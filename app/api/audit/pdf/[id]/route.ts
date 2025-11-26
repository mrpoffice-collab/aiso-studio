import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { generateAuditPDF } from '@/lib/aiso-audit-engine';

export const runtime = 'nodejs';

/**
 * GET /api/audit/pdf/[id]
 * Generate and download PDF for an audit
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.getUserByClerkId(clerkId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id } = await params;
    const auditId = parseInt(id);

    if (isNaN(auditId)) {
      return NextResponse.json({ error: 'Invalid audit ID' }, { status: 400 });
    }

    // Get the audit
    const audit = await db.getAccessibilityAuditById(auditId);
    if (!audit) {
      return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
    }

    // Verify ownership
    if (audit.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get agency branding if available
    let branding: any = {};
    try {
      const userBranding = await db.getUserBranding(user.id);
      if (userBranding) {
        branding = {
          name: userBranding.agency_name,
          logo: userBranding.agency_logo_url,
          primaryColor: userBranding.agency_primary_color,
        };
      }
    } catch (e) {
      // No branding, use defaults
    }

    // Helper to safely parse JSON fields
    const parseJsonField = (field: any, fallback: any = []) => {
      if (!field) return fallback;
      if (Array.isArray(field)) return field;
      if (typeof field === 'object') return field;
      if (typeof field === 'string') {
        try {
          return JSON.parse(field);
        } catch {
          return fallback;
        }
      }
      return fallback;
    };

    // Format the audit result
    const formattedAudit = {
      id: audit.id,
      url: audit.url,
      domain: new URL(audit.url).hostname.replace(/^www\./, ''),
      accessibilityScore: audit.accessibility_score || 0,
      criticalCount: audit.critical_count || 0,
      seriousCount: audit.serious_count || 0,
      moderateCount: audit.moderate_count || 0,
      minorCount: audit.minor_count || 0,
      totalViolations: audit.total_violations || 0,
      totalPasses: audit.total_passes || 0,
      violations: parseJsonField(audit.violations, []),
      passes: parseJsonField(audit.passes, []),
      wcagBreakdown: parseJsonField(audit.wcag_breakdown, {}),
      pageTitle: audit.page_title || '',
      aisoScore: audit.aiso_score || 0,
      aeoScore: audit.aeo_score || 0,
      seoScore: audit.seo_score || 0,
      readabilityScore: audit.readability_score || 0,
      engagementScore: audit.engagement_score || 0,
      factCheckScore: audit.fact_check_score || 0,
      seoDetails: parseJsonField(audit.seo_details, {}),
      readabilityDetails: parseJsonField(audit.readability_details, {}),
      engagementDetails: parseJsonField(audit.engagement_details, {}),
      aeoDetails: parseJsonField(audit.aeo_details, {}),
      factChecks: parseJsonField(audit.fact_checks, []),
      createdAt: new Date(audit.created_at),
      isExisting: false,
    };

    // Generate PDF
    const pdfBuffer = generateAuditPDF(formattedAudit as any, branding);

    // Return PDF
    const domain = formattedAudit.domain;
    const filename = `aiso-audit-${domain}-${Date.now()}.pdf`;

    // Convert Buffer to Uint8Array for NextResponse compatibility
    const pdfData = new Uint8Array(pdfBuffer);

    return new NextResponse(pdfData, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: `Failed to generate PDF: ${error.message}` },
      { status: 500 }
    );
  }
}
