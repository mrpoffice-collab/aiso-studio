import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { inngest } from '@/lib/inngest/client';
import { scanAccessibilityFull, closeBrowser } from '@/lib/accessibility-scanner-playwright';

export const runtime = 'nodejs';
export const maxDuration = 60;

// POST - Start an accessibility audit (sync or async)
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.getUserByClerkId(clerkId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { url, contentAuditId, async = false } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    if (async) {
      // Queue background job via Inngest
      await inngest.send({
        name: 'audit/accessibility.requested',
        data: {
          userId: user.id,
          url,
          contentAuditId: contentAuditId || undefined,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Accessibility audit queued',
        status: 'processing',
      });
    }

    // Synchronous scan
    const result = await scanAccessibilityFull(url);
    await closeBrowser();

    // Save to database
    const audit = await db.createAccessibilityAudit({
      user_id: user.id,
      content_audit_id: contentAuditId || undefined,
      url: result.url,
      accessibility_score: result.accessibilityScore,
      critical_count: result.criticalCount,
      serious_count: result.seriousCount,
      moderate_count: result.moderateCount,
      minor_count: result.minorCount,
      total_violations: result.totalViolations,
      total_passes: result.totalPasses,
      violations: result.violations,
      passes: result.passes,
      wcag_breakdown: result.wcagBreakdown,
      scan_version: result.scanVersion,
      page_title: result.pageTitle,
      page_language: result.pageLanguage,
    });

    return NextResponse.json({
      success: true,
      audit: {
        id: audit.id,
        url: audit.url,
        accessibilityScore: audit.accessibility_score,
        criticalCount: audit.critical_count,
        seriousCount: audit.serious_count,
        moderateCount: audit.moderate_count,
        minorCount: audit.minor_count,
        totalViolations: audit.total_violations,
        totalPasses: audit.total_passes,
        violations: audit.violations,
        passes: audit.passes,
        wcagBreakdown: audit.wcag_breakdown,
        pageTitle: audit.page_title,
        createdAt: audit.created_at,
      },
    });
  } catch (error: any) {
    console.error('Accessibility audit error:', error);
    await closeBrowser();
    return NextResponse.json(
      { error: `Failed to run accessibility audit: ${error.message || error}` },
      { status: 500 }
    );
  }
}

// GET - List accessibility audits for user
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
    const limit = parseInt(searchParams.get('limit') || '50');
    const contentAuditId = searchParams.get('contentAuditId');

    if (contentAuditId) {
      const audit = await db.getAccessibilityAuditByContentAuditId(parseInt(contentAuditId));
      return NextResponse.json({ audit });
    }

    const audits = await db.getAccessibilityAuditsByUserId(user.id, limit);

    return NextResponse.json({
      audits: audits.map((a: any) => ({
        id: a.id,
        url: a.url,
        accessibilityScore: a.accessibility_score,
        criticalCount: a.critical_count,
        seriousCount: a.serious_count,
        moderateCount: a.moderate_count,
        minorCount: a.minor_count,
        totalViolations: a.total_violations,
        pageTitle: a.page_title,
        createdAt: a.created_at,
      })),
    });
  } catch (error) {
    console.error('Error fetching accessibility audits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audits' },
      { status: 500 }
    );
  }
}
