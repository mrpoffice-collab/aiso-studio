'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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

type PersonaType = 'own_site' | 'client_site' | null;

function FreeAuditContent() {
  const searchParams = useSearchParams();
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<AuditResult | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Email capture state
  const [email, setEmail] = useState('');
  const [emailCaptured, setEmailCaptured] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [isCapturingEmail, setIsCapturingEmail] = useState(false);
  const [persona, setPersona] = useState<PersonaType>(null);

  // Pre-fill URL from query parameter
  useEffect(() => {
    const urlParam = searchParams.get('url');
    if (urlParam) {
      setUrl(urlParam);
    }
  }, [searchParams]);

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

  const handleEmailCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');

    if (!email.trim()) {
      setEmailError('Please enter your email');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setEmailError('Please enter a valid email');
      return;
    }

    if (!persona) {
      setEmailError('Please select who you are auditing for');
      return;
    }

    setIsCapturingEmail(true);

    try {
      const response = await fetch('/api/leads/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          persona,
          source: 'free_audit',
          domain: result?.domain,
          url: result?.url,
          aisoScore: result?.aisoScore,
        }),
      });

      if (response.ok) {
        setEmailCaptured(true);
      } else {
        const data = await response.json();
        setEmailError(data.error || 'Failed to save email');
      }
    } catch (err) {
      setEmailError('Failed to save email. Please try again.');
    } finally {
      setIsCapturingEmail(false);
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
            Free AISO Content Audit + AI Search Visibility Check
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-6">
            Get instant AI-powered insights on your blog posts. Check SEO, readability, engagement scores, and <strong>discover if your content is visible to ChatGPT & AI search engines</strong>.
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
              <div className="rounded-lg bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 p-6">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-3xl">⚠️</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-red-800 text-lg mb-2">Problem: AI Search Engines Can't Read This Page</h3>
                    <p className="text-slate-700 mb-3">
                      We scanned your page and <strong>couldn't extract the content</strong>. This means ChatGPT, Perplexity, Google AI Overviews, and other AI search tools can't read it either.
                    </p>
                    <p className="text-slate-700 mb-3">
                      <strong>Why this matters:</strong> Millions of people now use AI to find products, services, and answers. If AI can't read your content, you're invisible to this growing audience.
                    </p>
                    <div className="bg-white/60 rounded-lg p-3 mb-3">
                      <p className="text-sm font-semibold text-slate-800 mb-1">Common causes:</p>
                      <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
                        <li>JavaScript-rendered content (React, Vue, Angular)</li>
                        <li>Bot detection or CAPTCHA blocking crawlers</li>
                        <li>Content loaded dynamically after page load</li>
                      </ul>
                    </div>
                    <p className="text-slate-700">
                      <strong>The fix:</strong> AISO Studio analyzes your content and rewrites it to be AI-search friendly — so you show up when people ask AI for recommendations in your industry.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-red-200">
                  <Link
                    href="/sign-up"
                    className="flex-1 text-center rounded-lg bg-gradient-to-r from-sunset-orange to-orange-600 px-6 py-3 font-bold text-white shadow-md hover:shadow-lg transition-all hover:scale-105"
                  >
                    Fix This With a Free Trial
                  </Link>
                  <Link
                    href="/pricing"
                    className="flex-1 text-center rounded-lg border-2 border-orange-600 bg-white px-6 py-3 font-bold text-orange-600 hover:bg-orange-50 transition-all"
                  >
                    See How It Works
                  </Link>
                </div>
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
            {/* Overall Score - Always Visible */}
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

            {/* Email Capture Gate - Show if not captured yet */}
            {!emailCaptured && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 p-8">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <span className="text-3xl">🔓</span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    Unlock Your Full Report
                  </h3>
                  <p className="text-slate-600 max-w-md mx-auto">
                    Enter your email to see the detailed breakdown of your SEO, Readability, and Engagement scores - plus actionable recommendations.
                  </p>
                </div>

                <form onSubmit={handleEmailCapture} className="max-w-md mx-auto space-y-4">
                  {/* Persona Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Who is this audit for?
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPersona('own_site')}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          persona === 'own_site'
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="text-2xl mb-1">🏠</div>
                        <div className="font-semibold text-slate-900">My own site</div>
                        <div className="text-xs text-slate-500">I want to improve my content</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPersona('client_site')}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          persona === 'client_site'
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="text-2xl mb-1">🏢</div>
                        <div className="font-semibold text-slate-900">A client's site</div>
                        <div className="text-xs text-slate-500">I'm a marketer or agency</div>
                      </button>
                    </div>
                  </div>

                  {/* Email Input */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Your email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-lg border-2 border-slate-200 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                  </div>

                  {emailError && (
                    <p className="text-sm text-red-600 font-medium">{emailError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={isCapturingEmail}
                    className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] disabled:opacity-50"
                  >
                    {isCapturingEmail ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Unlocking...
                      </span>
                    ) : (
                      'Unlock Full Report'
                    )}
                  </button>

                  <p className="text-xs text-center text-slate-500">
                    We'll send you tips to improve your score. Unsubscribe anytime.
                  </p>
                </form>

                {/* Blurred Preview */}
                <div className="mt-8 relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/80 to-blue-50 z-10"></div>
                  <div className="grid md:grid-cols-3 gap-4 blur-sm opacity-50 pointer-events-none">
                    <div className="bg-white rounded-xl border border-slate-200 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-slate-900">SEO</span>
                        <span className="text-2xl font-bold text-slate-400">??</span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full"></div>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-slate-900">Readability</span>
                        <span className="text-2xl font-bold text-slate-400">??</span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full"></div>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-slate-900">Engagement</span>
                        <span className="text-2xl font-bold text-slate-400">??</span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Full Results - Show after email captured */}
            {emailCaptured && (
              <>
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

                {/* Persona-Specific CTA */}
                <div className={`rounded-2xl shadow-xl p-8 text-white text-center ${
                  persona === 'client_site'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600'
                    : 'bg-gradient-to-r from-sunset-orange to-orange-600'
                }`}>
                  {persona === 'client_site' ? (
                    <>
                      <h3 className="text-2xl font-bold mb-2">
                        Scale Your Agency with AI-Powered Audits
                      </h3>
                      <p className="text-lg mb-6 opacity-90">
                        Run unlimited audits, generate proposals, and win more clients with AISO Studio.
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 className="text-2xl font-bold mb-2">
                        Ready to Improve Your Score?
                      </h3>
                      <p className="text-lg mb-6 opacity-90">
                        Get AI-powered rewrites, content strategies, and optimization tools.
                      </p>
                    </>
                  )}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                      href="/sign-up"
                      className="rounded-lg bg-white px-8 py-3 font-semibold text-slate-900 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                    >
                      Start Free Trial
                    </Link>
                    <Link
                      href="/pricing"
                      className="rounded-lg border-2 border-white px-8 py-3 font-semibold text-white hover:bg-white/10 transition-all duration-200"
                    >
                      View Pricing
                    </Link>
                  </div>
                </div>
              </>
            )}

            {/* Upgrade CTA for low audits remaining - show regardless of email capture */}
            {result.auditsRemaining <= 1 && emailCaptured && (
              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6 text-center">
                <p className="text-amber-800 font-semibold">
                  {result.auditsRemaining === 0
                    ? "You've used all your free audits!"
                    : 'Only 1 free audit left!'}
                </p>
                <p className="text-amber-700 text-sm mt-1">
                  Sign up to unlock unlimited audits.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Features Section */}
        {!result && (
          <div className="mt-16">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
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
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100 flex items-center justify-center border-2 border-orange-300">
                  <span className="text-3xl">🤖</span>
                </div>
                <h3 className="font-bold text-slate-900 mb-2">AI Search Visibility</h3>
                <p className="text-sm text-slate-600">
                  If we can't scrape it, ChatGPT can't find it. Get instant visibility diagnostics.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <span className="text-2xl">⚠️</span>
                <h3 className="text-lg font-black text-slate-900">Unscrape-able = Invisible to AI Search</h3>
              </div>
              <p className="text-sm text-slate-700 max-w-2xl mx-auto">
                If your URL won't audit, it means <strong>ChatGPT, Perplexity, and Google SGE can't access your content either</strong>. We'll diagnose the issue and show you how to fix it for maximum AI search visibility.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-0 relative overflow-hidden animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-6 right-6 z-10 text-slate-400 hover:text-slate-700 transition-colors bg-white/80 rounded-full w-8 h-8 flex items-center justify-center hover:bg-slate-100"
            >
              <span className="text-2xl leading-none">×</span>
            </button>

            {/* Header Banner */}
            <div className="bg-gradient-to-br from-sunset-orange via-orange-500 to-orange-600 px-8 pt-12 pb-8 text-white text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>

              <div className="relative">
                <div className="inline-block mb-3 px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
                  LIMITED TIME OFFER
                </div>
                <h2 className="text-4xl md:text-5xl font-black mb-3 drop-shadow-lg">
                  You've Discovered<br />Something Powerful
                </h2>
                <p className="text-xl md:text-2xl font-medium opacity-95 max-w-xl mx-auto">
                  Join 1,000+ agencies using AISO Studio to optimize content 10x faster
                </p>
              </div>
            </div>

            <div className="px-8 py-8">
              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-4 mb-8 -mt-16 relative z-10">
                <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-4 text-center">
                  <div className="text-3xl font-black text-sunset-orange mb-1">10M+</div>
                  <div className="text-xs text-slate-600 font-semibold">Words Optimized</div>
                </div>
                <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-4 text-center">
                  <div className="text-3xl font-black text-sunset-orange mb-1">95%</div>
                  <div className="text-xs text-slate-600 font-semibold">Avg Score Increase</div>
                </div>
                <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-4 text-center">
                  <div className="text-3xl font-black text-sunset-orange mb-1">24/7</div>
                  <div className="text-xs text-slate-600 font-semibold">AI Optimization</div>
                </div>
              </div>

              {/* Special Offer Box */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-sunset-orange to-orange-600 flex items-center justify-center text-2xl">
                    🎁
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Special First-Time Offer</h3>
                    <p className="text-sm text-slate-600">Start your 7-day free trial today</p>
                  </div>
                </div>

                <div className="space-y-2.5 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span className="text-slate-700 font-medium">Unlimited AISO content audits + AI rewrites</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span className="text-slate-700 font-medium">Batch audit 50+ URLs simultaneously</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span className="text-slate-700 font-medium">Full content strategy generator (15 topics/strategy)</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span className="text-slate-700 font-medium">Lead discovery + pipeline management tools</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span className="text-slate-700 font-medium">Digital asset vault (Unlimited storage)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-white rounded-lg px-4 py-3 border border-blue-200">
                  <div>
                    <div className="text-sm text-slate-600">Starting at</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-900">$39</span>
                      <span className="text-slate-500 font-medium">/month</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500">After 7-day free trial</div>
                    <div className="text-sm font-bold text-green-600">Cancel anytime</div>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3">
                <Link
                  href="/sign-up"
                  className="block w-full rounded-xl bg-gradient-to-r from-sunset-orange to-orange-600 px-8 py-4 font-black text-lg text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] text-center"
                >
                  Start Your Free Trial Now
                </Link>
                <p className="text-center text-xs text-slate-500">
                  No credit card required • Cancel anytime • 7-day money-back guarantee
                </p>
                <Link
                  href="/sign-in"
                  className="block text-center text-sm font-semibold text-slate-600 hover:text-sunset-orange transition-colors pt-2"
                >
                  Already have an account? Sign in
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-slate-200">
                <div className="flex items-center justify-center gap-6 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <span className="text-green-600">🔒</span>
                    <span>Secure Checkout</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-blue-600">⚡</span>
                    <span>Instant Access</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-purple-600">💯</span>
                    <span>Money-Back Guarantee</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FreeAuditPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-sunset-orange border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-600">Loading audit page...</p>
        </div>
      </div>
    }>
      <FreeAuditContent />
    </Suspense>
  );
}
