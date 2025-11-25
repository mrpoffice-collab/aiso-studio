import { inngest } from './client';
import { scanAccessibilityFull, closeBrowser } from '../accessibility-scanner-playwright';
import { db } from '../db';
import { scoreBusinessForAISO, calculateAISOOpportunity, type BusinessData } from '../scoring/aiso-fit-score';

// Event types
export interface AccessibilityAuditRequestedEvent {
  name: 'audit/accessibility.requested';
  data: {
    userId: number;
    url: string;
    contentAuditId?: number;
  };
}

export interface AccessibilityAuditCompletedEvent {
  name: 'audit/accessibility.completed';
  data: {
    userId: number;
    url: string;
    auditId: number;
    accessibilityScore: number;
    totalViolations: number;
  };
}

// Accessibility audit background job
export const accessibilityAuditFunction = inngest.createFunction(
  {
    id: 'accessibility-audit',
    name: 'Run Accessibility Audit',
    retries: 2,
  },
  { event: 'audit/accessibility.requested' },
  async ({ event, step }) => {
    const { userId, url, contentAuditId } = event.data;

    // Step 1: Run the accessibility scan
    const scanResult = await step.run('scan-accessibility', async () => {
      try {
        const result = await scanAccessibilityFull(url);
        await closeBrowser();
        return result;
      } catch (error) {
        await closeBrowser();
        throw error;
      }
    });

    // Step 2: Save to database
    const audit = await step.run('save-audit', async () => {
      return await db.createAccessibilityAudit({
        user_id: userId,
        content_audit_id: contentAuditId,
        url: scanResult.url,
        accessibility_score: scanResult.accessibilityScore,
        critical_count: scanResult.criticalCount,
        serious_count: scanResult.seriousCount,
        moderate_count: scanResult.moderateCount,
        minor_count: scanResult.minorCount,
        total_violations: scanResult.totalViolations,
        total_passes: scanResult.totalPasses,
        violations: scanResult.violations,
        passes: scanResult.passes,
        wcag_breakdown: scanResult.wcagBreakdown,
        scan_version: scanResult.scanVersion,
        page_title: scanResult.pageTitle,
        page_language: scanResult.pageLanguage,
      });
    });

    // Step 3: Emit completion event
    await step.sendEvent('emit-completed', {
      name: 'audit/accessibility.completed',
      data: {
        userId,
        url,
        auditId: audit.id,
        accessibilityScore: scanResult.accessibilityScore,
        totalViolations: scanResult.totalViolations,
      },
    });

    return {
      success: true,
      auditId: audit.id,
      accessibilityScore: scanResult.accessibilityScore,
      totalViolations: scanResult.totalViolations,
    };
  }
);

// Batch accessibility audit
export const batchAccessibilityAuditFunction = inngest.createFunction(
  {
    id: 'batch-accessibility-audit',
    name: 'Run Batch Accessibility Audit',
    retries: 1,
  },
  { event: 'audit/accessibility.batch-requested' },
  async ({ event, step }) => {
    const { userId, urls } = event.data as { userId: number; urls: string[] };
    const results: { url: string; auditId: number; score: number }[] = [];

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];

      try {
        const scanResult = await step.run(`scan-${i}`, async () => {
          const result = await scanAccessibilityFull(url);
          return result;
        });

        const audit = await step.run(`save-${i}`, async () => {
          return await db.createAccessibilityAudit({
            user_id: userId,
            url: scanResult.url,
            accessibility_score: scanResult.accessibilityScore,
            critical_count: scanResult.criticalCount,
            serious_count: scanResult.seriousCount,
            moderate_count: scanResult.moderateCount,
            minor_count: scanResult.minorCount,
            total_violations: scanResult.totalViolations,
            total_passes: scanResult.totalPasses,
            violations: scanResult.violations,
            passes: scanResult.passes,
            wcag_breakdown: scanResult.wcagBreakdown,
            scan_version: scanResult.scanVersion,
            page_title: scanResult.pageTitle,
            page_language: scanResult.pageLanguage,
          });
        });

        results.push({
          url,
          auditId: audit.id,
          score: scanResult.accessibilityScore,
        });
      } catch (error) {
        console.error(`Failed to scan ${url}:`, error);
      }
    }

    // Clean up browser
    await step.run('cleanup', async () => {
      await closeBrowser();
    });

    return { success: true, results };
  }
);

// Batch Lead Discovery - Runs large-scale lead searches in background
export interface BatchLeadDiscoveryRequestedEvent {
  name: 'leads/batch-discovery.requested';
  data: {
    batchId: string;
    userId: string;
    projectId?: number;
  };
}

