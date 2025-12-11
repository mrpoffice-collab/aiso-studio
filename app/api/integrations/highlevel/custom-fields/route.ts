import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { query } from '@/lib/db';
import { HighLevelClient } from '@/lib/highlevel';

/**
 * GET /api/integrations/highlevel/custom-fields
 * Get available custom fields from HighLevel for mapping AISO data
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
    const fieldsResult = await client.getContactCustomFields();

    if (!fieldsResult.success) {
      return NextResponse.json(
        { error: 'Failed to fetch custom fields', details: fieldsResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      customFields: fieldsResult.data?.customFields || [],
    });
  } catch (error) {
    console.error('Error fetching HighLevel custom fields:', error);
    return NextResponse.json(
      { error: 'Failed to fetch custom fields' },
      { status: 500 }
    );
  }
}
