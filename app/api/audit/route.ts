import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { performFactCheck } from '@/lib/fact-check';
import { calculateAISOScore } from '@/lib/content-scoring';
import { scrapeContent } from '@/lib/aiso-audit-engine';
import * as cheerio from 'cheerio';

/**
 * POST /api/audit
 * Audit existing blog post content for quality
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await db.getUserByClerkId(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    let { content, url, title, metaDescription } = body;

    // Normalize URL if provided
    if (url) {
      url = url.trim();

      // Add protocol if missing
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      // Add www. if it's just a domain name without subdomain
      // e.g., "facebook.com" -> "https://www.facebook.com"
      // but "blog.facebook.com" stays as-is
      try {
        const urlObj = new URL(url);
        const parts = urlObj.hostname.split('.');

        // If it's just domain.tld (2 parts), add www.
        if (parts.length === 2) {
          urlObj.hostname = 'www.' + urlObj.hostname;
          url = urlObj.toString();
        }
      } catch (e) {
        // If URL parsing fails, we'll let the fetch fail naturally below
      }
    }

    // If URL provided, scrape the content using the engine's scraper
    // This supports both static sites (fetch) and JS-rendered sites (headless browser)
    if (url && !content) {
      console.log(`Scraping content from URL: ${url}`);

      try {
        const scraped = await scrapeContent(url);
        content = scraped.content;
        title = title || scraped.title;
        metaDescription = metaDescription || scraped.metaDescription;

        if (!content || content.length < 100) {
          throw new Error('Could not extract meaningful content from URL');
        }

        console.log(`Scraped ${content.length} characters from URL`);
      } catch (error: any) {
        return NextResponse.json(
          { error: `Failed to scrape URL: ${error.message}` },
          { status: 400 }
        );
      }
    }

    if (!content || content.trim().length < 100) {
      return NextResponse.json(
        { error: 'Please provide content (min 100 characters) or a valid URL' },
        { status: 400 }
      );
    }

    console.log(`Auditing content (${content.length} characters)`);

    // Use empty string if title/meta not provided (for manual content audits)
    // Note: If URL was provided, scrapeContent already extracted title/meta
    title = title || '';
    metaDescription = metaDescription || '';

    // Perform comprehensive scoring
    console.log('Running comprehensive AISO analysis...');

    // Fact-checking (KEY DIFFERENTIATOR - 30% weight!)
    const factCheckResult = await performFactCheck(content);

    // AISO scoring (AEO, GEO, SEO, Readability, Engagement + Fact-check)
    // Note: No local context here since audit doesn't have strategy context
    const aisoScores = calculateAISOScore(
      content,
      title,
      metaDescription,
      factCheckResult.overallScore // Fact-check gets 30% weight in national content
    );

    // Log usage
    const estimatedCost = 0.03; // $0.03 per audit
    await db.logUsage({
      user_id: user.id,
      operation_type: 'content_audit',
      cost_usd: estimatedCost,
      tokens_used: 1000,
      metadata: {
        content_length: content.length,
        fact_check_score: factCheckResult.overallScore,
        aeo_score: aisoScores.aeoScore,
        aiso_score: aisoScores.aisoScore,
        url: url || null,
      },
    });

    return NextResponse.json({
      success: true,
      content,
      url: url || undefined,
      title,
      metaDescription,

      // AISO Stack Scores (NEW)
      aisoScore: aisoScores.aisoScore, // Overall AISO score with fact-checking (30% weight)
      aeoScore: aisoScores.aeoScore, // Answer Engine Optimization

      // Legacy scores (kept for backward compatibility)
      overallScore: aisoScores.overallScore, // Base score without fact-check
      factCheckScore: factCheckResult.overallScore,
      seoScore: aisoScores.seoScore,
      readabilityScore: aisoScores.readabilityScore,
      engagementScore: aisoScores.engagementScore,

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
      aeoDetails: aisoScores.aeoDetails, // NEW - AEO breakdown
    });
  } catch (error: any) {
    console.error('Audit error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to audit content' },
      { status: 500 }
    );
  }
}
