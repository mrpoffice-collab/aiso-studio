import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

/**
 * GET /api/strategies/[id]/money-pages
 * List all money pages for a strategy
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

    // Get all money pages for this strategy
    const moneyPages = await db.getMoneyPagesByStrategyId(strategyId);

    return NextResponse.json({ moneyPages });
  } catch (error: any) {
    console.error('Error fetching money pages:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch money pages' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/strategies/[id]/money-pages
 * Create a new money page
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
    if (!body.url || !body.title || !body.page_type) {
      return NextResponse.json(
        { error: 'Missing required fields: url, title, page_type' },
        { status: 400 }
      );
    }

    // Create money page
    const moneyPage = await db.createMoneyPage({
      strategy_id: strategyId,
      url: body.url,
      title: body.title,
      page_type: body.page_type,
      description: body.description,
      priority: body.priority || 2,
      target_keywords: body.target_keywords || [],
    });

    console.log(`✅ Created money page: ${moneyPage.title} (${moneyPage.url})`);

    return NextResponse.json({ moneyPage }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating money page:', error);

    // Handle duplicate URL error
    if (error.code === '23505' && error.constraint_name === 'money_pages_strategy_id_url_key') {
      return NextResponse.json(
        { error: 'A money page with this URL already exists for this strategy' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create money page' },
      { status: 500 }
    );
  }
}
