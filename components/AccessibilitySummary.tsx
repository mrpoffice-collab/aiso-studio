'use client';

import { useState } from 'react';

interface WcagBreakdown {
  perceivable: { violations: number; score: number };
  operable: { violations: number; score: number };
  understandable: { violations: number; score: number };
  robust: { violations: number; score: number };
}

interface AccessibilityViolation {
  id: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  description: string;
  help: string;
  helpUrl: string;
  wcagTags: string[];
  nodes: {
    html: string;
    target: string[];
    failureSummary: string;
  }[];
}

interface AccessibilitySummaryProps {
  score: number;
  criticalCount: number;
  seriousCount: number;
  moderateCount: number;
  minorCount: number;
  totalViolations: number;
  totalPasses: number;
  violations: AccessibilityViolation[];
  wcagBreakdown: WcagBreakdown;
  pageTitle?: string;
  onFixAll?: () => void;
  isFixing?: boolean;
  aiSuggestions?: any[];
}

export default function AccessibilitySummary({
  score,
  criticalCount,
  seriousCount,
  moderateCount,
  minorCount,
  totalViolations,
  totalPasses,
  violations,
  wcagBreakdown,
  pageTitle,
  onFixAll,
  isFixing,
  aiSuggestions,
}: AccessibilitySummaryProps) {
  const [expandedViolation, setExpandedViolation] = useState<string | null>(null);
  const [showAllViolations, setShowAllViolations] = useState(false);

  // Ensure violations is always an array (handle string JSON from DB)
  const parseIfString = (val: any) => {
    if (typeof val === 'string') {
      try { return JSON.parse(val); } catch { return null; }
    }
    return val;
  };
  const parsedViolations = parseIfString(violations);
  const parsedWcagBreakdown = parseIfString(wcagBreakdown);
  const parsedAiSuggestions = parseIfString(aiSuggestions);

  const safeViolations = Array.isArray(parsedViolations) ? parsedViolations : [];
  const safeWcagBreakdown = parsedWcagBreakdown && typeof parsedWcagBreakdown === 'object' ? parsedWcagBreakdown : {
    perceivable: { violations: 0, score: 100 },
    operable: { violations: 0, score: 100 },
    understandable: { violations: 0, score: 100 },
    robust: { violations: 0, score: 100 },
  };
  const safeAiSuggestions = Array.isArray(parsedAiSuggestions) ? parsedAiSuggestions : [];

  const getScoreColor = (s: number) => {
    if (s >= 90) return 'text-green-700 bg-green-50 border-green-300';
    if (s >= 70) return 'text-blue-700 bg-blue-50 border-blue-300';
    if (s >= 50) return 'text-yellow-700 bg-yellow-50 border-yellow-300';
    return 'text-red-700 bg-red-50 border-red-300';
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'serious': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'minor': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const displayedViolations = showAllViolations ? safeViolations : safeViolations.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Main Score Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Accessibility Score (WCAG)
            </h3>
            {pageTitle && (
              <p className="text-sm text-slate-600 mt-1">{pageTitle}</p>
            )}
          </div>
          <div className={`px-6 py-4 rounded-xl border-2 ${getScoreColor(score)}`}>
            <div className="text-4xl font-black">{score}</div>
            <div className="text-xs font-bold uppercase tracking-wider opacity-70">/100</div>
          </div>
        </div>

        {/* Violation Counts */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-center">
            <div className="text-2xl font-black text-red-700">{criticalCount}</div>
            <div className="text-xs font-bold text-red-600 uppercase">Critical</div>
          </div>
          <div className="p-3 rounded-lg bg-orange-50 border border-orange-200 text-center">
            <div className="text-2xl font-black text-orange-700">{seriousCount}</div>
            <div className="text-xs font-bold text-orange-600 uppercase">Serious</div>
          </div>
          <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-center">
            <div className="text-2xl font-black text-yellow-700">{moderateCount}</div>
            <div className="text-xs font-bold text-yellow-600 uppercase">Moderate</div>
          </div>
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-center">
            <div className="text-2xl font-black text-blue-700">{minorCount}</div>
            <div className="text-xs font-bold text-blue-600 uppercase">Minor</div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-sm text-slate-600">Total Issues:</span>
              <span className="ml-2 font-bold text-slate-900">{totalViolations}</span>
            </div>
            <div>
              <span className="text-sm text-slate-600">Rules Passed:</span>
              <span className="ml-2 font-bold text-green-700">{totalPasses}</span>
            </div>
          </div>
          {onFixAll && totalViolations > 0 && (
            <button
              onClick={onFixAll}
              disabled={isFixing}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold text-sm hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isFixing ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating Fixes...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Fix All with AI
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* WCAG Principles Breakdown */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        <h4 className="text-lg font-bold text-slate-900 mb-4">WCAG 2.1 Principles (POUR)</h4>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(safeWcagBreakdown).map(([principle, data]: [string, { violations: number; score: number }]) => (
            <div key={principle} className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-900 capitalize">{principle}</span>
                <span className={`px-2 py-1 rounded text-xs font-bold ${getScoreColor(data.score)}`}>
                  {data.score}/100
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    data.score >= 90 ? 'bg-green-500' :
                    data.score >= 70 ? 'bg-blue-500' :
                    data.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${data.score}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-600 mt-2">
                {data.violations} violation{data.violations !== 1 ? 's' : ''}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Violations List */}
      {safeViolations.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
          <h4 className="text-lg font-bold text-slate-900 mb-4">
            Accessibility Issues ({totalViolations})
          </h4>
          <div className="space-y-3">
            {displayedViolations.map((v) => (
              <div
                key={v.id}
                className={`p-4 rounded-lg border ${getImpactColor(v.impact)} cursor-pointer transition-all hover:shadow-md`}
                onClick={() => setExpandedViolation(expandedViolation === v.id ? null : v.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${getImpactColor(v.impact)}`}>
                        {v.impact}
                      </span>
                      <span className="text-xs text-slate-600 font-mono">{v.id}</span>
                    </div>
                    <p className="font-bold text-slate-900">{v.help}</p>
                    <p className="text-sm text-slate-700 mt-1">{v.description}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <span className="text-xs text-slate-600">{v.nodes.length} element{v.nodes.length !== 1 ? 's' : ''}</span>
                    <svg
                      className={`w-5 h-5 text-slate-400 transition-transform ${expandedViolation === v.id ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {expandedViolation === v.id && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="space-y-3">
                      {v.nodes.slice(0, 3).map((node, idx) => (
                        <div key={idx} className="p-3 rounded bg-white border border-slate-200">
                          <p className="text-xs font-mono text-slate-600 mb-2 break-all">
                            {node.target.join(' > ')}
                          </p>
                          <pre className="text-xs bg-slate-100 p-2 rounded overflow-x-auto mb-2">
                            {node.html}
                          </pre>
                          <p className="text-sm text-red-700">{node.failureSummary}</p>
                        </div>
                      ))}
                      {v.nodes.length > 3 && (
                        <p className="text-xs text-slate-600">
                          + {v.nodes.length - 3} more affected elements
                        </p>
                      )}
                    </div>
                    <a
                      href={v.helpUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-3 text-sm text-purple-600 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Learn how to fix this
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>

          {safeViolations.length > 5 && (
            <button
              onClick={() => setShowAllViolations(!showAllViolations)}
              className="mt-4 w-full py-2 text-sm font-bold text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            >
              {showAllViolations ? 'Show Less' : `Show All ${safeViolations.length} Issues`}
            </button>
          )}
        </div>
      )}

      {/* AI Suggestions */}
      {safeAiSuggestions.length > 0 && (
        <div className="rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-6 shadow-lg">
          <h4 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI-Generated Fixes ({safeAiSuggestions.length})
          </h4>
          <div className="space-y-4">
            {safeAiSuggestions.map((suggestion, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-white border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-xs font-bold">
                    Priority {suggestion.priority}
                  </span>
                  <span className="text-xs font-mono text-slate-600">{suggestion.violationId}</span>
                </div>
                <p className="text-sm text-slate-700 mb-3">{suggestion.explanation}</p>
                {suggestion.currentCode && (
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs font-bold text-red-600">Before:</span>
                      <pre className="mt-1 text-xs bg-red-50 p-2 rounded overflow-x-auto border border-red-200">
                        {suggestion.currentCode}
                      </pre>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-green-600">After:</span>
                      <pre className="mt-1 text-xs bg-green-50 p-2 rounded overflow-x-auto border border-green-200">
                        {suggestion.fixedCode}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Issues Message */}
      {totalViolations === 0 && (
        <div className="rounded-2xl border-2 border-green-200 bg-green-50 p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h4 className="text-xl font-bold text-green-800 mb-2">Excellent Accessibility!</h4>
          <p className="text-green-700">
            This page passes all WCAG 2.1 accessibility checks. Great job!
          </p>
        </div>
      )}
    </div>
  );
}
