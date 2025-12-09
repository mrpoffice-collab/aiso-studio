'use client';

import { useState } from 'react';
import DashboardNav from '@/components/DashboardNav';
import AISOMascot, { AISOMascotLoading } from '@/components/AISOMascot';
import { generateCompetitorComparisonPDF } from '@/lib/competitor-comparison-pdf';

interface AuditResult {
  url: string;
  success: boolean;
  error?: string;
  scores?: {
    overall: number;
    aeo: number;
    seo: number;
    readability: number;
    engagement: number;
    factCheck?: number;
  };
  title?: string;
  domain?: string;
}

interface ComparisonResult {
  target: AuditResult;
  competitors: AuditResult[];
  ranking: {
    position: number;
    total: number;
    scores: { url: string; score: number; isTarget: boolean }[];
  };
  insights: {
    winning: string[];
    losing: string[];
    opportunities: string[];
    salesPitch: string;
  };
}

interface DiscoveredCompetitor {
  domain: string;
  name: string;
  url: string;
}

export default function CompareAuditPage() {
  const [targetUrl, setTargetUrl] = useState('');
  const [competitorUrls, setCompetitorUrls] = useState(['', '', '']);
  const [loading, setLoading] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [discoveredCompetitors, setDiscoveredCompetitors] = useState<DiscoveredCompetitor[]>([]);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState('');

  const handleDiscoverCompetitors = async () => {
    if (!targetUrl) {
      setError('Please enter the target URL first');
      return;
    }

    setDiscovering(true);
    setError('');
    setDiscoveredCompetitors([]);

    try {
      const response = await fetch('/api/competitors/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to discover competitors');
      }

      if (data.competitors && data.competitors.length > 0) {
        setDiscoveredCompetitors(data.competitors);
        // Auto-fill the competitor URL fields
        const newUrls = ['', '', ''];
        data.competitors.slice(0, 3).forEach((comp: DiscoveredCompetitor, i: number) => {
          newUrls[i] = comp.url || `https://${comp.domain}`;
        });
        setCompetitorUrls(newUrls);
      } else {
        // Show specific error from API or generic message
        const errorMsg = data.error || 'No competitors found.';
        const suggestion = data.suggestion || 'Please enter competitor URLs manually.';
        setError(`${errorMsg} ${suggestion}`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDiscovering(false);
    }
  };

  const handleCompare = async () => {
    if (!targetUrl) {
      setError('Please enter the target URL');
      return;
    }

    const validCompetitors = competitorUrls.filter((url) => url.trim());
    if (validCompetitors.length === 0) {
      setError('Please enter at least one competitor URL');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/audit/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUrl,
          competitorUrls: validCompetitors,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Comparison failed');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <DashboardNav />

      <main className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900">Competitor Comparison</h1>
          <p className="text-slate-600 mt-1">
            Compare your prospect's site against their competitors for a powerful sales pitch
          </p>
        </div>

        {/* Input Form */}
        {!result && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm mb-8">
            <div className="grid gap-6">
              {/* Target URL */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Target URL (Your Prospect)
                </label>
                <input
                  type="url"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://prospect-website.com/blog-post"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Enter a specific blog post or page URL from your prospect's site
                </p>
              </div>

              {/* Competitor URLs */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-bold text-slate-700">
                    Competitor URLs (up to 3)
                  </label>
                  <button
                    type="button"
                    onClick={handleDiscoverCompetitors}
                    disabled={discovering || !targetUrl}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {discovering ? (
                      <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Discovering...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Auto-Discover
                      </>
                    )}
                  </button>
                </div>

                {/* Discovered Competitors Info */}
                {discoveredCompetitors.length > 0 && (
                  <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700 font-medium mb-2">
                      Found {discoveredCompetitors.length} competitors:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {discoveredCompetitors.map((comp, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                        >
                          {comp.name || comp.domain}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {competitorUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => {
                          const newUrls = [...competitorUrls];
                          newUrls[index] = e.target.value;
                          setCompetitorUrls(newUrls);
                          // Clear discovered competitors if user manually edits
                          if (discoveredCompetitors.length > 0) {
                            setDiscoveredCompetitors([]);
                          }
                        }}
                        placeholder={`https://competitor${index + 1}.com/similar-page`}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                      {discoveredCompetitors[index] && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                          {discoveredCompetitors[index].name}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Use Auto-Discover to find competitors automatically, or enter URLs manually
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                onClick={handleCompare}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? 'Analyzing...' : 'Compare Sites'}
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <AISOMascotLoading message="Analyzing all sites... This may take a minute" />
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="space-y-8">
            {/* Sales Pitch Card */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 text-white shadow-xl">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-2">Your Sales Pitch</h2>
                  <p className="text-white/90 text-lg leading-relaxed">
                    {result.insights.salesPitch}
                  </p>
                </div>
              </div>
            </div>

            {/* Ranking Overview */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4">AI Readiness Ranking</h3>
              <div className="space-y-3">
                {result.ranking.scores.map((item, index) => (
                  <div
                    key={item.url}
                    className={`flex items-center gap-4 p-4 rounded-xl border ${
                      item.isTarget
                        ? 'bg-orange-50 border-orange-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0
                          ? 'bg-yellow-500'
                          : index === 1
                          ? 'bg-slate-400'
                          : index === 2
                          ? 'bg-amber-600'
                          : 'bg-slate-300'
                      }`}
                    >
                      #{index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold truncate ${item.isTarget ? 'text-orange-700' : 'text-slate-700'}`}>
                        {new URL(item.url).hostname}
                        {item.isTarget && (
                          <span className="ml-2 text-xs bg-orange-200 text-orange-700 px-2 py-0.5 rounded-full">
                            TARGET
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-slate-500 truncate">{item.url}</p>
                    </div>
                    <div className={`text-2xl font-black ${getScoreColor(item.score).split(' ')[0]}`}>
                      {item.score}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Comparison Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900">Score Breakdown</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold text-slate-700">Metric</th>
                      <th className="text-center p-4 text-sm font-semibold text-orange-600">
                        Target
                      </th>
                      {result.competitors.map((comp, i) => (
                        <th key={i} className="text-center p-4 text-sm font-semibold text-slate-600">
                          Competitor {i + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { key: 'overall', label: 'Overall Score', icon: '🎯' },
                      { key: 'aeo', label: 'AI Answer Optimization', icon: '🤖' },
                      { key: 'seo', label: 'Search Engine Optimization', icon: '🔍' },
                      { key: 'readability', label: 'Content Readability', icon: '📖' },
                      { key: 'engagement', label: 'User Engagement', icon: '💡' },
                    ].map((metric) => (
                      <tr key={metric.key} className="hover:bg-slate-50">
                        <td className="p-4">
                          <span className="flex items-center gap-2 font-medium text-slate-700">
                            <span>{metric.icon}</span>
                            {metric.label}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          {result.target.success ? (
                            <span
                              className={`inline-block px-3 py-1 rounded-lg font-bold border ${getScoreColor(
                                result.target.scores?.[metric.key as keyof typeof result.target.scores] || 0
                              )}`}
                            >
                              {result.target.scores?.[metric.key as keyof typeof result.target.scores] || 0}
                            </span>
                          ) : (
                            <span className="text-red-500">Error</span>
                          )}
                        </td>
                        {result.competitors.map((comp, i) => (
                          <td key={i} className="p-4 text-center">
                            {comp.success ? (
                              <span
                                className={`inline-block px-3 py-1 rounded-lg font-bold border ${getScoreColor(
                                  comp.scores?.[metric.key as keyof typeof comp.scores] || 0
                                )}`}
                              >
                                {comp.scores?.[metric.key as keyof typeof comp.scores] || 0}
                              </span>
                            ) : (
                              <span className="text-red-500">Error</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Insights */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Winning Areas */}
              {result.insights.winning.length > 0 && (
                <div className="bg-green-50 rounded-2xl border border-green-200 p-6">
                  <h3 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Where Target Wins
                  </h3>
                  <ul className="space-y-2">
                    {result.insights.winning.map((item, i) => (
                      <li key={i} className="text-green-700 flex items-start gap-2">
                        <span className="text-green-500 mt-1">+</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Losing Areas */}
              {result.insights.losing.length > 0 && (
                <div className="bg-red-50 rounded-2xl border border-red-200 p-6">
                  <h3 className="text-lg font-bold text-red-800 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Where Target Loses
                  </h3>
                  <ul className="space-y-2">
                    {result.insights.losing.map((item, i) => (
                      <li key={i} className="text-red-700 flex items-start gap-2">
                        <span className="text-red-500 mt-1">-</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Opportunities */}
            {result.insights.opportunities.length > 0 && (
              <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6">
                <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Opportunities to Pitch
                </h3>
                <ul className="grid md:grid-cols-2 gap-3">
                  {result.insights.opportunities.map((item, i) => (
                    <li
                      key={i}
                      className="bg-white rounded-lg p-3 border border-blue-100 text-blue-700 flex items-start gap-2"
                    >
                      <span className="text-blue-500 mt-0.5">→</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setResult(null);
                  setTargetUrl('');
                  setCompetitorUrls(['', '', '']);
                }}
                className="px-6 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition"
              >
                New Comparison
              </button>
              <button
                onClick={() => {
                  if (!result) return;

                  const getDomain = (url: string) => {
                    try {
                      return new URL(url).hostname;
                    } catch {
                      return url;
                    }
                  };

                  generateCompetitorComparisonPDF({
                    target: {
                      url: result.target.url,
                      domain: getDomain(result.target.url),
                      isTarget: true,
                      overall: result.target.scores?.overall || 0,
                      aeo: result.target.scores?.aeo || 0,
                      seo: result.target.scores?.seo || 0,
                      readability: result.target.scores?.readability || 0,
                      engagement: result.target.scores?.engagement || 0,
                    },
                    competitors: result.competitors.map(comp => ({
                      url: comp.url,
                      domain: getDomain(comp.url),
                      isTarget: false,
                      overall: comp.scores?.overall || 0,
                      aeo: comp.scores?.aeo || 0,
                      seo: comp.scores?.seo || 0,
                      readability: comp.scores?.readability || 0,
                      engagement: comp.scores?.engagement || 0,
                    })),
                    ranking: {
                      position: result.ranking.position,
                      total: result.ranking.total,
                    },
                    insights: result.insights,
                  });
                }}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:shadow-lg transition"
              >
                Export to PDF
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
