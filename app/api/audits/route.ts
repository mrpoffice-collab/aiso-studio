import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

/**
 * POST /api/audits
 * Save a content audit result
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
    const {
      url,
      title,
      originalContent,
      originalScore,
      originalBreakdown,
      improvedContent,
      improvedScore,
      improvedBreakdown,
      iterations,
      costUsd,
    } = body;

    if (!url || !originalContent || originalScore === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: url, originalContent, originalScore' },
        { status: 400 }
      );
    }

    const audit = await db.createContentAudit({
      user_id: user.id,
      url,
      title,
      original_content: originalContent,
      original_score: originalScore,
      original_breakdown: originalBreakdown,
      improved_content: improvedContent,
      improved_score: improvedScore,
      improved_breakdown: improvedBreakdown,
      iterations,
      cost_usd: costUsd,
    });

    return NextResponse.json({ success: true, audit }, { status: 201 });
  } catch (error) {
    console.error('Error saving audit:', error);
    return NextResponse.json(
      { error: 'Failed to save audit' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/audits
 * Get user's audit history (both content audits and site audits)
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.getUserByClerkId(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const type = searchParams.get('type'); // 'content', 'site', or null for all

    // Get content audits (single URL audits)
    let contentAudits: any[] = [];
    if (type !== 'site') {
      try {
        contentAudits = await db.getContentAuditsByUserId(user.id, limit);
      } catch (e) {
        console.error('Error fetching content audits:', e);
        // Continue with empty array if table doesn't exist
      }
    }

    // Get site audits (strategy-based website audits)
    let siteAudits: any[] = [];
    if (type !== 'content') {
      try {
        siteAudits = await db.getSiteAuditsByUserId(user.id, limit);
      } catch (e) {
        console.error('Error fetching site audits:', e);
        // Continue with empty array if table doesn't exist
      }
    }

    // Normalize and combine both types
    const normalizedContentAudits = contentAudits.map((audit: any) => ({
      id: audit.id,
      type: 'content' as const,
      url: audit.url,
      title: audit.title,
      score: audit.improved_score || audit.original_score,
      originalScore: audit.original_score,
      improvedScore: audit.improved_score,
      iterations: audit.iterations,
      status: 'completed',
      createdAt: audit.created_at,
    }));

    const normalizedSiteAudits = siteAudits.map((audit: any) => ({
      id: audit.id,
      type: 'site' as const,
      url: audit.site_url,
      title: audit.client_name || 'Site Audit',
      score: audit.avg_aiso_score,
      pagesFound: audit.pages_found,
      imagesFound: audit.images_found,
      status: audit.status,
      strategyId: audit.strategy_id,
      createdAt: audit.created_at,
      completedAt: audit.completed_at,
    }));

    // Combine and sort by date
    const allAudits = [...normalizedContentAudits, ...normalizedSiteAudits]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);

    return NextResponse.json({
      audits: allAudits,
      contentAudits: normalizedContentAudits,
      siteAudits: normalizedSiteAudits,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching audits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audits' },
      { status: 500 }
    );
  }
}
