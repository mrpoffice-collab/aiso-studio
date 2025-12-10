import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { publishToWordPress, decryptCredential } from '@/lib/wordpress-client';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { postId, mockMode } = body;

    if (!postId) {
      return NextResponse.json(
        { error: 'Missing required field: postId' },
        { status: 400 }
      );
    }

    // Get the post with its topic and strategy
    const post = await db.getPostById(postId);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Get the strategy for WordPress settings
    const strategy = await db.getStrategyByTopicId(post.topic_id);
    if (!strategy) {
      return NextResponse.json({ error: 'Strategy not found' }, { status: 404 });
    }

    // Check if WordPress is enabled for this strategy
    if (!strategy.wordpress_enabled && !mockMode) {
      return NextResponse.json(
        { error: 'WordPress publishing is not enabled for this strategy' },
        { status: 400 }
      );
    }

    // For mock mode, use placeholder settings
    const wpUrl = mockMode ? 'https://mock-wordpress-site.com' : strategy.wordpress_url;
    const wpUsername = mockMode ? 'mock_user' : strategy.wordpress_username;
    const wpPassword = mockMode
      ? 'mock_password'
      : decryptCredential(strategy.wordpress_app_password || '');

    if (!mockMode && (!wpUrl || !wpUsername || !wpPassword)) {
      return NextResponse.json(
        { error: 'WordPress credentials not configured for this strategy' },
        { status: 400 }
      );
    }

    // Publish to WordPress
    const result = await publishToWordPress(
      {
        url: wpUrl!,
        username: wpUsername!,
        appPassword: wpPassword,
        mockMode: mockMode ?? false,
      },
      {
        title: post.title,
        content: post.content,
        excerpt: post.meta_description || '',
        status: (strategy.wordpress_default_status as 'draft' | 'publish') || 'draft',
        categories: strategy.wordpress_category_id ? [strategy.wordpress_category_id] : undefined,
        author: strategy.wordpress_author_id || undefined,
      }
    );

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error,
      });
    }

    // Update the post with WordPress info
    await db.updatePostWordPress(postId, {
      wordpress_post_id: result.postId,
      wordpress_post_url: result.postUrl,
      wordpress_published_at: new Date(),
      status: 'published',
    });

    return NextResponse.json({
      success: true,
      postId: result.postId,
      postUrl: result.postUrl,
      editUrl: result.editUrl,
      mockMode: result.mockMode,
      status: strategy.wordpress_default_status || 'draft',
    });
  } catch (error: any) {
    console.error('WordPress publish error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
