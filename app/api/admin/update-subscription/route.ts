import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

/**
 * POST /api/admin/update-subscription
 * Manually update user subscription (Backdoor admin access)
 */
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await db.getUserByClerkId(clerkUserId);
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // TODO: Add proper admin role check
    const ADMIN_EMAILS = [
      'TODO_REPLACE_WITH_YOUR_EMAIL@gmail.com', // ⚠️ UPDATE THIS WITH YOUR ACTUAL EMAIL
    ];
    if (!ADMIN_EMAILS.includes(currentUser.email)) {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, tier, articleLimit, status, reason } = body;

    if (!userId || !tier || !articleLimit) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update subscription
    await db.updateUserSubscription({
      userId,
      tier,
      status,
      articleLimit,
      manualOverride: true,
      overrideReason: reason || 'Manual activation',
      overrideBy: currentUser.email,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error updating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    );
  }
}
