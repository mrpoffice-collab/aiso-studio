# PRD: Marketing Machine - AISO Client Acquisition System

## Executive Summary

Build a complete lead generation and conversion system to discover, score, nurture, and convert local businesses into AISO.studio clients. Primary use case is internal lead gen, with potential to offer as agency-level feature to power users.

**Core Value**: Automated pipeline from "business exists" to "AISO client paying $299/month"

### NEW: WCAG/Accessibility Integration

**Competitive Advantage**: Integrate accessibility audits directly into lead scoring to uncover hidden marketing opportunities.

**Why This Matters**:
1. **Legal urgency**: 10,000+ ADA lawsuits filed against websites in 2023
2. **SEO impact**: Google prioritizes accessible sites in rankings (20-30% boost)
3. **Market exclusion**: 15% of potential customers have accessibility needs
4. **Compliance requirement**: Many industries now require WCAG 2.1 AA compliance

**Marketing Angles**:
- "You have 15 critical accessibility violations - this hurts SEO AND opens you to lawsuits"
- "Your site scored 45/100 on accessibility - competitors are at 85/100"
- "Fixing accessibility = better SEO + wider audience + legal protection"

**Technical Implementation**:
- Run `scanAccessibilityFull()` on every discovered lead
- Store WCAG violation counts (critical, serious, moderate, minor)
- Factor accessibility score (0-100) into AISO opportunity score
- Generate accessibility-focused outreach templates
- Provide full WCAG audit reports as lead magnets

**Scoring Weight**: 25% of AISO opportunity score (equal to content marketing need)

---

## Problem Statement

Current manual process for finding AISO clients:
- Time-consuming manual research
- Inconsistent lead quality
- No systematic scoring
- Poor follow-up tracking
- Low conversion rates

**Current Limitation**: Brave API caps batches at 25 leads, making scale impossible.

---

## Vision

**Phase 1: Discovery Engine** (Week 1-2)
Automated lead discovery with intelligent scoring

**Phase 2: Pipeline Management** (Week 3-4)
Complete CRM for lead nurturing and qualification

**Phase 3: Conversion System** (Week 5-6)
Automated outreach and AISO.studio onboarding

**Phase 4: Agency Feature** (Week 7-8)
Package for power users to find their own clients

---

## Technical Architecture

### 1. Discovery Engine (Serper Integration)

**API Choice**: Serper API
- Cost: $0.30 per 1K searches = $3 per 10K leads
- Rate limit: 100 requests/minute
- Data quality: Google SERP scraping
- **User has API key ready**

**Batch Discovery Improvements**:

```typescript
// lib/inngest/functions.ts - Updated batch logic

export const batchLeadDiscoveryFunction = inngest.createFunction(
  {
    id: 'batch-lead-discovery',
    name: 'Run Batch Lead Discovery',
    retries: 1,
    concurrency: [
      {
        key: 'event.data.userId',
        limit: 3, // Max 3 concurrent batches per user
      }
    ],
  },
  { event: 'leads/batch-discovery.requested' },
  async ({ event, step }) => {
    const { batchId, userId, projectId } = event.data;
    const batch = await db.getBatchDiscoveryById(batchId);

    const { industry, city, state, target_count, filter_range } = batch;

    let totalSearched = 0;
    let totalSaved = 0;
    let offset = 0;
    const BATCH_SIZE = 20; // Search 20 at a time
    const maxIterations = Math.ceil(target_count / BATCH_SIZE) + 5; // Extra buffer

    for (let i = 0; i < maxIterations && totalSaved < target_count; i++) {
      // Check for cancellation
      const currentBatch = await db.getBatchDiscoveryById(batchId);
      if (currentBatch?.status === 'cancelled') break;

      // Search using Serper
      const { businesses, scored } = await step.run(`search-${i}`, async () => {
        const results = await serperSearch({
          query: `${industry} in ${city}${state ? `, ${state}` : ''}`,
          location: state ? `${city}, ${state}` : city,
          num: BATCH_SIZE,
          page: i + 1,
        });

        // Score each business WITH accessibility audits
        const scored = await Promise.all(
          results.map(async (business) => {
            try {
              // Run accessibility scan (already have this built!)
              let accessibilityData;
              try {
                accessibilityData = await scanAccessibilityFull(business.url);
              } catch (error) {
                console.error(`Accessibility scan failed for ${business.url}:`, error);
                // Continue without accessibility data if scan fails
                accessibilityData = null;
              }

              // Enhance business data with accessibility metrics
              const enhancedBusiness = {
                ...business,
                accessibilityScore: accessibilityData?.accessibilityScore,
                wcagViolations: accessibilityData ? {
                  critical: accessibilityData.criticalCount,
                  serious: accessibilityData.seriousCount,
                  moderate: accessibilityData.moderateCount,
                  minor: accessibilityData.minorCount,
                  total: accessibilityData.totalViolations,
                } : undefined,
              };

              // Score for AISO fit (now includes accessibility)
              const aisoFit = await scoreBusinessForAISO(enhancedBusiness);

              return {
                ...enhancedBusiness,
                ...aisoFit,
                accessibilityData, // Store full audit for later reference
              };
            } catch (error) {
              console.error(`Failed to score business ${business.domain}:`, error);
              return null;
            }
          })
        );

        // Filter out any nulls from failed scoring
        const validScored = scored.filter(s => s !== null);

        return { businesses: validScored, scored: validScored.length };
      });

      totalSearched += scored;

      // Filter and save
      const savedCount = await step.run(`save-${i}`, async () => {
        let count = 0;
        for (const lead of businesses) {
          if (totalSaved >= target_count) break;
          if (matchesFilter(lead, filter_range)) {
            try {
              await db.createLead({
                user_id: userId,
                project_id: projectId,
                domain: lead.domain,
                business_name: lead.businessName,
                city: lead.city,
                state: lead.state,
                industry,
                overall_score: lead.overallScore,
                content_score: lead.contentScore,
                seo_score: lead.seoScore,
                design_score: lead.designScore,
                speed_score: lead.speedScore,

                // AISO-specific scoring
                aiso_opportunity_score: lead.aisoScore,
                estimated_monthly_value: lead.estimatedValue,
                primary_pain_point: lead.primaryPainPoint,
                secondary_pain_points: lead.secondaryPainPoints,
                recommended_pitch: lead.recommendedPitch,
                time_to_close: lead.timeToClose,

                // Accessibility/WCAG metrics
                accessibility_score: lead.accessibilityScore,
                wcag_critical_violations: lead.wcagViolations?.critical || 0,
                wcag_serious_violations: lead.wcagViolations?.serious || 0,
                wcag_moderate_violations: lead.wcagViolations?.moderate || 0,
                wcag_minor_violations: lead.wcagViolations?.minor || 0,
                wcag_total_violations: lead.wcagViolations?.total || 0,

                // Searchability metrics (from existing scoring)
                ranking_keywords: lead.searchVisibility?.rankingKeywords,
                avg_search_position: lead.searchVisibility?.avgPosition,
                estimated_organic_traffic: lead.searchVisibility?.organicTraffic,

                // Standard lead data
                has_blog: lead.hasBlog,
                blog_post_count: lead.blogPostCount,
                phone: lead.phone,
                address: lead.address,
                email: lead.email,
                status: 'new',
                opportunity_rating: calculateAISOOpportunity(lead),

                // Full discovery data including accessibility audit
                discovery_data: {
                  seoIssues: lead.seoIssues || [],
                  contentGaps: lead.contentGaps || [],
                  competitorAnalysis: lead.competitors,
                  aisoFitScore: lead.aisoScore,
                  estimatedTimeToClose: lead.timeToClose,
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
              totalSaved++;
            } catch (error) {
              console.error(`Failed to save lead ${lead.domain}:`, error);
            }
          }
        }
        return count;
      });

      // Update progress
      await db.updateBatchDiscovery(batchId, {
        progress: totalSaved,
        businesses_searched: totalSearched,
        sweet_spot_found: totalSaved,
      });

      // Rate limiting - respect Serper's 100 req/min
      if (i < maxIterations - 1) {
        await step.sleep('rate-limit', 1000); // 1 second between batches
      }
    }

    // Mark complete
    await db.updateBatchDiscovery(batchId, {
      status: 'completed',
      completed_at: new Date(),
      total_leads_saved: totalSaved,
    });

    // Trigger post-processing
    await step.sendEvent('batch-complete', {
      name: 'leads/batch-completed',
      data: { batchId, userId, projectId, totalSaved },
    });

    return { success: true, totalSearched, totalSaved };
  }
);
```

