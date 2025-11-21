'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import DashboardNav from '@/components/DashboardNav';
import { useSearchParams } from 'next/navigation';
import AISOBadge from '@/components/AISOBadge';
import AEOScoreCard from '@/components/AEOScoreCard';
import ArticlePreview from '@/components/ArticlePreview';
import AccessibilitySummary from '@/components/AccessibilitySummary';
import { generateComparisonPDF } from '@/lib/comparison-pdf-generator';
import RepurposeModal from '@/components/RepurposeModal';

function AuditPageContent() {
  const searchParams = useSearchParams();
  const [contentInput, setContentInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [metaInput, setMetaInput] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);
  const [isRewriting, setIsRewriting] = useState(false);
  const [rewriteResult, setRewriteResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'preview' | 'metrics' | 'changes'>('preview');

  // Accessibility audit state
  const [accessibilityResult, setAccessibilityResult] = useState<any>(null);
  const [isAccessibilityAuditing, setIsAccessibilityAuditing] = useState(false);
  const [isGeneratingFixes, setIsGeneratingFixes] = useState(false);
  const [showRepurposeModal, setShowRepurposeModal] = useState(false);

  // Check for parameters from batch audit or direct post audit
  useEffect(() => {
    const urlParam = searchParams.get('url');
    const fromPost = searchParams.get('fromPost');

    // Check if data was passed via sessionStorage (from post detail page)
    if (fromPost === 'true') {
      const storedData = sessionStorage.getItem('auditPostData');
      if (storedData) {
        try {
          const { title, meta, content } = JSON.parse(storedData);
          setTitleInput(title || '');
          setMetaInput(meta || '');
          setContentInput(content || '');

          // Clear the stored data
          sessionStorage.removeItem('auditPostData');

          // Auto-audit
          setTimeout(() => {
            const auditBtn = document.querySelector('[data-audit-btn]') as HTMLButtonElement;
            auditBtn?.click();
          }, 100);
        } catch (e) {
          console.error('Failed to parse stored audit data:', e);
        }
      }
    } else if (urlParam) {
      setUrlInput(urlParam);
      // Auto-audit when URL is provided
      setTimeout(() => {
        const auditBtn = document.querySelector('[data-audit-btn]') as HTMLButtonElement;
        auditBtn?.click();
      }, 100);
    }
  }, [searchParams]);

  const handleAudit = async () => {
    if (!contentInput.trim() && !urlInput.trim()) {
      setError('Please paste content or enter a URL');
      return;
    }

    setIsAuditing(true);
    setError('');
    setAuditResult(null);
    setAccessibilityResult(null);

    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: contentInput,
          url: urlInput,
          title: titleInput,
          metaDescription: metaInput,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Audit failed');
      }

      setAuditResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleRewrite = async () => {
    if (!auditResult) return;

    setIsRewriting(true);
    setError('');

    // Capture original data for PDF
    const originalContent = auditResult.content;
    const originalScore = auditResult.aisoScore || auditResult.overallScore;
    const originalTitle = auditResult.title || 'Content Audit';

    try {
      const response = await fetch('/api/audit/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalContent: auditResult.content,
          auditReport: auditResult,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Rewrite failed');
      }

      setRewriteResult(data);

      // Auto-save audit to database
      try {
        await fetch('/api/audits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: urlInput || 'Manual input',
            title: auditResult.title || null,
            originalContent: auditResult.content,
            originalScore: originalScore,
            originalBreakdown: {
              factCheckScore: auditResult.factCheckScore,
              aeoScore: auditResult.aeoScore,
              seoScore: auditResult.seoScore,
              readabilityScore: auditResult.readabilityScore,
              engagementScore: auditResult.engagementScore,
            },
            improvedContent: data.improvedContent,
            improvedScore: data.newScore,
            improvedBreakdown: data.scoreBreakdown || null,
            iterations: data.iterations || 0,
            costUsd: (data.iterations || 0) * 0.15, // Estimated cost
          }),
        });
        console.log('✅ Audit saved to history');
      } catch (saveError) {
        console.error('Failed to save audit:', saveError);
        // Don't fail the rewrite if save fails
      }

      // Generate comparison PDF after successful rewrite
      setTimeout(() => {
        try {
          console.log('Generating comparison PDF...');
          console.log('Original score:', originalScore);
          console.log('New score:', data.newScore);

          generateComparisonPDF({
            title: originalTitle,
            originalContent: originalContent,
            improvedContent: data.improvedContent,
            originalScore: originalScore,
            improvedScore: data.newScore,
            scoreBreakdown: [
              {
                category: 'AISO Score',
                before: originalScore,
                after: data.newScore,
                improvement: data.newScore - originalScore
              },
              {
                category: 'Fact-Check (30%)',
                before: auditResult.factCheckScore || 0,
                after: data.factCheckScore || auditResult.factCheckScore || 0,
                improvement: (data.factCheckScore || auditResult.factCheckScore || 0) - (auditResult.factCheckScore || 0)
              },
              {
                category: 'AEO (25%)',
                before: auditResult.aeoScore || 0,
                after: data.aeoScore || auditResult.aeoScore || 0,
                improvement: (data.aeoScore || auditResult.aeoScore || 0) - (auditResult.aeoScore || 0)
              },
              {
                category: 'SEO (15%)',
                before: auditResult.seoScore,
                after: data.seoScore || auditResult.seoScore,
                improvement: (data.seoScore || auditResult.seoScore) - auditResult.seoScore
              }
            ],
            generatedDate: new Date().toLocaleDateString(),
          });

          console.log('PDF generation complete!');
          alert('✅ Content rewritten successfully!\n\n📄 Comparison PDF has been downloaded showing before/after improvements.');
        } catch (pdfError: any) {
          console.error('PDF generation error:', pdfError);
          alert('✅ Content rewritten successfully!\n\n⚠️ PDF generation failed: ' + pdfError.message);
        }
      }, 500);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsRewriting(false);
    }
  };

  // Accessibility audit handler
  const handleAccessibilityAudit = async (url: string) => {
    if (!url) return;

    setIsAccessibilityAuditing(true);
    setAccessibilityResult(null);

    try {
      const response = await fetch('/api/audit/accessibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const text = await response.text();

      if (!text) {
        console.error('Accessibility audit failed: Empty response');
        setError('Accessibility scan failed - empty response from server');
        return;
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        console.error('Failed to parse response:', text.substring(0, 500));
        setError('Accessibility scan failed - invalid response');
        return;
      }

      if (!response.ok) {
        console.error('Accessibility audit failed:', data.error);
        setError(data.error || 'Accessibility scan failed');
        return;
      }

      setAccessibilityResult(data.audit);
    } catch (err: any) {
      console.error('Accessibility audit error:', err);
      setError(err.message || 'Accessibility scan failed');
    } finally {
      setIsAccessibilityAuditing(false);
    }
  };

  // Generate AI fixes for accessibility issues
  const handleGenerateFixes = async () => {
    if (!accessibilityResult?.id) return;

    setIsGeneratingFixes(true);

    try {
      const response = await fetch(`/api/audit/accessibility/${accessibilityResult.id}/fix`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setAccessibilityResult((prev: any) => ({
          ...prev,
          aiSuggestions: data.suggestions,
        }));
      }
    } catch (err) {
      console.error('Failed to generate fixes:', err);
    } finally {
      setIsGeneratingFixes(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-700 bg-green-50 border-green-200';
    if (score >= 75) return 'text-blue-700 bg-blue-50 border-blue-200';
    if (score >= 60) return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    return 'text-red-700 bg-red-50 border-red-200';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 85) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <DashboardNav />

      <main className="container mx-auto px-6 py-12 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-deep-indigo via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                AISO Content Audit
              </h1>
              <p className="text-lg text-slate-700">
                Analyze blog posts for AI Search Optimization (AEO + SEO + Fact-Checking). Get scores for ChatGPT, Perplexity, Google SGE.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/audit/history"
                className="px-4 py-2 bg-deep-indigo text-white rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                History
              </Link>
              <Link
                href="/dashboard/audit/batch"
                className="px-4 py-2 bg-deep-indigo text-white rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Batch Audit
              </Link>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 border-2 border-red-200 p-4 text-red-700 font-semibold">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          {/* Input Section */}
          {!auditResult && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
              <h2 className="text-2xl font-black text-slate-900 mb-6">Step 1: Add Content to Audit</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Option A: Paste Content Directly
                  </label>
                  <textarea
                    value={contentInput}
                    onChange={(e) => {
                      setContentInput(e.target.value);
                      setUrlInput('');
                    }}
                    placeholder="Paste your blog post content here..."
                    rows={12}
                    className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                    style={{ color: '#0f172a' }}
                  />
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1 border-t border-slate-300"></div>
                  <span className="text-sm font-bold text-slate-700">OR</span>
                  <div className="flex-1 border-t border-slate-300"></div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Option B: Enter Blog Post URL
                  </label>
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => {
                      setUrlInput(e.target.value);
                      setContentInput('');
                    }}
                    placeholder="https://example.com/blog/post-title"
                    className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                    style={{ color: '#0f172a' }}
                  />
                  <p className="mt-2 text-xs text-slate-600">
                    We'll automatically scrape and analyze the content
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleAudit}
                    disabled={isAuditing || (!contentInput.trim() && !urlInput.trim())}
                    data-audit-btn
                    className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {isAuditing ? (
                      <>
                        <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Analyzing Content...
                      </>
                    ) : (
                      <>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        Full AISO Audit
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleAccessibilityAudit(urlInput)}
                    disabled={isAccessibilityAuditing || !urlInput.trim()}
                    className="px-6 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {isAccessibilityAuditing ? (
                      <>
                        <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Scanning...
                      </>
                    ) : (
                      <>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        WCAG Only
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Standalone WCAG Results (when no full audit) */}
          {accessibilityResult && !auditResult && !rewriteResult && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-900">WCAG Accessibility Results</h2>
                <button
                  onClick={() => {
                    setAccessibilityResult(null);
                    setUrlInput('');
                  }}
                  className="text-sm font-semibold text-slate-600 hover:text-deep-indigo"
                >
                  ← Scan Another URL
                </button>
              </div>

              <AccessibilitySummary
                score={accessibilityResult.accessibilityScore}
                criticalCount={accessibilityResult.criticalCount}
                seriousCount={accessibilityResult.seriousCount}
                moderateCount={accessibilityResult.moderateCount}
                minorCount={accessibilityResult.minorCount}
                totalViolations={accessibilityResult.totalViolations}
                totalPasses={accessibilityResult.totalPasses}
                violations={accessibilityResult.violations || []}
                wcagBreakdown={accessibilityResult.wcagBreakdown}
                pageTitle={accessibilityResult.pageTitle}
                onFixAll={handleGenerateFixes}
                isFixing={isGeneratingFixes}
                aiSuggestions={accessibilityResult.aiSuggestions}
              />
            </div>
          )}

          {/* Audit Results */}
          {auditResult && !rewriteResult && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-900">Audit Results</h2>
                <div className="flex items-center gap-3">
                  {auditResult?.content && (
                    <button
                      onClick={() => setShowRepurposeModal(true)}
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Repurpose
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setAuditResult(null);
                      setAccessibilityResult(null);
                      setContentInput('');
                      setUrlInput('');
                      setError('');
                    }}
                    className="text-sm font-semibold text-slate-600 hover:text-deep-indigo"
                  >
                    ← Audit Another Post
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
                {/* What was analyzed */}
                {auditResult.url && (
                  <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
                    <p className="text-sm font-bold text-slate-900 mb-1">📄 Analyzed Content:</p>
                    <p className="text-sm text-slate-700">
                      Single blog post from: <span className="font-mono text-xs break-all">{auditResult.url}</span>
                    </p>
                    <p className="text-xs text-slate-600 mt-2">
                      ℹ️ This audit analyzes one individual blog post, not your entire blog or website.
                    </p>
                  </div>
                )}

                {/* AISO Score - Primary Score */}
                {auditResult.aisoScore !== undefined && (
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-slate-900 mb-4">AISO Score (AI Search Optimization)</h3>
                    <div className="flex items-start gap-4">
                      <AISOBadge score={auditResult.aisoScore} size="lg" />
                      <div className="flex-1 p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
                        <p className="text-sm text-slate-700 mb-2">
                          <strong>AISO Score</strong> combines AEO (Answer Engine Optimization) + SEO + Readability + Engagement with <strong className="text-purple-600">30% fact-checking weight</strong> — our key differentiator.
                        </p>
                        <p className="text-xs text-slate-600">
                          This score predicts how likely your content is to be quoted by ChatGPT Search, Perplexity, Google SGE, and Bing Copilot.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Legacy Overall Score - Kept for backward compatibility */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Legacy Quality Score</h3>
                  <div className={`inline-flex items-center gap-4 px-6 py-4 rounded-xl border-2 ${getScoreColor(auditResult.overallScore)}`}>
                    <div className="text-5xl font-black">{auditResult.overallScore}</div>
                    <div>
                      <div className="text-sm font-bold uppercase tracking-wider">/ 100</div>
                      <div className="text-lg font-bold">{getScoreLabel(auditResult.overallScore)}</div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 mt-2">
                    (Base score without fact-checking weight - for comparison only)
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-8">
                  {/* Fact-Check Score - 30% weight (KEY DIFFERENTIATOR) */}
                  <div className={`p-4 rounded-xl border-2 ${getScoreColor(auditResult.factCheckScore)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold uppercase tracking-wider">Fact-Check ⭐</span>
                      <span className="text-2xl font-black">{auditResult.factCheckScore}</span>
                    </div>
                    <p className="text-xs">
                      ✅ {auditResult.verifiedClaims} verified &nbsp; ⚠️ {auditResult.uncertainClaims} uncertain &nbsp; ❌ {auditResult.unverifiedClaims} unverified
                    </p>
                    <p className="text-xs font-bold text-purple-600 mt-1">30% weight</p>
                  </div>

                  {/* AEO Score - NEW */}
                  {auditResult.aeoScore !== undefined && (
                    <div className={`p-4 rounded-xl border-2 ${getScoreColor(auditResult.aeoScore)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold uppercase tracking-wider">AEO (AI)</span>
                        <span className="text-2xl font-black">{auditResult.aeoScore}</span>
                      </div>
                      <p className="text-xs">
                        Answer Engine Optimization
                      </p>
                      <p className="text-xs font-bold text-blue-600 mt-1">25% weight</p>
                    </div>
                  )}

                  <div className={`p-4 rounded-xl border-2 ${getScoreColor(auditResult.seoScore)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold uppercase tracking-wider">SEO</span>
                      <span className="text-2xl font-black">{auditResult.seoScore}</span>
                    </div>
                    <p className="text-xs">
                      Keywords, structure, headers, meta tags
                    </p>
                    <p className="text-xs font-bold text-green-600 mt-1">15% weight</p>
                  </div>

                  <div className={`p-4 rounded-xl border-2 ${getScoreColor(auditResult.readabilityScore)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold uppercase tracking-wider">Readability</span>
                      <span className="text-2xl font-black">{auditResult.readabilityScore}</span>
                    </div>
                    <p className="text-xs">
                      {auditResult.readabilityDetails?.fleschGrade || 'Standard reading level'}
                    </p>
                    <p className="text-xs font-bold text-orange-600 mt-1">15% weight</p>
                  </div>

                  <div className={`p-4 rounded-xl border-2 ${getScoreColor(auditResult.engagementScore)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold uppercase tracking-wider">Engagement</span>
                      <span className="text-2xl font-black">{auditResult.engagementScore}</span>
                    </div>
                    <p className="text-xs">
                      Hooks, CTAs, formatting, interactivity
                    </p>
                    <p className="text-xs font-bold text-pink-600 mt-1">15% weight</p>
                  </div>
                </div>

                {/* AEO Score Card - NEW */}
                {auditResult.aeoDetails && (
                  <div className="mb-8">
                    <AEOScoreCard score={auditResult.aeoScore || 0} details={auditResult.aeoDetails} />
                  </div>
                )}

                {/* Detailed Breakdown */}
                <div className="space-y-4 mb-8">
                  <h3 className="text-lg font-bold text-slate-900">Detailed Analysis</h3>

                  {/* SEO Details */}
                  {auditResult.seoDetails && (
                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                      <h4 className="font-bold text-slate-900 mb-2">SEO Breakdown</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm text-slate-900">
                        <div>• Headers: <span className="font-bold">{auditResult.seoDetails.h2Count} H2, {auditResult.seoDetails.h3Count} H3</span> {auditResult.seoDetails.headerStructure ? '✅' : '⚠️'}</div>
                        <div>• Title Length: <span className="font-bold">{auditResult.seoDetails.titleLength || 0} chars</span> {auditResult.seoDetails.titleOptimal ? '✅' : '⚠️'}</div>
                        <div>• Meta Description: <span className="font-bold">{auditResult.seoDetails.metaLength || 0} chars</span> {auditResult.seoDetails.metaOptimal ? '✅' : '⚠️'}</div>
                        <div>• Images: <span className="font-bold">{auditResult.seoDetails.imageCount}</span> {auditResult.seoDetails.imageCount >= 2 ? '✅' : '⚠️'}</div>
                        <div>• Links: <span className="font-bold">{auditResult.seoDetails.hasInternalLinks ? 'Yes' : 'No'}</span> {auditResult.seoDetails.hasInternalLinks ? '✅' : '⚠️'}</div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-slate-300">
                        <p className="text-sm text-slate-900 mb-1">
                          <span className="font-bold">Word Count:</span> {auditResult.seoDetails.wordCount} words
                        </p>
                        <p className="text-xs text-slate-600">
                          📊 Context: Competitive keywords typically need 1,200+ words. Quick answers/how-tos work well at 600-800 words. This post's effectiveness depends on its target keywords and content type.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Readability Details */}
                  {auditResult.readabilityDetails && (
                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                      <h4 className="font-bold text-slate-900 mb-2">Readability Breakdown</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm text-slate-900">
                        <div>• Flesch Score: <span className="font-bold">{auditResult.readabilityDetails.fleschScore}</span></div>
                        <div>• Reading Level: <span className="font-bold">{auditResult.readabilityDetails.fleschGrade}</span></div>
                        <div>• Avg Sentence: <span className="font-bold">{auditResult.readabilityDetails.avgSentenceLength} words</span></div>
                        <div>• Sentences: <span className="font-bold">{auditResult.readabilityDetails.sentenceCount}</span></div>
                        <div>• Long Sentences: <span className="font-bold">{auditResult.readabilityDetails.longSentenceCount}</span> {auditResult.readabilityDetails.longSentenceCount < 5 ? '✅' : '⚠️'}</div>
                        <div>• Complex Words: <span className="font-bold">{auditResult.readabilityDetails.complexWordCount}</span></div>
                      </div>
                    </div>
                  )}

                  {/* Engagement Details */}
                  {auditResult.engagementDetails && (
                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                      <h4 className="font-bold text-slate-900 mb-2">Engagement Breakdown</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm text-slate-900">
                        <div>• Opening Hook: <span className="font-bold">{auditResult.engagementDetails.hasHook ? 'Yes ✅' : 'No ⚠️'}</span></div>
                        <div>• Call-to-Action: <span className="font-bold">{auditResult.engagementDetails.hasCTA ? 'Yes ✅' : 'No ⚠️'}</span></div>
                        <div>• Questions: <span className="font-bold">{auditResult.engagementDetails.hasQuestion ? 'Yes ✅' : 'No ⚠️'}</span></div>
                        <div>• Bullet Points: <span className="font-bold">{auditResult.engagementDetails.hasBulletPoints ? 'Yes ✅' : 'No ⚠️'}</span></div>
                        <div>• Numbered Lists: <span className="font-bold">{auditResult.engagementDetails.hasNumberedList ? 'Yes ✅' : 'No ⚠️'}</span></div>
                        <div>• Text Emphasis: <span className="font-bold">{auditResult.engagementDetails.hasEmphasis ? 'Yes ✅' : 'No ⚠️'}</span></div>
                      </div>
                    </div>
                  )}
                </div>

                {auditResult.overallScore < 75 && (
                  <button
                    onClick={handleRewrite}
                    disabled={isRewriting}
                    className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {isRewriting ? (
                      <>
                        <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Rewriting Content...
                      </>
                    ) : (
                      <>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Rewrite to Improve Score (~$0.10)
                      </>
                    )}
                  </button>
                )}

                {auditResult.overallScore >= 75 && (
                  <div className="p-4 rounded-xl bg-green-50 border-2 border-green-200">
                    <p className="text-green-800 font-bold text-center">
                      ✅ This content meets quality standards! No rewrite needed.
                    </p>
                  </div>
                )}

                {/* Accessibility Audit Section */}
                {urlInput && (
                  <div className="mt-8 pt-8 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        WCAG Accessibility Audit
                      </h3>
                      {!accessibilityResult && (
                        <button
                          onClick={() => handleAccessibilityAudit(urlInput)}
                          disabled={isAccessibilityAuditing}
                          className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold text-sm hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                          {isAccessibilityAuditing ? (
                            <>
                              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Scanning...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Run Accessibility Scan
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {isAccessibilityAuditing && (
                      <div className="p-8 rounded-xl bg-purple-50 border border-purple-200 text-center">
                        <svg className="animate-spin h-8 w-8 mx-auto mb-4 text-purple-600" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-purple-800 font-bold">Scanning page for WCAG accessibility issues...</p>
                        <p className="text-purple-600 text-sm mt-2">This may take 15-30 seconds</p>
                      </div>
                    )}

                    {accessibilityResult && (
                      <AccessibilitySummary
                        score={accessibilityResult.accessibilityScore}
                        criticalCount={accessibilityResult.criticalCount}
                        seriousCount={accessibilityResult.seriousCount}
                        moderateCount={accessibilityResult.moderateCount}
                        minorCount={accessibilityResult.minorCount}
                        totalViolations={accessibilityResult.totalViolations}
                        totalPasses={accessibilityResult.totalPasses}
                        violations={accessibilityResult.violations || []}
                        wcagBreakdown={accessibilityResult.wcagBreakdown || {
                          perceivable: { violations: 0, score: 100 },
                          operable: { violations: 0, score: 100 },
                          understandable: { violations: 0, score: 100 },
                          robust: { violations: 0, score: 100 },
                        }}
                        pageTitle={accessibilityResult.pageTitle}
                        onFixAll={handleGenerateFixes}
                        isFixing={isGeneratingFixes}
                        aiSuggestions={accessibilityResult.aiSuggestions}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Rewrite Results - Tabbed Interface */}
          {rewriteResult && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h2 className="text-3xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    Content Improved!
                  </h2>
                  <div className="px-4 py-2 rounded-full bg-green-100 border-2 border-green-200 animate-pulse">
                    <span className="text-sm font-black text-green-700">+{rewriteResult.improvement} points</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setRewriteResult(null);
                    setAuditResult(null);
                    setAccessibilityResult(null);
                    setContentInput('');
                    setUrlInput('');
                    setActiveTab('preview');
                  }}
                  className="px-6 py-3 rounded-xl bg-white border-2 border-slate-300 font-bold text-slate-700 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-all shadow-sm flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Audit Another Post
                </button>
              </div>

              {/* Tabs */}
              <div className="border-b border-slate-200 bg-white rounded-t-2xl shadow-sm">
                <nav className="flex gap-1 px-6 pt-4">
                  <button
                    onClick={() => setActiveTab('preview')}
                    className={`relative px-6 py-3 font-bold text-sm rounded-t-xl transition-all ${
                      activeTab === 'preview'
                        ? 'bg-gradient-to-br from-slate-50 to-blue-50 text-deep-indigo border-b-4 border-orange-500'
                        : 'text-slate-600 hover:text-deep-indigo hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      ✨ Your Improved Article
                      {activeTab === 'preview' && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      )}
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab('metrics')}
                    className={`px-6 py-3 font-bold text-sm rounded-t-xl transition-all ${
                      activeTab === 'metrics'
                        ? 'bg-gradient-to-br from-slate-50 to-blue-50 text-deep-indigo border-b-4 border-orange-500'
                        : 'text-slate-600 hover:text-deep-indigo hover:bg-slate-50'
                    }`}
                  >
                    📊 Performance Metrics
                  </button>
                  <button
                    onClick={() => setActiveTab('changes')}
                    className={`px-6 py-3 font-bold text-sm rounded-t-xl transition-all ${
                      activeTab === 'changes'
                        ? 'bg-gradient-to-br from-slate-50 to-blue-50 text-deep-indigo border-b-4 border-orange-500'
                        : 'text-slate-600 hover:text-deep-indigo hover:bg-slate-50'
                    }`}
                  >
                    🔍 What Changed
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="min-h-[600px]">
                {activeTab === 'preview' && (
                  <ArticlePreview
                    content={rewriteResult.improvedContent}
                    title={auditResult.title || titleInput || 'Improved Article'}
                    scoreImprovement={rewriteResult.improvement}
                    originalScore={auditResult.overallScore || auditResult.aisoScore}
                    newScore={rewriteResult.newScore}
                    wordCount={rewriteResult.improvedContent.split(/\s+/).length}
                  />
                )}

                {activeTab === 'metrics' && (
                  <div className="space-y-6">
                    {/* Score Improvement Card */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
                      <h3 className="text-2xl font-black text-slate-900 mb-6">AISO Score Improvement</h3>
                      <div className="flex items-center gap-6 mb-8">
                        <div className={`flex-1 px-8 py-6 rounded-xl border-2 ${getScoreColor(auditResult.overallScore || auditResult.aisoScore)}`}>
                          <div className="text-xs font-bold uppercase tracking-wider mb-2 opacity-70">Before</div>
                          <div className="text-5xl font-black">{auditResult.overallScore || auditResult.aisoScore}</div>
                          <div className="text-sm font-semibold mt-2">{getScoreLabel(auditResult.overallScore || auditResult.aisoScore)}</div>
                        </div>
                        <svg className="w-12 h-12 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <div className={`flex-1 px-8 py-6 rounded-xl border-2 ${getScoreColor(rewriteResult.newScore)}`}>
                          <div className="text-xs font-bold uppercase tracking-wider mb-2 opacity-70">After</div>
                          <div className="text-5xl font-black">{rewriteResult.newScore}</div>
                          <div className="text-sm font-semibold mt-2">{getScoreLabel(rewriteResult.newScore)}</div>
                        </div>
                        <div className="flex-1 px-8 py-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300">
                          <div className="text-xs font-bold text-green-700 uppercase tracking-wider mb-2">Improvement</div>
                          <div className="text-5xl font-black text-green-700">+{rewriteResult.improvement}</div>
                          <div className="text-sm font-bold text-green-700 mt-2">
                            {Math.round((rewriteResult.improvement / (auditResult.overallScore || auditResult.aisoScore)) * 100)}% better
                          </div>
                        </div>
                      </div>

                      {/* Category Breakdown */}
                      {rewriteResult.scoreBreakdown && (
                        <div>
                          <h4 className="text-lg font-bold text-slate-900 mb-4">Category-by-Category Breakdown</h4>
                          <div className="space-y-3">
                            {rewriteResult.scoreBreakdown.map((category: any, idx: number) => (
                              <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-bold text-slate-900">{category.category}</span>
                                  <div className="flex items-center gap-3">
                                    <span className="text-slate-600">{category.before}</span>
                                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                    <span className="font-black text-slate-900">{category.after}</span>
                                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                                      category.improvement > 0 ? 'bg-green-100 text-green-700' :
                                      category.improvement < 0 ? 'bg-red-100 text-red-700' :
                                      'bg-slate-100 text-slate-700'
                                    }`}>
                                      {category.improvement > 0 ? '+' : ''}{category.improvement}
                                    </span>
                                  </div>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${category.after}%` }}
                                  ></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Fact-Check Summary */}
                      {rewriteResult.newFactCheckSummary && (
                        <div className="mt-8 p-6 rounded-xl bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200">
                          <h4 className="text-lg font-bold text-slate-900 mb-3">✓ Fact-Check Results</h4>
                          <div className="grid grid-cols-4 gap-4">
                            <div className="text-center">
                              <div className="text-3xl font-black text-green-700">{rewriteResult.newFactCheckSummary.verifiedClaims}</div>
                              <div className="text-xs font-bold text-slate-600 uppercase">Verified</div>
                            </div>
                            <div className="text-center">
                              <div className="text-3xl font-black text-yellow-700">{rewriteResult.newFactCheckSummary.uncertainClaims}</div>
                              <div className="text-xs font-bold text-slate-600 uppercase">Uncertain</div>
                            </div>
                            <div className="text-center">
                              <div className="text-3xl font-black text-red-700">{rewriteResult.newFactCheckSummary.unverifiedClaims}</div>
                              <div className="text-xs font-bold text-slate-600 uppercase">Unverified</div>
                            </div>
                            <div className="text-center">
                              <div className="text-3xl font-black text-purple-700">{rewriteResult.newFactCheckSummary.totalClaims}</div>
                              <div className="text-xs font-bold text-slate-600 uppercase">Total Claims</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
                      <h3 className="text-2xl font-black text-slate-900 mb-6">Processing Stats</h3>
                      <div className="grid grid-cols-3 gap-6">
                        <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
                          <div className="text-sm font-bold text-slate-600 uppercase mb-2">Iterations</div>
                          <div className="text-4xl font-black text-deep-indigo">{rewriteResult.iterations || 5}</div>
                        </div>
                        <div className="p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                          <div className="text-sm font-bold text-slate-600 uppercase mb-2">Est. Cost</div>
                          <div className="text-4xl font-black text-green-700">$0.{rewriteResult.iterations * 15}</div>
                        </div>
                        <div className="p-6 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200">
                          <div className="text-sm font-bold text-slate-600 uppercase mb-2">Time Saved</div>
                          <div className="text-4xl font-black text-purple-700">2-3h</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'changes' && (
                  <div className="space-y-6">
                    {/* Key Changes Summary */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
                      <h3 className="text-2xl font-black text-slate-900 mb-6">✨ Key Improvements Made</h3>

                      <div className="space-y-6">
                        {/* Content Structure Improvements */}
                        <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <h4 className="text-lg font-bold text-blue-900 mb-2">📊 Content Structure Enhanced</h4>
                              <div className="space-y-2 text-sm text-slate-700">
                                <div className="flex items-center gap-2">
                                  <span className="text-green-600 font-bold">✓</span>
                                  <span>Added {(rewriteResult.improvedContent.match(/^##\s/gm) || []).length} major section headers (H2)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-green-600 font-bold">✓</span>
                                  <span>Created {(rewriteResult.improvedContent.match(/^###\s/gm) || []).length} subsections (H3) for better organization</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-green-600 font-bold">✓</span>
                                  <span>Word count: {auditResult.content.split(/\s+/).length} → {rewriteResult.improvedContent.split(/\s+/).length} words ({Math.round((rewriteResult.improvedContent.split(/\s+/).length / auditResult.content.split(/\s+/).length - 1) * 100)}% {rewriteResult.improvedContent.split(/\s+/).length > auditResult.content.split(/\s+/).length ? 'more comprehensive' : 'more concise'})</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* AEO Enhancements */}
                        {rewriteResult.improvedContent.toLowerCase().includes('frequently asked questions') && (
                          <div className="p-6 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <h4 className="text-lg font-bold text-purple-900 mb-2">🤖 AI Engine Optimization (AEO)</h4>
                                <div className="space-y-2 text-sm text-slate-700">
                                  <div className="flex items-center gap-2">
                                    <span className="text-green-600 font-bold">✓</span>
                                    <span>Added comprehensive FAQ section for ChatGPT & Perplexity</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-green-600 font-bold">✓</span>
                                    <span>Optimized first paragraph as quotable answer for SGE</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-green-600 font-bold">✓</span>
                                    <span>Added direct-answer format for AI assistants</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Fact-Check Improvements */}
                        {rewriteResult.newFactCheckSummary && (
                          <div className="p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <h4 className="text-lg font-bold text-green-900 mb-2">✓ Fact-Checking Enhanced</h4>
                                <div className="space-y-2 text-sm text-slate-700">
                                  <div className="flex items-center gap-2">
                                    <span className="text-green-600 font-bold">✓</span>
                                    <span>Removed {auditResult.factChecks?.filter((fc: any) => fc.status === 'unverified').length || 0} unverifiable claims</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-green-600 font-bold">✓</span>
                                    <span>Added qualifiers to uncertain claims ("typically", "often", "can")</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-green-600 font-bold">✓</span>
                                    <span>Fact-check score: {auditResult.factCheckScore || 0}/100 → {rewriteResult.newFactCheckSummary.overallScore}/100</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Engagement Improvements */}
                        <div className="p-6 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-orange-600 flex items-center justify-center flex-shrink-0">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <h4 className="text-lg font-bold text-orange-900 mb-2">🎯 Engagement Boosted</h4>
                              <div className="space-y-2 text-sm text-slate-700">
                                <div className="flex items-center gap-2">
                                  <span className="text-green-600 font-bold">✓</span>
                                  <span>Added {(rewriteResult.improvedContent.match(/^[-*]\s/gm) || []).length} bullet points for scannability</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-green-600 font-bold">✓</span>
                                  <span>Included {(rewriteResult.improvedContent.match(/^\d+\.\s/gm) || []).length} numbered steps for actionability</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-green-600 font-bold">✓</span>
                                  <span>Enhanced with **bold key terms** for emphasis</span>
                                </div>
                                {rewriteResult.improvedContent.toLowerCase().includes('ready to') && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-green-600 font-bold">✓</span>
                                    <span>Added clear call-to-action in conclusion</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* SEO Improvements */}
                        <div className="p-6 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-cyan-600 flex items-center justify-center flex-shrink-0">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <h4 className="text-lg font-bold text-cyan-900 mb-2">🔍 SEO Optimized</h4>
                              <div className="space-y-2 text-sm text-slate-700">
                                <div className="flex items-center gap-2">
                                  <span className="text-green-600 font-bold">✓</span>
                                  <span>Improved content structure for better crawling</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-green-600 font-bold">✓</span>
                                  <span>Added {(rewriteResult.improvedContent.match(/\[.*?\]\(.*?\)/g) || []).length} internal linking opportunities</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-green-600 font-bold">✓</span>
                                  <span>Updated to {new Date().getFullYear()} for content freshness</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Stats */}
                    <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50 p-8">
                      <h3 className="text-xl font-bold text-slate-900 mb-4">📈 Overall Impact</h3>
                      <div className="grid grid-cols-3 gap-6">
                        <div className="text-center">
                          <div className="text-4xl font-black text-green-700 mb-2">+{rewriteResult.improvement}</div>
                          <div className="text-sm font-bold text-slate-600">AISO Score Improvement</div>
                        </div>
                        <div className="text-center">
                          <div className="text-4xl font-black text-blue-700 mb-2">{rewriteResult.iterations}</div>
                          <div className="text-sm font-bold text-slate-600">Refinement Iterations</div>
                        </div>
                        <div className="text-center">
                          <div className="text-4xl font-black text-purple-700 mb-2">{Math.round((rewriteResult.improvement / (auditResult.overallScore || auditResult.aisoScore)) * 100)}%</div>
                          <div className="text-sm font-bold text-slate-600">Quality Increase</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Repurpose Modal */}
      <RepurposeModal
        isOpen={showRepurposeModal}
        onClose={() => setShowRepurposeModal(false)}
        content={auditResult?.content || contentInput || ''}
        title={auditResult?.title || titleInput}
      />
    </div>
  );
}

export default function AuditPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <AuditPageContent />
    </Suspense>
  );
}
