import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db, query } from '@/lib/db';

export const runtime = 'nodejs';

/**
 * POST /api/strategies/[id]/bulk-approve
 * Approve all draft posts in a strategy
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: strategyId } = await params;

    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await db.getUserByClerkId(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get strategy and verify ownership
    const strategy = await db.getStrategyById(strategyId);
    if (!strategy) {
      return NextResponse.json({ error: 'Strategy not found' }, { status: 404 });
    }

    if (strategy.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if user is on Agency tier
    if (user.subscription_tier !== 'agency') {
      return NextResponse.json(
        {
          error: 'Agency tier required',
          message: 'Bulk approve is available on the Agency plan.',
          upgrade_url: '/pricing'
        },
        { status: 403 }
      );
    }

    // Get all draft posts for topics in this strategy
    const drafts = await query(
      `SELECT p.id, p.title
       FROM posts p
       JOIN topics t ON p.topic_id = t.id
       WHERE t.strategy_id = $1 AND p.status = 'draft' AND p.user_id = $2`,
      [strategyId, user.id]
    );

    if (drafts.length === 0) {
      return NextResponse.json(
        { error: 'No drafts to approve', message: 'All posts are already approved or no posts exist.' },
        { status: 400 }
      );
    }

    // Bulk approve all drafts
    const result = await query(
      `UPDATE posts
       SET status = 'approved', updated_at = NOW()
       WHERE id = ANY($1::int[])
       RETURNING id, title, status`,
      [drafts.map((d: any) => d.id)]
    );

    return NextResponse.json({
      success: true,
      message: `Approved ${result.length} posts`,
      approvedCount: result.length,
      posts: result.map((p: any) => ({
        id: p.id,
        title: p.title,
        status: p.status,
      })),
    });
  } catch (error: any) {
    console.error('Bulk approve error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to approve posts' },
      { status: 500 }
    );
  }
}
