import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db, query } from '@/lib/db';

/**
 * GET /api/strategies/[id]/edit
 * Get strategy details for editing
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

    const { id } = await params;
    const user = await db.getUserByClerkId(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const strategy = await db.getStrategyById(id);
    if (!strategy) {
      return NextResponse.json({ error: 'Strategy not found' }, { status: 404 });
    }

    // Verify ownership
    if (strategy.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ strategy });
  } catch (error: any) {
    console.error('Error fetching strategy:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch strategy' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/strategies/[id]/edit
 * Update strategy details
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const user = await db.getUserByClerkId(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const strategy = await db.getStrategyById(id);
    if (!strategy) {
      return NextResponse.json({ error: 'Strategy not found' }, { status: 404 });
    }

    // Verify ownership
    if (strategy.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const {
      clientName,
      industry,
      goals,
      targetAudience,
      brandVoice,
      frequency,
      contentLength,
      keywords,
      contentType,
      city,
      state,
      serviceArea,
      websiteUrl,
    } = body;

    // Validate required fields
    if (!clientName || !industry || !targetAudience || !brandVoice) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Parse keywords into array if it's a string
    let keywordsArray: string[] = [];
    if (keywords) {
      if (Array.isArray(keywords)) {
        keywordsArray = keywords;
      } else if (typeof keywords === 'string') {
        // Split by comma and trim whitespace
        keywordsArray = keywords
          .split(',')
          .map((k: string) => k.trim())
          .filter((k: string) => k.length > 0);
      }
    }

    // Update strategy
    await query(
      `UPDATE strategies
       SET client_name = $1,
           industry = $2,
           goals = $3,
           target_audience = $4,
           brand_voice = $5,
           frequency = $6,
           content_length = $7,
           keywords = $8,
           content_type = $9,
           city = $10,
           state = $11,
           service_area = $12,
           website_url = $13,
           updated_at = NOW()
       WHERE id = $14`,
      [
        clientName,
        industry,
        Array.isArray(goals) ? goals : [goals],
        targetAudience,
        brandVoice,
        frequency || 'weekly',
        contentLength || 'medium',
        keywordsArray,
        contentType || 'national',
        contentType === 'local' || contentType === 'hybrid' ? city : null,
        contentType === 'local' || contentType === 'hybrid' ? state : null,
        contentType === 'local' || contentType === 'hybrid' ? serviceArea : null,
        websiteUrl || null,
        id,
      ]
    );

    // Get updated strategy
    const updatedStrategy = await db.getStrategyById(id);

    console.log(`✅ Strategy ${id} updated successfully`);

    return NextResponse.json({
      success: true,
      strategy: updatedStrategy,
    });
  } catch (error: any) {
    console.error('Error updating strategy:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update strategy' },
      { status: 500 }
    );
  }
}
