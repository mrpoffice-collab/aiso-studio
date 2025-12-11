import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import {
  parseWebhookPayload,
  handleHighLevelWebhook,
  HighLevelWebhookEvent,
} from '@/lib/highlevel';

/**
 * POST /api/webhooks/highlevel
 *
 * Webhook receiver for HighLevel events.
 * This enables powerful bidirectional sync:
 *
 * When HighLevel sends:
 * - ContactCreate → Auto-run AISO audit on their website
 * - ContactUpdate → Sync changes
 * - OpportunityStageUpdate → Update AISO pipeline
 * - OpportunityStatusUpdate → Track won/lost deals
 *
 * Setup in HighLevel:
 * 1. Go to Settings > Integrations > Webhooks
 * 2. Add webhook URL: https://aiso.studio/api/webhooks/highlevel
 * 3. Select events: ContactCreate, OpportunityStageUpdate, etc.
 */
export async function POST(request: NextRequest) {
  try {
    // Get webhook signature for verification
    const signature = request.headers.get('x-wh-signature') || '';
    const locationId = request.headers.get('x-location-id') || '';

    // Parse the payload
    const body = await request.text();
    const { valid, event, payload, error } = parseWebhookPayload(body);

    if (!valid || !event || !payload) {
      console.error('Invalid HighLevel webhook payload:', error);
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Log the webhook for debugging
    console.log(`HighLevel webhook received: ${event}`, {
      locationId: payload.locationId || locationId,
      id: payload.id,
    });

    // Find the user who owns this HighLevel location
    const userResult = await query(
      `SELECT id, clerk_id, highlevel_auto_sync
       FROM users
       WHERE highlevel_location_id = $1`,
      [payload.locationId || locationId]
    );

    if (userResult.length === 0) {
      // No user has this location configured - ignore
      console.log(`No user found for HighLevel location: ${payload.locationId || locationId}`);
      return NextResponse.json({ received: true, processed: false });
    }

    const user = userResult[0];

    // Handle the webhook event
    const result = await handleHighLevelWebhook(event as HighLevelWebhookEvent, payload);

    // Process specific events with AISO actions
    switch (event) {
      case 'ContactCreate': {
        // When a new contact is added in HighLevel, optionally auto-audit their website
        if (user.highlevel_auto_sync && payload.website) {
          // Queue an audit for this contact's website
          await query(
            `INSERT INTO webhook_queue (
              user_id,
              event_type,
              source,
              payload,
              status,
              created_at
            ) VALUES ($1, $2, $3, $4, $5, NOW())`,
            [
              user.id,
              'auto_audit',
              'highlevel',
              JSON.stringify({
                contactId: payload.id,
                website: payload.website,
                email: payload.email,
                name: payload.name || `${payload.firstName || ''} ${payload.lastName || ''}`.trim(),
              }),
              'pending',
            ]
          );

          console.log(`Queued auto-audit for HighLevel contact: ${payload.id}`);
        }
        break;
      }

      case 'OpportunityStageUpdate': {
        // Sync opportunity stage changes back to AISO pipeline
        if (payload.id) {
          await query(
            `UPDATE pipeline_leads
             SET highlevel_stage_id = $1,
                 updated_at = NOW()
             WHERE highlevel_opportunity_id = $2
               AND user_id = $3`,
            [payload.pipelineStageId, payload.id, user.id]
          );
        }
        break;
      }

      case 'OpportunityStatusUpdate': {
        // Track won/lost deals
        if (payload.id && payload.status) {
          let aisoStatus = 'active';
          if (payload.status === 'won') {
            aisoStatus = 'won';
          } else if (payload.status === 'lost') {
            aisoStatus = 'lost';
          } else if (payload.status === 'abandoned') {
            aisoStatus = 'lost';
          }

          await query(
            `UPDATE pipeline_leads
             SET status = $1,
                 updated_at = NOW()
             WHERE highlevel_opportunity_id = $2
               AND user_id = $3`,
            [aisoStatus, payload.id, user.id]
          );
        }
        break;
      }

      case 'ContactTagUpdate': {
        // Could trigger actions based on specific tags
        // e.g., if tagged "Needs AISO Audit" → queue audit
        if (payload.tags?.includes('Needs AISO Audit') && payload.website) {
          await query(
            `INSERT INTO webhook_queue (
              user_id,
              event_type,
              source,
              payload,
              status,
              created_at
            ) VALUES ($1, $2, $3, $4, $5, NOW())
            ON CONFLICT DO NOTHING`,
            [
              user.id,
              'tag_triggered_audit',
              'highlevel',
              JSON.stringify({
                contactId: payload.id,
                website: payload.website,
                email: payload.email,
                tag: 'Needs AISO Audit',
              }),
              'pending',
            ]
          );
        }
        break;
      }
    }

    // Log the webhook event
    await query(
      `INSERT INTO webhook_logs (
        user_id,
        source,
        event_type,
        payload,
        result,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, NOW())`,
      [
        user.id,
        'highlevel',
        event,
        body.substring(0, 10000), // Limit payload size
        JSON.stringify(result),
      ]
    );

    return NextResponse.json({
      received: true,
      processed: true,
      action: result.action,
    });
  } catch (error) {
    console.error('Error processing HighLevel webhook:', error);

    // Still return 200 to prevent HighLevel from retrying
    return NextResponse.json({
      received: true,
      processed: false,
      error: 'Internal processing error',
    });
  }
}

/**
 * GET /api/webhooks/highlevel
 * Verification endpoint for HighLevel webhook setup
 */
export async function GET() {
  return NextResponse.json({
    status: 'active',
    message: 'AISO Studio HighLevel webhook endpoint',
    supportedEvents: [
      'ContactCreate',
      'ContactUpdate',
      'ContactTagUpdate',
      'OpportunityCreate',
      'OpportunityUpdate',
      'OpportunityStageUpdate',
      'OpportunityStatusUpdate',
    ],
    documentation: 'https://aiso.studio/docs/integrations/highlevel',
  });
}
