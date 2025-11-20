import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

/**
 * GET /api/admin/users
 * Fetch all users with subscription info (Admin only)
 */
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await db.getUserByClerkId(userId);
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // TODO: Add proper admin role check
    // For now, only allow specific email or add admin flag to users table
    const ADMIN_EMAILS = [
      'TODO_REPLACE_WITH_YOUR_EMAIL@gmail.com', // ⚠️ UPDATE THIS WITH YOUR ACTUAL EMAIL
    ];
    if (!ADMIN_EMAILS.includes(currentUser.email)) {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    const users = await db.getAllUsersWithSubscriptions();

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