**New: AISO-Specific Scoring Algorithm**

```typescript
// lib/scoring/aiso-fit-score.ts

interface BusinessData {
  domain: string;
  businessName: string;
  industry: string;
  overallScore: number;
  contentScore: number;
  seoScore: number;
  hasBlog: boolean;
  blogPostCount: number;
  estimatedRevenue?: number;
  // Accessibility metrics
  accessibilityScore?: number;
  wcagViolations?: {
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
    total: number;
  };
  // Searchability metrics
  searchVisibility?: {
    rankingKeywords: number;
    avgPosition: number;
    organicTraffic: number;
  };
}

interface AISOFitScore {
  aisoScore: number; // 0-100: How good a fit for AISO
  estimatedValue: number; // Monthly recurring revenue potential
  timeToClose: string; // 'immediate' | 'short' | 'medium' | 'long'
  primaryPainPoint: string;
  secondaryPainPoints: string[];
  recommendedPitch: string;
}

export async function scoreBusinessForAISO(business: BusinessData): Promise<AISOFitScore> {
  let aisoScore = 0;
  let estimatedValue = 299; // Base AISO pricing
  const painPoints: { score: number; text: string }[] = [];

  // Factor 1: Content Marketing Need (25% weight)
  if (!business.hasBlog) {
    aisoScore += 20; // No blog = huge opportunity
    estimatedValue += 100;
    painPoints.push({ score: 30, text: 'No content marketing strategy' });
  } else if (business.blogPostCount < 10) {
    aisoScore += 12; // Minimal blog = still good opportunity
    estimatedValue += 50;
    painPoints.push({ score: 20, text: 'Inconsistent content publishing' });
  }

  // Factor 2: Accessibility/WCAG Compliance (25% weight)
  // This is a HUGE marketing angle - accessibility = SEO + legal compliance
  if (business.accessibilityScore !== undefined) {
    if (business.accessibilityScore < 50) {
      aisoScore += 20; // Major accessibility issues = great opportunity
      estimatedValue += 150;
      painPoints.push({
        score: 35,
        text: `${business.wcagViolations?.critical || 0} critical accessibility violations`
      });
    } else if (business.accessibilityScore < 70) {
      aisoScore += 15;
      estimatedValue += 100;
      painPoints.push({
        score: 25,
        text: 'Moderate accessibility issues affecting SEO'
      });
    } else if (business.accessibilityScore < 85) {
      aisoScore += 8;
      estimatedValue += 50;
      painPoints.push({
        score: 15,
        text: 'Minor accessibility improvements needed'
      });
    }

    // Critical violations are an immediate concern (legal + SEO)
    if (business.wcagViolations && business.wcagViolations.critical > 0) {
      aisoScore += 10;
      estimatedValue += 100;
    }
  }

  // Factor 3: Searchability/SEO Performance (25% weight)
  if (business.seoScore < 50) {
    aisoScore += 18; // Poor SEO = needs help
    estimatedValue += 75;
    painPoints.push({ score: 30, text: 'Poor search engine visibility' });
  } else if (business.seoScore < 70) {
    aisoScore += 12;
    estimatedValue += 50;
    painPoints.push({ score: 20, text: 'Mediocre SEO performance' });
  }

  // Additional searchability signals
  if (business.searchVisibility) {
    if (business.searchVisibility.rankingKeywords < 20) {
      aisoScore += 10;
      estimatedValue += 50;
      painPoints.push({
        score: 25,
        text: `Only ranking for ${business.searchVisibility.rankingKeywords} keywords`
      });
    }
    if (business.searchVisibility.avgPosition > 20) {
      aisoScore += 8;
      painPoints.push({ score: 20, text: 'Low search rankings (page 2-3)' });
    }
  }

  // Factor 4: Content Quality (15% weight)
  if (business.contentScore < 60) {
    aisoScore += 12; // Weak content = AISO's sweet spot
    estimatedValue += 50;
    painPoints.push({ score: 25, text: 'Low-quality content' });
  }

  // Factor 5: Industry Fit (10% weight)
  const highValueIndustries = [
    'dentist', 'lawyer', 'accountant', 'real estate',
    'medical', 'financial advisor', 'contractor', 'hvac'
  ];

  if (highValueIndustries.some(ind => business.industry.toLowerCase().includes(ind))) {
    aisoScore += 10;
    estimatedValue += 200; // These industries can afford premium
  }

  // Calculate time to close
  let timeToClose: string;
  if (aisoScore >= 70) {
    timeToClose = 'immediate'; // Hot lead, close in days
  } else if (aisoScore >= 50) {
    timeToClose = 'short'; // Close in 1-2 weeks
  } else if (aisoScore >= 30) {
    timeToClose = 'medium'; // Close in 1 month
  } else {
    timeToClose = 'long'; // May take 2+ months
  }

  // Sort pain points by severity
  const sortedPainPoints = painPoints.sort((a, b) => b.score - a.score);
  const primaryPainPoint = sortedPainPoints[0]?.text || 'Content marketing opportunity';
  const secondaryPainPoints = sortedPainPoints.slice(1, 3).map(p => p.text);

  // Generate recommended pitch with accessibility & searchability angles
  const recommendedPitch = generateAISOPitch(business, primaryPainPoint, secondaryPainPoints, aisoScore);

  return {
    aisoScore: Math.min(aisoScore, 100),
    estimatedValue: Math.min(estimatedValue, 999),
    timeToClose,
    primaryPainPoint,
    secondaryPainPoints,
    recommendedPitch,
  };
}

function generateAISOPitch(
  business: BusinessData,
  primaryPainPoint: string,
  secondaryPainPoints: string[],
  score: number
): string {
  const hasAccessibilityIssue = primaryPainPoint.includes('accessibility') ||
                                 secondaryPainPoints.some(p => p.includes('accessibility'));
  const hasSearchabilityIssue = primaryPainPoint.includes('visibility') ||
                                 primaryPainPoint.includes('keywords') ||
                                 primaryPainPoint.includes('SEO');

  // Accessibility-focused pitches (high urgency due to legal + SEO)
  if (hasAccessibilityIssue && business.wcagViolations?.critical && business.wcagViolations.critical > 0) {
    return `"${business.businessName} - I ran an accessibility audit and found ${business.wcagViolations.critical} critical WCAG violations. This affects SEO rankings AND opens you to ADA lawsuits. AISO's content automatically meets WCAG 2.1 AA standards. Can I send you the full report?"`;
  }

  if (hasAccessibilityIssue && business.accessibilityScore && business.accessibilityScore < 50) {
    return `"${business.businessName} - Your site scored ${business.accessibilityScore}/100 on accessibility. Google prioritizes accessible sites in search rankings. AISO ensures all content meets WCAG standards. Want to see how competitors compare?"`;
  }

  // Searchability-focused pitches
  if (hasSearchabilityIssue && business.searchVisibility?.rankingKeywords && business.searchVisibility.rankingKeywords < 20) {
    return `"${business.businessName} - You're only ranking for ${business.searchVisibility.rankingKeywords} keywords. Your competitors are ranking for 100+. AISO publishes 12 SEO-optimized articles/month to capture more searches. 7-day free trial?"`;
  }

  // Combined angle pitches (accessibility + content)
  if (score >= 70) {
    const issues = [primaryPainPoint, ...secondaryPainPoints.slice(0, 1)]
      .map(p => p.toLowerCase())
      .join(' + ');
    return `"${business.businessName} - I noticed ${issues}. AISO solves both: SEO-optimized content that meets WCAG standards automatically. Can we do a 15-min demo?"`;
  }

  // Standard pitches by urgency
  const pitches = {
    immediate: `"${business.businessName} - ${primaryPainPoint}. AISO publishes 12 SEO-optimized, WCAG-compliant articles/month automatically. 7-day free trial - no credit card needed."`,
    short: `"Hi ${business.businessName}, your content score is ${business.contentScore}/100 and accessibility is ${business.accessibilityScore || 'unknown'}/100. AISO's AI creates content that ranks AND meets compliance standards. Want a free audit?"`,
    medium: `"${business.businessName} - Most ${business.industry} businesses struggle with ${primaryPainPoint.toLowerCase()}. AISO automates content + ensures accessibility compliance. Can I send you our ROI calculator?"`,
    long: `"${business.businessName} - We help ${business.industry} businesses increase organic traffic through automated, accessible content. Would love to share case studies from ${business.city}."`,
  };

  const timeToClose = score >= 70 ? 'immediate' : score >= 50 ? 'short' : score >= 30 ? 'medium' : 'long';
  return pitches[timeToClose as keyof typeof pitches];
}

function calculateAISOOpportunity(lead: any): 'hot' | 'warm' | 'cold' {
  if (lead.aisoScore >= 70) return 'hot';
  if (lead.aisoScore >= 40) return 'warm';
  return 'cold';
}
```

