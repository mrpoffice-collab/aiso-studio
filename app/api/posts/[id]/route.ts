import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export async function GET(
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

    // Get post
    const post = await db.getPostById(postId);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Verify ownership
    if (post.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get topic to retrieve strategy_id
    let strategy_id = null;
    if (post.topic_id) {
      const topic = await db.getTopicById(post.topic_id);
      strategy_id = topic?.strategy_id;
    }

    // Get fact checks
    const factChecks = await db.getFactChecksByPostId(postId);

    return NextResponse.json({
      post: { ...post, strategy_id }, // Add strategy_id to post object
      factChecks,
    });
  } catch (error: any) {
    console.error('Get post error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    // Get post
    const post = await db.getPostById(postId);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Verify ownership
    if (post.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const updates: any = {};

    if (body.content !== undefined) {
      updates.content = body.content;
    }
    if (body.status !== undefined) {
      updates.status = body.status;
    }
    if (body.meta_description !== undefined) {
      updates.meta_description = body.meta_description;
    }
    if (body.title !== undefined) {
      updates.title = body.title;
    }
    if (body.featured_image_url !== undefined) {
      updates.featured_image_url = body.featured_image_url;
    }
    if (body.image_attribution !== undefined) {
      updates.image_attribution = body.image_attribution;
    }

    // Track asset usage if a DAM asset is being set as featured image
    if (body.asset_id !== undefined) {
      // Remove old featured image asset usage for this post
      await db.deleteAssetUsageByEntity('post', postId, 'featured_image');

      // Add new asset usage tracking if asset_id is provided
      if (body.asset_id) {
        await db.createAssetUsage({
          asset_id: body.asset_id,
          entity_type: 'post',
          entity_id: postId,
          usage_type: 'featured_image',
        });
      }
    }

    // Update post
    const updatedPost = await db.updatePost(postId, updates);

    return NextResponse.json({
      success: true,
      post: updatedPost,
    });
  } catch (error: any) {
    console.error('Update post error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update post' },
      { status: 500 }
    );
  }
}
