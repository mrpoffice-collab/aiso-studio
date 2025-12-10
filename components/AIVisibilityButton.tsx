'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Eye, X, CheckCircle, XCircle, Loader2 } from 'lucide-react';

// Admin emails - must match server-side
const ADMIN_EMAILS = ['mrpoffice@gmail.com', 'kim@aliidesign.com'];

interface AIVisibilityButtonProps {
  url: string;
  keywords?: string[];
  businessName?: string;
  industry?: string;
  location?: string;
  variant?: 'button' | 'icon';
  className?: string;
}

interface CheckResult {
  query: string;
  wasCited: boolean;
  citationType: string;
  citationPosition: number | null;
  responseSnippet: string;
}

interface QuickCheckResult {
  url: string;
  domain: string;
  results: CheckResult[];
  score: {
    score: number;
    totalChecks: number;
    totalCitations: number;
    citationRate: number;
    avgPosition: number | null;
  };
}

export default function AIVisibilityButton({
  url,
  keywords = [],
  businessName,
  industry,
  location,
  variant = 'button',
  className = '',
}: AIVisibilityButtonProps) {
  const { user, isLoaded } = useUser();
  const [showModal, setShowModal] = useState(false);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<QuickCheckResult | null>(null);
  const [error, setError] = useState('');

  // Custom keywords input for when none provided
  const [customKeywords, setCustomKeywords] = useState('');

  // Check if user is admin
  const isAdmin = isLoaded && user?.primaryEmailAddress?.emailAddress &&
    ADMIN_EMAILS.includes(user.primaryEmailAddress.emailAddress);

  // Don't render anything for non-admins
  if (!isAdmin) return null;

  const runCheck = async () => {
    const keywordsToUse = keywords.length > 0
      ? keywords
      : customKeywords.split(',').map(k => k.trim()).filter(Boolean);

    if (keywordsToUse.length === 0) {
      setError('Enter at least one keyword');
      return;
    }

    setChecking(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/admin/ai-visibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'quick-check',
          url,
          keywords: keywordsToUse,
          businessName,
          industry,
          location,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        const errData = await res.json();
        setError(errData.error || 'Check failed');
      }
    } catch (err) {
      setError('Failed to run check');
    } finally {
      setChecking(false);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      {variant === 'icon' ? (
        <button
          onClick={() => setShowModal(true)}
          className={`p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors ${className}`}
          title="Check AI Visibility (Admin)"
        >
          <Eye className="w-4 h-4" />
        </button>
      ) : (
        <button
          onClick={() => setShowModal(true)}
          className={`px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 flex items-center gap-1.5 ${className}`}
          title="Check AI Visibility (Admin)"
        >
          <Eye className="w-4 h-4" />
          AI Visibility
        </button>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-purple-600" />
                  AI Visibility Check
                </h3>
                <p className="text-sm text-purple-600 font-medium">Admin Only</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              {/* URL being checked */}
              <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">Checking URL:</p>
                <p className="font-medium text-slate-900 break-all">{url}</p>
              </div>

              {/* Keywords input if none provided */}
              {keywords.length === 0 && !result && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Keywords to check (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={customKeywords}
                    onChange={(e) => setCustomKeywords(e.target.value)}
                    placeholder="seo agency, digital marketing, web design"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              )}

              {/* Pre-filled keywords display */}
              {keywords.length > 0 && !result && (
                <div className="mb-4">
                  <p className="text-sm text-slate-600 mb-1">Keywords:</p>
                  <div className="flex flex-wrap gap-1">
                    {keywords.map((kw, i) => (
                      <span key={i} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Run Check Button */}
              {!result && (
                <button
                  onClick={runCheck}
                  disabled={checking}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {checking ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Checking Perplexity...
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      Run AI Visibility Check
                    </>
                  )}
                </button>
              )}

              {/* Results */}
              {result && (
                <div className="space-y-4">
                  {/* Score Summary */}
                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-purple-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-black text-purple-600">
                        {result.score.score}
                      </div>
                      <div className="text-xs text-slate-600">Score</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-black text-slate-900">
                        {result.score.totalCitations}/{result.score.totalChecks}
                      </div>
                      <div className="text-xs text-slate-600">Citations</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-black text-slate-900">
                        {result.score.citationRate}%
                      </div>
                      <div className="text-xs text-slate-600">Rate</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-black text-slate-900">
                        {result.score.avgPosition || '-'}
                      </div>
                      <div className="text-xs text-slate-600">Avg Pos</div>
                    </div>
                  </div>

                  {/* Individual Results */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700">Query Results:</p>
                    {result.results.map((r, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-lg border ${
                          r.wasCited
                            ? 'bg-green-50 border-green-200'
                            : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {r.wasCited ? (
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                          )}
                          <span className="text-sm font-medium text-slate-900">
                            "{r.query}"
                          </span>
                        </div>
                        {r.wasCited && r.citationPosition && (
                          <p className="text-xs text-slate-600 ml-6 mt-1">
                            Position #{r.citationPosition} - {r.citationType.replace('_', ' ')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Run Again */}
                  <button
                    onClick={() => setResult(null)}
                    className="w-full px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200"
                  >
                    Check Different Keywords
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
