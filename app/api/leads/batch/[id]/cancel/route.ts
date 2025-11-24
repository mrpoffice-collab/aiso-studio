import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

/**
 * POST /api/leads/batch/[id]/cancel
 * Cancel a running batch discovery job
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

    const user = await db.getUserByClerkId(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id } = await params;
    const batchId = id;

    // Get the batch to verify ownership
    const batch = await db.getBatchDiscoveryById(batchId);
    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    if (batch.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update batch status to cancelled
    await db.updateBatchDiscovery(batchId, {
      status: 'cancelled',
      completed_at: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Cancel batch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cancel batch' },
      { status: 500 }
    );
  }
}
