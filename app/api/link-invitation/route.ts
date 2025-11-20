import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { invitationToken } = body;

    if (!invitationToken) {
      return NextResponse.json(
        { error: 'Invitation token is required' },
        { status: 400 }
      );
    }

    // Check if invitation exists and is valid
    const invitation = await db.getInvitationByToken(invitationToken);

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation' },
        { status: 404 }
      );
    }

    // Check if user already has an account
    const existingUser = await db.getUserByClerkId(clerkId);

    if (existingUser && existingUser.id !== invitation.id) {
      // User already has a different account, this shouldn't happen
      return NextResponse.json(
        { error: 'Account conflict' },
        { status: 409 }
      );
    }

    // Link the Clerk account to the pre-configured user
    const linkedUser = await db.linkInvitationToClerkAccount(invitationToken, clerkId);

    if (!linkedUser) {
      return NextResponse.json(
        { error: 'Failed to link invitation' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        email: linkedUser.email,
        name: linkedUser.name,
        subscription_tier: linkedUser.subscription_tier,
        article_limit: linkedUser.article_limit,
      }
    });

  } catch (error) {
    console.error('Error linking invitation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
