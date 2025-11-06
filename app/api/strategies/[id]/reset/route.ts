import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

/**
 * POST /api/strategies/[id]/reset
 * Resets a strategy by deleting all topics and posts, allowing a fresh start
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

    // Get counts before deletion for cost calculation
    const topics = await db.getTopicsByStrategyId(strategyId);
    const posts = await db.getPostsByStrategyId(strategyId);

    // Calculate approximate cost based on what was deleted
    // This helps agencies understand the value lost
    const estimatedCostPerPost = 0.05; // ~$0.05 per generated post (conservative estimate)
    const totalEstimatedCost = posts.length * estimatedCostPerPost;

    // Perform the reset
    const deleteStats = await db.resetStrategy(strategyId);

    // If posts exist, block the reset
    if (deleteStats.hasExistingPosts) {
      return NextResponse.json({
        error: 'Cannot reset strategy with existing posts. Posts contain valuable content and cannot be deleted. To generate new topics, use the "Generate Topics" button which will add topics alongside existing ones.',
        hasExistingPosts: true,
        postCount: posts.length
      }, { status: 400 });
    }

    // Log the reset operation
    await db.logUsage({
      user_id: user.id,
      operation_type: 'strategy_generation', // Using existing type
      cost_usd: 0, // No actual API cost for deletion
      tokens_used: 0,
      metadata: {
        action: 'strategy_reset',
        strategy_id: strategyId,
        client_name: strategy.client_name,
        deleted_topics: deleteStats.deletedTopics,
        deleted_posts: deleteStats.deletedPosts,
        deleted_fact_checks: deleteStats.deletedFactChecks,
        estimated_previous_cost_usd: totalEstimatedCost,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Strategy reset successfully. Deleted ${deleteStats.deletedTopics} topics.`,
      stats: {
        deletedTopics: deleteStats.deletedTopics,
        deletedPosts: deleteStats.deletedPosts,
        deletedFactChecks: deleteStats.deletedFactChecks,
        estimatedPreviousCost: totalEstimatedCost.toFixed(2),
      },
    });
  } catch (error: any) {
    console.error('Strategy reset error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to reset strategy' },
      { status: 500 }
    );
  }
}
