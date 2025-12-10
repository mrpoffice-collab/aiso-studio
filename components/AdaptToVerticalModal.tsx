'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Strategy {
  id: string;
  client_name: string;
  industry: string;
}

interface AdaptToVerticalModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  title?: string;
  originalUrl?: string;
  auditId?: number;
}

const COMMON_INDUSTRIES = [
  'Healthcare / Medical',
  'Legal / Law Firm',
  'Dental',
  'Veterinary',
  'Real Estate',
  'Home Services (HVAC, Plumbing, Electrical)',
  'Automotive',
  'Financial Services',
  'Insurance',
  'Technology / SaaS',
  'E-commerce / Retail',
  'Restaurant / Food Service',
  'Fitness / Wellness',
  'Education',
  'Manufacturing',
  'Construction',
  'Professional Services',
  'Non-Profit',
];

export default function AdaptToVerticalModal({
  isOpen,
  onClose,
  content,
  title,
  originalUrl,
  auditId,
}: AdaptToVerticalModalProps) {
  const router = useRouter();
  const [targetIndustry, setTargetIndustry] = useState('');
  const [customIndustry, setCustomIndustry] = useState('');
  const [targetKeyword, setTargetKeyword] = useState('');
  const [targetStrategy, setTargetStrategy] = useState<string>('');
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdapting, setIsAdapting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ postId: number; strategyId: string } | null>(null);

  // Load user's strategies
  useEffect(() => {
    if (isOpen) {
      fetchStrategies();
    }
  }, [isOpen]);

  const fetchStrategies = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/strategies');
      if (response.ok) {
        const data = await response.json();
        setStrategies(data.strategies || []);
      }
    } catch (err) {
      console.error('Failed to load strategies:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdapt = async () => {
    const industry = targetIndustry === 'custom' ? customIndustry : targetIndustry;

    if (!industry) {
      setError('Please select a target industry');
      return;
    }

    if (!targetKeyword.trim()) {
      setError('Please enter a target keyword');
      return;
    }

    setIsAdapting(true);
    setError('');

    try {
      const response = await fetch('/api/audit/adapt-vertical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalContent: content,
          originalTitle: title,
          originalUrl,
          auditId,
          targetIndustry: industry,
          targetKeyword: targetKeyword.trim(),
          strategyId: targetStrategy || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.upgrade_url) {
          throw new Error(`${data.message || data.error} - Upgrade to Agency to access this feature.`);
        }
        throw new Error(data.message || data.error || 'Adaptation failed');
      }

      setSuccess({
        postId: data.post.id,
        strategyId: data.strategyId,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsAdapting(false);
    }
  };

  const handleViewPost = () => {
    if (success) {
      router.push(`/dashboard/strategies/${success.strategyId}/posts/${success.postId}`);
    }
  };

  const handleReset = () => {
    setSuccess(null);
    setTargetIndustry('');
    setCustomIndustry('');
    setTargetKeyword('');
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 max-w-lg w-full rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-deep-indigo to-purple-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Adapt to Vertical</h2>
                <p className="text-sm text-white/80">Rewrite content for a different industry</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            // Success State
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Content Adapted!</h3>
              <p className="text-slate-600 mb-6">
                Your content has been successfully adapted for the new vertical with AISO optimization.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-300 font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Adapt Another
                </button>
                <button
                  onClick={handleViewPost}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-deep-indigo to-purple-600 text-white font-bold hover:shadow-lg transition-all"
                >
                  View New Post
                </button>
              </div>
              <button
                onClick={onClose}
                className="mt-4 text-sm text-slate-500 hover:text-slate-700"
              >
                Back to Audit Results
              </button>
            </div>
          ) : (
            // Form State
            <div className="space-y-5">
              {/* Original Content Preview */}
              {title && (
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Adapting:</p>
                  <p className="text-sm font-semibold text-slate-900 truncate">{title}</p>
                </div>
              )}

              {/* Target Industry */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Target Industry *
                </label>
                <select
                  value={targetIndustry}
                  onChange={(e) => setTargetIndustry(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-slate-900"
                >
                  <option value="">Select an industry...</option>
                  {COMMON_INDUSTRIES.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                  <option value="custom">Other (Custom)</option>
                </select>
              </div>

              {/* Custom Industry Input */}
              {targetIndustry === 'custom' && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Custom Industry *
                  </label>
                  <input
                    type="text"
                    value={customIndustry}
                    onChange={(e) => setCustomIndustry(e.target.value)}
                    placeholder="e.g., Aerospace Manufacturing"
                    className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-slate-900"
                  />
                </div>
              )}

              {/* Target Keyword */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Target Keyword *
                </label>
                <input
                  type="text"
                  value={targetKeyword}
                  onChange={(e) => setTargetKeyword(e.target.value)}
                  placeholder="e.g., personal injury lawyer SEO"
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-slate-900"
                />
                <p className="mt-1 text-xs text-slate-500">
                  The primary keyword to optimize the adapted content for
                </p>
              </div>

              {/* Target Strategy (Optional) */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Save to Strategy (Optional)
                </label>
                <select
                  value={targetStrategy}
                  onChange={(e) => setTargetStrategy(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-slate-900"
                  disabled={isLoading}
                >
                  <option value="">Create standalone post</option>
                  {strategies.map((strategy) => (
                    <option key={strategy.id} value={strategy.id}>
                      {strategy.client_name} ({strategy.industry})
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-slate-500">
                  Link the adapted content to an existing client strategy
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-300 font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdapt}
                  disabled={isAdapting}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-deep-indigo to-purple-600 text-white font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isAdapting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Adapting...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Adapt Content
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Agency Badge */}
        <div className="px-6 py-3 bg-gradient-to-r from-orange-50 to-amber-50 border-t border-orange-200">
          <div className="flex items-center gap-2 text-xs text-orange-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <span className="font-bold">Agency Feature</span>
            <span>- Adapt content across verticals with AISO optimization</span>
          </div>
        </div>
      </div>
    </div>
  );
}
