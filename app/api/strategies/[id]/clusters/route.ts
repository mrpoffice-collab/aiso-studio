import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

/**
 * GET /api/strategies/[id]/clusters
 * List all topic clusters for a strategy
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

    const { id: strategyId } = await params;

    // Verify user owns this strategy
    const strategy = await db.getStrategyById(strategyId);
    if (!strategy) {
      return NextResponse.json({ error: 'Strategy not found' }, { status: 404 });
    }

    const user = await db.getUserByClerkId(userId);
    if (!user || strategy.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get all clusters for this strategy
    const clusters = await db.getTopicClustersByStrategyId(strategyId);

    return NextResponse.json({ clusters });
  } catch (error: any) {
    console.error('Error fetching clusters:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch clusters' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/strategies/[id]/clusters
 * Create a new topic cluster
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: strategyId } = await params;
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

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: 'Missing required field: name' },
        { status: 400 }
      );
    }

    // Create cluster
    const cluster = await db.createTopicCluster({
      strategy_id: strategyId,
      name: body.name,
      description: body.description,
      primary_money_page_id: body.primary_money_page_id,
      secondary_money_page_ids: body.secondary_money_page_ids || [],
      funnel_stage: body.funnel_stage,
    });

    console.log(`✅ Created cluster: ${cluster.name}`);

    return NextResponse.json({ cluster }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating cluster:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create cluster' },
      { status: 500 }
    );
  }
}
