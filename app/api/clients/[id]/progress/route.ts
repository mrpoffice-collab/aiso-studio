import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db, query } from '@/lib/db';

/**
 * GET /api/clients/[id]/progress
 * Get before/after comparison data for a client
 * Shows audit score progression over time
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.getUserByClerkId(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id } = await params;
    const leadId = parseInt(id);

    // Get the lead/client
    const lead = await db.getLeadById(leadId);
    if (!lead || lead.user_id !== user.id) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Get all audits for this client's domain, ordered by date
    const audits = await query(
      `SELECT
        id,
        url,
        created_at,
        scores,
        audit_type
       FROM content_audits
       WHERE user_id = $1
         AND (url LIKE $2 OR url LIKE $3)
       ORDER BY created_at ASC`,
      [user.id, `%${lead.domain}%`, `%${lead.domain.replace('www.', '')}%`]
    );

    if (audits.length === 0) {
      return NextResponse.json({
        success: true,
        hasData: false,
        message: 'No audits found for this client',
      });
    }

    // Get first and latest audit for comparison
    const firstAudit = audits[0];
    const latestAudit = audits[audits.length - 1];

    // Parse scores
    const parseScores = (audit: any) => {
      const scores = typeof audit.scores === 'string'
        ? JSON.parse(audit.scores)
        : audit.scores;
      return {
        overall: scores?.overall || scores?.overallScore || 0,
        aeo: scores?.aeo || scores?.aeoScore || 0,
        seo: scores?.seo || scores?.seoScore || 0,
        readability: scores?.readability || scores?.readabilityScore || 0,
        engagement: scores?.engagement || scores?.engagementScore || 0,
      };
    };

    const firstScores = parseScores(firstAudit);
    const latestScores = parseScores(latestAudit);

    // Calculate changes
    const changes = {
      overall: latestScores.overall - firstScores.overall,
      aeo: latestScores.aeo - firstScores.aeo,
      seo: latestScores.seo - firstScores.seo,
      readability: latestScores.readability - firstScores.readability,
      engagement: latestScores.engagement - firstScores.engagement,
    };

    // Build timeline data for charts
    const timeline = audits.map((audit: any) => {
      const scores = parseScores(audit);
      return {
        date: audit.created_at,
        url: audit.url,
        ...scores,
      };
    });

    // Generate insights
    const insights = generateProgressInsights(firstScores, latestScores, changes, audits.length);

    return NextResponse.json({
      success: true,
      hasData: true,
      client: {
        id: lead.id,
        name: lead.business_name,
        domain: lead.domain,
      },
      comparison: {
        first: {
          date: firstAudit.created_at,
          url: firstAudit.url,
          scores: firstScores,
        },
        latest: {
          date: latestAudit.created_at,
          url: latestAudit.url,
          scores: latestScores,
        },
        changes,
        percentChange: {
          overall: firstScores.overall > 0
            ? Math.round((changes.overall / firstScores.overall) * 100)
            : 0,
        },
      },
      timeline,
      totalAudits: audits.length,
      insights,
    });
  } catch (error: any) {
    console.error('Client progress error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get progress' },
      { status: 500 }
    );
  }
}

function generateProgressInsights(
  first: any,
  latest: any,
  changes: any,
  auditCount: number
): {
  summary: string;
  highlights: string[];
  concerns: string[];
  recommendation: string;
} {
  const highlights: string[] = [];
  const concerns: string[] = [];

  // Check each dimension
  if (changes.overall > 0) {
    highlights.push(`Overall score improved by ${changes.overall} points`);
  } else if (changes.overall < 0) {
    concerns.push(`Overall score decreased by ${Math.abs(changes.overall)} points`);
  }

  if (changes.aeo >= 10) {
    highlights.push(`AI optimization up ${changes.aeo} points - better visibility in ChatGPT/Perplexity`);
  } else if (changes.aeo <= -10) {
    concerns.push(`AI optimization dropped ${Math.abs(changes.aeo)} points`);
  }

  if (changes.seo >= 10) {
    highlights.push(`SEO score improved ${changes.seo} points`);
  }

  if (changes.readability >= 10) {
    highlights.push(`Content readability improved ${changes.readability} points`);
  }

  if (changes.engagement >= 10) {
    highlights.push(`Engagement score up ${changes.engagement} points`);
  }

  // Generate summary
  let summary = '';
  if (changes.overall >= 20) {
    summary = `Excellent progress! The site has improved significantly since we started working together.`;
  } else if (changes.overall >= 10) {
    summary = `Good progress. The site is moving in the right direction with solid improvements.`;
  } else if (changes.overall >= 0) {
    summary = `Steady progress. The site is maintaining quality with slight improvements.`;
  } else {
    summary = `The site scores have dipped slightly. Let's review recent changes and optimize.`;
  }

  // Generate recommendation
  let recommendation = '';
  if (latest.aeo < 60) {
    recommendation = 'Focus on AI optimization - add FAQ sections, clear answers, and structured data.';
  } else if (latest.seo < 60) {
    recommendation = 'Improve SEO fundamentals - meta tags, headings, and keyword optimization.';
  } else if (latest.readability < 60) {
    recommendation = 'Simplify content - shorter sentences, clearer language, better formatting.';
  } else if (latest.engagement < 60) {
    recommendation = 'Boost engagement - add CTAs, improve hooks, make content more actionable.';
  } else {
    recommendation = 'Maintain quality and consider expanding content coverage to new topics.';
  }

  return { summary, highlights, concerns, recommendation };
}
