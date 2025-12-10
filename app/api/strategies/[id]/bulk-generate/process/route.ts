import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes - each article takes ~30-60 seconds

/**
 * POST /api/strategies/[id]/bulk-generate/process
 * Background processor for bulk content generation
 * Called internally by the bulk-generate endpoint
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: strategyId } = await params;
  const jobId = request.headers.get('x-bulk-job-id');
  const userIdStr = request.headers.get('x-user-id');

  if (!jobId || !userIdStr) {
    return NextResponse.json({ error: 'Missing job ID or user ID' }, { status: 400 });
  }

  const userId = parseInt(userIdStr);
  const { topicIds } = await request.json();

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🚀 BULK GENERATION STARTED`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`   Job ID: ${jobId}`);
  console.log(`   Strategy: ${strategyId}`);
  console.log(`   Topics: ${topicIds.length}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  try {
    // Update job status to processing
    await db.updateBulkJob(jobId, { status: 'processing' });

    const results: any[] = [];
    let completedCount = 0;
    let failedCount = 0;

    // Get base URL for internal API calls
    const baseUrl = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL;

    // Process topics sequentially to avoid rate limits and manage resources
    for (const topicId of topicIds) {
      console.log(`\n📝 Processing topic ${completedCount + failedCount + 1}/${topicIds.length}: ${topicId}`);

      try {
        // Call the existing generate endpoint for each topic
        const response = await fetch(`${baseUrl}/api/topics/${topicId}/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Pass through auth by using internal auth
            'x-internal-bulk-request': 'true',
            'x-bulk-user-id': userId.toString(),
          },
        });

        const data = await response.json();

        if (response.ok && data.success) {
          completedCount++;
          results.push({
            topicId,
            status: 'completed',
            postId: data.post?.id,
            aisoScore: data.aisoScores?.aisoScore,
          });
          console.log(`   ✅ Topic ${topicId} completed - Post ID: ${data.post?.id}`);
        } else {
          failedCount++;
          results.push({
            topicId,
            status: 'failed',
            error: data.error || data.message || 'Unknown error',
          });
          console.log(`   ❌ Topic ${topicId} failed: ${data.error || data.message}`);
        }

        // Update job progress
        await db.updateBulkJob(jobId, {
          completed_items: completedCount,
          failed_items: failedCount,
          results: JSON.stringify(results),
        });
      } catch (error: any) {
        failedCount++;
        results.push({
          topicId,
          status: 'failed',
          error: error.message || 'Processing error',
        });
        console.log(`   ❌ Topic ${topicId} error: ${error.message}`);

        // Update job progress even on error
        await db.updateBulkJob(jobId, {
          completed_items: completedCount,
          failed_items: failedCount,
          results: JSON.stringify(results),
        });
      }

      // Small delay between topics to avoid overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Mark job as completed
    const finalStatus = failedCount === topicIds.length ? 'failed' :
                       failedCount > 0 ? 'completed_with_errors' : 'completed';

    await db.updateBulkJob(jobId, {
      status: finalStatus,
      completed_items: completedCount,
      failed_items: failedCount,
      results: JSON.stringify(results),
      completed_at: new Date().toISOString(),
    });

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`✅ BULK GENERATION COMPLETE`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`   Completed: ${completedCount}/${topicIds.length}`);
    console.log(`   Failed: ${failedCount}/${topicIds.length}`);
    console.log(`   Status: ${finalStatus}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    return NextResponse.json({
      success: true,
      status: finalStatus,
      completed: completedCount,
      failed: failedCount,
      results,
    });
  } catch (error: any) {
    console.error('Bulk processing error:', error);

    // Update job with error
    await db.updateBulkJob(jobId, {
      status: 'failed',
      error: error.message || 'Processing failed',
      completed_at: new Date().toISOString(),
    });

    return NextResponse.json(
      { error: error.message || 'Bulk processing failed' },
      { status: 500 }
    );
  }
}