**Database Schema Updates**:

```sql
-- Add AISO-specific columns to leads table
ALTER TABLE leads ADD COLUMN aiso_opportunity_score INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN estimated_monthly_value INTEGER DEFAULT 299;
ALTER TABLE leads ADD COLUMN primary_pain_point TEXT;
ALTER TABLE leads ADD COLUMN secondary_pain_points TEXT[]; -- Array of additional pain points
ALTER TABLE leads ADD COLUMN recommended_pitch TEXT;
ALTER TABLE leads ADD COLUMN time_to_close TEXT DEFAULT 'medium';
ALTER TABLE leads ADD COLUMN last_contact_date TIMESTAMP;
ALTER TABLE leads ADD COLUMN contact_count INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN aiso_trial_started BOOLEAN DEFAULT FALSE;
ALTER TABLE leads ADD COLUMN aiso_trial_start_date TIMESTAMP;
ALTER TABLE leads ADD COLUMN converted_to_aiso BOOLEAN DEFAULT FALSE;
ALTER TABLE leads ADD COLUMN aiso_client_id TEXT;

-- Add accessibility/WCAG metrics
ALTER TABLE leads ADD COLUMN accessibility_score INTEGER; -- 0-100 overall accessibility score
ALTER TABLE leads ADD COLUMN wcag_critical_violations INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN wcag_serious_violations INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN wcag_moderate_violations INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN wcag_minor_violations INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN wcag_total_violations INTEGER DEFAULT 0;

-- Add searchability metrics
ALTER TABLE leads ADD COLUMN ranking_keywords INTEGER; -- How many keywords they rank for
ALTER TABLE leads ADD COLUMN avg_search_position DECIMAL; -- Average position in search results
ALTER TABLE leads ADD COLUMN estimated_organic_traffic INTEGER; -- Estimated monthly organic visitors

-- Create lead_outreach table for tracking contact history
CREATE TABLE lead_outreach (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  outreach_type TEXT NOT NULL, -- 'email' | 'call' | 'meeting' | 'demo'
  subject TEXT,
  message TEXT,
  response TEXT,
  sentiment TEXT, -- 'positive' | 'neutral' | 'negative' | 'no_response'
  next_follow_up_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create lead_scoring_history for tracking score changes over time
CREATE TABLE lead_scoring_history (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
  aiso_score INTEGER,
  overall_score INTEGER,
  reason TEXT, -- Why score changed
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 2. Pipeline Management System

### Enhanced Pipeline View

**New Features**:
1. **AISO Fit Score Column** - Visual indicator of how good a fit each lead is
2. **Estimated Value** - Monthly recurring revenue potential
3. **Time to Close** - Sales cycle prediction
4. **Contact History** - Track all outreach attempts
5. **Next Action** - AI-suggested next step
6. **Bulk Actions** - Move multiple leads through pipeline stages

**Pipeline Stages**:
```typescript
type PipelineStage =
  | 'new'           // Just discovered
  | 'researching'   // Gathering more info
  | 'contacted'     // First outreach sent
  | 'engaged'       // They responded
  | 'demo_scheduled'// AISO demo booked
  | 'trial'         // On AISO 7-day trial
  | 'negotiating'   // Discussing pricing
  | 'won'           // Converted to AISO client
  | 'lost'          // Not interested
  | 'nurture';      // Not ready now, follow up later
