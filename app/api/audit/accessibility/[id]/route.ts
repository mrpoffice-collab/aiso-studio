import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

// GET - Get single accessibility audit
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const audit = await db.getAccessibilityAuditById(parseInt(id));

    if (!audit) {
      return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
    }

    return NextResponse.json({
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
        pageLanguage: audit.page_language,
        scanVersion: audit.scan_version,
        aiSuggestions: audit.ai_suggestions,
        remediationApplied: audit.remediation_applied,
        createdAt: audit.created_at,
      },
    });
  } catch (error) {
    console.error('Error fetching accessibility audit:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit' },
      { status: 500 }
    );
  }
}

// DELETE - Delete accessibility audit
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await db.deleteAccessibilityAudit(parseInt(id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting accessibility audit:', error);
    return NextResponse.json(
      { error: 'Failed to delete audit' },
      { status: 500 }
    );
  }
}
