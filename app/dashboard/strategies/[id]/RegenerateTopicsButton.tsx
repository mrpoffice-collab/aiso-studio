'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface RegenerateTopicsButtonProps {
  strategyId: string;
  clusters?: any[];
}

export default function RegenerateTopicsButton({ strategyId, clusters = [] }: RegenerateTopicsButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCluster, setSelectedCluster] = useState<string>('');
  const router = useRouter();

  const handleRegenerate = async () => {
    setIsGenerating(true);

    try {
      const response = await fetch(`/api/strategies/${strategyId}/regenerate-topics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cluster_id: selectedCluster || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to regenerate topics');
      }

      // Show success message with cost info
      alert(
        `✅ Topics Generated Successfully!\n\n` +
        `📝 Generated: ${data.topicsCount} blog topics\n` +
        `💰 Cost: $${data.cost}\n` +
        `🎯 Tokens Used: ${data.tokensUsed.toLocaleString()}\n\n` +
        `You can now start generating blog posts!`
      );

      // Close modal and refresh
      setIsOpen(false);
      setSelectedCluster('');
      router.refresh();
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // If no clusters, use simple button
  if (clusters.length === 0) {
    return (
      <button
        onClick={handleRegenerate}
        disabled={isGenerating}
        className="group relative px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold shadow-xl shadow-green-300/50 hover:shadow-green-400/60 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
      >
        <span className="relative z-10 flex items-center gap-2">
          {isGenerating ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating Topics...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Generate Topics
            </>
          )}
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
      </button>
    );
  }

  // With clusters, show modal for selection
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        disabled={isGenerating}
        className="group relative px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold shadow-xl shadow-green-300/50 hover:shadow-green-400/60 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
      >
        <span className="relative z-10 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Generate Topics
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="p-8">
          <h3 className="text-2xl font-black text-slate-900 mb-6">Generate Topics</h3>

          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-700 mb-3">
              Select Target Cluster (Optional)
            </label>
            <select
              value={selectedCluster}
              onChange={(e) => setSelectedCluster(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">No cluster (general topics)</option>
              {clusters.map((cluster) => (
                <option key={cluster.id} value={cluster.id}>
                  {cluster.name} → {cluster.primary_money_page_title || cluster.primary_money_page_url}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-2">
              {selectedCluster
                ? 'Topics will be linked to the cluster\'s target money page'
                : 'Topics will be generated without strategic links'}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              disabled={isGenerating}
              className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleRegenerate}
              disabled={isGenerating}
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
