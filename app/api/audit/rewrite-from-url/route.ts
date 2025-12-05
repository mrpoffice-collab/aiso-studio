import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { scoreContent } from '@/lib/content-scoring';
import { scrapeContent } from '@/lib/aiso-audit-engine';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

/**
 * POST /api/audit/rewrite-from-url
 * Rewrite content from URL based on batch audit scores
 * Skips full fact-checking to save cost/time
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
    const { url, currentScores } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    console.log(`Rewriting content from: ${url}`);

    // Scrape content from URL using the engine's scraper
    // This supports both static sites (fetch) and JS-rendered sites (headless browser)
    const scraped = await scrapeContent(url);
    const title = scraped.title;
    const metaDescription = scraped.metaDescription;
    const originalContent = scraped.content;

    if (!originalContent || originalContent.length < 100) {
      throw new Error('Could not extract meaningful content from URL');
    }

    console.log(`Scraped ${originalContent.length} characters. Starting iterative improvement...`);

    // Iterative improvement - try up to 3 times to get all scores above 75
    let improvedContent = originalContent;
    let newContentScores = scoreContent(originalContent, title, metaDescription);
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      attempts++;

      // Calculate current overall score
      const currentOverall = Math.round(
        newContentScores.seoScore * 0.35 +
        newContentScores.readabilityScore * 0.30 +
        newContentScores.engagementScore * 0.35
      );

      console.log(`Attempt ${attempts}: SEO=${newContentScores.seoScore}, Readability=${newContentScores.readabilityScore}, Engagement=${newContentScores.engagementScore}, Overall=${currentOverall}`);

      // Check if all scores are above 80 (Good quality on recalibrated scale)
      if (newContentScores.seoScore >= 80 &&
          newContentScores.readabilityScore >= 80 &&
          newContentScores.engagementScore >= 80) {
        console.log(`All scores above 80! Stopping after ${attempts} attempt(s).`);
        break;
      }

      // Identify issues from current scores
      const issues = [];
      if (newContentScores.seoScore < 80) {
        issues.push(`SEO issues (current: ${newContentScores.seoScore}): Missing headers, images, or links`);
      }
      if (newContentScores.readabilityScore < 80) {
        issues.push(`Readability issues (current: ${newContentScores.readabilityScore}): Sentences too long or complex, Flesch score too low`);
      }
      if (newContentScores.engagementScore < 80) {
        issues.push(`Engagement issues (current: ${newContentScores.engagementScore}): Missing hooks, CTAs, or formatting`);
      }

      if (issues.length === 0) {
        break; // All scores are good
      }

      // Create improvement prompt focused on technical issues
      const prompt = `You are a professional content editor improving blog post quality.

**Content to Improve:**
${improvedContent}

**Current Scores (Attempt ${attempts}):**
- SEO: ${newContentScores.seoScore}/100 (Target: 80+ for "Good")
- Readability: ${newContentScores.readabilityScore}/100 (Target: 80+ for "Good")
- Engagement: ${newContentScores.engagementScore}/100 (Target: 80+ for "Good")
- Overall: ${currentOverall}/100

**Score Scale:**
- 90-100: Excellent (top-tier content)
- 80-89: Good (professional quality)
- 70-79: Fair (needs improvement)
- Below 70: Poor (significant issues)

**Issues to Fix:**
${issues.join('\n')}

**Rewrite Instructions:**

1. **Improve SEO** (if score < 75):
   - Add clear H2 and H3 headers to structure content
   - Suggest 2-3 relevant image placements with descriptive alt text
   - Add 3-5 internal/external links where contextually appropriate
   - Ensure title is 40-70 characters if provided

2. **Improve Readability** (if score < 75) - CRITICAL:
   - MAXIMUM 20 words per sentence - break ALL longer sentences
   - Replace ALL complex words (3+ syllables) with simpler alternatives
   - Use ONLY active voice - eliminate ALL passive constructions
   - Remove ALL filler words, adverbs, and redundant phrases
   - Use SHORT, punchy sentences - vary between 8-15 words
   - Target 6th-7th grade reading level (Flesch score 70-80)
   - Every paragraph should have at least one sentence under 12 words

3. **Improve Engagement** (if score < 75):
   - Add an engaging hook in the first paragraph (question, surprising fact, or bold statement)
   - Add a clear call-to-action at the end
   - Add 2-3 questions throughout to engage readers
   - Convert dense text blocks into bullet points or numbered lists
   - Add **bold** and *italic* emphasis on key points (5-10 instances)
   - Vary paragraph length (mix short, medium, long)

4. **Preserve Quality**:
   - Keep all factually accurate information
   - Maintain the core message and key points
   - Preserve the author's voice and style
   - Keep approximately the same length (±20%)

**Output:**
Return ONLY the rewritten content in markdown format. No explanations, no meta-commentary, just the improved blog post.`;

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 16000,
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      improvedContent = message.content[0].type === 'text'
        ? message.content[0].text
        : improvedContent;

      console.log('Re-scoring improved content...');

      // Score the improved content
      newContentScores = scoreContent(improvedContent, title, metaDescription);
    }

    // Calculate new overall score (same weighting as batch audit)
    const newOverallScore = Math.round(
      newContentScores.seoScore * 0.35 +
      newContentScores.readabilityScore * 0.30 +
      newContentScores.engagementScore * 0.35
    );

    console.log(`Final score improvement: ${currentScores.overallScore} → ${newOverallScore} (${attempts} attempts)`);

    // Log usage
    const estimatedCost = 0.10 * attempts; // $0.10 per rewrite attempt
    await db.logUsage({
      user_id: user.id,
      operation_type: 'content_rewrite',
      cost_usd: estimatedCost,
      tokens_used: 8000 * attempts,
      metadata: {
        url,
        original_score: currentScores.overallScore,
        new_score: newOverallScore,
        improvement: newOverallScore - currentScores.overallScore,
        content_length: improvedContent.length,
        attempts,
      },
    });

    return NextResponse.json({
      success: true,
      originalContent,
      improvedContent,
      originalScores: currentScores,
      newScores: {
        overallScore: newOverallScore,
        seoScore: newContentScores.seoScore,
        readabilityScore: newContentScores.readabilityScore,
        engagementScore: newContentScores.engagementScore,
      },
      improvement: newOverallScore - currentScores.overallScore,
      title,
      url,
      attempts,
      estimatedCost,
    });
  } catch (error: any) {
    console.error('Rewrite error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to rewrite content' },
      { status: 500 }
    );
  }
}
