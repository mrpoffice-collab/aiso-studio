import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes max for bulk operations

/**
 * POST /api/strategies/[id]/bulk-generate
 * Start bulk content generation for all pending topics in a strategy
 * Returns immediately with a job ID, processing happens in the background
 */
export async function POST(
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

    // Check if user is on Agency tier (bulk generation is Agency-only)
    if (user.subscription_tier !== 'agency') {
      return NextResponse.json(
        {
          error: 'Agency tier required',
          message: 'Bulk content generation is available on the Agency plan. Upgrade to generate all topics at once.',
          upgrade_url: '/pricing'
        },
        { status: 403 }
      );
    }

    // Get subscription info for limit checks
    const subscription = await db.getUserSubscriptionInfo(user.id);
    if (!subscription) {
      return NextResponse.json({ error: 'Subscription info not found' }, { status: 500 });
    }

    // Check subscription status
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

    // Check if user already has a running bulk job
    const runningJobs = await db.getRunningBulkJobsForUser(user.id);
    if (runningJobs.length > 0) {
      const runningJob = runningJobs[0];
      return NextResponse.json(
        {
          error: 'Job already running',
          message: `You already have a bulk job in progress. Please wait for it to complete or cancel it first.`,
          existingJob: {
            id: runningJob.id,
            strategyId: runningJob.strategy_id,
            status: runningJob.status,
            progress: Math.round((runningJob.completed_items / runningJob.total_items) * 100),
            completedItems: runningJob.completed_items,
            totalItems: runningJob.total_items,
          }
        },
        { status: 409 }
      );
    }

    // Get all pending topics for this strategy
    const topics = await db.getTopicsByStrategyId(strategyId);
    const pendingTopics = topics.filter((t: any) => t.status === 'pending' || t.status === 'failed');

    if (pendingTopics.length === 0) {
      return NextResponse.json(
        { error: 'No pending topics', message: 'All topics have already been generated.' },
        { status: 400 }
      );
    }

    // Check if user has enough article credits
    const articlesRemaining = subscription.article_limit - subscription.articles_used_this_month;

    // Agency tier has unlimited, but check anyway
    if (articlesRemaining < pendingTopics.length && subscription.article_limit !== -1) {
      return NextResponse.json(
        {
          error: 'Not enough article credits',
          message: `You have ${articlesRemaining} articles remaining but ${pendingTopics.length} topics to generate.`,
          articlesRemaining,
          topicsToGenerate: pendingTopics.length,
        },
        { status: 403 }
      );
    }

    // Create a bulk job record
    const jobId = `bulk-${strategyId}-${Date.now()}`;

    // Store job in database
    await db.createBulkJob({
      id: jobId,
      user_id: user.id,
      strategy_id: strategyId,
      job_type: 'generate',
      status: 'pending',
      total_items: pendingTopics.length,
      completed_items: 0,
      failed_items: 0,
      topic_ids: pendingTopics.map((t: any) => t.id),
    });

    // Start background processing (using fetch to our own endpoint)
    // This allows the request to return immediately
    const baseUrl = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL;

    // Fire and forget - process in background
    fetch(`${baseUrl}/api/strategies/${strategyId}/bulk-generate/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-bulk-job-id': jobId,
        'x-user-id': user.id.toString(),
      },
      body: JSON.stringify({ topicIds: pendingTopics.map((t: any) => t.id) }),
    }).catch(err => {
      console.error('Failed to start bulk processing:', err);
    });

    return NextResponse.json({
      success: true,
      jobId,
      message: `Started generating ${pendingTopics.length} articles`,
      totalTopics: pendingTopics.length,
      topics: pendingTopics.map((t: any) => ({
        id: t.id,
        title: t.title,
        status: 'queued',
      })),
    });
  } catch (error: any) {
    console.error('Bulk generate error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to start bulk generation' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/strategies/[id]/bulk-generate
 * Get status of bulk generation job
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: strategyId } = await params;
    const jobId = request.nextUrl.searchParams.get('jobId');

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

    if (jobId) {
      // Get specific job status
      const job = await db.getBulkJob(jobId);
      if (!job) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
      }

      if (job.user_id !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      return NextResponse.json({
        success: true,
        job: {
          id: job.id,
          status: job.status,
          totalItems: job.total_items,
          completedItems: job.completed_items,
          failedItems: job.failed_items,
          progress: Math.round((job.completed_items / job.total_items) * 100),
          results: job.results,
          error: job.error,
          createdAt: job.created_at,
          completedAt: job.completed_at,
        },
      });
    } else {
      // Get latest job for this strategy
      const jobs = await db.getBulkJobsByStrategy(strategyId, user.id);
      const latestJob = jobs[0];

      if (!latestJob) {
        return NextResponse.json({
          success: true,
          job: null,
          message: 'No bulk generation jobs found for this strategy',
        });
      }

      return NextResponse.json({
        success: true,
        job: {
          id: latestJob.id,
          status: latestJob.status,
          totalItems: latestJob.total_items,
          completedItems: latestJob.completed_items,
          failedItems: latestJob.failed_items,
          progress: Math.round((latestJob.completed_items / latestJob.total_items) * 100),
          results: latestJob.results,
          error: latestJob.error,
          createdAt: latestJob.created_at,
          completedAt: latestJob.completed_at,
        },
      });
    }
  } catch (error: any) {
    console.error('Get bulk status error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get bulk status' },
      { status: 500 }
    );
  }
}
