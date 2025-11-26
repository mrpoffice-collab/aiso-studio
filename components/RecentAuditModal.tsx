'use client';

import AISOMascot from '@/components/AISOMascot';
import type { AuditResult } from '@/lib/aiso-audit-engine';

interface RecentAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  audit: AuditResult;
  ageHours: number;
  onViewExisting: () => void;
  onRunNew: () => void;
}

export default function RecentAuditModal({
  isOpen,
  onClose,
  audit,
  ageHours,
  onViewExisting,
  onRunNew,
}: RecentAuditModalProps) {
  if (!isOpen) return null;

  const formatAge = (hours: number): string => {
    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    }
    if (hours < 24) {
      const h = Math.round(hours);
      return `${h} hour${h !== 1 ? 's' : ''} ago`;
    }
    const days = Math.round(hours / 24);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-blue-600 bg-blue-100';
    if (score >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
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
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl transform transition-all">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 transition-colors z-10"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="p-6">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center mb-3">
                <AISOMascot state="idle" size="md" showMessage={false} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">Recent Audit Found</h2>
              <p className="text-slate-600">{audit.domain}</p>
            </div>

            {/* Audit Info */}
            <div className="bg-slate-50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-600">Last audited</span>
                <span className="text-sm font-medium text-slate-900">{formatAge(ageHours)}</span>
              </div>

              {/* Score Preview */}
              <div className="grid grid-cols-3 gap-2">
                <div className={`rounded-lg p-2 text-center ${getScoreColor(audit.aisoScore)}`}>
                  <div className="text-lg font-bold">{audit.aisoScore}</div>
                  <div className="text-xs">AISO</div>
                </div>
                <div className={`rounded-lg p-2 text-center ${getScoreColor(audit.accessibilityScore)}`}>
                  <div className="text-lg font-bold">{audit.accessibilityScore}</div>
                  <div className="text-xs">WCAG</div>
                </div>
                <div className={`rounded-lg p-2 text-center ${getScoreColor(audit.seoScore)}`}>
                  <div className="text-lg font-bold">{audit.seoScore}</div>
                  <div className="text-xs">SEO</div>
                </div>
              </div>
            </div>

            {/* Info Text */}
            <p className="text-sm text-slate-500 text-center mb-6">
              Running a new audit will use credits. View the existing audit or run a fresh one?
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  onViewExisting();
                  onClose();
                }}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
              >
                View Existing
              </button>
              <button
                onClick={() => {
                  onRunNew();
                  onClose();
                }}
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all"
              >
                Run New
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
