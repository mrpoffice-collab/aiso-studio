'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface AuditResult {
  success: boolean;
  url: string;
  domain: string;
  title: string;
  metaDescription: string;
  aisoScore: number;
  scores: {
    seo: number;
    readability: number;
    engagement: number;
  };
  details: any;
  wordCount: number;
  contentLength: number;
  auditsUsed: number;
  auditsRemaining: number;
  totalFreeAudits: number;
  upgradePrompt: string;
}

export default function FreeAuditPage() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<AuditResult | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Fair';
    return 'Needs Improvement';
  };

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/audit/free', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          // Hit limit - show upgrade modal
          setShowUpgradeModal(true);
          setError(data.error);
        } else {
          setError(data.error || 'Failed to audit content');
        }
        return;
      }

      setResult(data);

      // Show upgrade modal if this was the last free audit
      if (data.auditsRemaining === 0) {
        setTimeout(() => setShowUpgradeModal(true), 2000);
      }

    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-sm sticky top-0 z-50">
        <div className="container mx-auto flex h-20 items-center justify-between px-6">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-sunset-orange to-orange-600 bg-clip-text text-transparent">
            AISO Studio
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/sign-in"
              className="text-sm font-semibold text-slate-600 hover:text-deep-indigo transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="rounded-lg bg-gradient-to-r from-sunset-orange to-orange-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-5xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold">
            Try Before You Buy
          </div>
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            Free AISO Content Audit
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-6">
            Get instant AI-powered insights on your blog posts. Check SEO, readability, and engagement scores in seconds.
          </p>
          <p className="text-sm text-slate-500">
            <span className="font-semibold text-sunset-orange">3 Free Audits</span> • No Credit Card Required • No Sign-Up Needed
          </p>
        </div>

        {/* Audit Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 mb-8">
          <form onSubmit={handleAudit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Enter Your Blog Post URL
              </label>
              <div className="flex gap-3">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://yourblog.com/article"
                  className="flex-1 rounded-lg border-2 border-slate-200 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-sunset-orange focus:outline-none focus:ring-2 focus:ring-sunset-orange/20 transition-all"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-lg bg-gradient-to-r from-sunset-orange to-orange-600 px-8 py-3 font-semibold text-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Analyzing...
                    </span>
                  ) : (
                    'Audit Content'
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {result && (
              <div className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-slate-600">
                    <span className="font-semibold text-sunset-orange">
                      {result.auditsUsed} / {result.totalFreeAudits}
                    </span>{' '}
                    free audits used
                  </p>
                  {result.auditsRemaining > 0 && (
                    <p className="text-sm text-green-600 font-semibold">
                      {result.auditsRemaining} remaining
                    </p>
                  )}
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sunset-orange to-orange-600 transition-all duration-500"
                    style={{ width: `${(result.auditsUsed / result.totalFreeAudits) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  {result.title || 'Audit Results'}
                </h2>
                <p className="text-sm text-slate-500 mb-6">{result.domain}</p>

                <div className="inline-flex flex-col items-center justify-center">
                  <div className="relative w-40 h-40 mb-4">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="#e2e8f0"
                        strokeWidth="12"
                        fill="none"
                      />
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="url(#gradient)"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${(result.aisoScore / 100) * 439.6} 439.6`}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#f97316" />
                          <stop offset="100%" stopColor="#ea580c" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-4xl font-bold ${getScoreColor(result.aisoScore)}`}>
                        {result.aisoScore}
                      </span>
                      <span className="text-sm text-slate-500 font-semibold">AISO Score</span>
                    </div>
                  </div>
                  <p className={`text-lg font-bold ${getScoreColor(result.aisoScore)}`}>
                    {getScoreLabel(result.aisoScore)}
                  </p>
                </div>
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* SEO Score */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900">SEO</h3>
                  <span className={`text-3xl font-bold ${getScoreColor(result.scores.seo)}`}>
                    {result.scores.seo}
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                    style={{ width: `${result.scores.seo}%` }}
                  />
                </div>
                <p className="text-sm text-slate-600 mt-2">
                  {getScoreLabel(result.scores.seo)}
                </p>
              </div>

              {/* Readability Score */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900">Readability</h3>
                  <span className={`text-3xl font-bold ${getScoreColor(result.scores.readability)}`}>
                    {result.scores.readability}
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
                    style={{ width: `${result.scores.readability}%` }}
                  />
                </div>
                <p className="text-sm text-slate-600 mt-2">
                  {getScoreLabel(result.scores.readability)}
                </p>
              </div>

              {/* Engagement Score */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900">Engagement</h3>
                  <span className={`text-3xl font-bold ${getScoreColor(result.scores.engagement)}`}>
                    {result.scores.engagement}
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500"
                    style={{ width: `${result.scores.engagement}%` }}
                  />
                </div>
                <p className="text-sm text-slate-600 mt-2">
                  {getScoreLabel(result.scores.engagement)}
                </p>
              </div>
            </div>

            {/* Upgrade CTA */}
            {result.auditsRemaining <= 1 && (
              <div className="bg-gradient-to-r from-sunset-orange to-orange-600 rounded-2xl shadow-xl p-8 text-white text-center">
                <h3 className="text-2xl font-bold mb-2">
                  {result.auditsRemaining === 0
                    ? "You've Used All Your Free Audits!"
                    : 'Only 1 Free Audit Left!'}
                </h3>
                <p className="text-lg mb-6 opacity-90">
                  Sign up now to unlock unlimited audits + AI-powered content rewriting
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/sign-up"
                    className="rounded-lg bg-white px-8 py-3 font-semibold text-sunset-orange shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                  >
                    Sign Up Free
                  </Link>
                  <Link
                    href="/sign-in"
                    className="rounded-lg border-2 border-white px-8 py-3 font-semibold text-white hover:bg-white/10 transition-all duration-200"
                  >
                    Already Have an Account?
                  </Link>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4">Content Stats</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Word Count</p>
                  <p className="text-xl font-bold text-slate-900">{result.wordCount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Characters</p>
                  <p className="text-xl font-bold text-slate-900">{result.contentLength.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Reading Time</p>
                  <p className="text-xl font-bold text-slate-900">{Math.ceil(result.wordCount / 200)} min</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Domain</p>
                  <p className="text-sm font-semibold text-slate-900 truncate">{result.domain}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features Section */}
        {!result && (
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="font-bold text-slate-900 mb-2">SEO Analysis</h3>
              <p className="text-sm text-slate-600">
                Get insights on headers, keywords, meta tags, and search optimization
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-3xl">📖</span>
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Readability Check</h3>
              <p className="text-sm text-slate-600">
                Analyze sentence structure, complexity, and Flesch reading score
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-3xl">✨</span>
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Engagement Score</h3>
              <p className="text-sm text-slate-600">
                Evaluate hooks, CTAs, formatting, and reader engagement
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative">
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <span className="text-2xl">×</span>
            </button>

            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-sunset-orange to-orange-600 flex items-center justify-center">
                <span className="text-4xl">🚀</span>
              </div>

              <h2 className="text-3xl font-bold text-slate-900 mb-3">
                Ready for More?
              </h2>
              <p className="text-lg text-slate-600 mb-6">
                Create a free account to unlock unlimited audits and powerful features
              </p>

              <div className="bg-slate-50 rounded-xl p-6 mb-6 text-left space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-green-600 text-xl">✓</span>
                  <span className="text-slate-700">Unlimited AISO content audits</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-green-600 text-xl">✓</span>
                  <span className="text-slate-700">AI-powered content rewriting</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-green-600 text-xl">✓</span>
                  <span className="text-slate-700">Batch audit multiple URLs</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-green-600 text-xl">✓</span>
                  <span className="text-slate-700">Save and compare reports</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-green-600 text-xl">✓</span>
                  <span className="text-slate-700">Full content strategy tools</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Link
                  href="/sign-up"
                  className="rounded-lg bg-gradient-to-r from-sunset-orange to-orange-600 px-8 py-4 font-bold text-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                >
                  Sign Up Free - No Credit Card Required
                </Link>
                <Link
                  href="/sign-in"
                  className="text-sm font-semibold text-slate-600 hover:text-sunset-orange transition-colors"
                >
                  Already have an account? Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
