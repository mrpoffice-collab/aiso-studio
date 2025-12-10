'use client';

import { useState } from 'react';
import Link from 'next/link';
import AIVisibilityButton from '@/components/AIVisibilityButton';

interface LeadResult {
  domain: string;
  businessName: string;
  city: string;
  state: string;
  overallScore: number;
  contentScore?: number;
  seoScore?: number;
  designScore?: number;
  speedScore?: number;
  technicalSEO: number;
  onPageSEO: number;
  contentMarketing: number;
  localSEO: number;
  hasBlog: boolean;
  blogPostCount: number;
  lastBlogUpdate?: string;
  phone?: string;
  address?: string;
  email?: string;
  opportunityRating: 'high' | 'medium' | 'low';
  seoIssues: Array<{
    category: string;
    issue: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    fix: string;
  }>;
  opportunityType?: 'missing-technical-seo' | 'no-content-strategy' | 'weak-local-seo' | 'needs-optimization';
}

interface LeadDiscoveryProps {
  onLeadSaved?: () => void;
}

export default function LeadDiscovery({ onLeadSaved }: LeadDiscoveryProps) {
  const [industry, setIndustry] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [limit, setLimit] = useState(15);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<LeadResult[]>([]);
  const [error, setError] = useState('');
  const [filterRange, setFilterRange] = useState<'all' | 'sweet-spot' | 'high' | 'low'>('sweet-spot');
  const [generatingReportFor, setGeneratingReportFor] = useState<string | null>(null);
  const [savingToPipeline, setSavingToPipeline] = useState<string | null>(null);
  const [savedLeads, setSavedLeads] = useState<Set<string>>(new Set());

  const handleSearch = async () => {
    if (!industry.trim() || !city.trim()) {
      setError('Please enter both industry and city');
      return;
    }

    setIsSearching(true);
    setError('');
    setResults([]);

    try {
      const response = await fetch('/api/leads/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ industry, city, state, limit }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to discover leads');
      }

      setResults(data.leads);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSearching(false);
    }
  };

  const handleGenerateReport = async (lead: LeadResult) => {
    setGeneratingReportFor(lead.domain);

    try {
      const response = await fetch('/api/leads/opportunity-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: lead.domain,
          businessName: lead.businessName,
          city: lead.city,
          state: lead.state,
          overallScore: lead.overallScore,
          technicalSEO: lead.technicalSEO,
          onPageSEO: lead.onPageSEO,
          contentMarketing: lead.contentMarketing,
          localSEO: lead.localSEO,
          seoIssues: lead.seoIssues,
          hasBlog: lead.hasBlog,
          blogPostCount: lead.blogPostCount,
          industry: industry,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate report');
      }

      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error('PDF generation returned empty file');
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Opportunity-Report-${lead.businessName.replace(/[^a-z0-9]/gi, '-')}.pdf`;
      document.body.appendChild(a);
      await new Promise(resolve => setTimeout(resolve, 100));
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 1000);
    } catch (err: any) {
      alert(`Failed to generate report: ${err.message}`);
    } finally {
      setGeneratingReportFor(null);
    }
  };

  const handleSaveToPipeline = async (lead: LeadResult) => {
    setSavingToPipeline(lead.domain);

    try {
      const response = await fetch('/api/leads/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: lead.domain,
          business_name: lead.businessName,
          city: lead.city,
          state: lead.state,
          industry: industry,
          overall_score: lead.overallScore,
          content_score: lead.contentScore,
          seo_score: lead.seoScore,
          design_score: lead.designScore,
          speed_score: lead.speedScore,
          has_blog: lead.hasBlog,
          blog_post_count: lead.blogPostCount,
          last_blog_update: lead.lastBlogUpdate,
          phone: lead.phone,
          address: lead.address,
          email: lead.email,
          opportunity_rating: lead.opportunityRating,
          seoIssues: lead.seoIssues,
          opportunityType: lead.opportunityType,
          technicalSEO: lead.technicalSEO,
          onPageSEO: lead.onPageSEO,
          contentMarketing: lead.contentMarketing,
          localSEO: lead.localSEO,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save lead');
      }

      setSavedLeads(prev => new Set(prev).add(lead.domain));
      onLeadSaved?.();
    } catch (err: any) {
      alert(`Failed to save lead: ${err.message}`);
    } finally {
      setSavingToPipeline(null);
    }
  };

  const getFilteredResults = () => {
    if (filterRange === 'all') return results;
    if (filterRange === 'sweet-spot') return results.filter(r => r.overallScore >= 45 && r.overallScore <= 70);
    if (filterRange === 'high') return results.filter(r => r.overallScore > 70);
    if (filterRange === 'low') return results.filter(r => r.overallScore < 45);
    return results;
  };

  const filteredResults = getFilteredResults();

  const getScoreColor = (score: number) => {
    if (score > 70) return 'text-green-700 bg-green-50 border-green-300';
    if (score >= 45) return 'text-orange-600 bg-orange-50 border-orange-300';
    return 'text-red-700 bg-red-50 border-red-300';
  };

  const getOpportunityBadge = (rating: string) => {
    if (rating === 'high') return { text: 'High Opportunity', color: 'bg-orange-100 text-orange-800 border-orange-300' };
    if (rating === 'medium') return { text: 'Medium Opportunity', color: 'bg-blue-100 text-blue-800 border-blue-300' };
    return { text: 'Low Priority', color: 'bg-slate-100 text-slate-600 border-slate-300' };
  };

  return (
    <div>
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm font-bold text-red-800">{error}</p>
        </div>
      )}

      {/* Search Form */}
      {!results.length && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl mb-8">
          <h2 className="text-2xl font-black text-slate-900 mb-6">Find Your Perfect Prospects</h2>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Industry / Business Type
              </label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g., dental clinics, law firms, plumbers"
                className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g., Phoenix, Chicago, Miami"
                className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                State (Optional)
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g., AZ, IL, FL"
                className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Number of Results (5-25)
              </label>
              <input
                type="number"
                min="5"
                max="25"
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value))}
                className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-slate-900"
              />
            </div>
          </div>

          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {isSearching ? (
              <>
                <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Discovering Leads...
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Discover Leads
              </>
            )}
          </button>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <>
          {/* Summary & Filters */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  Found {results.length} Prospects
                </h2>
                <p className="text-sm text-slate-600">
                  Showing {filteredResults.length} {filterRange === 'sweet-spot' ? 'sweet spot opportunities' : 'results'}
                </p>
              </div>
              <button
                onClick={() => {
                  setResults([]);
                  setIndustry('');
                  setCity('');
                  setState('');
                }}
                className="text-sm font-semibold text-slate-600 hover:text-purple-600"
              >
                New Search
              </button>
            </div>

            <div className="flex gap-2 flex-wrap">
              {(['sweet-spot', 'high', 'low', 'all'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setFilterRange(filter)}
                  className={`px-3 py-1.5 rounded-lg font-bold text-sm transition-all ${
                    filterRange === filter
                      ? filter === 'sweet-spot' ? 'bg-orange-100 text-orange-800 border-2 border-orange-300'
                      : filter === 'high' ? 'bg-green-100 text-green-800 border-2 border-green-300'
                      : filter === 'low' ? 'bg-red-100 text-red-800 border-2 border-red-300'
                      : 'bg-purple-100 text-purple-800 border-2 border-purple-300'
                      : 'bg-slate-100 text-slate-600 border-2 border-slate-200'
                  }`}
                >
                  {filter === 'sweet-spot' ? 'Sweet Spot (50-75)' :
                   filter === 'high' ? 'High (75+)' :
                   filter === 'low' ? 'Low (<50)' : 'All'}
                </button>
              ))}
            </div>
          </div>

          {/* Results List */}
          <div className="space-y-4">
            {filteredResults.map((lead, idx) => {
              const oppBadge = getOpportunityBadge(lead.opportunityRating);
              return (
                <div
                  key={idx}
                  className="p-5 rounded-xl border-2 border-slate-200 bg-white hover:border-purple-300 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-black text-slate-900">{lead.businessName}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${oppBadge.color}`}>
                          {oppBadge.text}
                        </span>
                      </div>
                      <a
                        href={`https://${lead.domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-purple-600 hover:text-purple-800 font-semibold"
                      >
                        {lead.domain}
                      </a>
                      <span className="text-sm text-slate-500 ml-2">
                        {lead.city}, {lead.state}
                      </span>
                    </div>

                    <div className={`text-2xl font-black px-3 py-1 rounded-lg border-2 ${getScoreColor(lead.overallScore)}`}>
                      {lead.overallScore}
                    </div>
                  </div>

                  {/* Score Breakdown */}
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    <div className="text-center p-2 rounded bg-slate-50">
                      <div className="text-lg font-bold text-slate-900">{lead.technicalSEO}</div>
                      <div className="text-xs text-slate-600">Technical</div>
                    </div>
                    <div className="text-center p-2 rounded bg-slate-50">
                      <div className="text-lg font-bold text-slate-900">{lead.onPageSEO}</div>
                      <div className="text-xs text-slate-600">On-Page</div>
                    </div>
                    <div className="text-center p-2 rounded bg-slate-50">
                      <div className="text-lg font-bold text-slate-900">{lead.contentMarketing}</div>
                      <div className="text-xs text-slate-600">Content</div>
                    </div>
                    <div className="text-center p-2 rounded bg-slate-50">
                      <div className="text-lg font-bold text-slate-900">{lead.localSEO}</div>
                      <div className="text-xs text-slate-600">Local</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {!savedLeads.has(lead.domain) ? (
                      <button
                        onClick={() => handleSaveToPipeline(lead)}
                        disabled={savingToPipeline === lead.domain}
                        className="flex-1 px-3 py-2 rounded-lg bg-green-600 text-white font-bold text-sm hover:bg-green-700 transition-all disabled:opacity-50 flex items-center justify-center gap-1"
                      >
                        {savingToPipeline === lead.domain ? 'Saving...' : '+ Add to Pipeline'}
                      </button>
                    ) : (
                      <div className="flex-1 px-3 py-2 rounded-lg bg-green-100 border-2 border-green-500 text-green-800 font-bold text-sm flex items-center justify-center">
                        Added
                      </div>
                    )}
                    {/* AI Visibility - Admin Only */}
                    <AIVisibilityButton
                      url={`https://${lead.domain}`}
                      keywords={[industry, `${industry} ${city}`]}
                      businessName={lead.businessName}
                      industry={industry}
                      location={`${city}${state ? `, ${state}` : ''}`}
                      variant="icon"
                    />
                    <button
                      onClick={() => handleGenerateReport(lead)}
                      disabled={generatingReportFor === lead.domain}
                      className="px-3 py-2 rounded-lg bg-orange-500 text-white font-bold text-sm hover:bg-orange-600 transition-all disabled:opacity-50"
                    >
                      {generatingReportFor === lead.domain ? '...' : 'PDF'}
                    </button>
                    <Link
                      href={`/dashboard/audit?url=https://${lead.domain}`}
                      className="px-3 py-2 rounded-lg bg-purple-600 text-white font-bold text-sm hover:bg-purple-700 transition-all"
                    >
                      Audit
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
