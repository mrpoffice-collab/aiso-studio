import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { performFactCheck } from '@/lib/fact-check';
import { calculateAISOScore } from '@/lib/content-scoring';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

/**
 * POST /api/audit/rewrite
 * Rewrite content to improve quality scores
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

    // Check subscription and usage limits
    const subscription = await db.getUserSubscriptionInfo(user.id);
    if (!subscription) {
      return NextResponse.json({ error: 'Subscription info not found' }, { status: 500 });
    }

    // Check if trial expired
    if (subscription.subscription_status === 'trialing' && subscription.trial_ends_at) {
      if (new Date() > new Date(subscription.trial_ends_at)) {
        return NextResponse.json(
          {
            error: 'Trial expired',
            message: 'Your 7-day trial has ended. Please upgrade to continue rewriting content.',
            upgrade_url: '/pricing'
          },
          { status: 402 }
        );
      }
    }

    // Check if subscription is active
    if (!['trialing', 'active'].includes(subscription.subscription_status)) {
      return NextResponse.json(
        {
          error: 'Subscription inactive',
          message: 'Your subscription is not active. Please upgrade or renew.',
          upgrade_url: '/pricing'
        },
        { status: 402 }
      );
    }

    // Check article limit (rewrites count as articles)
    if (subscription.articles_used_this_month >= subscription.article_limit) {
      return NextResponse.json(
        {
          error: 'Article limit reached',
          message: `You've used all ${subscription.article_limit} articles this month. Upgrade your plan for more.`,
          current_usage: subscription.articles_used_this_month,
          limit: subscription.article_limit,
          upgrade_url: '/pricing'
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { originalContent, auditReport } = body;

    if (!originalContent || originalContent.trim().length < 100) {
      return NextResponse.json(
        { error: 'Original content is required (minimum 100 characters)' },
        { status: 400 }
      );
    }

    console.log(`Rewrite request received. Content length: ${originalContent.length} characters`);
    console.log(`Content preview: ${originalContent.substring(0, 200)}...`);

    console.log('Rewriting content to improve AISO quality...');

    const MINIMUM_AISO_SCORE = 90; // Aim for 90+ for high quality
    const MAX_ITERATIONS = 3; // Optimal based on real-world testing (best scores typically achieved by iteration 2-3)

    let currentContent = originalContent;
    let currentScore = auditReport.aisoScore || auditReport.overallScore;
    let iteration = 0;
    let bestContent = originalContent;
    let bestScore = currentScore;

    while (currentScore < MINIMUM_AISO_SCORE && iteration < MAX_ITERATIONS) {
      iteration++;
      console.log(`Rewrite iteration ${iteration}/${MAX_ITERATIONS}...`);

      // Identify problematic claims from audit (ensure factChecks is an array)
      const problematicClaims = Array.isArray(auditReport.factChecks)
        ? auditReport.factChecks
            .filter((fc: any) => fc.status === 'unverified' || fc.status === 'uncertain')
            .map((fc: any) => fc.claim)
        : [];

      // Calculate what needs improvement
      const factCheckScore = auditReport.factCheckScore || 0;
      const aeoScore = auditReport.aeoScore || 0;
      const seoScore = auditReport.seoScore || 0;
      const readabilityScore = auditReport.readabilityScore || 0;
      const engagementScore = auditReport.engagementScore || 0;

      // Get current date for content freshness
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().toLocaleString('en-US', { month: 'long' });

      // Create AISO-focused improvement prompt with iteration-specific guidance
      const prompt = `You are a professional content editor improving an EXISTING blog post. Your ONLY job is to improve the content provided below - DO NOT write new content on a different topic.

**CRITICAL RULE:** You MUST keep the same topic and subject matter as the original. If the original is about "Crisis Counseling for Pastors", your output MUST be about crisis counseling for pastors. NEVER replace the content with a different topic.

**CORE PHILOSOPHY:**
- PRESERVE the original topic, subject matter, and key information
- PRESERVE what's already good (voice, links, structure, valuable content)
- IMPROVE clarity, accuracy, and readability
- ADD structure ONLY when it genuinely helps the reader
- NEVER add generic filler just to hit metrics
- NEVER change the topic or subject of the article

**IMPORTANT CONTEXT - CURRENT DATE:**
- Today's Date: ${currentMonth} ${currentYear}
- Update outdated year references to ${currentYear} or use timeless language
- Make content feel current without forcing it

**Iteration ${iteration}/${MAX_ITERATIONS} - Current AISO Score**: ${currentScore}/100

${iteration > 1 ? `Progress: Started at ${auditReport.aisoScore || auditReport.overallScore}/100, now at ${currentScore}/100. ${currentScore > (auditReport.aisoScore || auditReport.overallScore) ? 'Keep improving quality.' : 'Score dropped - focus on preserving what works.'}` : ''}

**Current Content:**
${currentContent}

**SCORING BREAKDOWN:**
- Fact-Check: ${factCheckScore}/100 (30% weight) ${factCheckScore < 80 ? '- Fix unverifiable claims' : '✅'}
- AEO: ${aeoScore}/100 (25% weight) ${aeoScore < 70 ? '- Needs better structure for AI engines' : '✅'}
- SEO: ${seoScore}/100 (15% weight) ${seoScore < 70 ? '- Improve headers/structure' : '✅'}
- Readability: ${readabilityScore}/100 (15% weight) ${readabilityScore < 70 ? '- Simplify language' : '✅'}
- Engagement: ${engagementScore}/100 (15% weight) ${engagementScore < 70 ? '- Add hooks/formatting' : '✅'}
${auditReport.unverifiedClaims > 0 ? `- Unverified claims: ${auditReport.unverifiedClaims} ⚠️` : ''}

${problematicClaims.length > 0 ? `**PROBLEMATIC CLAIMS TO FIX:**
${problematicClaims.map((claim: string, i: number) => `${i + 1}. "${claim}" - Remove or add qualifiers ("typically", "often", "can", "may")`).join('\n')}` : ''}

**IMPROVEMENT PRIORITIES:**

${factCheckScore < 80 ? `
**Fix Factual Accuracy (HIGH PRIORITY):**
- Remove or qualify unverifiable claims
- Avoid: "studies show", "research proves", "X% of companies" (without sources)
- Use: "often", "typically", "can help", "many find", "common approach"
- Focus on processes and how-to content, not unverifiable outcome promises
` : ''}

${aeoScore < 70 ? `
**Improve AI Engine Optimization:**
- Make first paragraph a clear, quotable answer (2-3 sentences)
- Add FAQ section (4-8 Q&As) - DEFAULT TO YES unless content is clearly opinion/news/story format
  * How-to, explainer, product, tutorial, comparison content → ALWAYS add FAQ
  * Only skip FAQ for: opinion pieces, personal stories, news updates, creative writing
- Use clear definitions for key terms
- Add structured steps for how-to content (when relevant)
` : ''}

${seoScore < 70 ? `
**Improve Structure & SEO:**
- Add clear H2/H3 headers to break up content
- **CRITICAL: PRESERVE all original links** - Keep every [link](url) from the source
- Add internal link suggestions where genuinely helpful (don't spam)
- Ensure logical content flow
` : ''}

${readabilityScore < 70 ? `
**Improve Readability:**
- Break up long sentences (aim for 15-20 words max)
- Use shorter paragraphs (3-5 sentences)
- Simplify complex words without dumbing down
- Add transition words for better flow
` : ''}

${engagementScore < 70 ? `
**Improve Engagement:**
- Add opening hook if missing (question, surprising fact, clear benefit)
- Use bullet points and lists for scannable content
- Bold **key terms** for emphasis (use sparingly)
- Add closing CTA if appropriate
- Update year references to ${currentYear}
` : ''}

**CRITICAL RULES:**

✅ DO:
- Preserve ALL original links [text](url) exactly as they appear
- Keep the author's voice and tone
- Improve clarity and accuracy
- Add structure where it genuinely helps
- Fix factual errors and unverifiable claims
- Make content more scannable (bullets, headers, bold)
- Add FAQ section (4-8 Q&As) for most content types (how-to, explainer, tutorial, product)

❌ DON'T:
- Remove or change existing links
- Add generic "filler" sections just for metrics
- Force FAQ into opinion pieces, personal stories, or news articles (wrong format)
- Add arbitrary tables/lists that don't serve the reader
- Change the core message or intent
- Add keyword-stuffed content
- Make it feel robotic or formulaic

**TARGET IMPROVEMENTS:**
- If content is missing structure (headers, bullets), add it
- If content has unverifiable claims, fix them
- If content is hard to read, simplify it
- If content is how-to/explainer/tutorial → ADD FAQ with relevant Q&As
- If content is opinion/story/news → SKIP FAQ (doesn't fit format)
- If content has good links/citations, KEEP THEM ALL

**OUTPUT FORMAT:**
Return ONLY the improved content in markdown format. Preserve all original links. No explanations.`;

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

      const rewrittenContent = message.content[0].type === 'text'
        ? message.content[0].text
        : currentContent;

      console.log(`Rewritten content preview: ${rewrittenContent.substring(0, 200)}...`);
      console.log('Scoring rewritten content with AISO...');

      // Fact-check the rewritten content
      const factCheckResult = await performFactCheck(rewrittenContent);

      // Calculate full AISO score
      const aisoScores = calculateAISOScore(
        rewrittenContent,
        auditReport.title,
        auditReport.metaDescription,
        factCheckResult.overallScore
      );

      const newAisoScore = aisoScores.aisoScore || aisoScores.overallScore;

      console.log(`AISO improvement attempt ${iteration}: ${currentScore} → ${newAisoScore}`);

      // Track best result
      if (newAisoScore > bestScore) {
        bestScore = newAisoScore;
        bestContent = rewrittenContent;
      }

      // Update current for next iteration
      currentContent = rewrittenContent;
      currentScore = newAisoScore;

      // If we hit the target, break early
      if (currentScore >= MINIMUM_AISO_SCORE) {
        console.log(`✅ Target AISO score achieved: ${currentScore}/100`);
        break;
      }
    }

    // Log usage
    const estimatedCost = 0.15 * iteration; // $0.15 per iteration (includes fact-checking)
    await db.logUsage({
      user_id: user.id,
      operation_type: 'content_rewrite',
      cost_usd: estimatedCost,
      tokens_used: 8000 * iteration,
      metadata: {
        original_score: auditReport.aisoScore || auditReport.overallScore,
        final_score: bestScore,
        improvement: bestScore - (auditReport.aisoScore || auditReport.overallScore),
        iterations: iteration,
        content_length: bestContent.length,
      },
    });

    // Calculate final scores for the best content
    const finalFactCheck = await performFactCheck(bestContent);
    const finalAisoScores = calculateAISOScore(
      bestContent,
      auditReport.title,
      auditReport.metaDescription,
      finalFactCheck.overallScore
    );

    // Increment article usage counter (rewrites count as articles)
    await db.incrementArticleUsage(user.id);
    console.log(`✅ Rewrite usage incremented: ${subscription.articles_used_this_month + 1}/${subscription.article_limit}`);

    return NextResponse.json({
      success: true,
      improvedContent: bestContent,
      originalScore: auditReport.aisoScore || auditReport.overallScore,
      newScore: bestScore,
      improvement: bestScore - (auditReport.aisoScore || auditReport.overallScore),
      iterations: iteration,
      factCheckScore: finalFactCheck.overallScore,
      aeoScore: finalAisoScores.aeoScore,
      seoScore: finalAisoScores.seoScore,
      scoreBreakdown: [
        {
          category: 'AISO Score',
          before: auditReport.aisoScore || auditReport.overallScore,
          after: bestScore,
          improvement: bestScore - (auditReport.aisoScore || auditReport.overallScore)
        },
        {
          category: 'Fact-Check (30%)',
          before: auditReport.factCheckScore || 0,
          after: finalFactCheck.overallScore,
          improvement: finalFactCheck.overallScore - (auditReport.factCheckScore || 0)
        },
        {
          category: 'AEO (25%)',
          before: auditReport.aeoScore || 0,
          after: finalAisoScores.aeoScore,
          improvement: finalAisoScores.aeoScore - (auditReport.aeoScore || 0)
        },
        {
          category: 'SEO (15%)',
          before: auditReport.seoScore || 0,
          after: finalAisoScores.seoScore,
          improvement: finalAisoScores.seoScore - (auditReport.seoScore || 0)
        }
      ],
      newFactCheckSummary: {
        overallScore: finalFactCheck.overallScore,
        totalClaims: finalFactCheck.totalClaims,
        verifiedClaims: finalFactCheck.verifiedClaims,
        uncertainClaims: finalFactCheck.uncertainClaims,
        unverifiedClaims: finalFactCheck.unverifiedClaims,
      },
    });
  } catch (error: any) {
    console.error('Rewrite error:', error);
    console.error('Error stack:', error.stack);

    // Check for specific error types
    if (error.message?.includes('API key')) {
      return NextResponse.json(
        { error: 'AI service configuration error. Please contact support.' },
        { status: 500 }
      );
    }

    if (error.message?.includes('rate limit')) {
      return NextResponse.json(
        { error: 'AI service rate limit reached. Please try again in a few minutes.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to rewrite content' },
      { status: 500 }
    );
  }
}
