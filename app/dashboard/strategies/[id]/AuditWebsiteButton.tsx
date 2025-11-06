'use client';

import { useState } from 'react';

interface AuditWebsiteButtonProps {
  strategyId: string;
  websiteUrl: string | null;
  onAuditComplete?: () => void;
}

export default function AuditWebsiteButton({
  strategyId,
  websiteUrl,
  onAuditComplete,
}: AuditWebsiteButtonProps) {
  const [isAuditing, setIsAuditing] = useState(false);
  const [error, setError] = useState('');

  if (!websiteUrl) {
    return null; // Don't show button if no website URL
  }

  const handleAudit = async () => {
    if (!confirm(`Audit website?\n\n${websiteUrl}\n\nThis will crawl the site and analyze all pages. This may take a few minutes.\n\nContinue?`)) {
      return;
    }

    setIsAuditing(true);
    setError('');

    try {
      const response = await fetch(`/api/strategies/${strategyId}/audit`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to audit website');
      }

      alert(`✅ Audit Complete!\n\n📄 Pages Found: ${data.audit.pagesFound}\n🖼️  Images Found: ${data.audit.imagesFound}\n📊 Avg AISO Score: ${data.audit.avgAisoScore}/100\n\nRefreshing page...`);

      if (onAuditComplete) {
        onAuditComplete();
      }

      // Refresh the page to show audit results
      window.location.reload();
    } catch (err: any) {
      setError(err.message);
      alert(`❌ Audit Failed: ${err.message}`);
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <button
      onClick={handleAudit}
      disabled={isAuditing}
      className="group relative px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-xl shadow-blue-300/50 hover:shadow-blue-400/60 hover:scale-105 transition-all duration-200 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
    >
      <span className="relative z-10 flex items-center gap-2">
        {isAuditing ? (
          <>
            <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Auditing Website...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Audit Website
          </>
        )}
      </span>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-r from-indigo-700 to-blue-700"></div>
    </button>
  );
}
