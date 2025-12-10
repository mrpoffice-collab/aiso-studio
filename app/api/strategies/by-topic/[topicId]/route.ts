import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ topicId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { topicId } = await params;

    const strategy = await db.getStrategyByTopicId(topicId);
    if (!strategy) {
      return NextResponse.json({ error: 'Strategy not found' }, { status: 404 });
    }

    // Don't return the encrypted password
    const safeStrategy = {
      ...strategy,
      wordpress_app_password: strategy.wordpress_app_password ? '********' : null,
    };

    return NextResponse.json({ strategy: safeStrategy });
  } catch (error: any) {
    console.error('Error fetching strategy by topic:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
