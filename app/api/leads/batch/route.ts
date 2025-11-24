import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { inngest } from '@/lib/inngest/client';

/**
 * POST /api/leads/batch
 * Create a batch lead discovery job
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
    const { industry, city, state, targetCount = 50, filterRange = 'sweet-spot' } = body;

    if (!industry || !city) {
      return NextResponse.json(
        { error: 'Industry and city are required' },
        { status: 400 }
      );
    }

    // Create batch job in database
    const batch = await db.createBatchDiscovery({
      user_id: user.id,
      industry,
      city,
      state,
      target_count: targetCount,
      filter_range: filterRange,
    });

    // Trigger background processing via Inngest
    await inngest.send({
      name: 'leads/batch-discovery.requested',
      data: {
        batchId: batch.id,
        userId: user.id,
      },
    });

    const filterLabels: Record<string, string> = {
      'sweet-spot': 'sweet spot (45-75 score)',
      'high': 'high score (76-100)',
      'low': 'low score (0-44)',
      'all': 'all'
    };
    const filterLabel = filterLabels[filterRange] || 'sweet spot';

    return NextResponse.json({
      success: true,
      batchId: batch.id,
      message: `Batch discovery started! Searching for ${targetCount} ${filterLabel} leads in ${city}${state ? `, ${state}` : ''}.`,
    });
  } catch (error: any) {
    console.error('Batch discovery creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create batch discovery' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/leads/batch
 * Get user's batch discovery jobs
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

    const batches = await db.getBatchDiscoveriesByUserId(user.id);

    return NextResponse.json({
      success: true,
      batches,
    });
  } catch (error: any) {
    console.error('Get batches error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get batch discoveries' },
      { status: 500 }
    );
  }
}
