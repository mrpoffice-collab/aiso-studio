'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider, usePostHog } from 'posthog-js/react'
import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser()

  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
        capture_pageview: true,
        capture_pageleave: true,
        autocapture: true, // Auto-capture clicks, form submissions
        session_recording: {
          maskAllInputs: false,
          maskInputOptions: {
            password: true,
          },
        },
      })
    }
  }, [])

  // Identify user when logged in
  useEffect(() => {
    if (user && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.identify(user.id, {
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName,
      })
    }
  }, [user])

  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return <>{children}</>
  }

  return <PHProvider client={posthog}>{children}</PHProvider>
}

// ===== Custom Event Tracking Functions =====

// Strategy events
export function trackStrategyCreated(clientName: string, industry: string) {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.capture('strategy_created', {
      client_name: clientName,
      industry: industry,
    })
  }
}

export function trackTopicGenerated(strategyId: string, topicCount: number) {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.capture('topics_generated', {
      strategy_id: strategyId,
      topic_count: topicCount,
    })
  }
}

// Content events
export function trackContentGenerated(topicId: string, wordCount: number) {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.capture('content_generated', {
      topic_id: topicId,
      word_count: wordCount,
    })
  }
}

export function trackContentPublished(postId: string, destination: string) {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.capture('content_published', {
      post_id: postId,
      destination: destination, // 'wordpress', 'download', etc.
    })
  }
}

// Audit events
export function trackAuditStarted(auditType: string, url?: string) {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.capture('audit_started', {
      audit_type: auditType, // 'single', 'batch', 'accessibility', 'free'
      url: url,
    })
  }
}

export function trackAuditCompleted(auditType: string, score: number) {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.capture('audit_completed', {
      audit_type: auditType,
      score: score,
    })
  }
}

export function trackFreeAuditConversion() {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.capture('free_audit_conversion')
  }
}

// Rewrite events
export function trackRewriteStarted(postId: string) {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.capture('rewrite_started', {
      post_id: postId,
    })
  }
}

export function trackRewriteCompleted(postId: string, improvementPercent: number) {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.capture('rewrite_completed', {
      post_id: postId,
      improvement_percent: improvementPercent,
    })
  }
}

// Lead/Pipeline events
export function trackLeadDiscovered(domain: string, source: string) {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.capture('lead_discovered', {
      domain: domain,
      source: source,
    })
  }
}

// Subscription events
export function trackSubscriptionUpgrade(fromTier: string, toTier: string) {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.capture('subscription_upgraded', {
      from_tier: fromTier,
      to_tier: toTier,
    })
  }
}

// Feature usage
export function trackFeatureUsed(featureName: string, metadata?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.capture('feature_used', {
      feature: featureName,
      ...metadata,
    })
  }
}

// Error tracking
export function trackError(errorType: string, errorMessage: string, context?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.capture('error_occurred', {
      error_type: errorType,
      error_message: errorMessage,
      ...context,
    })
  }
}

// Hook for components
export function useTrackEvent() {
  const posthogClient = usePostHog()

  return (eventName: string, properties?: Record<string, unknown>) => {
    if (posthogClient) {
      posthogClient.capture(eventName, properties)
    }
  }
}
