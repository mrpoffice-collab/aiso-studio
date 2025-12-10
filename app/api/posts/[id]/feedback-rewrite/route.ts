import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

/**
 * POST /api/posts/[id]/feedback-rewrite
 * Rewrite a post based on human feedback
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;

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

    // Get post and verify ownership
    const post = await db.getPostById(postId);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (post.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { feedback, preserveLength } = body;

    if (!feedback || feedback.trim().length === 0) {
      return NextResponse.json({ error: 'Feedback is required' }, { status: 400 });
    }

    console.log(`\n📝 Feedback-based rewrite for: ${post.title}`);
    console.log(`📋 Feedback: ${feedback}`);

    // Get topic for word count target
    const topic = post.topic_id ? await db.getTopicById(post.topic_id) : null;
    const targetWordCount = topic?.word_count || post.word_count || 1000;

    // Build the rewrite prompt
    const prompt = `You are an expert content editor. A human has reviewed this article and provided specific feedback for improvements.

**ORIGINAL ARTICLE:**

Title: ${post.title}

Meta Description: ${post.meta_description || 'None'}

Content:
${post.content}

---

**HUMAN FEEDBACK:**
${feedback}

---

**YOUR TASK:**
Rewrite the article to address the human's feedback. Make the requested changes while maintaining:
- The overall topic and key information
- SEO optimization (headers, keywords)
- Proper markdown formatting
${preserveLength ? `- Similar word count (target: ${targetWordCount} words ±10%)` : ''}

**IMPORTANT GUIDELINES:**
1. If feedback mentions "too choppy" or "needs flow" - use longer, more connected sentences and better transitions
2. If feedback mentions "more story" or "narrative" - add anecdotes, examples, or a story arc
3. If feedback mentions "remove unverifiable facts" - replace specific statistics with qualitative statements or remove them
4. If feedback mentions "simpler language" - reduce complexity, shorter sentences, common words
5. If feedback mentions "more detail" - expand on key points with examples and explanations
6. If feedback mentions "shorter" - trim unnecessary content while keeping key points

**OUTPUT FORMAT:**
Return the rewritten content in this JSON structure:
{
  "title": "Updated title (if needed, otherwise keep original)",
  "metaDescription": "Updated meta description (150-160 chars)",
  "content": "The full rewritten article in Markdown format",
  "changesApplied": ["List of specific changes you made based on the feedback"]
}`;

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

    const response = message.content[0];
    if (response.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // Parse the JSON response
    const jsonMatch = response.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from Claude response');
    }

    const result = JSON.parse(jsonMatch[0]);
    const newWordCount = result.content.split(/\s+/).filter(Boolean).length;

    // Update the post with rewritten content
    await db.updatePost(postId, {
      content: result.content,
      title: result.title,
      meta_description: result.metaDescription,
      word_count: newWordCount,
    });

    // Log usage
    const estimatedCost = 0.15;
    await db.logUsage({
      user_id: user.id,
      operation_type: 'content_feedback_rewrite',
      cost_usd: estimatedCost,
      tokens_used: 8000,
      metadata: {
        action: 'feedback_rewrite',
        post_id: postId,
        feedback: feedback.substring(0, 500), // Truncate for logging
        changes_applied: result.changesApplied,
      },
    });

    console.log(`✅ Feedback rewrite complete. Changes: ${result.changesApplied?.join(', ')}`);

    return NextResponse.json({
      success: true,
      title: result.title,
      metaDescription: result.metaDescription,
      content: result.content,
      wordCount: newWordCount,
      changesApplied: result.changesApplied || [],
      message: 'Article rewritten based on your feedback',
    });
  } catch (error: any) {
    console.error('Feedback rewrite error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to rewrite post' },
      { status: 500 }
    );
  }
}
