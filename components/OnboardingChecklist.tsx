'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AISOMascotInline } from './AISOMascot';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  href: string;
  action?: string;
}

interface OnboardingChecklistProps {
  compact?: boolean;
  onComplete?: () => void;
}

export default function OnboardingChecklist({ compact = false, onComplete }: OnboardingChecklistProps) {
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    fetchOnboardingStatus();
  }, []);

  const fetchOnboardingStatus = async () => {
    try {
      const response = await fetch('/api/onboarding/status');
      const data = await response.json();

      if (data.steps) {
        setSteps(data.steps);

        // Check if all steps are complete
        const allComplete = data.steps.every((s: OnboardingStep) => s.completed);
        if (allComplete && onComplete) {
          onComplete();
        }
      }
    } catch (error) {
      console.error('Failed to fetch onboarding status:', error);
    } finally {
      setLoading(false);
    }
  };

  const completedCount = steps.filter(s => s.completed).length;
  const totalSteps = steps.length;
  const progress = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;
  const isComplete = completedCount === totalSteps && totalSteps > 0;

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-3">
          <AISOMascotInline state="running" />
          <span className="text-slate-600">Loading setup progress...</span>
        </div>
      </div>
    );
  }

  if (isComplete && compact) {
    return null; // Hide when complete in compact mode
  }

  if (compact) {
    return (
      <div className="rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
              <span className="text-lg">🚀</span>
            </div>
            <div>
              <p className="font-medium text-slate-900">
                Complete your agency setup
              </p>
              <p className="text-sm text-slate-600">
                {completedCount} of {totalSteps} steps complete
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/settings/onboarding"
            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
          >
            Continue Setup
          </Link>
        </div>
        <div className="mt-3 h-2 rounded-full bg-orange-100">
          <div
            className="h-2 rounded-full bg-orange-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      {/* Header */}
      <div className="border-b border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500">
              <span className="text-2xl">🎯</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                {isComplete ? 'Setup Complete!' : 'Complete Your Agency Setup'}
              </h2>
              <p className="text-slate-600">
                {isComplete
                  ? 'Your agency is ready to go'
                  : `${completedCount} of ${totalSteps} steps complete`}
              </p>
            </div>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <svg
              className={`h-5 w-5 transform transition-transform ${expanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-2 rounded-full bg-slate-100">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              isComplete ? 'bg-green-500' : 'bg-orange-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      {expanded && (
        <div className="divide-y divide-slate-100">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center gap-4 p-4 ${
                step.completed ? 'bg-slate-50' : 'bg-white'
              }`}
            >
              {/* Step number/check */}
              <div
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                  step.completed
                    ? 'bg-green-100 text-green-600'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {step.completed ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>

              {/* Step info */}
              <div className="flex-1 min-w-0">
                <p className={`font-medium ${step.completed ? 'text-slate-500' : 'text-slate-900'}`}>
                  {step.title}
                </p>
                <p className="text-sm text-slate-500 truncate">{step.description}</p>
              </div>

              {/* Action */}
              {!step.completed && (
                <Link
                  href={step.href}
                  className="flex-shrink-0 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                >
                  {step.action || 'Complete'}
                </Link>
              )}
              {step.completed && (
                <span className="flex-shrink-0 text-sm text-green-600 font-medium">
                  Done
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Footer for complete state */}
      {isComplete && expanded && (
        <div className="border-t border-slate-200 bg-green-50 p-4">
          <div className="flex items-center gap-3 text-green-800">
            <AISOMascotInline state="success" />
            <span className="font-medium">You're all set! Your agency is ready to impress clients.</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Compact banner for dashboard
export function OnboardingBanner() {
  const [show, setShow] = useState(true);
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/onboarding/status');
      const data = await response.json();
      if (data.steps) {
        setSteps(data.steps);
        // Hide if all complete
        const allComplete = data.steps.every((s: OnboardingStep) => s.completed);
        if (allComplete) {
          setShow(false);
        }
      }
    } catch (error) {
      console.error('Failed to fetch onboarding status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !show) return null;

  const completedCount = steps.filter(s => s.completed).length;
  const totalSteps = steps.length;
  const nextStep = steps.find(s => !s.completed);

  return (
    <div className="rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
            <span className="text-lg">🚀</span>
          </div>
          <div>
            <p className="font-medium text-slate-900">
              {nextStep?.title || 'Complete your setup'}
            </p>
            <p className="text-sm text-slate-600">
              Step {completedCount + 1} of {totalSteps}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {nextStep && (
            <Link
              href={nextStep.href}
              className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
            >
              {nextStep.action || 'Continue'}
            </Link>
          )}
          <button
            onClick={() => setShow(false)}
            className="rounded-lg p-2 text-slate-400 hover:bg-white/50 hover:text-slate-600"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
