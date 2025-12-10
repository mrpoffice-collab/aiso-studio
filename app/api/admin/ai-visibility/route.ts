import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { isAdminEmail } from '@/lib/admin-config';
import {
  checkPerplexityCitation,
  checkVisibilityForKeywords,
  calculateVisibilityScore,
} from '@/lib/perplexity-client';

/**
 * GET /api/admin/ai-visibility
 * Get all monitors and recent checks (Admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.getUserByClerkId(clerkUserId);
    if (!user || !isAdminEmail(user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const monitors = await db.getAIVisibilityMonitorsByUser(user.id);
    const recentChecks = await db.getRecentAIVisibilityChecks(user.id, 50);

    // Get stats for each monitor
    const monitorsWithStats = await Promise.all(
      monitors.map(async (monitor: any) => {
        const stats = await db.getAIVisibilityStats(monitor.id);
        return { ...monitor, stats };
      })
    );

    return NextResponse.json({
      monitors: monitorsWithStats,
      recentChecks,
    });
  } catch (error) {
    console.error('Error fetching AI visibility data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/ai-visibility
 * Create a new monitor or run a quick check (Admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.getUserByClerkId(clerkUserId);
    if (!user || !isAdminEmail(user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { action } = body;

    // Quick check without saving (for lead gen proof)
    if (action === 'quick-check') {
      const { url, keywords, businessName, industry, location } = body;

      if (!url || !keywords || keywords.length === 0) {
        return NextResponse.json(
          { error: 'URL and at least one keyword required' },
          { status: 400 }
        );
      }

      // Extract domain from URL
      const domain = extractDomain(url);

      // Run visibility checks
      const results = await checkVisibilityForKeywords(
        keywords,
        url,
        domain,
        businessName,
        industry,
        location
      );

      // Calculate visibility score
      const score = calculateVisibilityScore(results);

      return NextResponse.json({
        url,
        domain,
        businessName,
        keywords,
        results,
        score,
        checkedAt: new Date(),
      });
    }

    // Create a new monitor
    if (action === 'create-monitor') {
      const { url, businessName, industry, keywords, checkFrequency, notes } = body;

      if (!url) {
        return NextResponse.json({ error: 'URL required' }, { status: 400 });
      }

      const domain = extractDomain(url);

      const monitor = await db.createAIVisibilityMonitor({
        user_id: user.id,
        url,
        domain,
        business_name: businessName,
        industry,
        target_keywords: keywords || [],
        check_frequency: checkFrequency || 'weekly',
        notes,
      });

      return NextResponse.json({ monitor });
    }

    // Run check for existing monitor
    if (action === 'run-check') {
      const { monitorId } = body;

      if (!monitorId) {
        return NextResponse.json({ error: 'Monitor ID required' }, { status: 400 });
      }

      const monitor = await db.getAIVisibilityMonitorById(monitorId);
      if (!monitor) {
        return NextResponse.json({ error: 'Monitor not found' }, { status: 404 });
      }

      // Run checks for all keywords
      const results = await checkVisibilityForKeywords(
        monitor.target_keywords || [],
        monitor.url,
        monitor.domain,
        monitor.business_name,
        monitor.industry
      );

      // Save each check result
      for (const result of results) {
        await db.createAIVisibilityCheck({
          monitor_id: monitorId,
          platform: 'perplexity',
          query_used: result.query,
          keyword: result.query.split(' ')[0], // First word as keyword
          was_cited: result.wasCited,
          citation_type: result.citationType,
          citation_position: result.citationPosition ?? undefined,
          response_snippet: result.responseSnippet,
          sources_returned: result.allCitations,
          full_response: result.fullResponse,
        });
      }

      // Update last checked timestamp
      await db.updateAIVisibilityMonitor(monitorId, {
        last_checked_at: new Date(),
      });

      // Calculate score
      const score = calculateVisibilityScore(results);

      return NextResponse.json({
        monitor,
        results,
        score,
        checkedAt: new Date(),
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in AI visibility:', error);

    // Handle Perplexity API key missing
    if (error.message?.includes('PERPLEXITY_API_KEY')) {
      return NextResponse.json(
        { error: 'Perplexity API key not configured. Add PERPLEXITY_API_KEY to .env.local' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/ai-visibility
 * Delete a monitor (Admin only)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.getUserByClerkId(clerkUserId);
    if (!user || !isAdminEmail(user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const monitorId = searchParams.get('id');

    if (!monitorId) {
      return NextResponse.json({ error: 'Monitor ID required' }, { status: 400 });
    }

    await db.deleteAIVisibilityMonitor(monitorId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting monitor:', error);
    return NextResponse.json(
      { error: 'Failed to delete monitor' },
      { status: 500 }
    );
  }
}

function extractDomain(url: string): string {
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    return parsed.hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return url.toLowerCase().replace(/^www\./, '');
  }
}
