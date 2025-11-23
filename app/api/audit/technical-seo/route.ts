import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { inngest } from '@/lib/inngest/client';
import { scanTechnicalSEO } from '@/lib/technical-seo-scanner';

export const runtime = 'nodejs';
export const maxDuration = 60;

// POST - Start a technical SEO audit (sync or async)
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
        name: 'audit/technical-seo.requested',
        data: {
          userId: user.id,
          url,
          contentAuditId: contentAuditId || undefined,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Technical SEO audit queued',
        status: 'processing',
      });
    }

    // Synchronous scan
    const result = await scanTechnicalSEO(url);

    // Parse estimated cost range from string like "$5,500-$11,000"
    let estimatedMinCost: number | undefined;
    let estimatedMaxCost: number | undefined;
    if (result.agencyCanFix.estimatedCost) {
      const matches = result.agencyCanFix.estimatedCost.match(/\$([0-9,]+)-\$([0-9,]+)/);
      if (matches) {
        estimatedMinCost = parseInt(matches[1].replace(/,/g, '')) * 100; // Convert to cents
        estimatedMaxCost = parseInt(matches[2].replace(/,/g, '')) * 100; // Convert to cents
      }
    }

    // Save to database
    const audit = await db.createTechnicalSeoAudit({
      user_id: user.id,
      content_audit_id: contentAuditId || undefined,
      url: result.url,
      overall_score: result.overallScore,
      ai_searchability_score: result.aiSearchabilityScore,
      technical_seo_score: result.technicalSeoScore,
      agency_fixable_count: result.agencyCanFix.count,
      owner_action_count: result.ownerMustChange.count,
      estimated_min_cost: estimatedMinCost,
      estimated_max_cost: estimatedMaxCost,
      agency_can_fix: result.agencyCanFix,
      owner_must_change: result.ownerMustChange,
      checks: result.checks,
      recommendations: result.recommendations,
      scan_version: '1.0.0',
    });

    return NextResponse.json({
      success: true,
      audit: {
        id: audit.id,
        url: audit.url,
        overallScore: audit.overall_score,
        aiSearchabilityScore: audit.ai_searchability_score,
        technicalSeoScore: audit.technical_seo_score,
        agencyCanFix: {
          count: audit.agency_fixable_count,
          estimatedCost: result.agencyCanFix.estimatedCost,
          issues: result.agencyCanFix.issues,
        },
        ownerMustChange: {
          count: audit.owner_action_count,
          issues: result.ownerMustChange.issues,
        },
        checks: audit.checks,
        recommendations: audit.recommendations,
        createdAt: audit.created_at,
      },
    });
  } catch (error: any) {
    console.error('Technical SEO audit error:', error);
    return NextResponse.json(
      { error: `Failed to run technical SEO audit: ${error.message || error}` },
      { status: 500 }
    );
  }
}

// GET - List technical SEO audits for user
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
      const audit = await db.getTechnicalSeoAuditByContentAuditId(parseInt(contentAuditId));
      return NextResponse.json({ audit });
    }

    const audits = await db.getTechnicalSeoAuditsByUserId(user.id, limit);

    return NextResponse.json({
      audits: audits.map((a: any) => ({
        id: a.id,
        url: a.url,
        overallScore: a.overall_score,
        aiSearchabilityScore: a.ai_searchability_score,
        technicalSeoScore: a.technical_seo_score,
        agencyFixableCount: a.agency_fixable_count,
        ownerActionCount: a.owner_action_count,
        estimatedMinCost: a.estimated_min_cost,
        estimatedMaxCost: a.estimated_max_cost,
        createdAt: a.created_at,
      })),
    });
  } catch (error) {
    console.error('Error fetching technical SEO audits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audits' },
      { status: 500 }
    );
  }
}
