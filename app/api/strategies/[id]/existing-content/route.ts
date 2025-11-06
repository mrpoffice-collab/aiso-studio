import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { scrapeMultipleUrls } from '@/lib/duplicate-checker';

/**
 * GET /api/strategies/[id]/existing-content
 * Get all existing content URLs for a strategy
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: strategyId } = await params;

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

    // Get existing content
    const existingContent = await db.getExistingContentByStrategyId(strategyId);

    return NextResponse.json({
      success: true,
      existingContent,
    });
  } catch (error: any) {
    console.error('Get existing content error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch existing content' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/strategies/[id]/existing-content
 * Add existing content URLs (will scrape and store)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: strategyId } = await params;
    const body = await request.json();
    const { urls } = body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: 'Please provide an array of URLs' },
        { status: 400 }
      );
    }

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

    // Scrape URLs
    console.log(`Scraping ${urls.length} URLs...`);
    const scrapedContent = await scrapeMultipleUrls(urls);

    // Save to database
    const savedContent = [];
    for (const content of scrapedContent) {
      const saved = await db.addExistingContent({
        strategy_id: strategyId,
        url: content.url,
        title: content.title,
        content_excerpt: content.excerpt,
      });
      savedContent.push(saved);
    }

    // Update strategy with URLs
    const existingUrls = Array.isArray(strategy.existing_blog_urls)
      ? strategy.existing_blog_urls
      : [];
    const updatedUrls = [...new Set([...existingUrls, ...urls])];
    await db.updateStrategyExistingUrls(strategyId, updatedUrls);

    return NextResponse.json({
      success: true,
      message: `Successfully added ${savedContent.length} out of ${urls.length} URLs`,
      addedCount: savedContent.length,
      failedCount: urls.length - savedContent.length,
      savedContent,
    });
  } catch (error: any) {
    console.error('Add existing content error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add existing content' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/strategies/[id]/existing-content?contentId=xxx
 * Delete an existing content entry
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: strategyId } = await params;
    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('contentId');

    if (!contentId) {
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 }
      );
    }

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

    // Delete existing content
    await db.deleteExistingContent(contentId);

    return NextResponse.json({
      success: true,
      message: 'Existing content deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete existing content error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete existing content' },
      { status: 500 }
    );
  }
}
