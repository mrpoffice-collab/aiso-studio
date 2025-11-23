import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  try {
    console.log('[DEBUG] Starting user debug check...');

    const clerkUser = await currentUser();
    console.log('[DEBUG] Clerk user:', clerkUser ? `ID: ${clerkUser.id}` : 'null');

    if (!clerkUser) {
      return NextResponse.json({
        error: 'Not signed in to Clerk',
        clerkUser: null,
        dbUser: null,
      });
    }

    const dbUser = await db.getUserByClerkId(clerkUser.id);
    console.log('[DEBUG] Database user:', dbUser ? `ID: ${dbUser.id}` : 'null');

    return NextResponse.json({
      clerkUser: {
        id: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
      },
      dbUser: dbUser ? {
        id: dbUser.id,
        clerk_id: dbUser.clerk_id,
        email: dbUser.email,
        name: dbUser.name,
        subscription_tier: dbUser.subscription_tier,
      } : null,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[DEBUG] Error in debug endpoint:', error);
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
