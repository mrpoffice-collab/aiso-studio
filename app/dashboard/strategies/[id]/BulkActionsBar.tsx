'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface BulkActionsBarProps {
  strategyId: string;
  topics: any[];
  isAgencyTier: boolean;
}

interface BulkJob {
  id: string;
  status: string;
  totalItems: number;
  completedItems: number;
  failedItems: number;
  progress: number;
  results?: any[];
  error?: string;
}

export default function BulkActionsBar({ strategyId, topics, isAgencyTier }: BulkActionsBarProps) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [currentJob, setCurrentJob] = useState<BulkJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  // Calculate stats
  const pendingTopics = topics.filter(t => t.status === 'pending' || t.status === 'failed');
  const completedTopics = topics.filter(t => t.status === 'completed');
  const hasPendingTopics = pendingTopics.length > 0;
  const hasCompletedTopics = completedTopics.length > 0;

  // Poll for job status
  const pollJobStatus = useCallback(async (jobId: string) => {
    try {
      const response = await fetch(`/api/strategies/${strategyId}/bulk-generate?jobId=${jobId}`);
      const data = await response.json();

      if (data.success && data.job) {
        setCurrentJob(data.job);

        // Check if job is complete
        if (['completed', 'completed_with_errors', 'failed'].includes(data.job.status)) {
          setIsGenerating(false);
          // Refresh the page to show updated topics
          router.refresh();
        } else {
          // Continue polling
          setTimeout(() => pollJobStatus(jobId), 3000);
        }
      }
    } catch (err) {
      console.error('Error polling job status:', err);
    }
  }, [strategyId, router]);

  // Check for existing running job on mount
  useEffect(() => {
    const checkExistingJob = async () => {
      try {
        const response = await fetch(`/api/strategies/${strategyId}/bulk-generate`);
        const data = await response.json();

        if (data.success && data.job && ['pending', 'processing'].includes(data.job.status)) {
          setCurrentJob(data.job);
          setIsGenerating(true);
          pollJobStatus(data.job.id);
        }
      } catch (err) {
        console.error('Error checking existing job:', err);
      }
    };

    checkExistingJob();
  }, [strategyId, pollJobStatus]);

  const handleGenerateAll = async () => {
    if (!isAgencyTier) {
      setShowUpgradePrompt(true);
      return;
    }

    setIsGenerating(true);
    setError(null);
    setCurrentJob(null);

    try {
      const response = await fetch(`/api/strategies/${strategyId}/bulk-generate`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to start bulk generation');
      }

      setCurrentJob({
        id: data.jobId,
        status: 'processing',
        totalItems: data.totalTopics,
        completedItems: 0,
        failedItems: 0,
        progress: 0,
      });

      // Start polling for status
      pollJobStatus(data.jobId);
    } catch (err: any) {
      setError(err.message);
      setIsGenerating(false);
    }
  };

  const handleApproveAll = async () => {
    if (!isAgencyTier) {
      setShowUpgradePrompt(true);
      return;
    }

    setIsApproving(true);
    setError(null);

    try {
      const response = await fetch(`/api/strategies/${strategyId}/bulk-approve`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to approve posts');
      }

      // Refresh the page
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsApproving(false);
    }
  };

  const handleDownloadAll = async () => {
    if (!isAgencyTier) {
      setShowUpgradePrompt(true);
      return;
    }

    setIsExporting(true);
    setError(null);

    try {
      const response = await fetch(`/api/strategies/${strategyId}/bulk-export`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || data.error || 'Failed to export posts');
      }

      // Download the ZIP file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `strategy-${strategyId}-export.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsExporting(false);
    }
  };

  // Don't show if no topics
  if (topics.length === 0) return null;

  return (
    <>
      {/* Upgrade Prompt Modal */}
      {showUpgradePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 max-w-md rounded-2xl bg-white p-8 shadow-2xl">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
              <svg className="h-8 w-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-bold text-slate-900">Agency Feature</h3>
            <p className="mb-6 text-slate-600">
              Bulk content operations are available on the Agency plan. Generate, approve, and export
              all your content at once to save hours of work.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowUpgradePrompt(false)}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <a
                href="/pricing"
                className="flex-1 rounded-lg bg-orange-500 px-4 py-2 text-center text-sm font-bold text-white hover:bg-orange-600"
              >
                Upgrade to Agency
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions Bar */}
      <div className="mb-8 rounded-2xl border border-slate-200/60 bg-white p-6 shadow-xl shadow-slate-200/50">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Bulk Actions</h3>
            <p className="text-sm text-slate-600">
              {pendingTopics.length} pending • {completedTopics.length} generated
              {!isAgencyTier && <span className="ml-2 text-orange-600">(Agency tier required)</span>}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Generate All Button */}
            <button
              onClick={handleGenerateAll}
              disabled={isGenerating || !hasPendingTopics}
              className={`group relative flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold shadow-lg transition-all duration-200 ${
                hasPendingTopics && !isGenerating
                  ? 'bg-gradient-to-r from-deep-indigo to-blue-600 text-white hover:shadow-xl hover:scale-105'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isGenerating ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generate All ({pendingTopics.length})
                </>
              )}
            </button>

            {/* Approve All Button */}
            <button
              onClick={handleApproveAll}
              disabled={isApproving || !hasCompletedTopics}
              className={`group relative flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold shadow-lg transition-all duration-200 ${
                hasCompletedTopics && !isApproving
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-xl hover:scale-105'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isApproving ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Approving...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Approve All
                </>
              )}
            </button>

            {/* Download All Button */}
            <button
              onClick={handleDownloadAll}
              disabled={isExporting || !hasCompletedTopics}
              className={`group relative flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold shadow-lg transition-all duration-200 ${
                hasCompletedTopics && !isExporting
                  ? 'bg-gradient-to-r from-sunset-orange to-orange-600 text-white hover:shadow-xl hover:scale-105'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isExporting ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Exporting...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download All (ZIP)
                </>
              )}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {currentJob && isGenerating && (
          <div className="mt-4 rounded-xl bg-slate-50 p-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">
                Generating articles... ({currentJob.completedItems + currentJob.failedItems}/{currentJob.totalItems})
              </span>
              <span className="font-bold text-deep-indigo">{currentJob.progress}%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-deep-indigo to-blue-600 transition-all duration-500"
                style={{ width: `${currentJob.progress}%` }}
              />
            </div>
            {currentJob.failedItems > 0 && (
              <p className="mt-2 text-sm text-orange-600">
                {currentJob.failedItems} article(s) failed - you can retry them individually later
              </p>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        {/* Job Complete Message */}
        {currentJob && !isGenerating && currentJob.status !== 'pending' && (
          <div className={`mt-4 rounded-xl p-4 ${
            currentJob.status === 'completed'
              ? 'border border-green-200 bg-green-50'
              : currentJob.status === 'completed_with_errors'
              ? 'border border-orange-200 bg-orange-50'
              : 'border border-red-200 bg-red-50'
          }`}>
            <p className={`text-sm font-medium ${
              currentJob.status === 'completed'
                ? 'text-green-800'
                : currentJob.status === 'completed_with_errors'
                ? 'text-orange-800'
                : 'text-red-800'
            }`}>
              {currentJob.status === 'completed'
                ? `Successfully generated ${currentJob.completedItems} articles!`
                : currentJob.status === 'completed_with_errors'
                ? `Generated ${currentJob.completedItems} articles with ${currentJob.failedItems} failures`
                : `Generation failed: ${currentJob.error || 'Unknown error'}`}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
