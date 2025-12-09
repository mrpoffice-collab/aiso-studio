import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await db.getUserByClerkId(clerkUser.id);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return user data without sensitive fields
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        subscription_tier: user.subscription_tier,
        subscription_status: user.subscription_status,
        article_limit: user.article_limit,
        articles_used_this_month: user.articles_used_this_month,
        strategies_limit: user.strategies_limit,
        strategies_used: user.strategies_used,
        audits_limit: user.audits_limit || user.audit_limit,
        audits_used_this_month: user.audits_used_this_month,
        rewrites_limit: user.rewrites_limit,
        rewrites_used_this_month: user.rewrites_used_this_month,
        repurposes_limit: user.repurposes_limit,
        repurposes_used_this_month: user.repurposes_used_this_month,
        // New tier limits
        active_clients_limit: user.active_clients_limit,
        active_clients_used: user.active_clients_used,
        vault_storage_limit_mb: user.vault_storage_limit_mb,
        vault_storage_used_mb: user.vault_storage_used_mb,
        data_retention_days: user.data_retention_days,
        locked_domain: user.locked_domain,
        agency_id: user.agency_id,
        agency_status: user.agency_status,
        created_at: user.created_at
      }
    });
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}
