import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateStrategy } from '@/lib/claude';
import { db } from '@/lib/db';

/**
 * POST /api/strategies/[id]/regenerate-topics
 * Regenerates topics for an existing strategy (useful after reset)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: strategyId } = await params;
    const body = await request.json();
    const clusterId = body.cluster_id; // Optional parameter

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

    // Get strategy and verify ownership
    const strategy = await db.getStrategyById(strategyId);
    if (!strategy) {
      return NextResponse.json({ error: 'Strategy not found' }, { status: 404 });
    }

    if (strategy.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // If cluster_id provided, fetch cluster details and validate
    let clusterInfo = null;
    if (clusterId) {
      clusterInfo = await db.getTopicClusterById(clusterId);
      if (!clusterInfo) {
        return NextResponse.json({ error: 'Cluster not found' }, { status: 404 });
      }
      if (clusterInfo.strategy_id !== strategyId) {
        return NextResponse.json({ error: 'Cluster does not belong to this strategy' }, { status: 400 });
      }
      console.log(`\n🎯 Generating topics for cluster: ${clusterInfo.name}`);
      console.log(`   Target money page: ${clusterInfo.primary_money_page_url}\n`);
    }

    // Check if topics already exist - this is OK now, we'll just add more
    const existingTopics = await db.getTopicsByStrategyId(strategyId);

    // Get the highest position number to continue from there
    const maxPosition = existingTopics.length > 0
      ? Math.max(...existingTopics.map((t: any) => t.position || 0))
      : 0;

    console.log(`\nℹ️  Found ${existingTopics.length} existing topics. Highest position: ${maxPosition}. Will generate additional topics.\n`);

    // Convert keywords array to string for the API
    const keywordsString = Array.isArray(strategy.keywords)
      ? strategy.keywords.join(', ')
      : strategy.keywords || '';

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log('📝 GENERATING STRATEGY WITH VALIDATION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const targetFlesch = strategy.target_flesch_score || 55;
    const readingLevelDesc =
      targetFlesch >= 70 ? '7th grade (general public)' :
      targetFlesch >= 60 ? '8th-9th grade (standard)' :
      targetFlesch >= 50 ? '10th grade (educated adults)' :
      targetFlesch >= 40 ? 'College level (professionals)' :
      'Graduate level (technical experts)';

    console.log(`🎯 Target Reading Level: Flesch ${targetFlesch} (${readingLevelDesc})`);
    console.log(`👥 Target Audience: ${strategy.target_audience}`);
    console.log(`🏢 Industry: ${strategy.industry}\n`);

    let validatedTopics: any[] = [];
    let attemptCount = 0;
    const MAX_GENERATION_ATTEMPTS = 3;
    let totalTokensUsed = 0;

    while (validatedTopics.length < 15 && attemptCount < MAX_GENERATION_ATTEMPTS) {
      attemptCount++;
      console.log(`🔄 Generation Attempt ${attemptCount}/${MAX_GENERATION_ATTEMPTS}`);
      console.log(`   Current valid topics: ${validatedTopics.length}/15\n`);

      // Generate topics with Claude AI using existing strategy settings
      const { topics: generatedTopics, tokensUsed } = await generateStrategy({
        clientName: strategy.client_name,
        industry: strategy.industry,
        goals: Array.isArray(strategy.goals) ? strategy.goals : [strategy.goals],
        targetAudience: strategy.target_audience,
        brandVoice: strategy.brand_voice,
        frequency: strategy.frequency,
        contentLength: strategy.content_length,
        keywords: keywordsString,
        targetFleschScore: targetFlesch,
      });

      totalTokensUsed += tokensUsed;
      console.log(`   ✅ Generated ${generatedTopics.length} topics\n`);

      // Validate each topic
      console.log(`🔍 Validating topics for reading level match...\n`);

      const { anthropic } = require('@/lib/claude');

      for (let i = 0; i < generatedTopics.length; i++) {
        const topic = generatedTopics[i];

        // Skip if we already have 15 valid topics
        if (validatedTopics.length >= 15) break;

        // Check if we already have this topic (avoid duplicates)
        const isDuplicate = validatedTopics.some(
          vt => vt.title.toLowerCase() === topic.title.toLowerCase()
        );

        if (isDuplicate) {
          console.log(`   ⏭️  Topic ${i + 1}: "${topic.title}" - Duplicate, skipping`);
          continue;
        }

        // Validate topic complexity
        const validationPrompt = `You are a content strategy expert. Analyze if this blog topic can be naturally written at the specified reading level.

**Topic:** "${topic.title}"
**Target Keyword:** "${topic.keyword}"
**Target Reading Level:** ${readingLevelDesc} (Flesch ${targetFlesch})
**Target Audience:** ${strategy.target_audience}

**Analysis Required:**
1. Does this topic require technical jargon that can't be simplified?
2. Does this topic involve concepts too complex for the target audience?
3. Can this topic be written naturally at the target reading level without losing value?
4. Would the target audience search for and understand this topic?

**Guidelines:**
${targetFlesch >= 70 ? `- Flesch 70+ requires VERY simple language (7th grade)
- NO technical terminology, industry jargon, or complex processes
- Topics should be practical, everyday problems`
: targetFlesch >= 60 ? `- Flesch 60-69 requires simple language (8th-9th grade)
- Minimal technical terms, explain if necessary
- Topics should be practical and accessible`
: targetFlesch >= 50 ? `- Flesch 50-59 allows moderate complexity (10th grade)
- Some industry terms OK if explained
- Should be accessible to college-educated adults`
: `- Flesch <50 allows technical complexity (college/graduate level)`}

Return ONLY a JSON object:
{
  "appropriate": boolean,
  "confidence": number (0-100),
  "reasoning": "string (1 sentence)"
}`;

        const validationResponse = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 300,
          temperature: 0.3,
          messages: [{ role: 'user', content: validationPrompt }],
        });

        const validationContent = validationResponse.content[0];
        if (validationContent.type === 'text') {
          const jsonMatch = validationContent.text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const validation = JSON.parse(jsonMatch[0]);

            const status = validation.appropriate && validation.confidence >= 70 ? '✅' : '❌';
            console.log(`   ${status} Topic ${validatedTopics.length + 1}: "${topic.title}"`);
            console.log(`      Appropriate: ${validation.appropriate ? 'Yes' : 'No'} (${validation.confidence}%)`);
            console.log(`      ${validation.reasoning}\n`);

            if (validation.appropriate && validation.confidence >= 70) {
              validatedTopics.push(topic);
            }
          }
        }

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log(`\n📊 After attempt ${attemptCount}: ${validatedTopics.length}/15 valid topics\n`);

      // If we have 15 valid topics, we're done
      if (validatedTopics.length >= 15) {
        console.log(`✅ Successfully validated 15 topics!\n`);
        break;
      }

      // If this is not the last attempt and we don't have enough topics, continue
      if (attemptCount < MAX_GENERATION_ATTEMPTS) {
        const needed = 15 - validatedTopics.length;
        console.log(`⚠️  Still need ${needed} more topics. Generating again...\n`);
      }
    }

    // If we still don't have 15 topics after all attempts, use what we have
    if (validatedTopics.length < 15) {
      console.log(`⚠️  Warning: Only validated ${validatedTopics.length}/15 topics after ${attemptCount} attempts`);
      console.log(`   Proceeding with ${validatedTopics.length} validated topics.\n`);
    }

    const finalTopics = validatedTopics.slice(0, 15);

    // Create topics in database - starting position after highest existing position
    const startingPosition = maxPosition + 1;
    const topicPromises = finalTopics.map((topic, index) => {
      // Normalize outline to ensure it's always an array
      let outline = topic.outline;
      if (!Array.isArray(outline)) {
        if (typeof outline === 'string') {
          outline = outline.split(',').map((s: string) => s.trim());
        } else {
          outline = [];
        }
      }

      // Build topic data
      const topicData: any = {
        strategy_id: strategy.id,
        title: topic.title,
        keyword: topic.keyword,
        outline,
        seo_intent: topic.seoIntent,
        word_count: topic.wordCount,
        position: startingPosition + index, // Continue from existing topics
      };

      // If cluster provided, add strategic linking fields
      if (clusterInfo) {
        topicData.cluster_id = clusterId;
        topicData.primary_link_url = clusterInfo.primary_money_page_url;
        topicData.primary_link_anchor = clusterInfo.primary_money_page_title || 'Learn more';
        topicData.cta_type = clusterInfo.funnel_stage || 'awareness';
        topicData.link_placement_hint = 'contextual'; // Can be 'intro', 'contextual', or 'conclusion'
      }

      return db.createTopic(topicData);
    });

    await Promise.all(topicPromises);

    // Calculate cost (using actual tokens from the API)
    // Claude Sonnet 4: $3 per 1M input tokens, $15 per 1M output tokens
    // Approximate split: 20% input, 80% output
    const inputTokens = Math.floor(totalTokensUsed * 0.2);
    const outputTokens = Math.floor(totalTokensUsed * 0.8);
    const cost = (inputTokens / 1000000) * 3 + (outputTokens / 1000000) * 15;

    // Log usage
    await db.logUsage({
      user_id: user.id,
      operation_type: 'strategy_generation',
      cost_usd: cost,
      tokens_used: totalTokensUsed,
      metadata: {
        strategy_id: strategy.id,
        action: 'regenerate_topics_with_validation',
        topics_count: finalTopics.length,
        validated_topics: finalTopics.length,
        generation_attempts: attemptCount,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully generated ${finalTopics.length} validated topics!`,
      topicsCount: finalTopics.length,
      validatedTopics: finalTopics.length,
      generationAttempts: attemptCount,
      cost: cost.toFixed(4),
      tokensUsed: totalTokensUsed,
    });
  } catch (error: any) {
    console.error('Topic regeneration error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to regenerate topics' },
      { status: 500 }
    );
  }
}
