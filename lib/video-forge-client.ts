/**
 * Video Forge Client for AISO Studio
 *
 * This client integrates with the Video Forge service to generate
 * faceless videos from scripts.
 */

const VIDEO_FORGE_URL = process.env.VIDEO_FORGE_URL || 'http://localhost:3001'
const VIDEO_FORGE_API_KEY = process.env.VIDEO_FORGE_API_KEY

export interface VideoOptions {
  voice?: string
  voiceProvider?: 'elevenlabs' | 'openai'
  style?: 'cinematic' | 'bright' | 'minimal' | 'dark' | 'corporate'
  duration?: 'short' | 'medium' | 'long' | 'auto'
  aspectRatio?: '16:9' | '9:16' | '1:1' | '4:5'
  captions?: boolean
  captionStyle?: 'word_highlight' | 'sentence' | 'karaoke'
  captionPosition?: 'bottom' | 'center' | 'top'
  music?: string
  musicVolume?: number
  bRollSource?: 'auto' | 'pexels' | 'storyblocks' | 'asset_vault' | 'none'
}

export interface VideoJobResponse {
  jobId: string
  status: 'queued' | 'processing' | 'rendering' | 'uploading' | 'completed' | 'failed' | 'cancelled'
  progress: number
  currentStep?: string
  steps?: Array<{ name: string; status: string }>
  result?: VideoResult
  error?: string
  metadata?: Record<string, unknown>
  usage?: {
    voiceCharacters: number
    renderSeconds: number
    costCents: number
  }
  createdAt?: string
  completedAt?: string
}

export interface VideoResult {
  videoUrl: string
  thumbnailUrl: string
  duration: number
  fileSize: number
  captionsSrt?: string
  captionsVtt?: string
}

export interface Voice {
  id: string
  name: string
  provider: string
  voiceId: string
  description?: string
  gender?: string
  style?: string
  sampleUrl?: string
}

class VideoForgeClient {
  private baseUrl: string
  private apiKey: string

  constructor(baseUrl?: string, apiKey?: string) {
    this.baseUrl = baseUrl || VIDEO_FORGE_URL
    this.apiKey = apiKey || VIDEO_FORGE_API_KEY || ''
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(error.error || `Request failed: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Generate a video from a script
   */
  async generateVideo(
    script: string,
    options: VideoOptions = {},
    metadata?: Record<string, unknown>
  ): Promise<{ jobId: string; status: string; estimatedTime: number; pollUrl: string }> {
    return this.request('/api/v1/videos/generate', {
      method: 'POST',
      body: JSON.stringify({
        script,
        options: {
          voice: options.voice || 'adam',
          voiceProvider: options.voiceProvider || 'elevenlabs',
          style: options.style || 'cinematic',
          duration: options.duration || 'auto',
          aspectRatio: options.aspectRatio || '16:9',
          captions: options.captions ?? true,
          captionStyle: options.captionStyle || 'word_highlight',
          captionPosition: options.captionPosition || 'bottom',
          music: options.music,
          musicVolume: options.musicVolume ?? 20,
          bRollSource: options.bRollSource || 'auto',
        },
        webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL}/api/webhooks/video-complete`,
        metadata,
      }),
    })
  }

  /**
   * Get the status of a video job
   */
  async getVideoStatus(jobId: string): Promise<VideoJobResponse> {
    return this.request(`/api/v1/videos/${jobId}`)
  }

  /**
   * Cancel a video job
   */
  async cancelVideo(jobId: string): Promise<{ jobId: string; status: string; message: string }> {
    return this.request(`/api/v1/videos/${jobId}/cancel`, {
      method: 'POST',
    })
  }

  /**
   * Get available voices
   */
  async getVoices(): Promise<{ voices: Voice[] }> {
    return this.request('/api/v1/voices')
  }

  /**
   * Poll for video completion (utility method)
   */
  async waitForCompletion(
    jobId: string,
    options: {
      pollInterval?: number
      timeout?: number
      onProgress?: (job: VideoJobResponse) => void
    } = {}
  ): Promise<VideoJobResponse> {
    const { pollInterval = 5000, timeout = 600000, onProgress } = options
    const startTime = Date.now()

    while (true) {
      const job = await this.getVideoStatus(jobId)

      if (onProgress) {
        onProgress(job)
      }

      if (job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled') {
        return job
      }

      if (Date.now() - startTime > timeout) {
        throw new Error('Video generation timed out')
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval))
    }
  }
}

// Export singleton instance
export const videoForge = new VideoForgeClient()

// Export class for custom instances
export { VideoForgeClient }

// Convenience function for quick video generation
export async function generateVideoFromScript(
  script: string,
  options?: VideoOptions,
  metadata?: Record<string, unknown>
) {
  return videoForge.generateVideo(script, options, metadata)
}

export async function getVideoStatus(jobId: string) {
  return videoForge.getVideoStatus(jobId)
}

export async function getAvailableVoices() {
  return videoForge.getVoices()
}
