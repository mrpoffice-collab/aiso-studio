import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

// Default service pricing
const SERVICE_PRICING = {
  content_marketing: { name: 'Content Marketing', price: 400, type: 'monthly' as const },
  accessibility: { name: 'Accessibility Remediation', price: 1500, type: 'one-time' as const },
  seo_package: { name: 'SEO Optimization', price: 500, type: 'monthly' as const },
  content_refresh: { name: 'Content Optimization', price: 300, type: 'one-time' as const },
};

interface RecommendedService {
  id: string;
  name: string;
  reason: string;
  type: 'monthly' | 'one-time';
  price: number;
  description: string;
}

// Calculate recommended services from lead data
function getRecommendedServices(lead: any): RecommendedService[] {
  const services: RecommendedService[] = [];

  // Content Marketing
  if (!lead.has_blog || lead.blog_post_count < 10) {
    services.push({
      id: 'content_marketing',
      name: SERVICE_PRICING.content_marketing.name,
      reason: !lead.has_blog ? 'No blog detected on your website' : `Only ${lead.blog_post_count} blog posts found`,
      type: 'monthly',
      price: SERVICE_PRICING.content_marketing.price,
      description: '12 SEO-optimized, WCAG-compliant articles per month. Each article is researched, written, and published to drive organic traffic and establish thought leadership.',
    });
  }

  // Accessibility
  const needsAccessibility =
    (lead.accessibility_score !== undefined && lead.accessibility_score < 70) ||
    (lead.wcag_critical_violations && lead.wcag_critical_violations > 0);

  if (needsAccessibility) {
    const reason = lead.wcag_critical_violations
      ? `${lead.wcag_critical_violations} critical WCAG violations detected`
      : `Accessibility score of ${lead.accessibility_score}/100 needs improvement`;
    services.push({
      id: 'accessibility',
      name: SERVICE_PRICING.accessibility.name,
      reason,
      type: 'one-time',
      price: SERVICE_PRICING.accessibility.price,
      description: 'Complete WCAG 2.1 AA compliance audit and remediation. Includes fixing all critical and serious violations, ensuring ADA compliance, and providing documentation for legal protection.',
    });
  }

  // SEO
  const needsSEO =
    lead.seo_score < 70 ||
    (lead.ranking_keywords !== undefined && lead.ranking_keywords < 20) ||
    (lead.avg_search_position !== undefined && lead.avg_search_position > 20);

  if (needsSEO) {
    let reason = `SEO score of ${lead.seo_score}/100 indicates optimization opportunities`;
    if (lead.ranking_keywords !== undefined && lead.ranking_keywords < 20) {
      reason = `Currently ranking for only ${lead.ranking_keywords} keywords`;
    }
    services.push({
      id: 'seo_package',
      name: SERVICE_PRICING.seo_package.name,
      reason,
      type: 'monthly',
      price: SERVICE_PRICING.seo_package.price,
      description: 'Technical SEO audit and ongoing optimization. Includes keyword research, on-page optimization, meta tag improvements, schema markup, and monthly performance reporting.',
    });
  }

  // Content Optimization
  if (lead.content_score < 70 && lead.has_blog && lead.blog_post_count >= 10) {
    services.push({
      id: 'content_refresh',
      name: SERVICE_PRICING.content_refresh.name,
      reason: `Content quality score of ${lead.content_score}/100 on existing content`,
      type: 'one-time',
      price: SERVICE_PRICING.content_refresh.price,
      description: 'Audit and refresh of your existing content library. We optimize your top-performing pages for better rankings and update outdated content to improve engagement.',
    });
  }

  return services;
}