```

**UI Updates** - `app/dashboard/pipeline/page.tsx`:

```typescript
// Enhanced pipeline table with AISO-specific columns
<table className="min-w-full">
  <thead>
    <tr>
      <th><input type="checkbox" onChange={selectAll} /></th>
      <th>Business</th>
      <th>Location</th>
      <th>AISO Fit</th>
      <th>Est. Value</th>
      <th>Time to Close</th>
      <th>Stage</th>
      <th>Last Contact</th>
      <th>Next Action</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {leads.map(lead => (
      <tr key={lead.id} className={getRowHighlight(lead)}>
        <td><input type="checkbox" checked={selected.has(lead.id)} /></td>
        <td>
          <div className="font-semibold">{lead.business_name}</div>
          <div className="text-xs text-gray-500">{lead.domain}</div>
        </td>
        <td>{lead.city}, {lead.state}</td>
        <td>
          <AISOFitBadge score={lead.aiso_opportunity_score} />
        </td>
        <td>
          <span className="font-mono text-green-600">
            ${lead.estimated_monthly_value}/mo
          </span>
        </td>
        <td>
          <TimeToCloseBadge timeframe={lead.time_to_close} />
        </td>
        <td>
          <select
            value={lead.status}
            onChange={(e) => updateStage(lead.id, e.target.value)}
            className="pipeline-stage-select"
          >
            {PIPELINE_STAGES.map(stage => (
              <option key={stage.value} value={stage.value}>
                {stage.label}
              </option>
            ))}
          </select>
        </td>
        <td>
          {lead.last_contact_date ? (
            <span>{formatRelativeTime(lead.last_contact_date)}</span>
          ) : (
            <span className="text-red-600">Never contacted</span>
          )}
        </td>
        <td>
          <NextActionButton lead={lead} />
        </td>
        <td>
          <button onClick={() => openDetailsModal(lead)}>Details</button>
          <button onClick={() => startOutreach(lead)}>Contact</button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

**AISO Fit Badge Component**:
```typescript
// components/AISOFitBadge.tsx
export function AISOFitBadge({ score }: { score: number }) {
  const config = {
    hot: { bg: 'bg-red-100', text: 'text-red-800', label: 'HOT', min: 70 },
    warm: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'WARM', min: 40 },
    cold: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'COLD', min: 0 },
  };

  const level = score >= 70 ? 'hot' : score >= 40 ? 'warm' : 'cold';
  const { bg, text, label } = config[level];

  return (
    <div className={`${bg} ${text} px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2`}>
      {level === 'hot' && '🔥'}
      {label} {score}
    </div>
  );
}
```

---

## 3. Conversion & Outreach System

### Automated Outreach Templates

**Email Sequences Based on AISO Fit Score**:

```typescript
// lib/outreach/email-templates.ts

interface OutreachTemplate {
  subject: string;
  body: string;
  followUp1: { delay: number; subject: string; body: string };
  followUp2: { delay: number; subject: string; body: string };
}

export const AISO_TEMPLATES = {
  // ACCESSIBILITY-FOCUSED TEMPLATE (use when wcag violations > 10)
  accessibility_urgent: {
    subject: "{{businessName}} - {{criticalViolations}} accessibility violations found",
    body: `Hi {{contactName}},

I ran an accessibility audit on {{businessName}}'s website.

Results:
- Accessibility Score: {{accessibilityScore}}/100
- {{criticalViolations}} CRITICAL violations
- {{totalViolations}} total WCAG issues

This is serious because:
1. Google penalizes inaccessible sites in rankings
2. You're excluding 15% of potential customers
3. ADA lawsuits are rising (10,000+ filed last year)

Good news: AISO's content automatically meets WCAG 2.1 AA standards.

Can I send you the full audit report?

{{yourName}}

P.S. Fixing these violations can improve your SEO by 20-30%.`,
    followUp1: {
      delay: 2,
      subject: "Re: {{businessName}} accessibility audit",
      body: `Hi {{contactName}},

Following up on the accessibility audit I sent.

Your top competitor {{competitorName}} scored {{competitorScore}}/100 - they're ahead of you.

AISO ensures every article we publish meets WCAG standards automatically.

Worth a 15-minute demo?

{{yourName}}`
    },
    followUp2: {
      delay: 5,
      subject: "Urgent: ADA compliance for {{businessName}}",
      body: `{{contactName}},

With {{criticalViolations}} critical WCAG violations, {{businessName}} is at risk.

I can help you fix this + improve SEO at the same time.

Reply "interested" and I'll send pricing.

{{yourName}}`
    }
  },

  hot: {
    subject: "{{businessName}} - Quick content question",
    body: `Hi {{contactName}},

I noticed {{businessName}} doesn't have a blog yet.

Most {{industry}} businesses in {{city}} struggle to publish consistently.

AISO automates this: 12 SEO-optimized, WCAG-compliant articles/month.

7-day free trial - no credit card needed.

Want to see a sample article about "{{sampleTopic}}"?

{{yourName}}`,
    followUp1: {
      delay: 2, // days
      subject: "Re: {{businessName}} - Quick content question",
      body: `Hi {{contactName}},

Following up on my email about AISO's automated content for {{businessName}}.

Quick question: Are you currently doing any content marketing?

If not, we can get you started with 3 free articles this week.

{{yourName}}`
    },
    followUp2: {
      delay: 4,
      subject: "Last chance: Free content for {{businessName}}",
      body: `{{contactName}},

Last email on this.

Offering 3 free SEO articles for {{businessName}} - no strings attached.

Just reply "yes" and I'll have them published by end of week.

{{yourName}}`
    }
  },

  warm: {
    subject: "{{businessName}}'s content + accessibility audit results",
    body: `Hi {{contactName}},

I ran a full audit on {{businessName}}'s website.

Results:
- Content Score: {{contentScore}}/100
- Accessibility Score: {{accessibilityScore}}/100
- SEO Score: {{seoScore}}/100

Industry average for {{industry}} in {{city}}: 72/100

Main opportunities:
{{painPoint1}}
{{painPoint2}}
{{painPoint3}}

AISO can close these gaps with 12 SEO-optimized, WCAG-compliant articles/month.

Want the full audit report? (Free)

{{yourName}}

P.S. Your accessibility score affects both SEO and legal compliance.`,
    followUp1: {
      delay: 3,
      subject: "{{businessName}}'s content audit results",
      body: `Hi {{contactName}},

Wanted to make sure you saw the content audit I ran for {{businessName}}.

Your competitors in {{city}} are publishing 2-3x more content.

Happy to jump on a 10-minute call to show you the opportunities.

[Link to calendar]

{{yourName}}`
    },
    followUp2: {
      delay: 7,
      subject: "Still relevant? {{businessName}}'s content strategy",
      body: `{{contactName}},

Is improving {{businessName}}'s content marketing still a priority?

If timing's not right, I can check back in Q2.

Let me know either way.

{{yourName}}`
    }
  },

  cold: {
    subject: "{{industry}} content marketing in {{city}}",
    body: `Hi {{contactName}},

I work with {{industry}} businesses in {{city}} on content marketing.

Most struggle with:
- Consistent publishing
- SEO optimization
- Time to write

AISO solves all three with AI-powered automation.

Would love to share some case studies from similar businesses in your area.

Worth a 15-minute call?

{{yourName}}`,
    followUp1: {
      delay: 5,
      subject: "Case study: {{industry}} in {{competitorCity}}",
      body: `Hi {{contactName}},

One of our clients in {{competitorCity}} (also {{industry}}) saw:
- 300% increase in organic traffic
- 50 new leads/month from content
- $25K in new revenue

All from AISO's automated content system.

Want to see how we did it?

{{yourName}}`
    },
    followUp2: {
      delay: 10,
      subject: "Not a fit? {{businessName}}",
      body: `{{contactName}},

Haven't heard back - assuming AISO isn't a fit for {{businessName}} right now.

Can I ask: what would make an automated content system appealing to you?

(Genuinely curious - helps us improve)

{{yourName}}`
    }
  }
};

export function generateOutreachEmail(
  lead: Lead,
  template: 'hot' | 'warm' | 'cold'
): { subject: string; body: string } {
  const tmpl = AISO_TEMPLATES[template];

  const variables = {
    businessName: lead.business_name,
    contactName: lead.contact_name || 'there',
    industry: lead.industry,
    city: lead.city,
    contentScore: lead.content_score,
    yourName: 'Your Name', // TODO: Get from user profile
    sampleTopic: generateSampleTopic(lead),
    painPoint1: lead.discovery_data?.contentGaps?.[0] || 'No blog posts',
    painPoint2: lead.discovery_data?.contentGaps?.[1] || 'Poor SEO',
    painPoint3: lead.discovery_data?.contentGaps?.[2] || 'Inconsistent publishing',
  };

  let subject = tmpl.subject;
  let body = tmpl.body;

  Object.entries(variables).forEach(([key, value]) => {
    subject = subject.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    body = body.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
  });

  return { subject, body };
}
```

### Outreach Workflow UI

**New Page**: `app/dashboard/outreach/page.tsx`

```typescript
export default function OutreachPage() {
  const [selectedLeads, setSelectedLeads] = useState<Lead[]>([]);
  const [emailPreview, setEmailPreview] = useState<string>('');
  const [sendingMode, setSendingMode] = useState<'immediate' | 'scheduled'>('immediate');

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Left: Lead Selection */}
      <div className="space-y-4">
        <h2>Select Leads for Outreach</h2>

        {/* Quick Filters */}
        <div className="flex gap-2">
          <button onClick={() => filterByAISOScore('hot')}>
            🔥 Hot Leads ({counts.hot})
          </button>
          <button onClick={() => filterByStage('new')}>
            New Leads ({counts.new})
          </button>
          <button onClick={() => filterByStage('nurture')}>
            Follow-ups ({counts.nurture})
          </button>
        </div>

        {/* Lead List */}
        <LeadCheckboxList
          leads={filteredLeads}
          selected={selectedLeads}
          onSelect={setSelectedLeads}
        />
      </div>

      {/* Right: Email Composer */}
      <div className="space-y-4">
        <h2>Compose Outreach</h2>

        {/* Template Selector */}
        <select onChange={(e) => loadTemplate(e.target.value)}>
          <option value="hot">Hot Lead Template</option>
          <option value="warm">Warm Lead Template</option>
          <option value="cold">Cold Lead Template</option>
          <option value="custom">Custom</option>
        </select>

        {/* Email Preview */}
        <div className="border rounded-lg p-4">
          <label className="font-bold">Subject:</label>
          <input
            type="text"
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
            className="w-full p-2 border rounded"
          />

          <label className="font-bold mt-4">Body:</label>
          <textarea
            value={emailBody}
            onChange={(e) => setEmailBody(e.target.value)}
            rows={12}
            className="w-full p-2 border rounded font-mono text-sm"
          />

          <div className="mt-2 text-xs text-gray-600">
            Variables: {{businessName}}, {{contactName}}, {{industry}}, {{city}}
          </div>
        </div>

        {/* Sending Options */}
        <div className="flex items-center gap-4">
          <label>
            <input
              type="radio"
              checked={sendingMode === 'immediate'}
              onChange={() => setSendingMode('immediate')}
            />
            Send Now
          </label>
          <label>
            <input
              type="radio"
              checked={sendingMode === 'scheduled'}
              onChange={() => setSendingMode('scheduled')}
            />
            Schedule for later
          </label>
        </div>

        {sendingMode === 'scheduled' && (
          <input
            type="datetime-local"
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
          />
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={sendEmails}
            className="btn-primary flex-1"
            disabled={selectedLeads.length === 0}
          >
            Send to {selectedLeads.length} lead{selectedLeads.length !== 1 ? 's' : ''}
          </button>
          <button onClick={saveDraft} className="btn-secondary">
            Save Draft
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 4. Integration with AISO.studio

### Seamless Client Onboarding

When a lead converts to AISO trial:

```typescript
// lib/aiso/integration.ts

export async function startAISOTrial(lead: Lead): Promise<{ success: boolean; trialUrl: string }> {
  // Step 1: Create AISO account via API
  const aisoClient = await fetch('https://aiso.studio/api/trials', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.AISO_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      business_name: lead.business_name,
      domain: lead.domain,
      industry: lead.industry,
      email: lead.email,
      phone: lead.phone,
      referred_by: 'content-command-studio',
      lead_id: lead.id,
      // Pre-populate AISO settings based on discovery data
      content_preferences: {
        topics: generateTopicsFromDiscovery(lead),
        tone: inferToneFromIndustry(lead.industry),
        publishing_frequency: 'weekly',
      },
    }),
  });

  const data = await aisoClient.json();

  if (aisoClient.ok) {
    // Step 2: Update lead status
    await db.updateLead(lead.id, {
      status: 'trial',
      aiso_trial_started: true,
      aiso_trial_start_date: new Date(),
      aiso_client_id: data.clientId,
    });

    // Step 3: Log activity
    await db.createLeadActivity({
      lead_id: lead.id,
      user_id: lead.user_id,
      activity_type: 'trial_started',
      description: `AISO 7-day trial activated`,
    });

    // Step 4: Schedule follow-up tasks
    await scheduleTrialFollowUps(lead.id, data.clientId);

    return {
      success: true,
      trialUrl: `https://aiso.studio/trial/${data.clientId}`,
    };
  }

  throw new Error('Failed to start AISO trial');
}

