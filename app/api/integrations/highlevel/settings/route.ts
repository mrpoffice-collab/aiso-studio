import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { query } from '@/lib/db';
import { HighLevelClient } from '@/lib/highlevel';

/**
 * GET /api/integrations/highlevel/settings
 * Get the user's HighLevel integration settings
 */
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's HighLevel settings from database
    const result = await query(
      `SELECT
        highlevel_api_key,
        highlevel_location_id,
        highlevel_pipeline_id,
        highlevel_pipeline_stage_id,
        highlevel_aiso_score_field_id,
        highlevel_aiso_source_field_id,
        highlevel_auto_sync,
        highlevel_connected_at
      FROM users
      WHERE clerk_id = $1`,
      [userId]
    );

    if (result.length === 0) {
      return NextResponse.json({ connected: false });
    }

    const user = result[0];

    // Don't expose the full API key, just indicate if it's set
    const hasApiKey = !!user.highlevel_api_key;

    return NextResponse.json({
      connected: hasApiKey && !!user.highlevel_location_id,
      locationId: user.highlevel_location_id || null,
      pipelineId: user.highlevel_pipeline_id || null,
      pipelineStageId: user.highlevel_pipeline_stage_id || null,
      aisoScoreFieldId: user.highlevel_aiso_score_field_id || null,
      aisoSourceFieldId: user.highlevel_aiso_source_field_id || null,
      autoSync: user.highlevel_auto_sync || false,
      connectedAt: user.highlevel_connected_at || null,
    });
  } catch (error) {
    console.error('Error fetching HighLevel settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/integrations/highlevel/settings
 * Save or update HighLevel integration settings
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      apiKey,
      locationId,
      pipelineId,
      pipelineStageId,
      aisoScoreFieldId,
      aisoSourceFieldId,
      autoSync,
    } = body;

    // Validate required fields
    if (!apiKey || !locationId) {
      return NextResponse.json(
        { error: 'API key and Location ID are required' },
        { status: 400 }
      );
    }

    // Test the connection before saving
    const client = new HighLevelClient({
      apiKey,
      locationId,
    });

    const testResult = await client.testConnection();

    if (!testResult.success) {
      return NextResponse.json(
        {
          error: 'Failed to connect to HighLevel',
          details: testResult.error,
        },
        { status: 400 }
      );
    }

    // Save the settings
    await query(
      `UPDATE users SET
        highlevel_api_key = $1,
        highlevel_location_id = $2,
        highlevel_pipeline_id = $3,
        highlevel_pipeline_stage_id = $4,
        highlevel_aiso_score_field_id = $5,
        highlevel_aiso_source_field_id = $6,
        highlevel_auto_sync = $7,
        highlevel_connected_at = NOW()
      WHERE clerk_id = $8`,
      [
        apiKey,
        locationId,
        pipelineId || null,
        pipelineStageId || null,
        aisoScoreFieldId || null,
        aisoSourceFieldId || null,
        autoSync || false,
        userId,
      ]
    );

    return NextResponse.json({
      success: true,
      locationName: testResult.locationName,
      message: 'HighLevel connected successfully',
    });
  } catch (error) {
    console.error('Error saving HighLevel settings:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/integrations/highlevel/settings
 * Disconnect HighLevel integration
 */
export async function DELETE() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Clear all HighLevel settings
    await query(
      `UPDATE users SET
        highlevel_api_key = NULL,
        highlevel_location_id = NULL,
        highlevel_pipeline_id = NULL,
        highlevel_pipeline_stage_id = NULL,
        highlevel_aiso_score_field_id = NULL,
        highlevel_aiso_source_field_id = NULL,
        highlevel_auto_sync = FALSE,
        highlevel_connected_at = NULL
      WHERE clerk_id = $1`,
      [userId]
    );

    return NextResponse.json({
      success: true,
      message: 'HighLevel disconnected',
    });
  } catch (error) {
    console.error('Error disconnecting HighLevel:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect' },
      { status: 500 }
    );
  }
}
