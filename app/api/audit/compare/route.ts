import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db, query } from '@/lib/db';
import { runAISOAudit } from '@/lib/aiso-audit-engine';

/**
 * POST /api/audit/compare
 * Compare a target URL against competitor URLs
 * Returns side-by-side AISO scores for sales presentations
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.getUserByClerkId(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { targetUrl, competitorUrls } = body;

    if (!targetUrl) {
      return NextResponse.json(
        { error: 'Target URL is required' },
        { status: 400 }
      );
    }

    if (!competitorUrls || !Array.isArray(competitorUrls) || competitorUrls.length === 0) {
      return NextResponse.json(
        { error: 'At least one competitor URL is required' },
        { status: 400 }
      );
    }

    if (competitorUrls.length > 3) {
      return NextResponse.json(
        { error: 'Maximum 3 competitor URLs allowed' },
        { status: 400 }
      );
    }

    // Audit all URLs in parallel
    const allUrls = [targetUrl, ...competitorUrls];
    const auditPromises = allUrls.map(async (auditUrl) => {
      try {
        const result = await runAISOAudit(auditUrl, user.id, { skipAccessibility: true });
        return {
          url: auditUrl,
          success: true,
          scores: {
            overall: result.aisoScore || 0,
            aeo: result.aeoScore || 0,
            seo: result.seoScore || 0,
            readability: result.readabilityScore || 0,
            engagement: result.engagementScore || 0,
          },
          title: result.pageTitle,
          domain: result.domain,
        };
      } catch (error: any) {
        return {
          url: auditUrl,
          success: false,
          error: error.message || 'Failed to audit',
        };
      }
    });

    const results = await Promise.all(auditPromises);

    // Separate target from competitors
    const targetResult = results[0];
    const competitorResults = results.slice(1);

    // Calculate rankings
    const allScores = results
      .filter((r) => r.success)
      .map((r) => ({
        url: r.url,
        score: r.scores?.overall || 0,
        isTarget: r.url === targetUrl,
      }))
      .sort((a, b) => b.score - a.score);

    const targetRank = allScores.findIndex((s) => s.isTarget) + 1;

    // Generate insights
    const insights = generateComparisonInsights(targetResult, competitorResults);

    // Save comparison to database for history
    await query(
      `INSERT INTO competitor_comparisons (user_id, target_url, competitor_urls, results, insights, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [
        user.id,
        targetUrl,
        JSON.stringify(competitorUrls),
        JSON.stringify({ target: targetResult, competitors: competitorResults }),
        JSON.stringify(insights),
      ]
    );

    return NextResponse.json({
      success: true,
      target: targetResult,
      competitors: competitorResults,
      ranking: {
        position: targetRank,
        total: allScores.length,
        scores: allScores,
      },
      insights,
    });
  } catch (error: any) {
    console.error('Competitor comparison error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to compare' },
      { status: 500 }
    );
  }
}

function generateComparisonInsights(
  target: any,
  competitors: any[]
): {
  winning: string[];
  losing: string[];
  opportunities: string[];
  salesPitch: string;
} {
  const winning: string[] = [];
  const losing: string[] = [];
  const opportunities: string[] = [];

  if (!target.success) {
    return {
      winning: [],
      losing: ['Unable to audit target site'],
      opportunities: ['Fix site accessibility issues'],
      salesPitch: 'We encountered issues auditing your site, which may indicate technical problems that need addressing.',
    };
  }

  const targetScores = target.scores || {};
  const successfulCompetitors = competitors.filter((c) => c.success);

  if (successfulCompetitors.length === 0) {
    return {
      winning: [],
      losing: [],
      opportunities: ['Unable to compare - competitor sites could not be audited'],
      salesPitch: `Your site scores ${targetScores.overall || 0}/100 for AI readiness.`,
    };
  }

  // Calculate average competitor scores
  const avgCompetitor = {
    overall: avg(successfulCompetitors.map((c) => c.scores?.overall || 0)),
    aeo: avg(successfulCompetitors.map((c) => c.scores?.aeo || 0)),
    seo: avg(successfulCompetitors.map((c) => c.scores?.seo || 0)),
    readability: avg(successfulCompetitors.map((c) => c.scores?.readability || 0)),
    engagement: avg(successfulCompetitors.map((c) => c.scores?.engagement || 0)),
  };

  // Compare each dimension
  const dimensions = [
    { key: 'aeo', name: 'AI Answer Optimization', weight: 'critical' },
    { key: 'seo', name: 'Search Engine Optimization', weight: 'high' },
    { key: 'readability', name: 'Content Readability', weight: 'medium' },
    { key: 'engagement', name: 'User Engagement', weight: 'medium' },
  ];

  dimensions.forEach((dim) => {
    const targetScore = targetScores[dim.key] || 0;
    const competitorAvg = avgCompetitor[dim.key as keyof typeof avgCompetitor] || 0;
    const diff = targetScore - competitorAvg;

    if (diff >= 10) {
      winning.push(`${dim.name}: ${Math.round(diff)} points ahead of competitors`);
    } else if (diff <= -10) {
      losing.push(`${dim.name}: ${Math.round(Math.abs(diff))} points behind competitors`);
      opportunities.push(`Improve ${dim.name.toLowerCase()} to match industry standard`);
    }
  });

  // Generate sales pitch
  const overallDiff = (targetScores.overall || 0) - avgCompetitor.overall;
  let salesPitch = '';

  if (overallDiff < -20) {
    salesPitch = `Your site scores ${targetScores.overall}/100 for AI readiness, which is ${Math.round(Math.abs(overallDiff))} points below your competitors. When customers ask ChatGPT or Perplexity for recommendations, your competitors are more likely to be featured. We can close this gap.`;
  } else if (overallDiff < 0) {
    salesPitch = `Your site is ${Math.round(Math.abs(overallDiff))} points behind competitors in AI readiness. Small improvements now can make a big difference in AI search visibility.`;
  } else if (overallDiff < 10) {
    salesPitch = `You're neck-and-neck with competitors at ${targetScores.overall}/100. Strategic optimization can help you pull ahead in AI search results.`;
  } else {
    salesPitch = `Great news! You're ${Math.round(overallDiff)} points ahead of competitors. Let's maintain this advantage and push even further ahead.`;
  }

  return { winning, losing, opportunities, salesPitch };
}

function avg(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((a, b) => a + b, 0) / numbers.length;
}