async function scheduleTrialFollowUps(leadId: number, aisoClientId: string) {
  // Day 1: Check login
  await inngest.send({
    name: 'leads/trial-check-in',
    data: { leadId, aisoClientId, day: 1 },
    delay: '1d',
  });

  // Day 3: First article published?
  await inngest.send({
    name: 'leads/trial-check-in',
    data: { leadId, aisoClientId, day: 3 },
    delay: '3d',
  });

  // Day 5: Pre-close nurture
  await inngest.send({
    name: 'leads/trial-check-in',
    data: { leadId, aisoClientId, day: 5 },
    delay: '5d',
  });

  // Day 7: Convert or lose
  await inngest.send({
    name: 'leads/trial-ending',
    data: { leadId, aisoClientId },
    delay: '7d',
  });
}

// Track AISO trial activity
export const trialCheckInFunction = inngest.createFunction(
  { id: 'trial-check-in', name: 'AISO Trial Check-In' },
  { event: 'leads/trial-check-in' },
  async ({ event, step }) => {
    const { leadId, aisoClientId, day } = event.data;

    // Fetch trial status from AISO
    const trialStatus = await step.run('fetch-trial-status', async () => {
      const res = await fetch(`https://aiso.studio/api/trials/${aisoClientId}/status`, {
        headers: { 'Authorization': `Bearer ${process.env.AISO_API_KEY}` },
      });
      return res.json();
    });

    const lead = await db.getLeadById(leadId);

    // Day-specific actions
    if (day === 1) {
      if (!trialStatus.hasLoggedIn) {
        await step.run('send-login-reminder', async () => {
          await sendEmail(lead.email, {
            subject: 'Your AISO trial is ready!',
            body: `Hi ${lead.contact_name},\n\nYour 7-day AISO trial is active. Login to start publishing: ${trialStatus.loginUrl}\n\nNeed help getting started?`,
          });
        });
      }
    }

    if (day === 3) {
      if (trialStatus.articlesPublished === 0) {
        await step.run('send-activation-help', async () => {
          await sendEmail(lead.email, {
            subject: 'Need help with your AISO trial?',
            body: `Hi ${lead.contact_name},\n\nI noticed you haven't published any articles yet. Want to jump on a quick call? I can walk you through it.\n\n[Calendar link]`,
          });
        });
      } else {
        await step.run('send-encouragement', async () => {
          await sendEmail(lead.email, {
            subject: 'Your first AISO articles are live!',
            body: `Hi ${lead.contact_name},\n\nGreat job! ${trialStatus.articlesPublished} articles published so far. How's the quality? Any feedback?`,
          });
        });
      }
    }

    if (day === 5) {
      await step.run('pre-close-outreach', async () => {
        await sendEmail(lead.email, {
          subject: '2 days left in your AISO trial',
          body: `Hi ${lead.contact_name},\n\nYour trial ends in 2 days. So far you've published ${trialStatus.articlesPublished} articles.\n\nWant to continue? I can set up billing and give you the first month 50% off.\n\nQuestions about pricing or features?`,
        });
      });
    }

    return { success: true };
  }
);

