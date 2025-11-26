'use client';

import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useState, useEffect } from 'react';

export type MascotState = 'idle' | 'running' | 'thinking' | 'success' | 'error';
export type MascotSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AISOMascotProps {
  state?: MascotState;
  size?: MascotSize;
  message?: string;
  showMessage?: boolean;
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
}

const sizeMap: Record<MascotSize, { width: number; height: number }> = {
  xs: { width: 32, height: 32 },
  sm: { width: 48, height: 48 },
  md: { width: 80, height: 80 },
  lg: { width: 120, height: 120 },
  xl: { width: 200, height: 200 },
};

const stateMessages: Record<MascotState, string> = {
  idle: '',
  running: 'Working on it...',
  thinking: 'Analyzing...',
  success: 'Done!',
  error: 'Oops! Something went wrong.',
};

const stateStyles: Record<MascotState, string> = {
  idle: '',
  running: '',
  thinking: 'opacity-80',
  success: '',
  error: 'grayscale',
};

// Animation URL from LottieFiles
const STICKMAN_WALKING_URL = 'https://lottie.host/embed/004d8552-fea5-11ee-a41e-3ffb2b3d58c0/VaKTzQx6BQ.lottie';
const STICKMAN_LOTTIE_URL = 'https://assets-v2.lottiefiles.com/a/004d8552-fea5-11ee-a41e-3ffb2b3d58c0/VaKTzQx6BQ.lottie';

export default function AISOMascot({
  state = 'idle',
  size = 'md',
  message,
  showMessage = true,
  className = '',
  loop = true,
  autoplay = true,
}: AISOMascotProps) {
  const dimensions = sizeMap[size];
  const displayMessage = message || stateMessages[state];

  // Determine animation speed based on state
  const getSpeed = () => {
    switch (state) {
      case 'running':
        return 1.5; // Faster when working
      case 'thinking':
        return 0.5; // Slower when thinking
      case 'success':
        return 1;
      case 'error':
        return 0.3; // Very slow for error
      default:
        return 1;
    }
  };

  // Determine if should play based on state
  const shouldPlay = state !== 'idle' || autoplay;

  return (
    <div className={`inline-flex flex-col items-center gap-2 ${className}`}>
      <div
        className={`relative ${stateStyles[state]}`}
        style={{ width: dimensions.width, height: dimensions.height }}
      >
        <DotLottieReact
          src={STICKMAN_LOTTIE_URL}
          loop={loop}
          autoplay={shouldPlay}
          style={{ width: '100%', height: '100%' }}
          speed={getSpeed()}
        />

        {/* Success overlay */}
        {state === 'success' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
          </div>
        )}

        {/* Error overlay */}
        {state === 'error' && (
          <div className="absolute -top-1 -right-1">
            <span className="text-red-500 text-lg">!</span>
          </div>
        )}
      </div>

      {/* Message */}
      {showMessage && displayMessage && (
        <span className={`text-sm font-medium ${
          state === 'error' ? 'text-red-600' :
          state === 'success' ? 'text-green-600' :
          'text-slate-600'
        }`}>
          {displayMessage}
        </span>
      )}
    </div>
  );
}

// Convenience wrapper for loading states
export function AISOMascotLoading({
  message = 'Working on it...',
  size = 'md'
}: {
  message?: string;
  size?: MascotSize;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <AISOMascot state="running" size={size} message={message} />
    </div>
  );
}

// Convenience wrapper for inline button loading
export function AISOMascotInline({
  state = 'running',
  message,
  className = ''
}: {
  state?: MascotState;
  message?: string;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <AISOMascot state={state} size="xs" showMessage={false} />
      {message && <span>{message}</span>}
    </span>
  );
}

// Full page loading overlay
export function AISOMascotFullPage({
  message = 'Loading...',
  subMessage
}: {
  message?: string;
  subMessage?: string;
}) {
  return (
    <div className="fixed inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center">
        <AISOMascot state="running" size="xl" message={message} />
        {subMessage && (
          <p className="mt-2 text-sm text-slate-500">{subMessage}</p>
        )}
      </div>
    </div>
  );
}

// Progress indicator with mascot
export function AISOMascotProgress({
  message = 'Processing...',
  progress,
  steps
}: {
  message?: string;
  progress?: number; // 0-100
  steps?: { label: string; complete: boolean }[];
}) {
  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <AISOMascot state="running" size="lg" showMessage={false} />

      <div className="text-center">
        <p className="font-semibold text-slate-900">{message}</p>

        {progress !== undefined && (
          <div className="mt-3 w-48">
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">{progress}% complete</p>
          </div>
        )}

        {steps && (
          <div className="mt-4 text-left space-y-2">
            {steps.map((step, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                {step.complete ? (
                  <span className="text-green-500">&#10003;</span>
                ) : (
                  <span className="text-slate-300">&#9675;</span>
                )}
                <span className={step.complete ? 'text-slate-600' : 'text-slate-400'}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
