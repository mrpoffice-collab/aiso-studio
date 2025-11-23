'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();
  const [auditUrl, setAuditUrl] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);

  const handleQuickAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (auditUrl.trim()) {
      // Redirect to free audit page with the URL pre-filled
      router.push(`/audit?url=${encodeURIComponent(auditUrl.trim())}`);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-xl shadow-sm sticky top-0 z-50">
        <div className="container mx-auto flex h-20 items-center justify-between px-6">
          <Link href="/" className="text-2xl font-black bg-gradient-to-r from-sunset-orange to-orange-600 bg-clip-text text-transparent">
            AISO Studio
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-semibold text-slate-600 hover:text-sunset-orange transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-sm font-semibold text-slate-600 hover:text-sunset-orange transition-colors">
              Pricing
            </a>
            <a href="#faq" className="text-sm font-semibold text-slate-600 hover:text-sunset-orange transition-colors">
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <Link
              href="/sign-in"
              className="text-sm font-semibold text-slate-600 hover:text-sunset-orange transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="rounded-lg bg-gradient-to-r from-sunset-orange to-orange-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* HERO SECTION with Integrated Free Audit */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-orange-50/30">
          <div className="container mx-auto px-6 py-20 lg:py-28">
            <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
              {/* Left Column - Copy + Audit Input */}
              <div>
                <div className="inline-block mb-6 px-4 py-2 rounded-full bg-orange-100 border border-orange-200">
                  <span className="text-sm font-bold text-orange-700">Honest Scoring • Real Results</span>
                </div>

                <h1 className="text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight">
                  Stop Guessing If Your Content Is Good Enough.{' '}
                  <span className="bg-gradient-to-r from-sunset-orange to-orange-600 bg-clip-text text-transparent">
                    Know.
                  </span>
                </h1>

                <p className="text-xl text-slate-600 mb-8 leading-relaxed max-w-xl">
                  The only platform that scores content honestly (0-100), rewrites it to perform, and equips your agency with client management, assets, and proof-of-work reports.
                </p>

                {/* Integrated Audit Input */}
                <form onSubmit={handleQuickAudit} className="mb-6">
                  <div className="flex flex-col sm:flex-row gap-3 mb-3">
                    <input
                      type="url"
                      value={auditUrl}
                      onChange={(e) => setAuditUrl(e.target.value)}
                      placeholder="https://yourblog.com/article"
                      className="flex-1 rounded-lg border-2 border-slate-300 px-4 py-4 text-slate-900 placeholder-slate-400 focus:border-sunset-orange focus:outline-none focus:ring-2 focus:ring-sunset-orange/20 transition-all"
                      disabled={isAuditing}
                    />
                    <button
                      type="submit"
                      disabled={isAuditing || !auditUrl.trim()}
                      className="rounded-lg bg-gradient-to-r from-sunset-orange to-orange-600 px-8 py-4 font-bold text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 whitespace-nowrap"
                    >
                      Get Free Score
                    </button>
                  </div>
                  <p className="text-sm text-slate-500">
                    No email required • 3 free audits • Results in 30 seconds
                  </p>
                </form>

                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/sign-up"
                    className="rounded-lg border-2 border-sunset-orange bg-white px-6 py-3 font-semibold text-sunset-orange hover:bg-orange-50 transition-all"
                  >
                    Start 7-Day Free Trial
                  </Link>
                </div>
              </div>

              {/* Right Column - Visual */}
              <div className="relative">
                <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-center flex-1">
                      <div className="text-sm font-bold text-slate-500 mb-2">BEFORE</div>
                      <div className="text-6xl font-black text-red-500">41</div>
                      <div className="text-xs text-slate-500 mt-1">Needs Work</div>
                    </div>
                    <div className="text-4xl text-slate-300 mx-4">→</div>
                    <div className="text-center flex-1">
                      <div className="text-sm font-bold text-slate-500 mb-2">AFTER</div>
                      <div className="text-6xl font-black text-green-500">79</div>
                      <div className="text-xs text-slate-500 mt-1">Good Quality</div>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-600">Intent Match</span>
                      <span className="font-bold text-slate-900">12 → 18</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-600">Readability</span>
                      <span className="font-bold text-slate-900">8 → 17</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-600">AEO Score</span>
                      <span className="font-bold text-slate-900">0 → 26</span>
                    </div>
                  </div>
                </div>

                {/* Floating badge */}
                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-sunset-orange to-orange-600 text-white px-4 py-2 rounded-full shadow-lg text-sm font-bold">
                  Real Results
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS BAR */}
        <section className="border-y border-slate-200 bg-white py-12">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-black text-sunset-orange mb-2">15K+</div>
                <div className="text-sm font-semibold text-slate-600">Content Audits</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-sunset-orange mb-2">85</div>
                <div className="text-sm font-semibold text-slate-600">Avg Winning Score</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-sunset-orange mb-2">98%</div>
                <div className="text-sm font-semibold text-slate-600">Fact-Check Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-sunset-orange mb-2">10M+</div>
                <div className="text-sm font-semibold text-slate-600">Words Optimized</div>
              </div>
            </div>
          </div>
        </section>

        {/* PROOF BLOCK - Honest Scoring */}
        <section className="py-20 bg-gradient-to-br from-slate-50 to-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
                Brutally Transparent 0-100 Scoring
              </h2>
              <p className="text-xl text-slate-600">
                No grade inflation. No BS. Our AISO scoring system tells you exactly what's wrong and how to fix it.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
              <div className="bg-white rounded-xl border-2 border-red-200 p-6 shadow-lg">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <span className="text-2xl">❌</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">Intent Mismatch</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Your content doesn't match what searchers actually want. We detect informational vs. transactional intent gaps.
                </p>
                <div className="text-xs font-mono text-slate-500">
                  Score: 12/20 (Intent)
                </div>
              </div>

              <div className="bg-white rounded-xl border-2 border-yellow-200 p-6 shadow-lg">
                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
                  <span className="text-2xl">⚠️</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">Readability Problems</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Complex sentences, passive voice, and dense paragraphs kill engagement. We measure Flesch scores by intent.
                </p>
                <div className="text-xs font-mono text-slate-500">
                  Score: 8/20 (Readability)
                </div>
              </div>

              <div className="bg-white rounded-xl border-2 border-orange-200 p-6 shadow-lg">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-4">
                  <span className="text-2xl">🤖</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">Zero AEO Optimization</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Not optimized for ChatGPT, Perplexity, or Google SGE. Missing answer engine signals that modern search needs.
                </p>
                <div className="text-xs font-mono text-slate-500">
                  Score: 0/30 (AEO)
                </div>
              </div>
            </div>

            <div className="text-center">
              <Link
                href="/audit"
                className="inline-block rounded-lg bg-gradient-to-r from-sunset-orange to-orange-600 px-8 py-4 font-bold text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                Try It On Your Site
              </Link>
            </div>
          </div>
        </section>

        {/* PLATFORM OVERVIEW - 6 Core Features */}
        <section id="features" className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
                Everything Your Agency Needs. One Platform.
              </h2>
              <p className="text-xl text-slate-600">
                From prospecting to delivery, AISO Studio handles the entire client lifecycle.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {/* Feature 1 - Content Audit & Rewrite */}
              <div className="bg-gradient-to-br from-white to-orange-50/50 rounded-2xl border-2 border-orange-200 p-8 shadow-lg hover:shadow-xl transition-all hover:scale-105">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-sunset-orange to-orange-600 flex items-center justify-center mb-4">
                  <span className="text-3xl">✏️</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3">
                  Content Audit & Rewrite
                </h3>
                <p className="text-slate-600 mb-4">
                  100-point AISO scoring across 6 dimensions: AEO, SEO, Readability, Engagement, GEO, Fact-Check. Selective rewrites target specific scores.
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Batch audit 50+ URLs simultaneously</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Iterative rewrites with improvement tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Client-ready PDF reports</span>
                  </li>
                </ul>
              </div>

              {/* Feature 2 - Content Strategy Generator */}
              <div className="bg-gradient-to-br from-white to-blue-50/50 rounded-2xl border-2 border-blue-200 p-8 shadow-lg hover:shadow-xl transition-all hover:scale-105">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center mb-4">
                  <span className="text-3xl">📅</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3">
                  Content Strategy Generator
                </h3>
                <p className="text-slate-600 mb-4">
                  AI generates 15-topic content calendars tailored to industry, audience, and goals. Powered by Claude Sonnet 4 and GPT-4.
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Industry-specific topic generation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Automatic post generation from topics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Multi-client management for agencies</span>
                  </li>
                </ul>
              </div>

              {/* Feature 3 - Lead Discovery & Pipeline */}
              <div className="bg-gradient-to-br from-white to-purple-50/50 rounded-2xl border-2 border-purple-200 p-8 shadow-lg hover:shadow-xl transition-all hover:scale-105">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center mb-4">
                  <span className="text-3xl">🎯</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3">
                  Lead Discovery & Pipeline
                </h3>
                <p className="text-slate-600 mb-4">
                  Find businesses by industry and location, score their websites, generate opportunity reports, and manage through close.
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Website scoring (SEO, Content, Design, Speed)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Pipeline: Discovered → Contacted → Won</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Activity logging (calls, emails, meetings)</span>
                  </li>
                </ul>
              </div>

              {/* Feature 4 - Digital Asset Vault */}
              <div className="bg-gradient-to-br from-white to-green-50/50 rounded-2xl border-2 border-green-200 p-8 shadow-lg hover:shadow-xl transition-all hover:scale-105">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center mb-4">
                  <span className="text-3xl">🗂️</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3">
                  Digital Asset Vault (DAM)
                </h3>
                <p className="text-slate-600 mb-4">
                  Never dig through Drive folders again. Unlimited cloud storage with folder hierarchy, tags, and bulk operations.
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Color-coded folder organization</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Tag system + smart collections</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Track asset usage across posts</span>
                  </li>
                </ul>
              </div>

              {/* Feature 5 - Fact-Checking */}
              <div className="bg-gradient-to-br from-white to-red-50/50 rounded-2xl border-2 border-red-200 p-8 shadow-lg hover:shadow-xl transition-all hover:scale-105">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 flex items-center justify-center mb-4">
                  <span className="text-3xl">🔍</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3">
                  Fact-Checking & Accuracy
                </h3>
                <p className="text-slate-600 mb-4">
                  Automated claim extraction and verification via Brave Search API. 30% of AISO score = factual accuracy. Prevent AI hallucinations.
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Automatic claim extraction from content</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Real-time verification via search</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Source citations for every claim</span>
                  </li>
                </ul>
              </div>

              {/* Feature 6 - Accessibility Audits */}
              <div className="bg-gradient-to-br from-white to-indigo-50/50 rounded-2xl border-2 border-indigo-200 p-8 shadow-lg hover:shadow-xl transition-all hover:scale-105">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 flex items-center justify-center mb-4">
                  <span className="text-3xl">♿</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3">
                  Accessibility Audits (WCAG)
                </h3>
                <p className="text-slate-600 mb-4">
                  WCAG 2.1/2.2 compliance scanning via Playwright + axe-core. Get fix suggestions for every violation. Separate from AISO score.
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Automated accessibility scanning</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Detailed violation reports with selectors</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>AI-generated fix suggestions</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* WORKFLOW EXPLAINER */}
        <section className="py-20 bg-gradient-to-br from-slate-50 to-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
                How Agencies Use AISO Studio
              </h2>
              <p className="text-xl text-slate-600">
                Complete client lifecycle management in five simple steps.
              </p>
            </div>

            <div className="max-w-5xl mx-auto">
              <div className="space-y-8">
                {/* Step 1 */}
                <div className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-sunset-orange to-orange-600 flex items-center justify-center text-white font-black text-xl">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Find Leads</h3>
                    <p className="text-slate-600">
                      Search businesses by industry and location → Score their websites for content, SEO, and design weaknesses
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-sunset-orange to-orange-600 flex items-center justify-center text-white font-black text-xl">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Win Contracts</h3>
                    <p className="text-slate-600">
                      Generate opportunity reports showing exactly what's broken → Add to pipeline → Track through discovery, research, and contacted stages
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-sunset-orange to-orange-600 flex items-center justify-center text-white font-black text-xl">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Audit & Optimize</h3>
                    <p className="text-slate-600">
                      Batch audit client content → Get honest 0-100 AISO scores → Rewrite to 75+ target scores with selective optimization passes
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-sunset-orange to-orange-600 flex items-center justify-center text-white font-black text-xl">
                    4
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Manage Assets</h3>
                    <p className="text-slate-600">
                      Upload brand kits to Vault → Organize by client with color-coded folders → Tag and bulk-manage all creative assets
                    </p>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-sunset-orange to-orange-600 flex items-center justify-center text-white font-black text-xl">
                    5
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Deliver Reports</h3>
                    <p className="text-slate-600">
                      Export white-label PDF audits → Client-ready proof of improvement → Show before/after scores and what changed
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-12">
              <Link
                href="/sign-up"
                className="inline-block rounded-lg bg-gradient-to-r from-sunset-orange to-orange-600 px-8 py-4 font-bold text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                Start Your Free Trial
              </Link>
            </div>
          </div>
        </section>

        {/* COMPARISON SECTION */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
                One Platform. Five Tools Replaced.
              </h2>
              <p className="text-xl text-slate-600">
                Stop paying for separate tools. Get everything in one honest platform.
              </p>
            </div>

            <div className="max-w-5xl mx-auto overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="text-left p-4 font-bold text-slate-900">Feature</th>
                    <th className="text-center p-4 font-bold text-slate-500">Content Tools</th>
                    <th className="text-center p-4 font-bold text-slate-500">Lead Gen Tools</th>
                    <th className="text-center p-4 font-bold text-slate-500">CRM Tools</th>
                    <th className="text-center p-4 font-bold text-slate-500">DAM Tools</th>
                    <th className="text-center p-4 font-bold bg-orange-50 text-sunset-orange">AISO Studio</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="p-4 text-slate-700">Content Audit</td>
                    <td className="text-center p-4 text-green-600 font-bold">✓</td>
                    <td className="text-center p-4 text-slate-300">✗</td>
                    <td className="text-center p-4 text-slate-300">✗</td>
                    <td className="text-center p-4 text-slate-300">✗</td>
                    <td className="text-center p-4 bg-orange-50 text-green-600 font-bold">✓</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="p-4 text-slate-700">Lead Discovery</td>
                    <td className="text-center p-4 text-slate-300">✗</td>
                    <td className="text-center p-4 text-green-600 font-bold">✓</td>
                    <td className="text-center p-4 text-slate-300">✗</td>
                    <td className="text-center p-4 text-slate-300">✗</td>
                    <td className="text-center p-4 bg-orange-50 text-green-600 font-bold">✓</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="p-4 text-slate-700">Pipeline Management</td>
                    <td className="text-center p-4 text-slate-300">✗</td>
                    <td className="text-center p-4 text-slate-300">✗</td>
                    <td className="text-center p-4 text-green-600 font-bold">✓</td>
                    <td className="text-center p-4 text-slate-300">✗</td>
                    <td className="text-center p-4 bg-orange-50 text-green-600 font-bold">✓</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="p-4 text-slate-700">Asset Management</td>
                    <td className="text-center p-4 text-slate-300">✗</td>
                    <td className="text-center p-4 text-slate-300">✗</td>
                    <td className="text-center p-4 text-slate-300">✗</td>
                    <td className="text-center p-4 text-green-600 font-bold">✓</td>
                    <td className="text-center p-4 bg-orange-50 text-green-600 font-bold">✓</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="p-4 text-slate-700">Honest Scoring</td>
                    <td className="text-center p-4 text-slate-300">✗</td>
                    <td className="text-center p-4 text-slate-300">✗</td>
                    <td className="text-center p-4 text-slate-300">✗</td>
                    <td className="text-center p-4 text-slate-300">✗</td>
                    <td className="text-center p-4 bg-orange-50 text-green-600 font-bold">✓</td>
                  </tr>
                  <tr className="border-b-2 border-slate-200 font-bold">
                    <td className="p-4 text-slate-900">Monthly Cost</td>
                    <td className="text-center p-4 text-slate-600">$99+</td>
                    <td className="text-center p-4 text-slate-600">$150+</td>
                    <td className="text-center p-4 text-slate-600">$200+</td>
                    <td className="text-center p-4 text-slate-600">$50+</td>
                    <td className="text-center p-4 bg-orange-50 text-sunset-orange text-xl">$39-299</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="text-center mt-8">
              <p className="text-sm text-slate-500">
                Replace $500+/month in separate tools with one unified platform starting at $39/month
              </p>
            </div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <section id="pricing" className="py-20 bg-gradient-to-br from-slate-50 to-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
                Simple Plans for Agencies of All Sizes
              </h2>
              <p className="text-xl text-slate-600">
                Start with a 7-day free trial. Scale as you grow. Cancel anytime.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Starter */}
              <div className="rounded-2xl border-2 border-slate-200 bg-white p-8 shadow-lg hover:shadow-xl transition-all">
                <h3 className="text-2xl font-black text-slate-900 mb-2">Starter</h3>
                <p className="text-slate-600 mb-6">Perfect for solo marketers</p>
                <div className="mb-6">
                  <span className="text-5xl font-black text-slate-900">$39</span>
                  <span className="text-slate-600">/month</span>
                </div>
                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 text-lg">✓</span>
                    <span className="text-slate-700"><strong>25 articles</strong> per month</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 text-lg">✓</span>
                    <span className="text-slate-700">Unlimited audits</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 text-lg">✓</span>
                    <span className="text-slate-700">Unlimited strategies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 text-lg">✓</span>
                    <span className="text-slate-700">10 lead searches/month</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 text-lg">✓</span>
                    <span className="text-slate-700">Basic pipeline (1 project)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 text-lg">✓</span>
                    <span className="text-slate-700">5GB Vault storage</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 text-lg">✓</span>
                    <span className="text-slate-700">1 seat</span>
                  </li>
                </ul>
                <Link
                  href="/sign-up"
                  className="block w-full text-center rounded-lg border-2 border-slate-300 bg-white px-6 py-3 font-bold text-slate-700 hover:bg-slate-50 transition-all"
                >
                  Start Free Trial
                </Link>
                <p className="text-xs text-center text-slate-500 mt-4">
                  7-day free trial • No credit card
                </p>
              </div>

              {/* Agency - Recommended */}
              <div className="rounded-2xl border-4 border-sunset-orange bg-white p-8 shadow-2xl relative scale-105">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-sunset-orange to-orange-600 text-white text-sm font-bold shadow-lg">
                  RECOMMENDED
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Agency</h3>
                <p className="text-slate-600 mb-6">For multi-client agencies</p>
                <div className="mb-6">
                  <span className="text-5xl font-black bg-gradient-to-r from-sunset-orange to-orange-600 bg-clip-text text-transparent">$299</span>
                  <span className="text-slate-600">/month</span>
                </div>
                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-sunset-orange text-lg">✓</span>
                    <span className="text-slate-700"><strong>250 articles</strong> per month</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sunset-orange text-lg">✓</span>
                    <span className="text-slate-700">Unlimited audits</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sunset-orange text-lg">✓</span>
                    <span className="text-slate-700">Unlimited strategies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sunset-orange text-lg">✓</span>
                    <span className="text-slate-700">Unlimited lead searches</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sunset-orange text-lg">✓</span>
                    <span className="text-slate-700">Unlimited pipeline projects</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sunset-orange text-lg">✓</span>
                    <span className="text-slate-700">100GB Vault storage</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sunset-orange text-lg">✓</span>
                    <span className="text-slate-700">Accessibility audits (WCAG)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sunset-orange text-lg">✓</span>
                    <span className="text-slate-700">White-label PDF reports</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sunset-orange text-lg">✓</span>
                    <span className="text-slate-700">10 seats</span>
                  </li>
                </ul>
                <Link
                  href="/sign-up"
                  className="block w-full text-center rounded-lg bg-gradient-to-r from-sunset-orange to-orange-600 px-6 py-3 font-bold text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                >
                  Start Free Trial
                </Link>
                <p className="text-xs text-center text-slate-500 mt-4">
                  7-day free trial • No credit card
                </p>
              </div>

              {/* Enterprise */}
              <div className="rounded-2xl border-2 border-slate-200 bg-white p-8 shadow-lg hover:shadow-xl transition-all">
                <h3 className="text-2xl font-black text-slate-900 mb-2">Enterprise</h3>
                <p className="text-slate-600 mb-6">For large organizations</p>
                <div className="mb-6">
                  <span className="text-5xl font-black text-slate-900">$799</span>
                  <span className="text-slate-600">/month</span>
                </div>
                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 text-lg">✓</span>
                    <span className="text-slate-700"><strong>1,000 articles</strong> per month</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 text-lg">✓</span>
                    <span className="text-slate-700">Unlimited audits</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 text-lg">✓</span>
                    <span className="text-slate-700">Unlimited strategies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 text-lg">✓</span>
                    <span className="text-slate-700">Unlimited everything</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 text-lg">✓</span>
                    <span className="text-slate-700">Unlimited Vault storage</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 text-lg">✓</span>
                    <span className="text-slate-700">API access</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 text-lg">✓</span>
                    <span className="text-slate-700">Custom integrations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 text-lg">✓</span>
                    <span className="text-slate-700">Dedicated account manager</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 text-lg">✓</span>
                    <span className="text-slate-700">Unlimited seats</span>
                  </li>
                </ul>
                <Link
                  href="/sign-up"
                  className="block w-full text-center rounded-lg border-2 border-slate-300 bg-white px-6 py-3 font-bold text-slate-700 hover:bg-slate-50 transition-all"
                >
                  Start Free Trial
                </Link>
                <p className="text-xs text-center text-slate-500 mt-4">
                  7-day free trial • No credit card
                </p>
              </div>
            </div>

            <div className="text-center mt-12">
              <p className="text-sm text-slate-500">
                All plans include a 7-day free trial. No credit card required. Cancel anytime.
              </p>
            </div>
          </div>
        </section>

        {/* TECHNOLOGY CREDIBILITY */}
        <section className="py-16 bg-white border-y border-slate-200">
          <div className="container mx-auto px-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Powered by Industry-Leading AI</h3>
              <p className="text-slate-600">Built on the most advanced technology stack</p>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-8 text-slate-400">
              <div className="text-center">
                <div className="text-lg font-bold text-slate-700">Claude Sonnet 4</div>
                <div className="text-xs">Content Generation</div>
              </div>
              <div className="text-2xl">•</div>
              <div className="text-center">
                <div className="text-lg font-bold text-slate-700">GPT-4</div>
                <div className="text-xs">Strategy & Analysis</div>
              </div>
              <div className="text-2xl">•</div>
              <div className="text-center">
                <div className="text-lg font-bold text-slate-700">Brave Search</div>
                <div className="text-xs">Fact-Checking</div>
              </div>
              <div className="text-2xl">•</div>
              <div className="text-center">
                <div className="text-lg font-bold text-slate-700">Playwright + axe-core</div>
                <div className="text-xs">Accessibility</div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section id="faq" className="py-20 bg-gradient-to-br from-slate-50 to-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="max-w-3xl mx-auto space-y-6">
              <details className="bg-white rounded-lg border border-slate-200 p-6 group">
                <summary className="font-bold text-slate-900 cursor-pointer list-none flex justify-between items-center">
                  What is AISO scoring?
                  <span className="text-sunset-orange group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-slate-600 mt-4">
                  AISO = Answer Engine Optimization + Intent-based Readability + SEO + Overall optimization. It's a brutally honest 0-100 scoring system that evaluates content across 6 dimensions: AEO (30%), SEO (20%), Readability (20%), Engagement (15%), GEO (10%), and Fact-Check (30%). Unlike other tools that inflate scores, we tell you the truth.
                </p>
              </details>

              <details className="bg-white rounded-lg border border-slate-200 p-6 group">
                <summary className="font-bold text-slate-900 cursor-pointer list-none flex justify-between items-center">
                  How accurate are the scores?
                  <span className="text-sunset-orange group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-slate-600 mt-4">
                  Our fact-checking system has 98% accuracy verified against Brave Search results. The scoring algorithm is calibrated against 15,000+ audited pages. We intentionally grade harder than competitors—a 75+ from us means genuinely good content, not "participation trophy" quality.
                </p>
              </details>

              <details className="bg-white rounded-lg border border-slate-200 p-6 group">
                <summary className="font-bold text-slate-900 cursor-pointer list-none flex justify-between items-center">
                  What AI models do you use?
                  <span className="text-sunset-orange group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-slate-600 mt-4">
                  We use Claude Sonnet 4 (Anthropic) and GPT-4 (OpenAI) for content generation and analysis. Fact-checking is powered by Brave Search API. Accessibility audits use Playwright with axe-core engine for WCAG 2.1/2.2 compliance.
                </p>
              </details>

              <details className="bg-white rounded-lg border border-slate-200 p-6 group">
                <summary className="font-bold text-slate-900 cursor-pointer list-none flex justify-between items-center">
                  Is the rewritten content human-quality?
                  <span className="text-sunset-orange group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-slate-600 mt-4">
                  Yes. We use selective optimization passes (Readability Pass, SEO Pass, AEO Pass, Engagement Pass) rather than full regeneration. This preserves your voice while fixing specific weaknesses. You can also do multiple iterative rewrites, improving scores 10-30 points per pass.
                </p>
              </details>

              <details className="bg-white rounded-lg border border-slate-200 p-6 group">
                <summary className="font-bold text-slate-900 cursor-pointer list-none flex justify-between items-center">
                  Can I import existing content?
                  <span className="text-sunset-orange group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-slate-600 mt-4">
                  Yes. You can paste content directly, enter URLs (we'll scrape them), or batch audit 50+ URLs at once. The batch audit feature automatically detects local intent and applies appropriate GEO scoring.
                </p>
              </details>

              <details className="bg-white rounded-lg border border-slate-200 p-6 group">
                <summary className="font-bold text-slate-900 cursor-pointer list-none flex justify-between items-center">
                  Does it support teams?
                  <span className="text-sunset-orange group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-slate-600 mt-4">
                  Yes. Starter includes 1 seat, Agency includes 10 seats, and Enterprise includes unlimited seats. Team members can collaborate on strategies, share the Vault, manage pipeline together, and leave feedback comments on audits.
                </p>
              </details>

              <details className="bg-white rounded-lg border border-slate-200 p-6 group">
                <summary className="font-bold text-slate-900 cursor-pointer list-none flex justify-between items-center">
                  Can I white-label reports for clients?
                  <span className="text-sunset-orange group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-slate-600 mt-4">
                  Yes, on the Agency tier and above. You can export white-label PDF reports showing audit results, before/after comparisons, and opportunity analyses. Perfect for client deliverables and proposals.
                </p>
              </details>

              <details className="bg-white rounded-lg border border-slate-200 p-6 group">
                <summary className="font-bold text-slate-900 cursor-pointer list-none flex justify-between items-center">
                  What happens after the free trial?
                  <span className="text-sunset-orange group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-slate-600 mt-4">
                  Your 7-day free trial gives you full access to try all features. No credit card required to start. After 7 days, you can choose to upgrade to a paid plan or stay on the free tier (limited features). You can cancel anytime with no penalties.
                </p>
              </details>

              <details className="bg-white rounded-lg border border-slate-200 p-6 group">
                <summary className="font-bold text-slate-900 cursor-pointer list-none flex justify-between items-center">
                  Do you integrate with WordPress or other CMS platforms?
                  <span className="text-sunset-orange group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-slate-600 mt-4">
                  Not yet. Currently, you can copy/paste optimized content or export as Markdown/PDF to any platform. WordPress and CMS integrations are on our roadmap for Q2 2025.
                </p>
              </details>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-20 bg-gradient-to-r from-sunset-orange via-orange-500 to-orange-600">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center text-white">
              <h2 className="text-4xl md:text-5xl font-black mb-6">
                See What Your Content Really Scores
              </h2>
              <p className="text-xl md:text-2xl mb-8 opacity-95">
                No credit card. No email. Just 3 free audits to see if your content is actually good—or just good enough to fool you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link
                  href="/audit"
                  className="rounded-xl bg-white px-10 py-4 text-lg font-bold text-sunset-orange shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
                >
                  Run Free Audit
                </Link>
                <Link
                  href="/sign-up"
                  className="rounded-xl border-2 border-white px-10 py-4 text-lg font-bold text-white hover:bg-white/10 transition-all"
                >
                  Start 7-Day Trial
                </Link>
              </div>
              <div className="flex items-center justify-center gap-8 text-sm opacity-90">
                <div className="flex items-center gap-2">
                  <span>🔒</span>
                  <span>No Credit Card</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>⚡</span>
                  <span>30-Second Results</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>💯</span>
                  <span>Honest Scoring</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-black text-slate-900 mb-4 text-xl bg-gradient-to-r from-sunset-orange to-orange-600 bg-clip-text text-transparent">
                AISO Studio
              </h3>
              <p className="text-sm text-slate-600">
                Professional content optimization and agency management platform. Built for agencies that value honest results.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link href="/audit" className="hover:text-sunset-orange transition-colors">Free Audit</Link></li>
                <li><Link href="#features" className="hover:text-sunset-orange transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-sunset-orange transition-colors">Pricing</Link></li>
                <li><Link href="/sign-up" className="hover:text-sunset-orange transition-colors">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link href="#" className="hover:text-sunset-orange transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-sunset-orange transition-colors">Blog</Link></li>
                <li><Link href="mailto:contact@aiso.studio" className="hover:text-sunset-orange transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link href="#" className="hover:text-sunset-orange transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-sunset-orange transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 pt-8 text-center text-sm text-slate-600">
            © 2025 AISO Studio. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
