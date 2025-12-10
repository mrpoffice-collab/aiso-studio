import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'nodejs';
export const maxDuration = 120; // 2 minutes for adaptation

const anthropic = new Anthropic();

/**
 * POST /api/audit/adapt-vertical
 * Adapt content from one industry vertical to another
 * Agency tier only
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

    // Check if user is on Agency tier
    if (user.subscription_tier !== 'agency') {
      return NextResponse.json(
        {
          error: 'Agency tier required',
          message: 'Adapt to Vertical is an Agency-only feature. Upgrade to adapt content across industries.',
          upgrade_url: '/pricing',
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      originalContent,
      originalTitle,
      originalUrl,
      auditId,
      targetIndustry,
      targetKeyword,
      strategyId,
    } = body;

    if (!originalContent) {
      return NextResponse.json(
        { error: 'Missing content', message: 'No content provided to adapt.' },
        { status: 400 }
      );
    }

    if (!targetIndustry) {
      return NextResponse.json(
        { error: 'Missing industry', message: 'Please specify a target industry.' },
        { status: 400 }
      );
    }

    if (!targetKeyword) {
      return NextResponse.json(
        { error: 'Missing keyword', message: 'Please specify a target keyword.' },
        { status: 400 }
      );
    }

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🔄 ADAPT TO VERTICAL`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`   Original: ${originalTitle || 'Untitled'}`);
    console.log(`   Target Industry: ${targetIndustry}`);
    console.log(`   Target Keyword: ${targetKeyword}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    // Step 1: Adapt the content using Claude
    const adaptPrompt = `You are an expert content strategist specializing in industry-specific content adaptation.

TASK: Adapt the following content for a completely different industry vertical while maintaining the same quality, structure, and value.

ORIGINAL CONTENT:
${originalTitle ? `Title: ${originalTitle}\n` : ''}
${originalContent}

TARGET ADAPTATION:
- New Industry: ${targetIndustry}
- Primary Keyword: ${targetKeyword}

ADAPTATION REQUIREMENTS:

1. **Industry Context Change**:
   - Replace all industry-specific terminology with ${targetIndustry} equivalents
   - Change examples, case studies, and scenarios to be relevant to ${targetIndustry}
   - Update any statistics or data points to be industry-appropriate
   - Modify pain points and benefits to match ${targetIndustry} audience needs

2. **Keyword Optimization**:
   - Naturally incorporate "${targetKeyword}" as the primary keyword
   - Include the keyword in the title, first paragraph, and key headers
   - Use semantic variations throughout the content
   - Target keyword density of 1-2%

3. **Maintain Quality Standards**:
   - Keep the same content structure and flow
   - Preserve the value proposition and key insights
   - Maintain readability at the same level
   - Keep similar word count (within 10%)

4. **SEO & AEO Optimization**:
   - Create a compelling new title optimized for "${targetKeyword}"
   - Write a new meta description (150-160 chars) targeting the keyword
   - Ensure headers contain relevant keywords
   - Include FAQ-style sections if appropriate for AI search

5. **Fact-Check Awareness**:
   - Only include verifiable claims for the new industry
   - Use qualifiers ("typically", "often", "can") for general statements
   - Remove any claims that can't be adapted truthfully

OUTPUT FORMAT:
Return ONLY valid JSON in this exact format:
{
  "title": "New SEO-optimized title",
  "metaDescription": "150-160 character meta description",
  "content": "Full adapted article content in markdown format",
  "adaptationNotes": ["List of key changes made"],
  "keywordPlacements": {
    "title": true/false,
    "firstParagraph": true/false,
    "headers": number,
    "body": number
  }
}`;

    const adaptResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      messages: [
        {
          role: 'user',
          content: adaptPrompt,
        },
      ],
    });

    // Parse the response
    const adaptedText = adaptResponse.content[0].type === 'text'
      ? adaptResponse.content[0].text
      : '';

    let adaptedContent: any;
    try {
      // Extract JSON from response (handle potential markdown code blocks)
      const jsonMatch = adaptedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      adaptedContent = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Failed to parse adaptation response:', adaptedText.substring(0, 500));
      return NextResponse.json(
        { error: 'Adaptation failed', message: 'Failed to parse adapted content.' },
        { status: 500 }
      );
    }

    // Step 2: Score the adapted content
    const wordCount = adaptedContent.content.split(/\s+/).length;

    // Calculate basic scores (simplified for now, could use full AISO engine)
    const hasKeywordInTitle = adaptedContent.title.toLowerCase().includes(targetKeyword.toLowerCase());
    const hasKeywordInFirstPara = adaptedContent.content.split('\n\n')[0]?.toLowerCase().includes(targetKeyword.toLowerCase());
    const keywordCount = (adaptedContent.content.toLowerCase().match(new RegExp(targetKeyword.toLowerCase(), 'g')) || []).length;
    const keywordDensity = (keywordCount / wordCount) * 100;

    const seoScore = Math.min(100,
      (hasKeywordInTitle ? 25 : 0) +
      (hasKeywordInFirstPara ? 25 : 0) +
      (keywordDensity >= 0.5 && keywordDensity <= 3 ? 25 : 10) +
      (adaptedContent.metaDescription?.length >= 140 ? 25 : 15)
    );

    // Estimate AISO score (simplified)
    const estimatedAisoScore = Math.round(
      seoScore * 0.2 +
      75 * 0.25 + // Assume decent AEO
      70 * 0.15 + // Assume good readability
      70 * 0.15 + // Assume good engagement
      80 * 0.25   // Assume fact-checked (since we're adapting verified content)
    );

    // Step 3: Create or use strategy
    let finalStrategyId = strategyId;
    let topicId: string | null = null;

    if (!strategyId) {
      // Create a new standalone strategy for adapted content
      const newStrategy = await db.createStrategy({
        user_id: user.id,
        client_name: `Adapted Content - ${targetIndustry}`,
        industry: targetIndustry,
        goals: 'Adapted content from vertical transfer',
        target_audience: `${targetIndustry} professionals and businesses`,
        brand_voice: 'Professional',
        frequency: 'As needed',
        content_length: 'Standard',
        keywords: targetKeyword,
        target_flesch_score: 55,
        content_type: 'Blog',
      });
      finalStrategyId = newStrategy.id;

      // Create a topic for this adapted content
      const topic = await db.createTopic({
        strategy_id: finalStrategyId,
        title: adaptedContent.title,
        keyword: targetKeyword,
        seo_intent: 'informational',
        position: 1,
        status: 'completed',
      });
      topicId = topic.id;
    } else {
      // Verify strategy ownership
      const strategy = await db.getStrategyById(strategyId);
      if (!strategy || strategy.user_id !== user.id) {
        return NextResponse.json(
          { error: 'Strategy not found', message: 'Invalid strategy ID.' },
          { status: 404 }
        );
      }

      // Create a topic under the existing strategy
      const topics = await db.getTopicsByStrategyId(strategyId);
      const topic = await db.createTopic({
        strategy_id: strategyId,
        title: adaptedContent.title,
        keyword: targetKeyword,
        seo_intent: 'informational',
        position: topics.length + 1,
        status: 'completed',
      });
      topicId = topic.id;
    }

    // Step 4: Create the post
    const post = await db.createPost({
      user_id: user.id,
      topic_id: topicId,
      title: adaptedContent.title,
      content: adaptedContent.content,
      meta_description: adaptedContent.metaDescription,
      status: 'draft',
      word_count: wordCount,
      aiso_score: estimatedAisoScore,
      seo_score: seoScore,
      readability_score: 70, // Estimate
      engagement_score: 70, // Estimate
      aeo_score: 75, // Estimate
      fact_check_score: 80, // Assume good since adapting quality content
    });

    console.log(`\n✅ ADAPTATION COMPLETE`);
    console.log(`   New Title: ${adaptedContent.title}`);
    console.log(`   Word Count: ${wordCount}`);
    console.log(`   Estimated AISO Score: ${estimatedAisoScore}`);
    console.log(`   Strategy ID: ${finalStrategyId}`);
    console.log(`   Post ID: ${post.id}\n`);

    return NextResponse.json({
      success: true,
      message: 'Content successfully adapted for new vertical',
      post: {
        id: post.id,
        title: adaptedContent.title,
        wordCount,
        aisoScore: estimatedAisoScore,
      },
      strategyId: finalStrategyId,
      topicId,
      adaptationNotes: adaptedContent.adaptationNotes,
      keywordPlacements: adaptedContent.keywordPlacements,
    });
  } catch (error: any) {
    console.error('Adapt vertical error:', error);
    return NextResponse.json(
      { error: error.message || 'Adaptation failed' },
      { status: 500 }
    );
  }
}
