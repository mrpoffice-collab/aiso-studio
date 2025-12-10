'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Search, Plus, Play, Trash2, ExternalLink, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

// Admin emails - must match server-side check
const ADMIN_EMAILS = ['mrpoffice@gmail.com', 'kim@aliidesign.com'];

interface Monitor {
  id: string;
  url: string;
  domain: string;
  business_name: string | null;
  industry: string | null;
  target_keywords: string[];
  is_active: boolean;
  check_frequency: string;
  last_checked_at: string | null;
  created_at: string;
  stats?: {
    total_checks: number;
    total_citations: number;
    avg_position: number | null;
  };
}

interface CheckResult {
  query: string;
  wasCited: boolean;
  citationType: string;
  citationPosition: number | null;
  allCitations: string[];
  responseSnippet: string;
}

interface QuickCheckResult {
  url: string;
  domain: string;
  businessName?: string;
  keywords: string[];
  results: CheckResult[];
  score: {
    score: number;
    totalChecks: number;
    totalCitations: number;
    citationRate: number;
    avgPosition: number | null;
    breakdown: {
      directLinks: number;
      domainMatches: number;
      brandMentions: number;
    };
  };
}

export default function AIVisibilityPage() {
  const { user, isLoaded } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickCheckResult, setQuickCheckResult] = useState<QuickCheckResult | null>(null);
  const [checking, setChecking] = useState(false);

  // Quick check form
  const [quickUrl, setQuickUrl] = useState('');
  const [quickKeywords, setQuickKeywords] = useState('');
  const [quickBusinessName, setQuickBusinessName] = useState('');
  const [quickIndustry, setQuickIndustry] = useState('');
  const [quickLocation, setQuickLocation] = useState('');

  // New monitor form
  const [showNewMonitor, setShowNewMonitor] = useState(false);
  const [newMonitorUrl, setNewMonitorUrl] = useState('');
  const [newMonitorKeywords, setNewMonitorKeywords] = useState('');
  const [newMonitorBusinessName, setNewMonitorBusinessName] = useState('');
  const [newMonitorIndustry, setNewMonitorIndustry] = useState('');

  useEffect(() => {
    if (isLoaded && user) {
      const email = user.primaryEmailAddress?.emailAddress;
      if (email && ADMIN_EMAILS.includes(email)) {
        setIsAdmin(true);
        fetchData();
      } else {
        setLoading(false);
      }
    }
  }, [isLoaded, user]);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/ai-visibility');
      if (res.ok) {
        const data = await res.json();
        setMonitors(data.monitors || []);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const runQuickCheck = async () => {
    if (!quickUrl || !quickKeywords) return;

    setChecking(true);
    setQuickCheckResult(null);

    try {
      const keywords = quickKeywords.split(',').map((k) => k.trim()).filter(Boolean);

      const res = await fetch('/api/admin/ai-visibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'quick-check',
          url: quickUrl,
          keywords,
          businessName: quickBusinessName || undefined,
          industry: quickIndustry || undefined,
          location: quickLocation || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setQuickCheckResult(data);
      } else {
        const error = await res.json();
        alert(error.error || 'Check failed');
      }
    } catch (error) {
      console.error('Quick check failed:', error);
      alert('Failed to run check');
    } finally {
      setChecking(false);
    }
  };

  const createMonitor = async () => {
    if (!newMonitorUrl) return;

    try {
      const keywords = newMonitorKeywords.split(',').map((k) => k.trim()).filter(Boolean);

      const res = await fetch('/api/admin/ai-visibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-monitor',
          url: newMonitorUrl,
          keywords,
          businessName: newMonitorBusinessName || undefined,
          industry: newMonitorIndustry || undefined,
        }),
      });

      if (res.ok) {
        setShowNewMonitor(false);
        setNewMonitorUrl('');
        setNewMonitorKeywords('');
        setNewMonitorBusinessName('');
        setNewMonitorIndustry('');
        fetchData();
      }
    } catch (error) {
      console.error('Failed to create monitor:', error);
    }
  };

  const runMonitorCheck = async (monitorId: string) => {
    try {
      const res = await fetch('/api/admin/ai-visibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'run-check',
          monitorId,
        }),
      });

      if (res.ok) {
        fetchData();
        alert('Check completed!');
      }
    } catch (error) {
      console.error('Failed to run check:', error);
    }
  };

  const deleteMonitor = async (monitorId: string) => {
    if (!confirm('Delete this monitor?')) return;

    try {
      const res = await fetch(`/api/admin/ai-visibility?id=${monitorId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  // Not admin - show nothing (secret page)
  if (isLoaded && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Page not found</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-sm w-fit mb-2">
          <AlertTriangle className="w-4 h-4" />
          Internal Only - Not Visible to Users
        </div>
        <h1 className="text-3xl font-black text-slate-900">AI Visibility Tracker</h1>
        <p className="text-slate-600 mt-1">
          Check if URLs appear in AI search results (Perplexity)
        </p>
      </div>

      {/* Quick Check Section */}
      <div className="bg-white rounded-xl border-2 border-slate-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Search className="w-5 h-5" />
          Quick Check (Lead Gen Proof)
        </h2>
        <p className="text-slate-600 text-sm mb-4">
          Run a one-time check to see if a prospect's site appears in AI search results.
          Use this to show gaps in their AI visibility.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              URL to Check *
            </label>
            <input
              type="text"
              value={quickUrl}
              onChange={(e) => setQuickUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Keywords (comma-separated) *
            </label>
            <input
              type="text"
              value={quickKeywords}
              onChange={(e) => setQuickKeywords(e.target.value)}
              placeholder="seo agency, digital marketing"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Business Name (optional)
            </label>
            <input
              type="text"
              value={quickBusinessName}
              onChange={(e) => setQuickBusinessName(e.target.value)}
              placeholder="Acme Marketing"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Industry (optional)
            </label>
            <input
              type="text"
              value={quickIndustry}
              onChange={(e) => setQuickIndustry(e.target.value)}
              placeholder="healthcare"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Location (optional)
            </label>
            <input
              type="text"
              value={quickLocation}
              onChange={(e) => setQuickLocation(e.target.value)}
              placeholder="Houston, TX"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <button
          onClick={runQuickCheck}
          disabled={checking || !quickUrl || !quickKeywords}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {checking ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              Checking...
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              Run Quick Check
            </>
          )}
        </button>

        {/* Quick Check Results */}
        {quickCheckResult && (
          <div className="mt-6 border-t border-slate-200 pt-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Results</h3>

            {/* Score Card */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-slate-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-black text-indigo-600">
                  {quickCheckResult.score.score}
                </div>
                <div className="text-sm text-slate-600">Visibility Score</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-black text-slate-900">
                  {quickCheckResult.score.totalCitations}/{quickCheckResult.score.totalChecks}
                </div>
                <div className="text-sm text-slate-600">Citations</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-black text-slate-900">
                  {quickCheckResult.score.citationRate}%
                </div>
                <div className="text-sm text-slate-600">Citation Rate</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-black text-slate-900">
                  {quickCheckResult.score.avgPosition || '-'}
                </div>
                <div className="text-sm text-slate-600">Avg Position</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 text-center">
                <div className="text-sm font-medium text-slate-900">
                  {quickCheckResult.score.breakdown.directLinks} direct
                </div>
                <div className="text-sm font-medium text-slate-900">
                  {quickCheckResult.score.breakdown.domainMatches} domain
                </div>
                <div className="text-sm font-medium text-slate-900">
                  {quickCheckResult.score.breakdown.brandMentions} brand
                </div>
              </div>
            </div>

            {/* Individual Results */}
            <div className="space-y-3">
              {quickCheckResult.results.map((result, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-lg border-2 ${
                    result.wasCited
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {result.wasCited ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                        <span className="font-medium text-slate-900">
                          "{result.query}"
                        </span>
                      </div>
                      {result.wasCited && (
                        <div className="text-sm text-slate-600 ml-7">
                          {result.citationType === 'direct_link' && 'Direct link citation'}
                          {result.citationType === 'domain_match' && 'Domain match'}
                          {result.citationType === 'brand_mention' && 'Brand mentioned'}
                          {result.citationPosition && ` (Position #${result.citationPosition})`}
                        </div>
                      )}
                    </div>
                    {result.allCitations.length > 0 && (
                      <div className="text-xs text-slate-500">
                        {result.allCitations.length} sources cited
                      </div>
                    )}
                  </div>
                  {result.responseSnippet && (
                    <div className="mt-2 text-sm text-slate-600 bg-white/50 p-2 rounded ml-7">
                      {result.responseSnippet}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Monitors Section */}
      <div className="bg-white rounded-xl border-2 border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">Tracked URLs</h2>
          <button
            onClick={() => setShowNewMonitor(!showNewMonitor)}
            className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Monitor
          </button>
        </div>

        {/* New Monitor Form */}
        {showNewMonitor && (
          <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                value={newMonitorUrl}
                onChange={(e) => setNewMonitorUrl(e.target.value)}
                placeholder="URL to monitor"
                className="px-3 py-2 border border-slate-300 rounded-lg"
              />
              <input
                type="text"
                value={newMonitorKeywords}
                onChange={(e) => setNewMonitorKeywords(e.target.value)}
                placeholder="Keywords (comma-separated)"
                className="px-3 py-2 border border-slate-300 rounded-lg"
              />
              <input
                type="text"
                value={newMonitorBusinessName}
                onChange={(e) => setNewMonitorBusinessName(e.target.value)}
                placeholder="Business name"
                className="px-3 py-2 border border-slate-300 rounded-lg"
              />
              <input
                type="text"
                value={newMonitorIndustry}
                onChange={(e) => setNewMonitorIndustry(e.target.value)}
                placeholder="Industry"
                className="px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <button
              onClick={createMonitor}
              disabled={!newMonitorUrl}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              Create Monitor
            </button>
          </div>
        )}

        {/* Monitors List */}
        {monitors.length === 0 ? (
          <p className="text-slate-500 text-center py-8">
            No monitors yet. Add one to start tracking AI visibility over time.
          </p>
        ) : (
          <div className="space-y-3">
            {monitors.map((monitor) => (
              <div
                key={monitor.id}
                className="p-4 border border-slate-200 rounded-lg hover:border-slate-300"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <a
                        href={monitor.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-indigo-600 hover:underline flex items-center gap-1"
                      >
                        {monitor.domain}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      {monitor.business_name && (
                        <span className="text-slate-500">({monitor.business_name})</span>
                      )}
                    </div>
                    <div className="text-sm text-slate-600 mt-1">
                      Keywords: {monitor.target_keywords?.join(', ') || 'None'}
                    </div>
                    {monitor.stats && (
                      <div className="text-sm text-slate-500 mt-1">
                        {monitor.stats.total_citations}/{monitor.stats.total_checks} citations
                        {monitor.stats.avg_position && ` (avg pos: ${monitor.stats.avg_position})`}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => runMonitorCheck(monitor.id)}
                      className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                      title="Run check now"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteMonitor(monitor.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {monitor.last_checked_at && (
                  <div className="text-xs text-slate-400 mt-2">
                    Last checked: {new Date(monitor.last_checked_at).toLocaleString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-bold text-blue-900 mb-2">How to Use</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li><strong>Quick Check:</strong> Run a one-time check on a prospect's URL. Great for sales calls - show them their AI visibility gap.</li>
          <li><strong>Monitors:</strong> Track URLs over time to see trends. Good for client reporting (internal use for now).</li>
          <li><strong>Keywords:</strong> The more specific, the better. "radiology seo houston" beats "seo".</li>
          <li><strong>Cost:</strong> ~$0.005 per query (3 queries per keyword).</li>
        </ul>
      </div>
    </div>
  );
}
