import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateStrategy, anthropic } from '@/lib/claude';
import { db, query } from '@/lib/db';
import { checkTopicAgainstSitePages } from '@/lib/duplicate-checker';

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

    // Check strategy limit
    const strategyLimit = await db.checkStrategyLimit(user.id);
    if (!strategyLimit.allowed) {
      return NextResponse.json(
        {
          error: `Strategy limit reached (${strategyLimit.used}/${strategyLimit.limit}). Upgrade your plan to create more strategies.`,
          limitReached: true,
          used: strategyLimit.used,
          limit: strategyLimit.limit,
        },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      clientName,
      industry,
      goals,
      targetAudience,
      brandVoice,
      frequency,
      contentLength,
      keywords,
      targetFleschScore,
      contentType,
      city,
      state,
      serviceArea,
      websiteUrl,
    } = body;

    // Validate required fields
    if (!clientName || !industry || !goals || !targetAudience || !brandVoice) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate strategy with Claude AI
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log('📝 GENERATING STRATEGY WITH VALIDATION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const targetFlesch = targetFleschScore || 55;
    const readingLevelDesc =
      targetFlesch >= 70 ? '7th grade (general public)' :
      targetFlesch >= 60 ? '8th-9th grade (standard)' :
      targetFlesch >= 50 ? '10th grade (educated adults)' :
      targetFlesch >= 40 ? 'College level (professionals)' :
      'Graduate level (technical experts)';

    console.log(`🎯 Target Reading Level: Flesch ${targetFlesch} (${readingLevelDesc})`);
    console.log(`👥 Target Audience: ${targetAudience}`);
    console.log(`🏢 Industry: ${industry}\n`);

    let validatedTopics: any[] = [];
    let attemptCount = 0;
    const MAX_GENERATION_ATTEMPTS = 3;

    while (validatedTopics.length < 15 && attemptCount < MAX_GENERATION_ATTEMPTS) {
      attemptCount++;
      console.log(`🔄 Generation Attempt ${attemptCount}/${MAX_GENERATION_ATTEMPTS}`);
      console.log(`   Current valid topics: ${validatedTopics.length}/15\n`);

      // Generate topics
      const { topics: generatedTopics } = await generateStrategy({
        clientName,
        industry,
        goals: Array.isArray(goals) ? goals : [goals],
        targetAudience,
        brandVoice,
        frequency: frequency || 'weekly',
        contentLength: contentLength || 'medium',
        keywords: keywords || '',
        targetFleschScore: targetFlesch,
      });

      console.log(`   ✅ Generated ${generatedTopics.length} topics\n`);

      // Validate each topic
      console.log(`🔍 Validating topics for reading level match...\n`);

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
**Target Audience:** ${targetAudience}

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

    // Create strategy in database
    const strategy = await db.createStrategy({
      user_id: user.id,
      client_name: clientName,
      industry,
      goals: Array.isArray(goals) ? goals : [goals],
      target_audience: targetAudience,
      brand_voice: brandVoice,
      frequency: frequency || 'weekly',
      content_length: contentLength || 'medium',
      keywords: keywords || '',
      target_flesch_score: targetFleschScore || 55,
      content_type: contentType || 'national',
      city: city || null,
      state: state || null,
      service_area: serviceArea || null,
      website_url: websiteUrl || null,
    });

    // Increment strategy usage counter
    await db.incrementStrategyUsage(user.id);
    console.log(`✅ Strategy usage incremented: ${strategyLimit.used + 1}/${strategyLimit.limit}`);

    // Check for duplicate content against audited site pages (if audit exists)
    let sitePages: any[] = [];
    if (websiteUrl) {
      console.log('\n🔍 Checking topics against audited website pages...\n');
      try {
        const auditResults = await query(
          `SELECT sp.url, sp.title, sp.content_preview, sp.meta_description
           FROM site_pages sp
           JOIN site_audits sa ON sp.audit_id = sa.id
           WHERE sa.strategy_id = $1 AND sa.status = 'completed'
           ORDER BY sa.completed_at DESC
           LIMIT 50`,
          [strategy.id]
        );
        sitePages = auditResults || [];

        if (sitePages.length > 0) {
          console.log(`   Found ${sitePages.length} pages from website audit`);

          // Check each topic for duplicates
          for (const topic of finalTopics) {
            const dupCheck = await checkTopicAgainstSitePages(
              topic.title,
              topic.keyword,
              sitePages
            );

            if (dupCheck.warnings.length > 0) {
              console.log(`\n   ⚠️  Topic: "${topic.title}"`);
              dupCheck.warnings.forEach(warning => console.log(`      ${warning}`));
            }

            // Store duplicate check results with topic
            (topic as any).duplicateCheck = dupCheck;
          }
        } else {
          console.log('   No completed audit found - skipping duplicate check');
        }
      } catch (error) {
        console.error('   Error checking for duplicates:', error);
        // Continue without duplicate checking if it fails
      }
    }

    // Create topics in database
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

      console.log('Creating topic:', {
        title: topic.title,
        outline,
        outlineType: Array.isArray(outline) ? 'array' : typeof outline,
      });

      return db.createTopic({
        strategy_id: strategy.id,
        title: topic.title,
        keyword: topic.keyword,
        outline,
        seo_intent: topic.seoIntent,
        word_count: topic.wordCount,
        position: index + 1,
      });
    });

    await Promise.all(topicPromises);

    // Log usage (approximate - Claude API doesn't return exact token counts in this implementation)
    await db.logUsage({
      user_id: user.id,
      operation_type: 'strategy_generation',
      cost_usd: 0.05, // Approximate cost for strategy generation
      tokens_used: 5000, // Approximate tokens
      metadata: { strategy_id: strategy.id },
    });

    return NextResponse.json({
      success: true,
      strategyId: strategy.id,
      topicsCount: finalTopics.length,
      validatedTopics: finalTopics.length,
      generationAttempts: attemptCount,
    });
  } catch (error: any) {
    console.error('Strategy generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate strategy' },
      { status: 500 }
    );
  }
}
