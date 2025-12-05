'use client';

import { useState } from 'react';
import Link from 'next/link';

interface NextStepsPanelProps {
  url: string;
  domain: string;
  aisoScore: number;
  accessibilityScore?: number;
  hasExistingClient?: boolean;
  clientId?: number;
  onAddToPipeline?: () => void;
}

export default function NextStepsPanel({
  url,
  domain,
  aisoScore,
  accessibilityScore,
  hasExistingClient,
  clientId,
  onAddToPipeline,
}: NextStepsPanelProps) {
  const [isAddingLead, setIsAddingLead] = useState(false);
  const [leadAdded, setLeadAdded] = useState(false);
  const [newLeadId, setNewLeadId] = useState<number | null>(null);

  const scoreCategory = aisoScore >= 80 ? 'good' : aisoScore >= 60 ? 'fair' : 'poor';

  const handleAddToPipeline = async () => {
    setIsAddingLead(true);
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_name: domain.replace('www.', '').split('.')[0].charAt(0).toUpperCase() +
                         domain.replace('www.', '').split('.')[0].slice(1),
          domain: domain,
          source: 'audit',
          overall_score: aisoScore,
          notes: `Added from AISO audit. Score: ${aisoScore}/100`,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setLeadAdded(true);
        setNewLeadId(data.lead?.id);
        onAddToPipeline?.();
      }
    } catch (err) {
      console.error('Failed to add lead:', err);
    } finally {
      setIsAddingLead(false);
    }
  };

  return (
    <div className="rounded-2xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-900">What's Next?</h3>
          <p className="text-sm text-slate-600">Turn this audit into business results</p>
        </div>
      </div>

      {/* Score-based recommendations */}
      <div className="mb-6 p-4 rounded-xl bg-white/70 border border-orange-100">
        {scoreCategory === 'poor' && (
          <div className="flex items-start gap-3">
            <span className="text-2xl">🎯</span>
            <div>
              <p className="font-bold text-slate-900">High-Value Sales Opportunity</p>
              <p className="text-sm text-slate-700 mt-1">
                A score of <span className="font-bold text-red-600">{aisoScore}</span> means this site is struggling with AI visibility.
                This is a <span className="font-bold text-green-600">perfect prospect</span> for your services.
              </p>
            </div>
          </div>
        )}
        {scoreCategory === 'fair' && (
          <div className="flex items-start gap-3">
            <span className="text-2xl">📈</span>
            <div>
              <p className="font-bold text-slate-900">Growth Opportunity</p>
              <p className="text-sm text-slate-700 mt-1">
                A score of <span className="font-bold text-yellow-600">{aisoScore}</span> shows room for improvement.
                Position your agency as the partner to take them from good to great.
              </p>
            </div>
          </div>
        )}
        {scoreCategory === 'good' && (
          <div className="flex items-start gap-3">
            <span className="text-2xl">✨</span>
            <div>
              <p className="font-bold text-slate-900">Maintenance & Optimization</p>
              <p className="text-sm text-slate-700 mt-1">
                A score of <span className="font-bold text-green-600">{aisoScore}</span> is solid.
                Offer ongoing optimization to maintain their competitive edge.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="space-y-3">
        {/* Primary Actions */}
        <div className="grid grid-cols-2 gap-3">
          {!hasExistingClient && !leadAdded && (
            <button
              onClick={handleAddToPipeline}
              disabled={isAddingLead}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50"
            >
              {isAddingLead ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Adding...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add to Pipeline
                </>
              )}
            </button>
          )}

          {leadAdded && newLeadId && (
            <Link
              href={`/dashboard/sales?lead=${newLeadId}`}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-500 text-white font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              View in Pipeline
            </Link>
          )}

          {hasExistingClient && clientId && (
            <Link
              href={`/dashboard/clients?client=${clientId}`}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-500 text-white font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              View Client Profile
            </Link>
          )}

          <Link
            href={`/dashboard/audit/compare?target=${encodeURIComponent(url)}`}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Compare vs Competitors
          </Link>
        </div>

        {/* Secondary Actions */}
        <div className="grid grid-cols-3 gap-3">
          {(leadAdded || hasExistingClient) && (
            <Link
              href={`/dashboard/sales?lead=${newLeadId || clientId}`}
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white border-2 border-slate-200 text-slate-700 font-semibold text-sm hover:border-orange-300 hover:bg-orange-50 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Generate Proposal
            </Link>
          )}

          <Link
            href={`/dashboard/strategies/new?domain=${domain}`}
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white border-2 border-slate-200 text-slate-700 font-semibold text-sm hover:border-purple-300 hover:bg-purple-50 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Create Strategy
          </Link>

          <Link
            href={`/dashboard/audit/batch?domain=${domain}`}
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white border-2 border-slate-200 text-slate-700 font-semibold text-sm hover:border-blue-300 hover:bg-blue-50 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Batch Audit Site
          </Link>
        </div>

        {/* Tip based on score */}
        <div className="mt-4 p-3 rounded-lg bg-white/50 border border-orange-100">
          <p className="text-xs text-slate-600">
            <span className="font-bold text-orange-600">Pro tip:</span>{' '}
            {scoreCategory === 'poor' && "Lead with the competitor comparison - show them how they stack up against rivals to create urgency."}
            {scoreCategory === 'fair' && "Create a strategy first to show them a clear roadmap, then generate the proposal."}
            {scoreCategory === 'good' && "Focus on maintaining their edge - batch audit their site to find any weak spots."}
          </p>
        </div>
      </div>
    </div>
  );
}
