import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { query } from '@/lib/db';
import { HighLevelClient } from '@/lib/highlevel';

/**
 * GET /api/integrations/highlevel/pipelines
 * Get available pipelines and stages from HighLevel
 */
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's HighLevel credentials
    const result = await query(
      `SELECT highlevel_api_key, highlevel_location_id
       FROM users
       WHERE clerk_id = $1`,
      [userId]
    );

    if (result.length === 0 || !result[0].highlevel_api_key) {
      return NextResponse.json(
        { error: 'HighLevel not connected' },
        { status: 400 }
      );
    }

    const { highlevel_api_key: apiKey, highlevel_location_id: locationId } = result[0];

    const client = new HighLevelClient({ apiKey, locationId });
    const pipelinesResult = await client.getPipelines();

    if (!pipelinesResult.success) {
      return NextResponse.json(
        { error: 'Failed to fetch pipelines', details: pipelinesResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      pipelines: pipelinesResult.data?.pipelines || [],
    });
  } catch (error) {
    console.error('Error fetching HighLevel pipelines:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pipelines' },
      { status: 500 }
    );
  }
}