export const batchLeadDiscoveryFunction = inngest.createFunction(
  {
    id: 'batch-lead-discovery',
    name: 'Run Batch Lead Discovery',
    retries: 1,
  },
  { event: 'leads/batch-discovery.requested' },
  async ({ event, step }) => {
    const { batchId, userId, projectId } = event.data;

    // Fetch the batch job details
    const batch = await db.getBatchDiscoveryById(batchId);
    if (!batch) {
      throw new Error(`Batch job ${batchId} not found`);
    }

    // Mark as processing
    await db.updateBatchDiscovery(batchId, {
      status: 'processing',
      started_at: new Date(),
    });

    try {
      const { industry, city, state, target_count, filter_range } = batch;
      const searchQuery = state ? `${industry} ${city} ${state}` : `${industry} ${city}`;

      let totalSearched = 0;
      let sweetSpotFound = 0;
      let offset = 0;
      const maxIterations = 1; // With Serper, we get up to 100 results per call (1 credit)
      let iteration = 0;

      // Helper function to check if lead matches filter
      const matchesFilter = (lead: any) => {
        const score = lead.overallScore;
        switch (filter_range) {
          case 'sweet-spot':
            return score >= 45 && score <= 75;
          case 'high':
            return score >= 76;
          case 'low':
            return score <= 44;
          case 'all':
            return true;
          default:
            return score >= 45 && score <= 75; // Default to sweet-spot
        }
      };

      // Keep searching until we have enough leads matching the filter
      while (sweetSpotFound < target_count && iteration < maxIterations) {
        iteration++;

        // Check if batch has been cancelled
        const currentBatch = await db.getBatchDiscoveryById(batchId);
        if (currentBatch?.status === 'cancelled') {
          console.log(`Batch ${batchId} was cancelled, stopping discovery`);
          break;
        }

        // Search and score businesses
        const { businesses, scored } = await step.run(`search-batch-${iteration}`, async () => {
          // Determine the API URL (works in both local and production)
          // Use APP_URL for server-side, fallback to NEXT_PUBLIC_APP_URL for local dev
          const baseUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

          // Use the same search logic from the discover route
          const response = await fetch(`${baseUrl}/api/leads/discover`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              industry,
              city,
              state,
              limit: 100, // Serper can return up to 100 results (1 credit)
              internal: true, // Flag for internal calls
              internalUserId: userId, // Pass userId for auth
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Discovery API error (${response.status}):`, errorText);
            throw new Error(`Discovery search failed: ${response.status} - ${errorText}`);
          }

          const data = await response.json();
          return {
            businesses: data.leads || [],
            scored: data.leads?.length || 0,
          };
        });

        totalSearched += scored;

        // NEW: Run accessibility audits and AISO scoring
        const enrichedBusinesses = await step.run(`enrich-with-wcag-${iteration}`, async () => {
          const enriched = [];

          for (const business of businesses) {
            try {
              console.log(`Running WCAG audit for ${business.businessName}...`);

              // Run accessibility scan
              let accessibilityData = null;
              try {
                const url = business.domain.startsWith('http')
                  ? business.domain
                  : `https://${business.domain}`;
                accessibilityData = await scanAccessibilityFull(url);
              } catch (error: any) {
                console.error(`Accessibility scan failed for ${business.domain}:`, error.message);
                // Continue without accessibility data if scan fails
              }

              // Prepare business data for AISO scoring
              // Note: Search visibility skipped in batch to save Serper credits (1 per lead)
              const businessData: BusinessData = {
                domain: business.domain,
                businessName: business.businessName,
                industry: business.industry || industry,
                city: business.city,
                state: business.state,
                overallScore: business.overallScore || 0,
                contentScore: business.contentScore || 0,
                seoScore: business.seoScore || 0,
                hasBlog: business.hasBlog || false,
                blogPostCount: business.blogPostCount || 0,
                accessibilityScore: accessibilityData?.accessibilityScore,
                wcagViolations: accessibilityData ? {
                  critical: accessibilityData.criticalCount,
                  serious: accessibilityData.seriousCount,
                  moderate: accessibilityData.moderateCount,
                  minor: accessibilityData.minorCount,
                  total: accessibilityData.totalViolations,
                } : undefined,
              };

              // Calculate AISO fit score
              const aisoFit = scoreBusinessForAISO(businessData);

              // Enrich business with AISO and WCAG data
              enriched.push({
                ...business,
                // AISO scoring
                aisoScore: aisoFit.aisoScore,
                estimatedValue: aisoFit.estimatedValue,
                timeToClose: aisoFit.timeToClose,
                primaryPainPoint: aisoFit.primaryPainPoint,
                secondaryPainPoints: aisoFit.secondaryPainPoints,
                recommendedPitch: aisoFit.recommendedPitch,
                // Accessibility data
                accessibilityScore: accessibilityData?.accessibilityScore,
                wcagViolations: businessData.wcagViolations,
                accessibilityData, // Store full audit for reference
              });

              console.log(`✅ ${business.businessName}: AISO ${aisoFit.aisoScore}, WCAG ${accessibilityData?.accessibilityScore || 'N/A'}`);
            } catch (error: any) {
              console.error(`Failed to enrich ${business.domain}:`, error.message);
              // Include business without enrichment data
              enriched.push(business);
            }
          }

          // Close browser after all scans
          try {
            await closeBrowser();
          } catch (error) {
            console.error('Failed to close browser:', error);
          }

          return enriched;
        });

        // Save enriched leads that match the filter to pipeline
        const savedCount = await step.run(`save-leads-${iteration}`, async () => {
          let count = 0;
          for (const lead of enrichedBusinesses) {
            // Stop if we've reached the target count
            if (sweetSpotFound >= target_count) {
              break;
            }

            if (matchesFilter(lead)) {
              try {
                // Save to pipeline with full discovery data + WCAG + AISO scoring
                await db.createLead({
                  user_id: userId,
                  project_id: projectId || null,
                  domain: lead.domain,
                  business_name: lead.businessName,
                  city: lead.city,
                  state: lead.state,
                  industry,
                  overall_score: lead.overallScore,
                  content_score: lead.contentScore || 0,
                  seo_score: lead.seoScore || 0,
                  design_score: lead.designScore || 0,
                  speed_score: lead.speedScore || 0,

                  // AISO-specific scoring
                  aiso_opportunity_score: lead.aisoScore || 0,
                  estimated_monthly_value: lead.estimatedValue || 299,
                  primary_pain_point: lead.primaryPainPoint,
                  secondary_pain_points: lead.secondaryPainPoints || [],
                  recommended_pitch: lead.recommendedPitch,
                  time_to_close: lead.timeToClose || 'medium',

                  // Accessibility/WCAG metrics
                  accessibility_score: lead.accessibilityScore,
                  wcag_critical_violations: lead.wcagViolations?.critical || 0,
                  wcag_serious_violations: lead.wcagViolations?.serious || 0,
                  wcag_moderate_violations: lead.wcagViolations?.moderate || 0,
                  wcag_minor_violations: lead.wcagViolations?.minor || 0,
                  wcag_total_violations: lead.wcagViolations?.total || 0,

                  // Standard lead data
                  has_blog: lead.hasBlog,
                  blog_post_count: lead.blogPostCount,
                  phone: lead.phone,
                  address: lead.address,
                  email: lead.email,
                  status: 'new',
                  opportunity_rating: calculateAISOOpportunity(lead.aisoScore || 0),

                  // Full discovery data including accessibility audit
                  discovery_data: {
                    seoIssues: lead.seoIssues || [],
                    opportunityType: lead.opportunityType,
                    technicalSEO: lead.technicalSEO,
                    onPageSEO: lead.onPageSEO,
                    contentMarketing: lead.contentMarketing,
                    localSEO: lead.localSEO,
                    // Store full accessibility audit results
                    accessibilityAudit: lead.accessibilityData ? {
                      url: lead.accessibilityData.url,
                      score: lead.accessibilityData.accessibilityScore,
                      violations: lead.accessibilityData.violations,
                      wcagBreakdown: lead.accessibilityData.wcagBreakdown,
                      pageTitle: lead.accessibilityData.pageTitle,
                    } : null,
                  },
                });
                count++;
              } catch (error) {
                console.error(`Failed to save lead ${lead.domain}:`, error);
              }
            }
          }
          return count;
        });

        // Update sweetSpotFound with the returned savedCount from step.run
        // (Inngest step.run checkpoints return values, side effects inside don't persist)
        sweetSpotFound += savedCount;

        // Update progress
        await db.updateBatchDiscovery(batchId, {
          progress: sweetSpotFound,
          businesses_searched: totalSearched,
          sweet_spot_found: sweetSpotFound,
        });

        // Check if we found enough
        if (sweetSpotFound >= target_count) {
          break;
        }

        // If no businesses found in this batch, stop
        if (scored === 0) {
          break;
        }
      }

      // Mark as completed
      await db.updateBatchDiscovery(batchId, {
        status: 'completed',
        completed_at: new Date(),
        total_leads_saved: sweetSpotFound,
      });

      // TODO: Send email notification

      return {
        success: true,
        totalSearched,
        sweetSpotFound,
      };
    } catch (error: any) {
      // Mark as failed
      await db.updateBatchDiscovery(batchId, {
        status: 'failed',
        error_message: error.message,
        completed_at: new Date(),
      });

      throw error;
    }
  }
);

// Export all functions for the Inngest serve handler
export const functions = [
  accessibilityAuditFunction,
  batchAccessibilityAuditFunction,
  batchLeadDiscoveryFunction,
];
