import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

/**
 * GET /api/user/domain-lock
 * Get the current locked domain for the user
 */
export async function GET() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.getUserByClerkId(clerkUser.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      lockedDomain: user.locked_domain,
      tier: user.subscription_tier,
    });
  } catch (error) {
    console.error('Error getting locked domain:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/user/domain-lock
 * Set the locked domain for Starter tier users (only if not already set)
 */
export async function POST(request: NextRequest) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.getUserByClerkId(clerkUser.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only allow setting for trial/starter users
    const restrictedTiers = ['trial', 'starter'];
    if (!restrictedTiers.includes(user.subscription_tier)) {
      return NextResponse.json({
        message: 'Your plan allows multiple domains',
        lockedDomain: null,
      });
    }

    // If already locked, return the existing lock
    if (user.locked_domain) {
      return NextResponse.json({
        lockedDomain: user.locked_domain,
        alreadyLocked: true,
      });
    }

    // Parse the domain from the request
    const body = await request.json();
    const { domain } = body;

    if (!domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
    }

    // Normalize the domain
    let normalizedDomain: string;
    try {
      if (domain.includes('://')) {
        const url = new URL(domain);
        normalizedDomain = url.hostname.replace(/^www\./, '').toLowerCase();
      } else {
        normalizedDomain = domain.replace(/^www\./, '').toLowerCase().split('/')[0];
      }
    } catch {
      normalizedDomain = domain.replace(/^www\./, '').toLowerCase().split('/')[0];
    }

    // Set the locked domain
    const result = await db.setLockedDomain(user.id, normalizedDomain);

    return NextResponse.json({
      lockedDomain: result || normalizedDomain,
      newlyLocked: true,
    });
  } catch (error) {
    console.error('Error setting locked domain:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/user/domain-lock
 * Clear the locked domain (admin use only for now)
 */
export async function DELETE() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.getUserByClerkId(clerkUser.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only admins can clear the domain lock
    const ADMIN_EMAILS = ['mrpoffice@gmail.com'];
    if (!ADMIN_EMAILS.includes(user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await db.clearLockedDomain(user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing locked domain:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