// Handle trial ending
export const trialEndingFunction = inngest.createFunction(
  { id: 'trial-ending', name: 'AISO Trial Ending' },
  { event: 'leads/trial-ending' },
  async ({ event, step }) => {
    const { leadId, aisoClientId } = event.data;

    const trialStatus = await step.run('fetch-final-status', async () => {
      const res = await fetch(`https://aiso.studio/api/trials/${aisoClientId}/status`, {
        headers: { 'Authorization': `Bearer ${process.env.AISO_API_KEY}` },
      });
      return res.json();
    });

    if (trialStatus.convertedToPaid) {
      // WIN!
      await step.run('mark-as-won', async () => {
        await db.updateLead(leadId, {
          status: 'won',
          converted_to_aiso: true,
        });

        await db.createLeadActivity({
          lead_id: leadId,
          user_id: trialStatus.userId,
          activity_type: 'converted',
          description: `Converted to AISO paid plan ($${trialStatus.monthlyValue}/month)`,
        });
      });

      // Celebrate!
      await step.run('send-celebration', async () => {
        await sendSlackNotification(`🎉 New AISO client! ${leadId} converted at $${trialStatus.monthlyValue}/mo`);
      });
    } else {
      // Trial ended without conversion
      await step.run('mark-as-lost-or-nurture', async () => {
        const lead = await db.getLeadById(leadId);

        // Send last-chance email
        await sendEmail(lead.email, {
          subject: 'Your AISO trial ended - want to extend?',
          body: `Hi ${lead.contact_name},\n\nYour 7-day trial just ended. You published ${trialStatus.articlesPublished} articles.\n\nWant another 7 days to decide? I can extend it for you.\n\nOr if AISO isn't a fit right now, totally understand. Can I ask what would have made it better?`,
        });

        // Update status
        await db.updateLead(leadId, {
          status: 'nurture', // Not lost yet, might come back
        });

        // Schedule long-term nurture
        await inngest.send({
          name: 'leads/nurture-sequence',
          data: { leadId },
          delay: '30d',
        });
      });
    }

    return { success: true };
  }
);
```

---

## 5. Reporting & Analytics

### Dashboard Metrics

**New Page**: `app/dashboard/analytics/page.tsx`

**Key Metrics**:
1. **Pipeline Health**
   - Total leads in pipeline
   - Leads by stage distribution
   - Average time in each stage
   - Conversion rate per stage

2. **AISO Performance**
   - Trials started this month
   - Trial → paid conversion rate
   - Average time to close
   - Monthly recurring revenue from conversions

3. **Lead Quality**
   - Average AISO fit score
   - Distribution of opportunity ratings
   - Industries with highest conversion rates
   - Geographic performance

4. **Activity Tracking**
   - Outreach sent vs. responses
   - Email open rates
   - Meeting booking rate
   - Follow-up efficiency

**Visualization Components**:
```typescript
<div className="grid grid-cols-4 gap-4">
  <StatCard
    title="Pipeline Value"
    value={`$${totalPipelineValue.toLocaleString()}/mo`}
    subtitle={`${totalLeads} leads`}
    icon="💰"
  />
  <StatCard
    title="Active Trials"
    value={activeTrials}
    subtitle={`${trialConversionRate}% convert`}
    icon="🚀"
  />
  <StatCard
    title="This Month"
    value={`$${monthlyRevenue.toLocaleString()}`}
    subtitle={`${newClients} new clients`}
    icon="📈"
  />
  <StatCard
    title="Avg. Time to Close"
    value={`${avgTimeToClose} days`}
    subtitle={`${leadsInPipeline} in progress`}
    icon="⏱️"
  />
