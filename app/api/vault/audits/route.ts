import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

/**
 * GET /api/vault/audits
 * Get all audits for a domain from both accessibility_audits and lead_audits tables
 */
export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.getUserByClerkId(clerkId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');

    if (!domain) {
      return NextResponse.json({ error: 'Domain parameter required' }, { status: 400 });
    }

    // Fetch from accessibility_audits (URL-based)
    const accessibilityAudits = await sql`
      SELECT
        id,
        url,
        accessibility_score as "accessibilityScore",
        critical_count as "criticalCount",
        serious_count as "seriousCount",
        moderate_count as "moderateCount",
        minor_count as "minorCount",
        total_violations as "totalViolations",
        page_title as "pageTitle",
        created_at as "createdAt",
        'accessibility_audits' as source
      FROM accessibility_audits
      WHERE user_id = ${user.id}
        AND LOWER(url) LIKE LOWER(${'%' + domain + '%'})
      ORDER BY created_at DESC
    `;

    // Fetch from lead_audits (domain-based)
    const leadAudits = await sql`
      SELECT
        id,
        domain as url,
        accessibility_score as "accessibilityScore",
        wcag_critical_violations as "criticalCount",
        wcag_serious_violations as "seriousCount",
        wcag_moderate_violations as "moderateCount",
        wcag_minor_violations as "minorCount",
        wcag_total_violations as "totalViolations",
        domain as "pageTitle",
        created_at as "createdAt",
        'lead_audits' as source
      FROM lead_audits
      WHERE user_id = ${user.id}
        AND LOWER(domain) LIKE LOWER(${'%' + domain + '%'})
        AND accessibility_score IS NOT NULL
      ORDER BY created_at DESC
    `;

    // Combine and sort by date
    const allAudits = [...accessibilityAudits, ...leadAudits]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ audits: allAudits });
  } catch (error) {
    console.error('Failed to load vault audits:', error);
    return NextResponse.json({ error: 'Failed to load audits' }, { status: 500 });
  }
}
