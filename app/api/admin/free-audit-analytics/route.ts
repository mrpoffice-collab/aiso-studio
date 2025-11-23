import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

/**
 * GET /api/admin/free-audit-analytics
 * Returns comprehensive analytics about free audit usage and conversions
 * Admin only
 */
export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await db.getUserByClerkId(clerkId);
    if (!user || !user.is_admin) {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view') || 'overview'; // overview, audits, domains, issues
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let data: any = {};

    switch (view) {
      case 'overview':
        // Get high-level analytics
        const analytics = await db.getFreeAuditAnalytics();

        // Get date range data (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const dateRangeData = await db.getFreeAuditsByDateRange(
          thirtyDaysAgo.toISOString(),
          new Date().toISOString()
        );

        data = {
          summary: analytics,
          dailyStats: dateRangeData,
        };
        break;

      case 'audits':
        // Get all audits with user info
        const audits = await db.getAllFreeAudits(limit, offset);
        data = {
          audits,
          pagination: { limit, offset },
        };
        break;

      case 'domains':
        // Get top audited domains
        const domains = await db.getTopAuditedDomains(limit);
        data = {
          domains,
        };
        break;

      case 'issues':
        // Get scoring issues
        const issues = await db.getScoringIssues();
        data = {
          issues,
          note: 'Pages with any score component below 30',
        };
        break;

      case 'daterange':
        if (!startDate || !endDate) {
          return NextResponse.json(
            { error: 'startDate and endDate required for daterange view' },
            { status: 400 }
          );
        }
        const rangeData = await db.getFreeAuditsByDateRange(startDate, endDate);
        data = {
          dateRange: { startDate, endDate },
          dailyStats: rangeData,
        };
        break;

      default:
        return NextResponse.json({ error: 'Invalid view parameter' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      view,
      data,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Admin analytics error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
