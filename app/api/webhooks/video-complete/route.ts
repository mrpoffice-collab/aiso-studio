import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
// import { assets } from '@/lib/db/schema' // Uncomment when assets table exists

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      event,
      jobId,
      status,
      result,
      metadata,
      usage,
    } = body

    console.log(`[Video Webhook] ${event} - Job ${jobId}: ${status}`)

    if (event === 'video.completed' && status === 'completed' && result) {
      // Save video to asset vault
      // Uncomment and adjust when you have the assets table ready:
      /*
      await db.insert(assets).values({
        id: generateId('asset'),
        userId: metadata?.userId,
        strategyId: metadata?.strategyId,
        topicId: metadata?.topicId,
        type: 'video',
        name: metadata?.title || `Video ${jobId}`,
        url: result.videoUrl,
        thumbnailUrl: result.thumbnailUrl,
        mimeType: 'video/mp4',
        size: result.fileSize,
        metadata: {
          duration: result.duration,
          captionsSrt: result.captionsSrt,
          captionsVtt: result.captionsVtt,
          videoForgeJobId: jobId,
          usage,
        },
        createdAt: new Date(),
      })
      */

      console.log(`[Video Webhook] Video saved to asset vault:`, {
        jobId,
        videoUrl: result.videoUrl,
        duration: result.duration,
      })
    }

    if (event === 'video.failed') {
      console.error(`[Video Webhook] Video generation failed:`, {
        jobId,
        error: body.error,
      })
    }

    return Response.json({ received: true })
  } catch (error) {
    console.error('[Video Webhook] Error processing webhook:', error)
    return Response.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
