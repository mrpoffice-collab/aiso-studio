'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ResetStrategyButton({ strategyId, clientName }: { strategyId: string; clientName: string }) {
  const [isResetting, setIsResetting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleReset = async () => {
    setIsResetting(true);

    try {
      const response = await fetch(`/api/strategies/${strategyId}/reset`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset strategy');
      }

      // Show success message
      alert(
        `✅ Strategy Reset Complete!\n\n` +
        `• Deleted ${data.stats.deletedTopics} unused topics\n` +
        `• Kept ${data.stats.deletedPosts === 0 ? 'all' : '0'} blog posts (no posts were deleted)\n\n` +
        `You can now generate fresh topics for this strategy.`
      );

      // Refresh the page to show updated state
      router.refresh();
      setShowConfirm(false);
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setIsResetting(false);
    }
  };

  if (!showConfirm) {
    return (
      <button
        onClick={() => setShowConfirm(true)}
        className="group flex items-center gap-2 rounded-xl border-2 border-red-500 bg-white px-6 py-3 font-bold text-red-600 hover:bg-red-500 hover:text-white transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Reset Strategy
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 border-2 border-red-200">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-red-100">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h3 className="text-2xl font-black text-slate-900 mb-3 text-center">
          Reset Strategy?
        </h3>

        <p className="text-slate-600 mb-6 text-center leading-relaxed">
          This will delete unused topics for <span className="font-bold text-deep-indigo">{clientName}</span>, allowing you to generate new ones.
        </p>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-green-800">
              <p className="font-bold mb-1">✅ Your posts are SAFE:</p>
              <ul className="space-y-1">
                <li>• All generated blog posts will be kept</li>
                <li>• Topics with posts will be preserved</li>
                <li>• No content will be lost</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-amber-800">
              <p className="font-bold mb-1">What will be deleted:</p>
              <ul className="space-y-1">
                <li>• Only unused topics (topics without posts)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowConfirm(false)}
            disabled={isResetting}
            className="flex-1 px-6 py-3 rounded-xl border-2 border-slate-300 font-bold text-slate-700 hover:bg-slate-50 transition-all duration-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleReset}
            disabled={isResetting}
            className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-bold hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResetting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Resetting...
              </span>
            ) : (
              'Yes, Reset Strategy'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
