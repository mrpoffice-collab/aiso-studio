import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db, query } from '@/lib/db';

/**
 * GET /api/calendar/topics
 * Get all topics for calendar view with publish dates
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

    // Get all topics from user's strategies with their publish dates
    const topics = await query(
      `SELECT
        t.id,
        t.title,
        t.status,
        t.target_publish_date,
        t.strategy_id,
        s.client_name,
        s.industry
       FROM topics t
       JOIN strategies s ON t.strategy_id = s.id
       WHERE s.user_id = $1
       ORDER BY t.target_publish_date ASC NULLS LAST`,
      [user.id]
    );

    return NextResponse.json({
      success: true,
      topics: topics || [],
    });
  } catch (error: any) {
    console.error('Calendar topics error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get topics' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/calendar/topics
 * Update topic publish date (drag and drop)
 */
export async function PATCH(request: NextRequest) {
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
    const { topicId, targetDate } = body;

    if (!topicId) {
      return NextResponse.json({ error: 'Topic ID required' }, { status: 400 });
    }

    // Verify topic belongs to user
    const [topic] = await query(
      `SELECT t.id FROM topics t
       JOIN strategies s ON t.strategy_id = s.id
       WHERE t.id = $1 AND s.user_id = $2`,
      [topicId, user.id]
    );

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    // Update the publish date
    await query(
      `UPDATE topics SET target_publish_date = $1, updated_at = NOW() WHERE id = $2`,
      [targetDate || null, topicId]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update topic date error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update topic' },
      { status: 500 }
    );
  }
}