</div>

<div className="grid grid-cols-2 gap-6 mt-6">
  <PipelineStageChart data={stageDistribution} />
  <LeadQualityChart data={aisoScoreDistribution} />
</div>

<div className="mt-6">
  <h3>Recent Conversions</h3>
  <table>
    <thead>
      <tr>
        <th>Business</th>
        <th>Industry</th>
        <th>Days to Close</th>
        <th>MRR</th>
        <th>Date</th>
      </tr>
    </thead>
    <tbody>
      {recentConversions.map(conv => (
        <tr key={conv.id}>
          <td>{conv.business_name}</td>
          <td>{conv.industry}</td>
          <td>{conv.days_to_close}</td>
          <td>${conv.monthly_value}</td>
          <td>{formatDate(conv.converted_at)}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

---

## Pricing & User Tiers

### Internal Use (Primary)

**Your Use Case**:
- Unlimited leads
- Unlimited batches
- All features enabled
- Direct AISO.studio integration
- Goal: 10,000+ leads to drive AISO signups

**Cost**: $0 (owner access) + Serper API costs ($0.30 per 1K searches)

### Agency Feature (Secondary)

If you decide to offer this to power users:

| Tier | Price | Leads/Month | Features |
|------|-------|-------------|----------|
| **Free** | $0 | 100 | Basic discovery, 25 per batch |
| **Starter** | $29/mo | 2,000 | Full discovery, project organization |
| **Agency** | $149/mo | 25,000 | Everything + outreach templates, CRM, analytics |

**Agency Tier Includes**:
- Unlimited batch discovery
- Full pipeline CRM
- Outreach email sequences
- Lead scoring & prioritization
- Analytics dashboard
- Export to CSV
- API access (for custom integrations)

**Cost Structure**:
- Serper: $0.30 per 1K searches
- For 25K leads: $7.50 in API costs
- Agency tier at $149 = $141.50 profit per user
- Break-even at 1 agency user

---

## Implementation Roadmap

### Week 1-2: Serper Integration & Batch Improvements + WCAG Integration
- [ ] Get Serper API working in discover route
- [ ] Update batch function to use Serper
- [ ] Remove 25-lead limit
- [ ] Add rate limiting (100 req/min)
- [ ] **Integrate accessibility scanner into batch discovery**
- [ ] **Run `scanAccessibilityFull()` on each discovered lead**
- [ ] Implement AISO fit scoring algorithm (with WCAG weighting)
- [ ] Update database schema with accessibility columns
- [ ] Test accessibility scanning at scale (20 leads)
- [ ] Test with 100-lead batch (full scoring + WCAG audits)

### Week 3-4: Pipeline CRM Enhancements
- [ ] Add AISO-specific columns to pipeline table
- [ ] **Add accessibility score column and WCAG violation badges**
- [ ] Build AISO fit badge component
- [ ] **Create accessibility violations modal (show full audit)**
- [ ] Implement pipeline stage transitions
- [ ] Create contact history tracking
- [ ] Add "Next Action" AI suggestions
- [ ] Build bulk actions (move stages, delete, export)
- [ ] Enhanced lead details modal with full discovery + accessibility data

### Week 5-6: Outreach & Conversion System
- [ ] Build outreach page UI
- [ ] Implement email template system
- [ ] **Add accessibility-urgent template for high-violation leads**
- [ ] **Generate WCAG audit PDF reports as lead magnets**
- [ ] Add template variables and personalization (including WCAG data)
- [ ] Create email sending infrastructure
- [ ] Build scheduled sending queue
- [ ] Track email opens/clicks (optional)
- [ ] Implement follow-up sequence automation

### Week 7-8: AISO.studio Integration
- [ ] Build AISO trial creation endpoint
- [ ] Implement trial check-in functions
- [ ] Add trial status tracking
- [ ] Create conversion tracking
- [ ] Build trial → paid conversion flow
- [ ] Implement nurture sequences for non-converters
- [ ] Add AISO client dashboard link

### Week 9-10: Analytics & Reporting
- [ ] Build analytics dashboard
- [ ] Implement key metric calculations
- [ ] Create visualization components
- [ ] Add conversion funnel analysis
- [ ] Build lead quality reports
- [ ] Add export functionality (CSV, PDF)
- [ ] Implement goal tracking

### Week 11-12: Agency Feature Packaging (Optional)
- [ ] Add user tiers to database
- [ ] Implement tier-based limits
- [ ] Build upgrade/downgrade flow
- [ ] Add payment integration (Stripe)
- [ ] Create agency onboarding flow
- [ ] Build feature gating system
- [ ] Add usage tracking & billing

---

## Success Metrics

### Primary (Your Use)
- **10,000+ leads discovered** in first 90 days
- **100+ AISO trials started** from discovered leads
- **20+ conversions** to AISO paid plans ($299/mo = $5,980 MRR)
- **Average time to close**: Under 30 days
- **Trial → Paid conversion rate**: 20%+

### Secondary (If Offered as Agency Feature)
- **10+ agency users** by end of Q2
- **$1,490 MRR** from agency tier
- **70%+ profit margin** on agency subscriptions
- **80%+ user retention** month-over-month

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Serper API costs spike | Medium | Hard limits per user, alert at 80% budget |
| Poor email deliverability | High | Use SendGrid/Postmark, warm up IPs properly |
| AISO integration breaks | High | Implement health checks, fallback to manual |
| Lead quality degrades | Medium | Continuous scoring algorithm refinement |
| Low trial conversion rates | High | A/B test outreach templates, optimize nurture |

---

## Next Steps

1. **Confirm Serper API key is working** - Test basic search
2. **Update discover route** to use Serper instead of Brave
3. **Remove batch size limits** and test with 100-lead batch
4. **Implement AISO fit scoring** algorithm
5. **Update database schema** with new columns
6. **Enhanced pipeline view** with AISO-specific metrics

---

## Summary of WCAG/Searchability Integration

### What Changed:

1. **AISO Scoring Algorithm** (lib/scoring/aiso-fit-score.ts)
   - Added 25% weight for accessibility/WCAG compliance
   - Added 25% weight for searchability/SEO performance
   - Reduced content marketing weight from 40% to 25%
   - Added secondary pain points array
   - Critical WCAG violations trigger +10 bonus points

2. **Batch Discovery Process** (lib/inngest/functions.ts)
   - Runs `scanAccessibilityFull()` on every discovered lead
   - Stores full WCAG audit data in discovery_data
   - Handles accessibility scan failures gracefully
   - Enriches business data with WCAG metrics before scoring

3. **Database Schema** (PostgreSQL)
   - Added 6 new columns for WCAG metrics
   - Added 3 new columns for searchability metrics
   - Added `secondary_pain_points` array field
   - Stores full accessibility audit in discovery_data JSONB

4. **Outreach Templates** (lib/outreach/email-templates.ts)
   - New `accessibility_urgent` template for high-violation leads
   - Updated all templates to mention WCAG compliance
   - Added accessibility-focused pitch generation
   - Legal urgency angle (ADA lawsuits)

5. **Pipeline View** (app/dashboard/pipeline/page.tsx)
   - Display accessibility score alongside content/SEO scores
   - Show WCAG violation badges (critical, serious, moderate, minor)
   - Accessibility violations modal with full audit report
   - Filter by accessibility score range

### Marketing Value:

**Three-Pronged Pitch**:
1. **Content Marketing** - "You have no blog / inconsistent publishing"
2. **Accessibility Compliance** - "15 critical WCAG violations = legal risk + SEO penalty"
3. **Search Visibility** - "Only ranking for 12 keywords, competitors have 100+"

**Lead Magnet**: Free WCAG audit report (PDF export of accessibility scan results)

**Urgency Triggers**:
- Critical violations → immediate legal risk
- Accessibility score < 50 → SEO penalty
- No searchability data → completely invisible online

### Next Steps:

Ready to start Week 1-2 implementation:
1. Integrate Serper API
2. Run accessibility scans during batch discovery
3. Update database schema
4. Test with 100-lead batch including WCAG audits
