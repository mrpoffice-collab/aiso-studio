import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

/**
 * GET /api/strategies/[id]/clusters/[clusterId]
 * Get a single topic cluster
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; clusterId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: strategyId, clusterId } = await params;

    // Verify user owns this strategy
    const strategy = await db.getStrategyById(strategyId);
    if (!strategy) {
      return NextResponse.json({ error: 'Strategy not found' }, { status: 404 });
    }

    const user = await db.getUserByClerkId(userId);
    if (!user || strategy.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get cluster
    const cluster = await db.getTopicClusterById(clusterId);
    if (!cluster || cluster.strategy_id !== strategyId) {
      return NextResponse.json({ error: 'Cluster not found' }, { status: 404 });
    }

    return NextResponse.json({ cluster });
  } catch (error: any) {
    console.error('Error fetching cluster:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch cluster' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/strategies/[id]/clusters/[clusterId]
 * Update a topic cluster
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; clusterId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: strategyId, clusterId } = await params;
    const body = await request.json();

    // Verify user owns this strategy
    const strategy = await db.getStrategyById(strategyId);
    if (!strategy) {
      return NextResponse.json({ error: 'Strategy not found' }, { status: 404 });
    }

    const user = await db.getUserByClerkId(userId);
    if (!user || strategy.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get existing cluster to verify it belongs to this strategy
    const existing = await db.getTopicClusterById(clusterId);
    if (!existing || existing.strategy_id !== strategyId) {
      return NextResponse.json({ error: 'Cluster not found' }, { status: 404 });
    }

    // Update cluster
    const cluster = await db.updateTopicCluster(clusterId, {
      name: body.name,
      description: body.description,
      primary_money_page_id: body.primary_money_page_id || null,
      secondary_money_page_ids: body.secondary_money_page_ids,
      funnel_stage: body.funnel_stage,
    });

    console.log(`✅ Updated cluster: ${cluster?.name}`);

    return NextResponse.json({ cluster });
  } catch (error: any) {
    console.error('Error updating cluster:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update cluster' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/strategies/[id]/clusters/[clusterId]
 * Delete a topic cluster
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; clusterId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: strategyId, clusterId } = await params;

    // Verify user owns this strategy
    const strategy = await db.getStrategyById(strategyId);
    if (!strategy) {
      return NextResponse.json({ error: 'Strategy not found' }, { status: 404 });
    }

    const user = await db.getUserByClerkId(userId);
    if (!user || strategy.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get existing cluster to verify it belongs to this strategy
    const existing = await db.getTopicClusterById(clusterId);
    if (!existing || existing.strategy_id !== strategyId) {
      return NextResponse.json({ error: 'Cluster not found' }, { status: 404 });
    }

    // Delete cluster
    const deleted = await db.deleteTopicCluster(clusterId);

    console.log(`✅ Deleted cluster: ${deleted?.name}`);

    return NextResponse.json({ success: true, cluster: deleted });
  } catch (error: any) {
    console.error('Error deleting cluster:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete cluster' },
      { status: 500 }
    );
  }
}
