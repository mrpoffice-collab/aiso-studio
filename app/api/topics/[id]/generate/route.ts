import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db, query } from '@/lib/db';
import { generateBlogPost } from '@/lib/content';
import { performFactCheck } from '@/lib/fact-check';
import { researchTopic } from '@/lib/brave-search';
import { checkForDuplicateContent, type ExistingContent } from '@/lib/duplicate-checker';
import { calculateAISOScore } from '@/lib/content-scoring';
import { anthropic } from '@/lib/claude';

// Force recompile v3
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: topicId } = await params;

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

    // Get topic
    const topic = await db.getTopicById(topicId);
    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    // Get strategy to verify ownership and get brand details
    const strategy = await db.getStrategyById(topic.strategy_id);
    if (!strategy) {
      return NextResponse.json({ error: 'Strategy not found' }, { status: 404 });
    }

    // Verify ownership
    if (strategy.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Use topic's target_flesch_score override if set, otherwise use strategy's
    const targetFleschScore = topic.target_flesch_score ?? strategy.target_flesch_score;

    // Track generation stats
    const generationStartTime = Date.now();
    let readabilityIterations = 0;

    // Update topic status to generating
    await db.updateTopicStatus(topicId, 'generating');

    try {
      // STEP 0.5: Pre-validate topic complexity vs target reading level
      if (targetFleschScore) {
        console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log('🔍 PRE-VALIDATING TOPIC COMPLEXITY');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        const readingLevelDesc =
          targetFleschScore >= 70 ? '7th grade (general public)' :
          targetFleschScore >= 60 ? '8th-9th grade (standard)' :
          targetFleschScore >= 50 ? '10th grade (educated adults)' :
          targetFleschScore >= 40 ? 'College level (professionals)' :
          'Graduate level (technical experts)';

        console.log(`   Topic: "${topic.title}"`);
        console.log(`   Keyword: "${topic.keyword}"`);
        console.log(`   Target: Flesch ${targetFleschScore} (${readingLevelDesc})${topic.target_flesch_score ? ' [OVERRIDE]' : ''}\n`);

        // Ask Claude to validate if this topic can be written at the target level
        const validationPrompt = `You are a content strategy expert. Analyze if this blog topic can be naturally written at the specified reading level.

**Topic:** "${topic.title}"
**Target Keyword:** "${topic.keyword}"
**Target Reading Level:** ${readingLevelDesc} (Flesch ${targetFleschScore})
**Target Audience:** ${strategy.target_audience}

**Analysis Required:**
1. Does this topic require technical jargon that can't be simplified?
2. Does this topic involve concepts too complex for the target audience?
3. Can this topic be written naturally at the target reading level without losing value?
4. Would the target audience search for and understand this topic?

**Guidelines:**
${targetFleschScore >= 70 ? `- Flesch 70+ requires VERY simple language (7th grade)
- Topics should be practical, everyday problems
- NO technical terminology, industry jargon, or complex processes
- Examples of GOOD topics: "How to Clean Your Kitchen", "Easy Ways to Save Money"
- Examples of BAD topics: "Cloud Storage Solutions", "Digital Asset Management", "OAuth Security"`
: targetFleschScore >= 60 ? `- Flesch 60-69 requires simple language (8th-9th grade)
- Topics should be practical with minimal technical terms
- Explain any industry terms in plain language
- Examples of GOOD topics: "How to Choose Health Insurance", "Understanding Your Credit Score"
- Examples of BAD topics: "API Integration Strategies", "Advanced SEO Techniques"`
: targetFleschScore >= 50 ? `- Flesch 50-59 allows moderate complexity (10th grade)
- Topics can include some industry terms if explained
- Should be accessible to college-educated adults
- Examples of GOOD topics: "Project Management Basics", "Email Marketing Best Practices"
- Examples of BAD topics: "Kubernetes Architecture", "REST API Design Patterns"`
: `- Flesch <50 allows technical complexity (college/graduate level)
- Topics can include technical terminology
- Audience has specialized knowledge`}

**Your Task:**
Determine if this topic is APPROPRIATE or TOO_COMPLEX for the target reading level.

Return ONLY a JSON object:
{
  "appropriate": boolean,
  "confidence": number (0-100),
  "reasoning": "string (1-2 sentences explaining why)",
  "suggestedAlternative": "string or null (if too complex, suggest a simpler alternative topic)"
}`;

        const validationResponse = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 500,
          temperature: 0.3,
          messages: [{ role: 'user', content: validationPrompt }],
        });

        const validationContent = validationResponse.content[0];
        if (validationContent.type === 'text') {
          const jsonMatch = validationContent.text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const validation = JSON.parse(jsonMatch[0]);

            console.log(`   Validation Result:`);
            console.log(`   - Appropriate: ${validation.appropriate ? '✅ Yes' : '❌ No'}`);
            console.log(`   - Confidence: ${validation.confidence}%`);
            console.log(`   - Reasoning: ${validation.reasoning}`);
            if (validation.suggestedAlternative) {
              console.log(`   - Suggested Alternative: "${validation.suggestedAlternative}"`);
            }

            // If topic is deemed too complex, reject it immediately
            if (!validation.appropriate && validation.confidence >= 70) {
              console.log(`\n❌ TOPIC REJECTED: Too complex for target reading level\n`);

              await db.updateTopicStatus(topicId, 'failed');

              return NextResponse.json(
                {
                  error: 'Topic too complex for target reading level',
                  validation: {
                    appropriate: false,
                    confidence: validation.confidence,
                    reasoning: validation.reasoning,
                    targetLevel: readingLevelDesc,
                    targetFlesch: targetFleschScore,
                  },
                  message: `This topic cannot be written at the target reading level (${readingLevelDesc}, Flesch ${targetFleschScore}).\n\n📊 Analysis:\n${validation.reasoning}\n\n💡 Recommendation:\n${validation.suggestedAlternative || 'Choose a simpler, more accessible topic that matches your audience\'s everyday vocabulary and knowledge level.'}\n\nOptions:\n1. Choose a different topic from your strategy\n2. Use "Edit Topic" to set a custom reading level for this topic\n3. Update the topic title/outline to be simpler`,
                },
                { status: 400 }
              );
            }

            console.log(`   ✅ Topic complexity validation passed\n`);
          }
        }
      }

      // STEP 1: Research the topic using Brave Search
      console.log(`Researching topic: ${topic.title} with keyword: ${topic.keyword}`);
      const researchData = await researchTopic(
        topic.keyword || topic.title,
        topic.title
      );

      console.log('Research completed:', {
        statistics: researchData.statistics.length,
        caseStudies: researchData.caseStudies.length,
        trends: researchData.recentTrends.length,
      });

      // STEP 2: Generate blog post content with research data
      console.log(`Generating content with target reading level...`);
      if (targetFleschScore) {
        const readingLevelDesc =
          targetFleschScore >= 70 ? '7th grade (general public)' :
          targetFleschScore >= 60 ? '8th-9th grade (standard)' :
          targetFleschScore >= 50 ? '10th grade (educated adults)' :
          targetFleschScore >= 40 ? 'College level (professionals)' :
          'Graduate level (technical experts)';
        console.log(`   🎯 Target Flesch Score: ${targetFleschScore} (${readingLevelDesc})${topic.target_flesch_score ? ' [OVERRIDE]' : ''}`);
      }

      // Ensure outline is always an array
      let outline = topic.outline || [];
      console.log('🔍 DEBUG outline type:', typeof outline, 'value:', outline);
      if (typeof outline === 'string') {
        console.log('   Converting string outline to array');
        try {
          outline = JSON.parse(outline);
        } catch {
          outline = outline.split('\n').filter(Boolean);
        }
      }
      if (!Array.isArray(outline)) {
        console.log('   ⚠️ Outline is not an array, setting to empty array');
        outline = [];
      }
      console.log('   ✅ Final outline:', outline);

      // Fetch internal link suggestions from website audit
      // Note: Images will use stock photo APIs (Pexels/Pixabay) instead of client site images
      let internalLinks: any[] = [];
      if (strategy.website_url) {
        try {
          // Get relevant pages for internal linking
          const linkResults = await query(
            `SELECT sp.url, sp.title, sp.meta_description
             FROM site_pages sp
             JOIN site_audits sa ON sp.audit_id = sa.id
             WHERE sa.strategy_id = $1 AND sa.status = 'completed'
             AND sp.aiso_score > 30
             ORDER BY sp.aiso_score DESC
             LIMIT 10`,
            [strategy.id]
          );
          internalLinks = linkResults || [];

          if (internalLinks.length > 0) {
            console.log(`\n📎 Found ${internalLinks.length} linkable pages from audit`);
            console.log('   Internal links:');
            internalLinks.forEach((link, i) => {
              console.log(`   ${i + 1}. ${link.title} - ${link.url}`);
            });
            console.log('');
          }
        } catch (error) {
          console.error('Error fetching audit resources:', error);
        }
      }

      // NOTE: Stock images will be added during WordPress export
      // This allows users to choose their own images or fetch from Pexels/Pixabay at publish time

      const generatedContent = await generateBlogPost(
        {
          title: topic.title,
          keyword: topic.keyword || '',
          outline,
          targetAudience: strategy.target_audience,
          brandVoice: strategy.brand_voice,
          wordCount: topic.word_count || 1500,
          seoIntent: topic.seo_intent || 'informational',
        },
        researchData,
        targetFleschScore, // NEW - Pass target reading level (with topic override support)
        internalLinks // NEW - Pass internal link suggestions
      );

      // STEP 3: Check for duplicate content against existing blog posts
      console.log('Checking for duplicate content...');
      const existingContent = await db.getExistingContentByStrategyId(strategy.id);

      const existingContentData: ExistingContent[] = existingContent.map((ec: any) => ({
        url: ec.url,
        title: ec.title,
        excerpt: ec.content_excerpt,
      }));

      const duplicateCheck = await checkForDuplicateContent(
        generatedContent.title,
        generatedContent.content,
        existingContentData
      );

      console.log('Duplicate check result:', {
        isDuplicate: duplicateCheck.isDuplicate,
        similarityScore: duplicateCheck.similarityScore,
        warningsCount: duplicateCheck.warnings.length,
      });

      // STEP 4: Perform fact-checking on the generated content
      const factCheckResult = await performFactCheck(generatedContent.content);

      // Auto-improve content if fact-check score is below threshold
      const MINIMUM_FACT_CHECK_SCORE = 70; // Require 70% confidence minimum (realistic for practical content)
      const MAX_REFINEMENT_ATTEMPTS = 3; // Up to 3 refinements to iterate toward quality

      let finalContent = generatedContent;
      let finalFactCheckResult = factCheckResult;
      let refinementAttempt = 0;

      // Single refinement pass to control costs
      while (finalFactCheckResult.overallScore < MINIMUM_FACT_CHECK_SCORE && refinementAttempt < MAX_REFINEMENT_ATTEMPTS) {
        refinementAttempt++;
        console.log(`Content quality below threshold (${finalFactCheckResult.overallScore}/100). Attempting ONE refinement to improve quality...`);

        // Identify problematic claims
        const problematicClaims = finalFactCheckResult.factChecks
          .filter(fc => fc.status === 'unverified' || (fc.status === 'uncertain' && fc.confidence < 50))
          .map(fc => fc.claim);

        if (problematicClaims.length === 0) {
          console.log('No specific problematic claims identified, breaking refinement loop');
          break;
        }

        console.log(`Removing ${problematicClaims.length} unverifiable claims to maintain content integrity...`);

        // Categorize claims by confidence level for appropriate handling
        const claimsToRemove = finalFactCheckResult.factChecks.filter(fc => fc.confidence < 60).map(fc => fc.claim);
        const claimsToSoften = finalFactCheckResult.factChecks.filter(fc => fc.confidence >= 60 && fc.confidence < 80).map(fc => fc.claim);

        if (claimsToRemove.length > 0) console.log(`   ❌ Removing/generalizing ${claimsToRemove.length} claims (< 60% confidence)`);
        if (claimsToSoften.length > 0) console.log(`   📝 Adding soft qualifiers to ${claimsToSoften.length} claims (60-79% confidence)`);

        // Use Claude to refine the content - remove unverifiable claims entirely
        const refinementPrompt = `You are refining a blog post to remove or rewrite unverifiable claims. The goal is to maintain content value while avoiding AI penalties for uncertain information.

**Original Content:**
${finalContent.content}

${claimsToRemove.length > 0 ? `**Claims to REMOVE or GENERALIZE (Confidence < 60%):**
${claimsToRemove.map((claim, i) => `${i + 1}. ${claim}`).join('\n')}

**How to handle these:**
- Remove specific numbers/statistics entirely
- Replace with general statements that don't need verification
- Keep the context valuable without making specific claims

**Examples:**
❌ "The market is $3.5B in 2025"
✅ "The market continues to grow significantly"

❌ "Paid plans cost $5-15/month"
✅ "Premium features typically require a subscription"

❌ "95% of users prefer feature X"
✅ "Many users find feature X valuable"

❌ "The platform has 10 million users"
✅ "The platform serves a large user base"

` : ''}${claimsToSoften.length > 0 ? `**Claims to ADD SOFT QUALIFIERS (Confidence 60-79%):**
${claimsToSoften.map((claim, i) => `${i + 1}. ${claim}`).join('\n')}
→ Add words like: "around", "approximately", "roughly", "about"
→ Keep it subtle - don't over-qualify
→ Example: "The tool costs $50" → "The tool costs around $50"

` : ''}**CRITICAL RULES:**
1. Keep verified claims (80%+ confidence) EXACTLY as written - do not touch them
2. For low-confidence claims: Remove specific numbers/stats, keep general concepts
3. Do NOT add phrases like "typically", "some experts suggest", "reports indicate" - AI penalizes these
4. Just make statements more general and remove unverifiable specifics
5. Maintain the same article structure, tone, and value
6. Ensure natural flow - should read smoothly
7. Do NOT add new statistics or claims

**Output Format:**
Return ONLY the refined content in markdown format. No explanations, just the improved article.`;

        const refinementResponse = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 16000,
          temperature: 0.7,
          messages: [
            {
              role: 'user',
              content: refinementPrompt,
            },
          ],
        });

        const refinedContent = refinementResponse.content[0].type === 'text'
          ? refinementResponse.content[0].text
          : finalContent.content;

        // Re-run fact-check on refined content
        console.log('Fact-checking refined content...');
        const refinedFactCheckResult = await performFactCheck(refinedContent);

        console.log(`Refinement result: ${finalFactCheckResult.overallScore} → ${refinedFactCheckResult.overallScore}`);

        // Update for next iteration
        finalContent = {
          ...finalContent,
          content: refinedContent,
        };
        finalFactCheckResult = refinedFactCheckResult;
      }

      // After refinement attempt, check if we still don't meet threshold
      if (finalFactCheckResult.overallScore < MINIMUM_FACT_CHECK_SCORE) {
        console.log(`Content still below threshold after refinement. Final score: ${finalFactCheckResult.overallScore}`);

        // Update topic status to failed
        await db.updateTopicStatus(topicId, 'failed');

        return NextResponse.json(
          {
            error: 'Unable to verify enough facts in the content',
            factCheckScore: finalFactCheckResult.overallScore,
            attempts: refinementAttempt,
            message: `Only ${finalFactCheckResult.verifiedClaims}/${finalFactCheckResult.totalClaims} claims could be verified. This topic may need:\n\n• More specific keywords in your strategy\n• Additional research context\n• A less technical angle\n• Manual fact-checking before generation`,
            factCheckSummary: {
              overallScore: finalFactCheckResult.overallScore,
              totalClaims: finalFactCheckResult.totalClaims,
              verifiedClaims: finalFactCheckResult.verifiedClaims,
              uncertainClaims: finalFactCheckResult.uncertainClaims,
              unverifiedClaims: finalFactCheckResult.unverifiedClaims,
            },
          },
          { status: 400 }
        );
      }

      if (refinementAttempt > 0) {
        console.log(`✅ Content approved with score ${finalFactCheckResult.overallScore}/100 after 1 refinement (improved from ${factCheckResult.overallScore})`);
      } else {
        console.log(`✅ Content approved with score ${finalFactCheckResult.overallScore}/100 on first attempt`);
      }

      // Calculate AISO scores (AEO, GEO if local, SEO, Readability, Engagement + Fact-check)
      console.log('Calculating AISO scores...');

      // Check if this is local content (get local context from strategy)
      const localContext = strategy.content_type === 'local' || strategy.content_type === 'hybrid'
        ? {
            city: strategy.city,
            state: strategy.state,
            serviceArea: strategy.service_area,
          }
        : undefined;

      let aisoScores = calculateAISOScore(
        finalContent.content,
        finalContent.title,
        finalContent.metaDescription,
        finalFactCheckResult.overallScore, // Fact-check gets 30% weight (national) or 25% (local)
        localContext,
        targetFleschScore // NEW - Pass target for intent-based readability scoring (with topic override support)
      );

      console.log('AISO Scores calculated:', {
        aisoScore: aisoScores.aisoScore,
        aeoScore: aisoScores.aeoScore,
        geoScore: aisoScores.geoScore,
        factCheckScore: aisoScores.factCheckScore,
        readabilityScore: aisoScores.readabilityScore,
        readabilityGap: targetFleschScore ? Math.abs(aisoScores.readabilityDetails.fleschScore - targetFleschScore) : null,
      });

      // STEP 5: Readability refinement if target is set and score is too low
      const MINIMUM_READABILITY_SCORE = 65; // Require 65/100 readability score
      const MAX_READABILITY_ATTEMPTS = 5; // Up to 5 readability refinements

      let readabilityAttempt = 0;

      if (targetFleschScore && aisoScores.readabilityScore < MINIMUM_READABILITY_SCORE) {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📖 READABILITY REFINEMENT NEEDED');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`   Target Flesch: ${targetFleschScore}`);
        console.log(`   Actual Flesch: ${aisoScores.readabilityDetails.fleschScore}`);
        console.log(`   Gap: ${Math.abs(aisoScores.readabilityDetails.fleschScore - targetFleschScore)} points`);
        console.log(`   Readability Score: ${aisoScores.readabilityScore}/100\n`);

        while (aisoScores.readabilityScore < MINIMUM_READABILITY_SCORE && readabilityAttempt < MAX_READABILITY_ATTEMPTS) {
          readabilityAttempt++;
          readabilityIterations++;
          console.log(`🔄 Readability refinement attempt ${readabilityAttempt}/${MAX_READABILITY_ATTEMPTS}...`);

          const readabilityReadingLevel =
            targetFleschScore >= 70 ? '7th grade (very accessible)' :
            targetFleschScore >= 60 ? '8th-9th grade (standard)' :
            targetFleschScore >= 50 ? '10th grade (educated adults)' :
            targetFleschScore >= 40 ? 'College level (professionals)' :
            'Graduate level (technical experts)';

          const targetSentenceLength =
            targetFleschScore >= 70 ? '10-12 words' :
            targetFleschScore >= 60 ? '12-15 words' :
            targetFleschScore >= 50 ? '15-18 words' :
            '15-20 words';

          const currentFlesch = aisoScores.readabilityDetails.fleschScore;
          const targetFlesch = targetFleschScore;
          const gap = Math.abs(currentFlesch - targetFlesch);
          const tooComplex = currentFlesch < targetFlesch;

          const refinementPrompt = `You are a readability expert. This content is not matching the target reading level.

**TARGET**: ${readabilityReadingLevel} (Flesch ${targetFlesch})
**CURRENT FLESCH**: ${currentFlesch}
**GAP**: ${gap} points ${tooComplex ? '(TOO COMPLEX - content is harder to read than target)' : '(TOO SIMPLE - content is easier to read than target)'}

**CRITICAL RULES:**
1. DO NOT add or remove sections - keep same H2/H3 structure
2. DO NOT add or remove core information or facts
3. ADJUST LANGUAGE IN ALL SECTIONS (body paragraphs, FAQ, Key Takeaways, everything)
4. Maintain same section headings and markdown structure

**YOUR TASK:**
- Target sentence length: ${targetSentenceLength}
${tooComplex ? `- SIMPLIFY ALL TEXT THROUGHOUT THE ENTIRE ARTICLE:
  * Break long sentences into 2-3 shorter sentences (EVERYWHERE - body, FAQ, Key Takeaways, etc.)
  * Replace complex/formal words with simpler everyday alternatives
  * Use active voice instead of passive voice
  * Remove unnecessary jargon and technical terms
  * One idea per sentence
  * Example transformations:
    - "X is defined as..." → "X means..." or "X is..."
    - "facilitate" → "help"
    - "utilize" → "use"
    - "implement" → "use" or "set up"
    - "commence" → "start"
  * Simplify FAQ answers - they should be conversational, not formal` : `- ADD COMPLEXITY TO ALL TEXT:
  * Combine short sentences into longer, flowing sentences
  * Use more sophisticated vocabulary
  * Add transitional phrases
  * Include more descriptive language`}
- Apply these changes to EVERY section: body paragraphs, FAQ answers, Key Takeaways, definitions, everywhere

**CONTENT TO ADJUST:**
${finalContent.content}

**OUTPUT:** Return ONLY the adjusted content with improved readability. No explanations. Keep the same structure and section headings.`;

          const refinementResponse = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 16000,
            temperature: 0.5,
            messages: [{ role: 'user', content: refinementPrompt }],
          });

          const refinedContent = refinementResponse.content[0].type === 'text'
            ? refinementResponse.content[0].text
            : finalContent.content;

          // Re-calculate fact-check (readability changes might affect claims)
          console.log('   Re-fact-checking content after readability adjustment...');
          const refinedFactCheck = await performFactCheck(refinedContent);

          // Re-calculate AISO scores
          const refinedAisoScores = calculateAISOScore(
            refinedContent,
            finalContent.title,
            finalContent.metaDescription,
            refinedFactCheck.overallScore,
            localContext,
            targetFleschScore
          );

          console.log(`   📊 Readability: ${aisoScores.readabilityScore} → ${refinedAisoScores.readabilityScore}`);
          console.log(`   📖 Flesch: ${currentFlesch} → ${refinedAisoScores.readabilityDetails.fleschScore}`);
          console.log(`   ✓ Fact-Check: ${finalFactCheckResult.overallScore} → ${refinedFactCheck.overallScore}`);

          // Update for next iteration
          finalContent = { ...finalContent, content: refinedContent };
          finalFactCheckResult = refinedFactCheck;
          aisoScores = refinedAisoScores;
        }

        // Check if readability still fails after attempts
        if (aisoScores.readabilityScore < MINIMUM_READABILITY_SCORE) {
          console.log(`\n❌ READABILITY REJECTION: Score ${aisoScores.readabilityScore}/100 after ${readabilityAttempt} attempts`);
          console.log(`   Gap: ${Math.abs(aisoScores.readabilityDetails.fleschScore - targetFleschScore)} points from target`);

          // Update topic status to failed
          await db.updateTopicStatus(topicId, 'failed');

          const readingLevelDesc = targetFleschScore >= 70 ? '7th grade (general public)' :
            targetFleschScore >= 60 ? '8th-9th grade (standard readers)' :
            targetFleschScore >= 50 ? '10th grade (educated adults)' :
            targetFleschScore >= 40 ? 'College level (professionals)' :
            'Graduate level (technical experts)';

          const actualReadingLevel = aisoScores.readabilityDetails.fleschScore >= 70 ? '7th grade' :
            aisoScores.readabilityDetails.fleschScore >= 60 ? '8th-9th grade' :
            aisoScores.readabilityDetails.fleschScore >= 50 ? '10th grade' :
            aisoScores.readabilityDetails.fleschScore >= 40 ? 'College level' :
            'Graduate level';

          return NextResponse.json(
            {
              error: 'Unable to match target reading level',
              readabilityScore: aisoScores.readabilityScore,
              targetFlesch: targetFleschScore,
              actualFlesch: aisoScores.readabilityDetails.fleschScore,
              gap: Math.abs(aisoScores.readabilityDetails.fleschScore - targetFleschScore),
              attempts: readabilityAttempt,
              message: `Content ended ${Math.abs(aisoScores.readabilityDetails.fleschScore - targetFleschScore)} points from your target reading level after ${readabilityAttempt} attempt${readabilityAttempt !== 1 ? 's' : ''}.\n\n📊 Target: Flesch ${targetFleschScore} (${readingLevelDesc})\n📖 Result: Flesch ${aisoScores.readabilityDetails.fleschScore} (${actualReadingLevel})\n\n${aisoScores.readabilityDetails.fleschScore < targetFleschScore
                ? `❌ This topic is too complex for your target audience.\n\n✅ Quick Fix Options:\n• Click "Edit Topic" → Increase target Flesch score (60-70 = easier)\n• Simplify the outline sections\n• Retry generation (sometimes succeeds)`
                : `❌ This topic is too simple for your target audience.\n\n✅ Quick Fix Options:\n• Click "Edit Topic" → Decrease target Flesch score (40-50 = harder)\n• Add more detailed outline sections\n• Retry generation (sometimes succeeds)`}`,
              readabilitySummary: {
                targetLevel: readingLevelDesc,
                actualLevel: actualReadingLevel,
                targetFlesch: targetFleschScore,
                actualFlesch: aisoScores.readabilityDetails.fleschScore,
                gap: Math.abs(aisoScores.readabilityDetails.fleschScore - targetFleschScore),
                avgSentenceLength: aisoScores.readabilityDetails.avgSentenceLength,
                readabilityScore: aisoScores.readabilityScore,
              },
            },
            { status: 400 }
          );
        }

        if (readabilityAttempt > 0) {
          console.log(`\n✅ Readability improved after ${readabilityAttempt} attempt${readabilityAttempt !== 1 ? 's' : ''}`);
          console.log(`   Score: ${aisoScores.readabilityScore}/100`);
          console.log(`   Flesch: ${aisoScores.readabilityDetails.fleschScore} (target: ${targetFleschScore})`);
          console.log(`   Gap: ${Math.abs(aisoScores.readabilityDetails.fleschScore - targetFleschScore)} points\n`);
        }
      } else if (targetFleschScore) {
        console.log(`✅ Readability score ${aisoScores.readabilityScore}/100 meets minimum threshold\n`);
      }

      // STEP 6: Strategic Link Validation - ensure required money page links are present
      if (topic.primary_link_url && topic.primary_link_anchor) {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔗 STRATEGIC LINK VALIDATION');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`   Target URL: ${topic.primary_link_url}`);
        console.log(`   Anchor Text: ${topic.primary_link_anchor}`);
        console.log(`   CTA Type: ${topic.cta_type || 'awareness'}`);
        console.log(`   Placement Hint: ${topic.link_placement_hint || 'contextual'}\n`);

        // Check if the required link exists in the content
        const linkPattern = new RegExp(`\\[([^\\]]+)\\]\\(${topic.primary_link_url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`, 'i');
        const hasRequiredLink = linkPattern.test(finalContent.content);

        if (hasRequiredLink) {
          console.log(`   ✅ Required strategic link found in content\n`);
        } else {
          console.log(`   ❌ Required strategic link MISSING - Auto-injecting...\n`);

          // Use Claude to intelligently inject the link
          const linkInjectionPrompt = `You are a content strategist. A blog post is missing a required strategic link that must be added naturally.

**TARGET LINK:**
- URL: ${topic.primary_link_url}
- Anchor Text: "${topic.primary_link_anchor}"
- CTA Type: ${topic.cta_type || 'awareness'}
- Placement Preference: ${topic.link_placement_hint || 'contextual'}

**PLACEMENT GUIDELINES:**
${topic.link_placement_hint === 'intro' ? `- Add in the introduction (first 2-3 paragraphs)
- Should set context for why this topic matters
- Natural transition to the linked page` :
topic.link_placement_hint === 'conclusion' ? `- Add in the conclusion section
- Should be a clear call-to-action
- Summarize benefit of visiting the linked page` :
`- Add in a contextually relevant section (middle of article)
- Find a natural place where the link adds value
- Should feel helpful, not forced`}

**CTA TYPE GUIDELINES:**
${topic.cta_type === 'awareness' ? `- Soft introduction: "learn more about...", "explore...", "discover..."
- Educational tone, not pushy
- Position as additional resource` :
topic.cta_type === 'consideration' ? `- More direct: "see how...", "compare...", "check out..."
- Show benefits and features
- Help reader evaluate options` :
`- Strong call-to-action: "get started with...", "try...", "sign up for..."
- Emphasize action and urgency
- Clear benefit statement`}

**CRITICAL RULES:**
1. Add the link EXACTLY ONCE - do not duplicate it
2. Use the EXACT anchor text provided: "${topic.primary_link_anchor}"
3. Make it feel natural and valuable to the reader
4. Do NOT remove or change any existing content structure
5. The link should add value, not feel like spam
6. Format: [${topic.primary_link_anchor}](${topic.primary_link_url})

**CONTENT TO MODIFY:**
${finalContent.content}

**OUTPUT:** Return ONLY the modified content with the strategic link added. No explanations.`;

          const linkInjectionResponse = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 16000,
            temperature: 0.7,
            messages: [{ role: 'user', content: linkInjectionPrompt }],
          });

          const contentWithLink = linkInjectionResponse.content[0].type === 'text'
            ? linkInjectionResponse.content[0].text
            : finalContent.content;

          // Verify the link was added
          const verifyLink = linkPattern.test(contentWithLink);
          if (verifyLink) {
            console.log(`   ✅ Strategic link successfully injected\n`);
            finalContent = { ...finalContent, content: contentWithLink };

            // Re-calculate AISO scores with updated content
            const finalFactCheckAfterLink = await performFactCheck(contentWithLink);
            aisoScores = calculateAISOScore(
              contentWithLink,
              finalContent.title,
              finalContent.metaDescription,
              finalFactCheckAfterLink.overallScore,
              localContext,
              targetFleschScore
            );
            finalFactCheckResult = finalFactCheckAfterLink;
          } else {
            console.log(`   ⚠️  Warning: Link injection failed, content will be saved without strategic link\n`);
          }
        }
      }

      // Calculate generation stats
      const generationTimeSeconds = Math.round((Date.now() - generationStartTime) / 1000);
      // Estimate cost: ~$0.15 per 5-pass generation, ~$0.03 per readability iteration
      const estimatedCostCents = Math.round(15 + (readabilityIterations * 3));

      // Create post in database with final refined content and AISO scores
      const post = await db.createPost({
        topic_id: topicId,
        user_id: user.id,
        title: finalContent.title,
        meta_description: finalContent.metaDescription,
        content: finalContent.content,
        word_count: finalContent.wordCount,
        fact_checks: finalFactCheckResult.factChecks,
        aeo_score: aisoScores.aeoScore, // NEW - Answer Engine Optimization
        geo_score: aisoScores.geoScore, // NEW - Local Intent Optimization (if applicable)
        aiso_score: aisoScores.aisoScore, // NEW - Overall AISO with fact-checking (30% weight!)
        actual_flesch_score: aisoScores.readabilityDetails.fleschScore, // Actual Flesch Reading Ease
        target_flesch_score: targetFleschScore, // Target from strategy
        readability_gap: targetFleschScore
          ? Math.abs(aisoScores.readabilityDetails.fleschScore - targetFleschScore)
          : null, // Gap between actual and target
        readability_score: aisoScores.readabilityScore, // Intent-based readability score
        generation_iterations: readabilityIterations + 1, // +1 for initial generation
        generation_cost_cents: estimatedCostCents,
        generation_time_seconds: generationTimeSeconds,
      });

      // Create individual fact-check records
      for (const factCheck of finalFactCheckResult.factChecks) {
        await db.createFactCheck({
          post_id: post.id,
          claim: factCheck.claim,
          status: factCheck.status,
          confidence: factCheck.confidence,
          sources: factCheck.sources,
        });
      }

      // Check duplicate content with final refined content
      const finalDuplicateCheck = await checkForDuplicateContent(
        finalContent.title,
        finalContent.content,
        existingContentData
      );

      // Update post with duplicate check results
      await db.updatePostSimilarityCheck(post.id, {
        similarity_checked: true,
        similarity_score: finalDuplicateCheck.similarityScore,
        duplicate_warnings: finalDuplicateCheck.warnings,
      });

      // Update topic status to completed
      await db.updateTopicStatus(topicId, 'completed');

      // Log usage (approximate cost calculation)
      // Content generation: ~10k tokens output, Fact checking: ~5k tokens
      const estimatedTokens = 15000;
      const estimatedCost = (estimatedTokens / 1000000) * 3.0; // $3 per million tokens (Sonnet 4)

      await db.logUsage({
        user_id: user.id,
        operation_type: 'content_generation',
        cost_usd: estimatedCost,
        tokens_used: estimatedTokens,
        metadata: {
          topic_id: topicId,
          post_id: post.id,
          word_count: finalContent.wordCount,
          fact_checks_count: finalFactCheckResult.totalClaims,
          refinement_attempts: refinementAttempt,
          initial_score: factCheckResult.overallScore,
          final_score: finalFactCheckResult.overallScore,
        },
      });

      return NextResponse.json({
        success: true,
        post: {
          id: post.id,
          title: post.title,
          wordCount: post.word_count,
          status: post.status,
        },
        aisoScores: {
          aisoScore: aisoScores.aisoScore, // NEW - Overall AISO with fact-checking (30% weight)
          aeoScore: aisoScores.aeoScore, // NEW - Answer Engine Optimization
          geoScore: aisoScores.geoScore, // NEW - Local Intent Optimization (if applicable)
          seoScore: aisoScores.seoScore,
          readabilityScore: aisoScores.readabilityScore,
          engagementScore: aisoScores.engagementScore,
          factCheckScore: aisoScores.factCheckScore,
          isLocalContent: !!localContext,
        },
        factCheckSummary: {
          overallScore: finalFactCheckResult.overallScore,
          totalClaims: finalFactCheckResult.totalClaims,
          verifiedClaims: finalFactCheckResult.verifiedClaims,
          uncertainClaims: finalFactCheckResult.uncertainClaims,
          unverifiedClaims: finalFactCheckResult.unverifiedClaims,
          refinementAttempts: refinementAttempt,
          initialScore: factCheckResult.overallScore,
        },
        duplicateCheck: {
          checked: true,
          isDuplicate: finalDuplicateCheck.isDuplicate,
          similarityScore: finalDuplicateCheck.similarityScore,
          warnings: finalDuplicateCheck.warnings,
          matchedUrls: finalDuplicateCheck.matchedUrls,
        },
      });
    } catch (error: any) {
      // Update topic status to failed
      await db.updateTopicStatus(topicId, 'failed');
      throw error;
    }
  } catch (error: any) {
    console.error('Content generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate content' },
      { status: 500 }
    );
  }
}
