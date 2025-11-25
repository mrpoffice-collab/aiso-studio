import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { neon } from '@neondatabase/serverless';
import { scanAccessibilityFull } from '@/lib/accessibility/scanner';
import { scoreBusinessForAISO } from '@/lib/scoring/aiso-fit-score';

const sql = neon(process.env.DATABASE_URL!);

interface SerperSearchResult {
  organic?: Array<{
    title: string;
    link: string;
    position: number;
  }>;
  searchParameters?: {
    q: string;
  };
}

/**
 * Fetch search visibility data from Serper API
 */
async function getSearchVisibility(domain: string, industry?: string): Promise<{
  rankingKeywords: number;
  avgPosition: number;
  organicTraffic: number;
  topKeywords: Array<{ keyword: string; position: number }>;
} | null> {
  if (!process.env.SERPER_API_KEY) {
    console.log('Serper API key not configured');
    return null;
  }

  try {
    // Search for the domain to see where it ranks
    const queries = [
      `site:${domain}`,
      industry ? `${industry} ${domain.replace('www.', '').split('.')[0]}` : domain.replace('www.', '').split('.')[0],
    ];

    let totalKeywords = 0;
    let totalPosition = 0;
    const topKeywords: Array<{ keyword: string; position: number }> = [];

    for (const query of queries) {
      const response = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'X-API-KEY': process.env.SERPER_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: query,
          num: 10,
        }),
      });

      if (response.ok) {
        const data: SerperSearchResult = await response.json();
        if (data.organic) {
          for (const result of data.organic) {
            if (result.link.includes(domain.replace('www.', ''))) {
              totalKeywords++;
              totalPosition += result.position;
              topKeywords.push({
                keyword: data.searchParameters?.q || query,
                position: result.position,
              });
            }
          }
        }
      }
    }

    return {
      rankingKeywords: totalKeywords,
      avgPosition: totalKeywords > 0 ? totalPosition / totalKeywords : 0,
      organicTraffic: totalKeywords * 50, // Rough estimate
      topKeywords: topKeywords.slice(0, 5),
    };
  } catch (error) {
    console.error('Serper API error:', error);
    return null;
  }
}

