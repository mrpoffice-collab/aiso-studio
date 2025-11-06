import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

/**
 * PATCH /api/topics/[id]
 * Update a topic (title, keyword, outline, target_flesch_score override)
 * Force reload v2
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: topicId } = await params;

    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await db.getUserByClerkId(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get topic and verify ownership through strategy
    const topic = await db.getTopicById(topicId);
    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    const strategy = await db.getStrategyById(topic.strategy_id);
    if (!strategy || strategy.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { title, keyword, outline, target_flesch_score } = body;

    // Update topic
    const updatedTopic = await db.updateTopic(topicId, {
      title,
      keyword,
      outline,
      target_flesch_score,
    });

    return NextResponse.json({
      success: true,
      topic: updatedTopic,
    });
  } catch (error: any) {
    console.error('Topic update error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update topic' },
      { status: 500 }
    );
  }
}
