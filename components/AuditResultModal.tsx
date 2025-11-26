'use client';

import { useState } from 'react';
import AISOMascot from '@/components/AISOMascot';
import type { AuditResult } from '@/lib/aiso-audit-engine';

interface AuditResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  audit: AuditResult | null;
  isLoading?: boolean;
  loadingMessage?: string;
  onDownloadPDF?: () => void;
  onViewFullReport?: () => void;
}

export default function AuditResultModal({
  isOpen,
  onClose,
  audit,
  isLoading = false,
  loadingMessage = 'Running AISO Audit...',
  onDownloadPDF,
  onViewFullReport,
}: AuditResultModalProps) {
  if (!isOpen) return null;

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'bg-green-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreTextColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Needs Work';
  };

  const handleDownload = async () => {
    if (audit?.pdfUrl) {
      window.open(audit.pdfUrl, '_blank');
    }
    onDownloadPDF?.();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl transform transition-all">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 transition-colors z-10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Loading State */}
          {isLoading && (
            <div className="p-12 text-center">
              <AISOMascot state="running" size="xl" message={loadingMessage} />
              <p className="mt-4 text-sm text-slate-500">This may take 15-30 seconds...</p>
            </div>
          )}

          {/* Results State */}
          {!isLoading && audit && (
            <div className="p-6">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-3 mb-2">
                  <AISOMascot state="success" size="sm" showMessage={false} />
                  <h2 className="text-2xl font-bold text-slate-900">Audit Complete!</h2>
                </div>
                <p className="text-slate-600">{audit.domain}</p>
                {audit.pageTitle && (
                  <p className="text-sm text-slate-500 truncate max-w-md mx-auto">{audit.pageTitle}</p>
                )}
              </div>

              {/* Score Cards */}
              <div className="grid grid-cols-4 gap-3 mb-6">
                {[
                  { label: 'AISO', score: audit.aisoScore, tooltip: 'Overall AI Search Optimization' },
                  { label: 'WCAG', score: audit.accessibilityScore, tooltip: 'Accessibility Score' },
                  { label: 'AEO', score: audit.aeoScore, tooltip: 'Answer Engine Optimization' },
                  { label: 'SEO', score: audit.seoScore, tooltip: 'Search Engine Optimization' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="relative group"
                    title={item.tooltip}
                  >
                    <div className={`${getScoreColor(item.score)} rounded-xl p-4 text-center text-white`}>
                      <div className="text-3xl font-black">{item.score}</div>
                      <div className="text-xs font-semibold opacity-90">{item.label}</div>
                    </div>
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 translate-y-full opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                      {item.tooltip}
                    </div>
                  </div>
                ))}
              </div>

              {/* Issues Summary */}
              {audit.totalViolations > 0 && (
                <div className="bg-slate-50 rounded-xl p-4 mb-6">
                  <h3 className="font-bold text-slate-900 mb-3">Accessibility Issues Found</h3>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="bg-red-100 rounded-lg p-2">
                      <div className="text-2xl font-bold text-red-600">{audit.criticalCount}</div>
                      <div className="text-xs text-red-700">Critical</div>
                    </div>
                    <div className="bg-orange-100 rounded-lg p-2">
                      <div className="text-2xl font-bold text-orange-600">{audit.seriousCount}</div>
                      <div className="text-xs text-orange-700">Serious</div>
                    </div>
                    <div className="bg-blue-100 rounded-lg p-2">
                      <div className="text-2xl font-bold text-blue-600">{audit.moderateCount}</div>
                      <div className="text-xs text-blue-700">Moderate</div>
                    </div>
                    <div className="bg-slate-200 rounded-lg p-2">
                      <div className="text-2xl font-bold text-slate-600">{audit.minorCount}</div>
                      <div className="text-xs text-slate-700">Minor</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Top Issues */}
              {(() => {
                // Safely parse violations - might be string, array, or undefined
                let violationsArray: any[] = [];
                if (audit.violations) {
                  if (Array.isArray(audit.violations)) {
                    violationsArray = audit.violations;
                  } else if (typeof audit.violations === 'string') {
                    try {
                      violationsArray = JSON.parse(audit.violations);
                    } catch { /* ignore parse errors */ }
                  }
                }
                return violationsArray.length > 0 ? (
                <div className="mb-6">
                  <h3 className="font-bold text-slate-900 mb-3">Top Issues to Fix</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {violationsArray.slice(0, 5).map((v: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 p-2 bg-slate-50 rounded-lg text-sm"
                      >
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          v.impact === 'critical' ? 'bg-red-100 text-red-700' :
                          v.impact === 'serious' ? 'bg-orange-100 text-orange-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {v.impact?.toUpperCase() || 'ISSUE'}
                        </span>
                        <span className="text-slate-700 flex-1">
                          {v.description || v.help || v.id}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                ) : null;
              })()}

              {/* Saved to Vault */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-800 font-medium">Saved to Vault</span>
              </div>

              {/* Existing Audit Notice */}
              {audit.isExisting && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-blue-800 text-sm">
                    This is a recent audit from {audit.createdAt.toLocaleDateString()}
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleDownload}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download PDF
                </button>
                <button
                  onClick={() => {
                    onViewFullReport?.();
                    onClose();
                  }}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  View Full Report
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Export types for use elsewhere
export type { AuditResultModalProps };
