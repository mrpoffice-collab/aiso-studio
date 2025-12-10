'use client';

import { useState, useEffect } from 'react';

interface AuditResultsProps {
  strategyId: string;
  clientName?: string;
}

interface Audit {
  id: string;
  site_url: string;
  status: string;
  pages_found: number;
  images_found: number;
  avg_aiso_score: number;
  started_at: string;
  completed_at: string;
}

interface Page {
  id: string;
  url: string;
  title: string;
  meta_description: string;
  word_count: number;
  aiso_score: number;
  aeo_score: number;
  seo_score: number;
  readability_score: number;
  engagement_score: number;
  flesch_score: number;
}

interface Image {
  id: string;
  url: string;
  alt_text: string;
  source_page_url: string;
  context: string;
}

// Score breakdown modal component
function ScoreBreakdownModal({
  isOpen,
  onClose,
  pages,
  avgScore
}: {
  isOpen: boolean;
  onClose: () => void;
  pages: Page[];
  avgScore: number;
}) {
  if (!isOpen) return null;

  // Calculate averages for each category
  const avgAeo = pages.length > 0 ? Math.round(pages.reduce((sum, p) => sum + p.aeo_score, 0) / pages.length) : 0;
  const avgSeo = pages.length > 0 ? Math.round(pages.reduce((sum, p) => sum + p.seo_score, 0) / pages.length) : 0;
  const avgReadability = pages.length > 0 ? Math.round(pages.reduce((sum, p) => sum + p.readability_score, 0) / pages.length) : 0;
  const avgEngagement = pages.length > 0 ? Math.round(pages.reduce((sum, p) => sum + p.engagement_score, 0) / pages.length) : 0;
  const avgFlesch = pages.length > 0 ? Math.round(pages.reduce((sum, p) => sum + p.flesch_score, 0) / pages.length) : 0;

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 70) return 'bg-green-100';
    if (score >= 50) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    if (score >= 30) return 'Needs Work';
    return 'Poor';
  };

  const categories = [
    {
      name: 'AEO (AI Engine Optimization)',
      score: avgAeo,
      weight: '30%',
      description: 'How well content is optimized for AI search engines like ChatGPT, Perplexity, and Google AI Overviews.',
      tips: avgAeo < 50 ? ['Add FAQ sections', 'Include statistics and data', 'Use clear definitions', 'Add how-to steps'] : []
    },
    {
      name: 'SEO (Search Engine Optimization)',
      score: avgSeo,
      weight: '20%',
      description: 'Traditional search engine factors like headers, meta tags, links, and images.',
      tips: avgSeo < 50 ? ['Add H2/H3 headers', 'Improve meta descriptions', 'Add internal links', 'Optimize images with alt text'] : []
    },
    {
      name: 'Readability',
      score: avgReadability,
      weight: '25%',
      description: `Content reading level and clarity. Average Flesch score: ${avgFlesch} (higher = easier to read).`,
      tips: avgReadability < 50 ? ['Shorten sentences', 'Use simpler words', 'Break up long paragraphs', 'Add bullet points'] : []
    },
    {
      name: 'Engagement',
      score: avgEngagement,
      weight: '25%',
      description: 'Elements that keep readers engaged: hooks, CTAs, questions, formatting variety.',
      tips: avgEngagement < 50 ? ['Add a compelling hook', 'Include call-to-actions', 'Use questions', 'Add bullet/numbered lists'] : []
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">AISO Score Breakdown</h2>
              <p className="text-blue-100 mt-1">Understanding your site's performance</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold">{avgScore}</div>
              <div className="text-sm text-blue-100">Overall Score</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Formula explanation */}
          <div className="bg-slate-50 rounded-xl p-4">
            <h3 className="font-bold text-slate-700 mb-2">How AISO Score is Calculated</h3>
            <p className="text-sm text-slate-600">
              AISO Score = AEO (30%) + SEO (20%) + Readability (25%) + Engagement (25%)
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Based on average scores across {pages.length} pages analyzed.
            </p>
          </div>

          {/* Category breakdown */}
          {categories.map((cat) => (
            <div key={cat.name} className="border rounded-xl overflow-hidden">
              <div className="p-4 bg-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800">{cat.name}</h3>
                  <p className="text-xs text-slate-500">Weight: {cat.weight}</p>
                </div>
                <div className={`px-4 py-2 rounded-lg font-bold text-2xl ${getScoreBg(cat.score)} ${getScoreColor(cat.score)}`}>
                  {cat.score}
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-slate-600 mb-2">{cat.description}</p>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${cat.score >= 70 ? 'bg-green-500' : cat.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${cat.score}%` }}
                    />
                  </div>
                  <span className={`text-sm font-medium ${getScoreColor(cat.score)}`}>
                    {getScoreLabel(cat.score)}
                  </span>
                </div>
                {cat.tips.length > 0 && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs font-bold text-blue-800 mb-1">Quick Improvements:</p>
                    <ul className="text-xs text-blue-700 space-y-1">
                      {cat.tips.map((tip, i) => (
                        <li key={i}>• {tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Top/Bottom pages */}
          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-xl p-4">
              <h3 className="font-bold text-green-700 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                Top Performing Pages
              </h3>
              <ul className="space-y-2">
                {pages.slice(0, 3).map((page) => (
                  <li key={page.id} className="text-sm">
                    <span className={`font-bold ${getScoreColor(page.aiso_score)}`}>{page.aiso_score}</span>
                    <span className="text-slate-600 ml-2 truncate">{page.title || page.url}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border rounded-xl p-4">
              <h3 className="font-bold text-red-700 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                Needs Improvement
              </h3>
              <ul className="space-y-2">
                {[...pages].sort((a, b) => a.aiso_score - b.aiso_score).slice(0, 3).map((page) => (
                  <li key={page.id} className="text-sm">
                    <span className={`font-bold ${getScoreColor(page.aiso_score)}`}>{page.aiso_score}</span>
                    <span className="text-slate-600 ml-2 truncate">{page.title || page.url}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-100 p-4 rounded-b-2xl border-t">
          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AuditResults({ strategyId, clientName }: AuditResultsProps) {
  const [audit, setAudit] = useState<Audit | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPages, setShowPages] = useState(false);
  const [showImages, setShowImages] = useState(false);
  const [savingToPipeline, setSavingToPipeline] = useState(false);
  const [savedToPipeline, setSavedToPipeline] = useState(false);
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);

  useEffect(() => {
    fetchAuditResults();
  }, [strategyId]);

  const fetchAuditResults = async () => {
    try {
      const response = await fetch(`/api/strategies/${strategyId}/audit`);
      const data = await response.json();

      if (data.audit) {
        setAudit(data.audit);
        setPages(data.pages || []);
        setImages(data.images || []);
      }
    } catch (error) {
      console.error('Failed to fetch audit results:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToPipeline = async () => {
    if (!audit) return;

    setSavingToPipeline(true);
    try {
      // Extract domain from URL
      const url = new URL(audit.site_url);
      const domain = url.hostname.replace('www.', '');

      // Calculate scores for the lead
      const avgAeo = pages.length > 0
        ? Math.round(pages.reduce((sum, p) => sum + p.aeo_score, 0) / pages.length)
        : 0;
      const avgSeo = pages.length > 0
        ? Math.round(pages.reduce((sum, p) => sum + p.seo_score, 0) / pages.length)
        : 0;
      const avgReadability = pages.length > 0
        ? Math.round(pages.reduce((sum, p) => sum + p.readability_score, 0) / pages.length)
        : 0;
      const avgEngagement = pages.length > 0
        ? Math.round(pages.reduce((sum, p) => sum + p.engagement_score, 0) / pages.length)
        : 0;

      // Collect issues from all pages
      const allIssues: string[] = [];
      pages.forEach(page => {
        if (page.aeo_score < 50) allIssues.push(`Poor AEO on ${page.title || page.url}`);
        if (page.seo_score < 50) allIssues.push(`SEO issues on ${page.title || page.url}`);
        if (page.word_count < 300) allIssues.push(`Thin content on ${page.title || page.url}`);
      });

      // Determine opportunity type based on score
      const overallScore = audit.avg_aiso_score;
      let opportunityType = 'content_optimization';
      if (overallScore < 30) opportunityType = 'full_rebuild';
      else if (overallScore < 50) opportunityType = 'major_improvements';
      else if (overallScore < 70) opportunityType = 'content_optimization';
      else opportunityType = 'maintenance';

      const response = await fetch('/api/leads/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain,
          business_name: clientName || domain,
          overall_score: audit.avg_aiso_score,
          content_score: avgAeo,
          seo_score: avgSeo,
          design_score: avgReadability,
          speed_score: avgEngagement,
          seoIssues: allIssues.slice(0, 10), // Limit to 10 issues
          opportunityType,
          technicalSEO: avgSeo,
          onPageSEO: avgSeo,
          contentMarketing: avgAeo,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save to pipeline');
      }

      setSavedToPipeline(true);
    } catch (error) {
      console.error('Failed to save to pipeline:', error);
      alert('Failed to save to pipeline. Please try again.');
    } finally {
      setSavingToPipeline(false);
    }
  };

  if (loading) {
    return null;
  }

  if (!audit) {
    return null;
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 70) return 'bg-green-50 border-green-200';
    if (score >= 50) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="mb-8 rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-lg">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-600 text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Website Audit Results</h2>
            <p className="text-sm text-slate-600 mt-1">
              {audit.status === 'completed'
                ? `Completed ${new Date(audit.completed_at).toLocaleString()}`
                : `Status: ${audit.status}`
              }
            </p>
          </div>
        </div>

        {/* Save to Pipeline Button */}
        {audit.status === 'completed' && (
          <div>
            {savedToPipeline ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Added to Pipeline
              </div>
            ) : (
              <button
                onClick={handleSaveToPipeline}
                disabled={savingToPipeline}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sunset-orange to-deep-indigo text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {savingToPipeline ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Save to Pipeline
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl bg-white border-2 border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-slate-600">Pages Found</p>
              <p className="text-3xl font-bold text-slate-900">{audit.pages_found}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white border-2 border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-slate-600">Images Found</p>
              <p className="text-3xl font-bold text-slate-900">{audit.images_found}</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowScoreBreakdown(true)}
          className={`rounded-xl border-2 p-4 ${getScoreBg(audit.avg_aiso_score)} hover:shadow-lg transition-all cursor-pointer text-left w-full`}
        >
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-slate-600">Avg AISO Score</p>
              <p className={`text-3xl font-bold ${getScoreColor(audit.avg_aiso_score)}`}>
                {audit.avg_aiso_score}/100
              </p>
              <p className="text-xs text-slate-500 mt-1">Click for breakdown</p>
            </div>
          </div>
        </button>
      </div>

      {/* Pages Section */}
      <div className="mb-4">
        <button
          onClick={() => setShowPages(!showPages)}
          className="w-full flex items-center justify-between p-4 rounded-xl bg-white border-2 border-slate-200 hover:border-blue-300 transition-all"
        >
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="font-bold text-slate-900">Discovered Pages ({pages.length})</span>
          </div>
          <svg
            className={`w-5 h-5 text-slate-600 transition-transform ${showPages ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showPages && (
          <div className="mt-3 space-y-3">
            {pages.map((page) => {
              // Identify issues for this page
              const issues: string[] = [];
              if (page.aiso_score < 50) issues.push('Low overall AISO score');
              if (page.word_count < 300) issues.push('Content too short (< 300 words)');
              if (page.word_count > 3000) issues.push('Content may be too long (> 3000 words)');
              if (page.aeo_score < 50) issues.push('Poor AEO - not optimized for AI search');
              if (page.seo_score < 50) issues.push('Low SEO score - may need better header structure');
              if (page.readability_score < 50) issues.push('Hard to read - complex sentences');
              if (page.engagement_score < 50) issues.push('Low engagement - needs hooks/CTAs');
              if (page.flesch_score < 30) issues.push('Very difficult to read (Flesch < 30)');
              // Only flag missing meta description if it's truly empty/null
              const hasMeta = page.meta_description && page.meta_description.trim().length > 0;
              if (!hasMeta) {
                issues.push('Missing meta description');
              } else if (page.meta_description.length < 120) {
                issues.push('Meta description too short (< 120 chars)');
              } else if (page.meta_description.length > 180) {
                issues.push('Meta description too long (> 180 chars)');
              }
              if (!page.title || page.title.trim() === '') {
                issues.push('Missing page title');
              }

              // Recommendations based on scores
              const recommendations: string[] = [];
              if (page.aeo_score < 60) recommendations.push('Add FAQ section for AI engines');
              if (page.seo_score < 60) recommendations.push('Add H2/H3 headers to structure content');
              if (page.readability_score < 60) recommendations.push('Shorten sentences, simplify language');
              if (page.engagement_score < 60) recommendations.push('Add bullet points, CTAs, and hooks');
              if (page.word_count < 500) recommendations.push('Expand content to 800+ words');

              return (
                <div key={page.id} className="p-4 rounded-xl bg-white border-2 border-slate-200">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 mb-1">{page.title || '(No title)'}</h4>
                      <a
                        href={page.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline break-all"
                      >
                        {page.url}
                      </a>
                      {page.meta_description && (
                        <p className="text-sm text-slate-600 mt-2 italic">"{page.meta_description}"</p>
                      )}
                    </div>
                    <div className={`ml-4 px-4 py-2 rounded-lg font-bold text-lg ${getScoreBg(page.aiso_score)}`}>
                      <span className={getScoreColor(page.aiso_score)}>{page.aiso_score}</span>
                      <span className="text-xs text-slate-500">/100</span>
                    </div>
                  </div>

                  {/* Score breakdown with visual bars */}
                  <div className="grid grid-cols-5 gap-2 mt-4 mb-3">
                    <div className="text-center">
                      <div className="text-xs font-bold text-slate-500 mb-1">AEO</div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className={`h-full ${page.aeo_score >= 70 ? 'bg-green-500' : page.aeo_score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${page.aeo_score}%` }}></div>
                      </div>
                      <div className={`text-sm font-bold ${getScoreColor(page.aeo_score)}`}>{page.aeo_score}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-bold text-slate-500 mb-1">SEO</div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className={`h-full ${page.seo_score >= 70 ? 'bg-green-500' : page.seo_score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${page.seo_score}%` }}></div>
                      </div>
                      <div className={`text-sm font-bold ${getScoreColor(page.seo_score)}`}>{page.seo_score}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-bold text-slate-500 mb-1">Read</div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className={`h-full ${page.readability_score >= 70 ? 'bg-green-500' : page.readability_score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${page.readability_score}%` }}></div>
                      </div>
                      <div className={`text-sm font-bold ${getScoreColor(page.readability_score)}`}>{page.readability_score}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-bold text-slate-500 mb-1">Engage</div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className={`h-full ${page.engagement_score >= 70 ? 'bg-green-500' : page.engagement_score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${page.engagement_score}%` }}></div>
                      </div>
                      <div className={`text-sm font-bold ${getScoreColor(page.engagement_score)}`}>{page.engagement_score}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-bold text-slate-500 mb-1">Words</div>
                      <div className="text-sm font-bold text-slate-700">{page.word_count}</div>
                      <div className="text-xs text-slate-500">Flesch: {page.flesch_score}</div>
                    </div>
                  </div>

                  {/* Issues identified */}
                  {issues.length > 0 && (
                    <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200">
                      <p className="text-xs font-bold text-red-800 mb-2 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Issues Found ({issues.length})
                      </p>
                      <ul className="text-xs text-red-700 space-y-1">
                        {issues.map((issue, idx) => (
                          <li key={idx} className="flex items-start gap-1">
                            <span className="text-red-500">•</span> {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendations */}
                  {recommendations.length > 0 && (
                    <div className="mt-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
                      <p className="text-xs font-bold text-blue-800 mb-2 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        Quick Fixes
                      </p>
                      <ul className="text-xs text-blue-700 space-y-1">
                        {recommendations.slice(0, 3).map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-1">
                            <span className="text-blue-500">→</span> {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="mt-3 flex gap-2">
                    <a
                      href={`/dashboard/audit?url=${encodeURIComponent(page.url)}`}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors"
                    >
                      Deep Audit
                    </a>
                    <a
                      href={page.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                    >
                      View Page ↗
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Images Section */}
      {images.length > 0 && (
        <div>
          <button
            onClick={() => setShowImages(!showImages)}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-white border-2 border-slate-200 hover:border-purple-300 transition-all"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-bold text-slate-900">Discovered Images ({images.length})</span>
            </div>
            <svg
              className={`w-5 h-5 text-slate-600 transition-transform ${showImages ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showImages && (
            <div className="mt-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {images.map((image) => (
                <div key={image.id} className="p-3 rounded-xl bg-white border-2 border-slate-200">
                  <div className="aspect-square rounded-lg bg-slate-100 mb-2 overflow-hidden">
                    <img
                      src={image.url}
                      alt={image.alt_text || 'Image'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  </div>
                  <p className="text-xs text-slate-600 truncate" title={image.alt_text}>
                    {image.alt_text || 'No alt text'}
                  </p>
                  {image.context && (
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
                      {image.context}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Score Breakdown Modal */}
      <ScoreBreakdownModal
        isOpen={showScoreBreakdown}
        onClose={() => setShowScoreBreakdown(false)}
        pages={pages}
        avgScore={audit.avg_aiso_score}
      />
    </div>
  );
}