/**
 * POST /api/leads/[id]/audit
 * Run a full audit on a lead and save to lead_audits table
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await db.getUserByClerkId(clerkUserId);
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id } = await params;
    const leadId = parseInt(id, 10);

    // Get the lead
    const lead = await db.getLeadById(leadId);
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Parse request body for audit options
    const body = await request.json().catch(() => ({}));
    const auditType = body.auditType || 'full';

    console.log(`Running ${auditType} audit for ${lead.domain}...`);

    // Initialize audit data with existing lead scores
    const auditData: Record<string, unknown> = {
      overall_score: lead.overall_score,
      content_score: lead.content_score,
      seo_score: lead.seo_score,
      design_score: lead.design_score,
      speed_score: lead.speed_score,
      has_blog: lead.has_blog,
      blog_post_count: lead.blog_post_count,
    };

    // Run accessibility scan if not already done or if full audit
    if (auditType === 'full' || auditType === 'accessibility') {
      if (!lead.accessibility_score || auditType === 'full') {
        console.log('Running accessibility scan...');
        try {
          const accessibilityResult = await scanAccessibilityFull(`https://${lead.domain}`);
          if (accessibilityResult) {
            auditData.accessibility_score = accessibilityResult.score;
            auditData.wcag_critical_violations = accessibilityResult.violations.critical;
            auditData.wcag_serious_violations = accessibilityResult.violations.serious;
            auditData.wcag_moderate_violations = accessibilityResult.violations.moderate;
            auditData.wcag_minor_violations = accessibilityResult.violations.minor;
            auditData.wcag_total_violations = accessibilityResult.violations.total;
            auditData.accessibility_details = accessibilityResult;
          }
        } catch (accessError) {
          console.error('Accessibility scan failed:', accessError);
        }
      } else {
        // Use existing data
        auditData.accessibility_score = lead.accessibility_score;
        auditData.wcag_critical_violations = lead.wcag_critical_violations;
        auditData.wcag_serious_violations = lead.wcag_serious_violations;
        auditData.wcag_moderate_violations = lead.wcag_moderate_violations;
        auditData.wcag_minor_violations = lead.wcag_minor_violations;
        auditData.wcag_total_violations = lead.wcag_total_violations;
      }
    }

    // Run search visibility check if not already done or if full audit
    if (auditType === 'full' || auditType === 'seo') {
      if (!lead.ranking_keywords || auditType === 'full') {
        console.log('Running search visibility check...');
        const searchData = await getSearchVisibility(lead.domain, lead.industry || undefined);
        if (searchData) {
          auditData.ranking_keywords = searchData.rankingKeywords;
          auditData.avg_search_position = searchData.avgPosition;
          auditData.estimated_organic_traffic = searchData.organicTraffic;
          auditData.top_keywords = searchData.topKeywords;
          auditData.search_details = searchData;
        }
      } else {
        // Use existing data
        auditData.ranking_keywords = lead.ranking_keywords;
        auditData.avg_search_position = lead.avg_search_position;
        auditData.estimated_organic_traffic = lead.estimated_organic_traffic;
      }
    }

    // Calculate AISO score with all available data
    const aisoResult = scoreBusinessForAISO({
      domain: lead.domain,
      businessName: lead.business_name,
      industry: lead.industry || 'general',
      city: lead.city || undefined,
      state: lead.state || undefined,
      overallScore: lead.overall_score,
      contentScore: lead.content_score,
      seoScore: lead.seo_score,
      hasBlog: lead.has_blog,
      blogPostCount: lead.blog_post_count,
      accessibilityScore: auditData.accessibility_score as number | undefined,
      wcagViolations: auditData.wcag_critical_violations ? {
        critical: auditData.wcag_critical_violations as number,
        serious: auditData.wcag_serious_violations as number || 0,
        moderate: auditData.wcag_moderate_violations as number || 0,
        minor: auditData.wcag_minor_violations as number || 0,
        total: auditData.wcag_total_violations as number || 0,
      } : undefined,
      searchVisibility: auditData.ranking_keywords ? {
        rankingKeywords: auditData.ranking_keywords as number,
        avgPosition: auditData.avg_search_position as number || 0,
        organicTraffic: auditData.estimated_organic_traffic as number || 0,
      } : undefined,
    });

    auditData.aiso_opportunity_score = aisoResult.aisoScore;
    auditData.primary_pain_point = aisoResult.primaryPainPoint;
    auditData.secondary_pain_points = aisoResult.secondaryPainPoints;
    auditData.recommended_services = aisoResult.recommendedServices;
    auditData.estimated_monthly_value = aisoResult.estimatedValue;
    auditData.time_to_close = aisoResult.timeToClose;

    // Save audit to lead_audits table
    const [savedAudit] = await sql`
      INSERT INTO lead_audits (
        user_id, domain, lead_id, audit_type,
        overall_score, content_score, seo_score, design_score, speed_score,
        accessibility_score, wcag_critical_violations, wcag_serious_violations,
        wcag_moderate_violations, wcag_minor_violations, wcag_total_violations,
        accessibility_details,
        ranking_keywords, avg_search_position, estimated_organic_traffic,
        top_keywords, search_details,
        has_blog, blog_post_count,
        aiso_opportunity_score, primary_pain_point, secondary_pain_points,
        recommended_services, estimated_monthly_value, time_to_close
      ) VALUES (
        ${dbUser.id}, ${lead.domain}, ${leadId}, ${auditType},
        ${auditData.overall_score}, ${auditData.content_score}, ${auditData.seo_score},
        ${auditData.design_score}, ${auditData.speed_score},
        ${auditData.accessibility_score || null}, ${auditData.wcag_critical_violations || 0},
        ${auditData.wcag_serious_violations || 0}, ${auditData.wcag_moderate_violations || 0},
        ${auditData.wcag_minor_violations || 0}, ${auditData.wcag_total_violations || 0},
        ${auditData.accessibility_details ? JSON.stringify(auditData.accessibility_details) : null},
        ${auditData.ranking_keywords || null}, ${auditData.avg_search_position || null},
        ${auditData.estimated_organic_traffic || null},
        ${auditData.top_keywords ? JSON.stringify(auditData.top_keywords) : null},
        ${auditData.search_details ? JSON.stringify(auditData.search_details) : null},
        ${auditData.has_blog}, ${auditData.blog_post_count},
        ${auditData.aiso_opportunity_score}, ${auditData.primary_pain_point},
        ${auditData.secondary_pain_points as string[]},
        ${JSON.stringify(auditData.recommended_services)},
        ${auditData.estimated_monthly_value}, ${auditData.time_to_close}
      )
      RETURNING *
    `;

    // Update the lead with new audit data
    await db.updateLead(leadId, {
      accessibility_score: auditData.accessibility_score as number | undefined,
      wcag_critical_violations: auditData.wcag_critical_violations as number | undefined,
      wcag_serious_violations: auditData.wcag_serious_violations as number | undefined,
      wcag_moderate_violations: auditData.wcag_moderate_violations as number | undefined,
      wcag_minor_violations: auditData.wcag_minor_violations as number | undefined,
      wcag_total_violations: auditData.wcag_total_violations as number | undefined,
      ranking_keywords: auditData.ranking_keywords as number | undefined,
      avg_search_position: auditData.avg_search_position as number | undefined,
      estimated_organic_traffic: auditData.estimated_organic_traffic as number | undefined,
      aiso_opportunity_score: auditData.aiso_opportunity_score as number | undefined,
      primary_pain_point: auditData.primary_pain_point as string | undefined,
      secondary_pain_points: auditData.secondary_pain_points as string[] | undefined,
      estimated_monthly_value: auditData.estimated_monthly_value as number | undefined,
      time_to_close: auditData.time_to_close as string | undefined,
    });

    console.log(`Audit saved for ${lead.domain}`);

    return NextResponse.json({
      success: true,
      audit: savedAudit,
      updatedLead: await db.getLeadById(leadId),
    });

  } catch (error) {
    console.error('Failed to run audit:', error);
    return NextResponse.json(
      { error: 'Failed to run audit' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/leads/[id]/audit
 * Get audit history for a lead
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await db.getUserByClerkId(clerkUserId);
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id } = await params;
    const leadId = parseInt(id, 10);

    // Get audit history for this lead
    const audits = await sql`
      SELECT * FROM lead_audits
      WHERE lead_id = ${leadId} AND user_id = ${dbUser.id}
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ audits });

  } catch (error) {
    console.error('Failed to get audits:', error);
    return NextResponse.json(
      { error: 'Failed to get audits' },
      { status: 500 }
    );
  }
}
