import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { runAISOAudit, scrapeContent } from '@/lib/aiso-audit-engine';
import { performFactCheck } from '@/lib/fact-check';
import { calculateAISOScore } from '@/lib/content-scoring';

/**
 * POST /api/audit
 * Full AISO Audit - includes WCAG accessibility + content scoring
 *
 * When URL is provided: Runs full unified audit (WCAG + Content)
 * When only content is provided: Runs content-only audit (no WCAG possible)
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.getUserByClerkId(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    let { content, url, title, metaDescription } = body;

    // Normalize URL if provided
    if (url) {
      url = url.trim();
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      try {
        const urlObj = new URL(url);
        const parts = urlObj.hostname.split('.');
        if (parts.length === 2) {
          urlObj.hostname = 'www.' + urlObj.hostname;
          url = urlObj.toString();
        }
      } catch (e) {
        // Keep as-is
      }
    }

    // If URL provided, run FULL unified audit (WCAG + Content)
    if (url && !content) {
      console.log(`Running full AISO audit on URL: ${url}`);

      try {
        // Use the unified audit engine - this includes WCAG!
        const auditResult = await runAISOAudit(url, user.id, {
          checkRecent: false, // Always run fresh for explicit audit requests
        });

        // Log usage
        await db.logUsage({
          user_id: user.id,
          operation_type: 'content_audit',
          cost_usd: 0.05, // Full audit costs more
          tokens_used: 2000,
          metadata: {
            url,
            aiso_score: auditResult.aisoScore,
            accessibility_score: auditResult.accessibilityScore,
            audit_id: auditResult.id,
            audit_type: 'full_with_wcag',
          },
        });

        // Return unified results
        return NextResponse.json({
          success: true,
          auditId: auditResult.id,
          url: auditResult.url,
          title: auditResult.pageTitle,

          // AISO Content Scores
          aisoScore: auditResult.aisoScore,
          aeoScore: auditResult.aeoScore,
          seoScore: auditResult.seoScore,
          readabilityScore: auditResult.readabilityScore,
          engagementScore: auditResult.engagementScore,
          factCheckScore: auditResult.factCheckScore,
          overallScore: auditResult.aisoScore, // For backward compatibility

          // WCAG Accessibility Scores
          accessibilityScore: auditResult.accessibilityScore,
          criticalCount: auditResult.criticalCount,
          seriousCount: auditResult.seriousCount,
          moderateCount: auditResult.moderateCount,
          minorCount: auditResult.minorCount,
          totalViolations: auditResult.totalViolations,
          totalPasses: auditResult.totalPasses,
          violations: auditResult.violations,
          wcagBreakdown: auditResult.wcagBreakdown,

          // Details
          seoDetails: auditResult.seoDetails,
          readabilityDetails: auditResult.readabilityDetails,
          engagementDetails: auditResult.engagementDetails,
          aeoDetails: auditResult.aeoDetails,
          factChecks: auditResult.factChecks,

          // PDF
          pdfUrl: auditResult.pdfUrl,
        });
      } catch (error: any) {
        console.error('Full audit failed:', error);
        return NextResponse.json(
          { error: `Failed to audit URL: ${error.message}` },
          { status: 400 }
        );
      }
    }

    // If only content provided (no URL), run content-only audit
    // WCAG requires a URL to scan, so we can only do content scoring here
    if (content && content.trim().length >= 100) {
      console.log(`Running content-only audit (${content.length} characters)`);

      title = title || '';
      metaDescription = metaDescription || '';

      // Fact-checking
      const factCheckResult = await performFactCheck(content);

      // AISO scoring
      const aisoScores = calculateAISOScore(
        content,
        title,
        metaDescription,
        factCheckResult.overallScore
      );

      // Log usage
      await db.logUsage({
        user_id: user.id,
        operation_type: 'content_audit',
        cost_usd: 0.03,
        tokens_used: 1000,
        metadata: {
          content_length: content.length,
          aiso_score: aisoScores.aisoScore,
        },
      });

      return NextResponse.json({
        success: true,
        content,
        title,
        metaDescription,

        // Content Scores
        aisoScore: aisoScores.aisoScore,
        aeoScore: aisoScores.aeoScore,
        seoScore: aisoScores.seoScore,
        readabilityScore: aisoScores.readabilityScore,
        engagementScore: aisoScores.engagementScore,
        overallScore: aisoScores.overallScore,
        factCheckScore: factCheckResult.overallScore,

        // Fact-check details
        verifiedClaims: factCheckResult.verifiedClaims,
        uncertainClaims: factCheckResult.uncertainClaims,
        unverifiedClaims: factCheckResult.unverifiedClaims,
        totalClaims: factCheckResult.totalClaims,
        factChecks: factCheckResult.factChecks,

        // Score details
        seoDetails: aisoScores.seoDetails,
        readabilityDetails: aisoScores.readabilityDetails,
        engagementDetails: aisoScores.engagementDetails,
        aeoDetails: aisoScores.aeoDetails,

        // No WCAG for content-only audits
        accessibilityScore: null,
        wcagNote: 'WCAG accessibility scoring requires a URL to scan. Paste a URL instead of content to get accessibility scores.',
      });
    }

    return NextResponse.json(
      { error: 'Please provide content (min 100 characters) or a valid URL' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Audit error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to audit content' },
      { status: 500 }
    );
  }
}