/**
 * POST /api/leads/[id]/proposal
 * Generate a proposal for a lead
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

    // Get recommended services
    const services = getRecommendedServices(lead);

    // Calculate totals
    const monthlyTotal = services
      .filter(s => s.type === 'monthly')
      .reduce((sum, s) => sum + s.price, 0);
    const oneTimeTotal = services
      .filter(s => s.type === 'one-time')
      .reduce((sum, s) => sum + s.price, 0);

    // Generate personalized intro using AI (Haiku for cost efficiency)
    const introPrompt = `Write a 2-3 sentence personalized opening paragraph for a business proposal to ${lead.business_name}, a ${lead.industry || 'local business'} in ${lead.city || 'their area'}${lead.state ? `, ${lead.state}` : ''}.

Their main issues are:
- Primary pain point: ${lead.primary_pain_point || 'digital presence needs improvement'}
${lead.secondary_pain_points?.length ? `- Secondary issues: ${lead.secondary_pain_points.join(', ')}` : ''}
- Overall website score: ${lead.overall_score}/100
${lead.accessibility_score !== undefined ? `- Accessibility score: ${lead.accessibility_score}/100` : ''}

Write in a professional but friendly tone. Focus on the opportunity to improve their online presence and grow their business. Don't mention specific prices. Start directly with the content, no greeting.`;

    let personalizedIntro = '';
    try {
      const aiResponse = await anthropic.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 200,
        messages: [{ role: 'user', content: introPrompt }],
      });

      if (aiResponse.content[0].type === 'text') {
        personalizedIntro = aiResponse.content[0].text;
      }
    } catch (aiError) {
      console.error('AI intro generation failed:', aiError);
      // Fallback intro
      personalizedIntro = `After reviewing ${lead.business_name}'s online presence, we've identified several opportunities to strengthen your digital footprint and attract more customers. Our analysis shows specific areas where strategic improvements could significantly impact your visibility and growth.`;
    }

    // Calculate ROI projections
    const currentScore = lead.overall_score || 0;
    const projectedScore = Math.min(currentScore + 25, 95); // Conservative improvement
    const aiVisibilityIncrease = Math.round((projectedScore - currentScore) * 2); // % increase in AI visibility

    // Estimate traffic/leads improvement based on industry benchmarks
    const estimatedMonthlyVisitors = lead.estimated_monthly_traffic || 500;
    const projectedTrafficIncrease = Math.round(estimatedMonthlyVisitors * (aiVisibilityIncrease / 100));
    const conversionRate = 0.02; // 2% average conversion
    const avgDealValue = lead.estimated_monthly_value || 500;
    const projectedNewLeads = Math.round(projectedTrafficIncrease * conversionRate);
    const projectedMonthlyRevenue = projectedNewLeads * avgDealValue;
    const annualROI = ((projectedMonthlyRevenue * 12) - (monthlyTotal * 12 + oneTimeTotal)) / (monthlyTotal * 12 + oneTimeTotal) * 100;

    // Build the proposal
    const proposal = {
      lead: {
        businessName: lead.business_name,
        domain: lead.domain,
        industry: lead.industry,
        city: lead.city,
        state: lead.state,
      },
      scores: {
        overall: lead.overall_score,
        content: lead.content_score,
        seo: lead.seo_score,
        accessibility: lead.accessibility_score,
        wcagViolations: lead.wcag_critical_violations,
        aisoScore: lead.aiso_opportunity_score,
      },
      projections: {
        currentScore,
        projectedScore,
        aiVisibilityIncrease,
        projectedTrafficIncrease,
        projectedNewLeads,
        projectedMonthlyRevenue,
        annualROI: Math.round(annualROI),
        timeToResults: '3-6 months',
      },
      personalizedIntro,
      painPoints: {
        primary: lead.primary_pain_point,
        secondary: lead.secondary_pain_points || [],
      },
      services,
      pricing: {
        monthlyTotal,
        oneTimeTotal,
        firstMonthTotal: monthlyTotal + oneTimeTotal,
        annualTotal: monthlyTotal * 12 + oneTimeTotal,
      },
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ proposal });

  } catch (error) {
    console.error('Failed to generate proposal:', error);
    return NextResponse.json(
      { error: 'Failed to generate proposal' },
      { status: 500 }
    );
  }
}
