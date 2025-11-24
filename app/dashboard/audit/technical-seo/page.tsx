'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardNav from '@/components/DashboardNav';
import TechnicalSEOResults from '@/components/TechnicalSEOResults';
import Link from 'next/link';

interface UserData {
  subscriptionTier: string;
  isAgency: boolean;
  agencyStatus?: string;
}

function TechnicalSEOAuditContent() {
  const searchParams = useSearchParams();
  const [url, setUrl] = useState(searchParams.get('url') || '');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [pastAudits, setPastAudits] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  // Fetch user data on mount
  useEffect(() => {
    fetch('/api/user/profile')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUserData({
            subscriptionTier: data.user.subscription_tier || 'trial',
            isAgency: data.user.agency_id !== null,
            agencyStatus: data.user.agency_status
          });
        }
      })
      .catch(err => console.error('Failed to load user data:', err));
  }, []);

  const handleScan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!url.trim()) {
      setError('Please enter a URL to scan');
      return;
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      setError('Please enter a valid URL (including https://)');
      return;
    }

    setIsScanning(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/audit/technical-seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to run technical SEO audit');
      }

      setResult(data.audit);
    } catch (err: any) {
      setError(err.message || 'An error occurred while scanning');
    } finally {
      setIsScanning(false);
    }
  };

  const loadPastAudits = async () => {
    try {
      const response = await fetch('/api/audit/technical-seo?limit=10');
      const data = await response.json();
      if (response.ok && data.audits) {
        setPastAudits(data.audits);
        setShowHistory(true);
      }
    } catch (err) {
      console.error('Failed to load past audits:', err);
    }
  };

  const loadAudit = (audit: any) => {
    setResult({
      ...audit,
      agencyCanFix: audit.agencyCanFix || { count: 0, estimatedCost: '$0', issues: [] },
      ownerMustChange: audit.ownerMustChange || { count: 0, issues: [] },
      checks: audit.checks || {},
      recommendations: audit.recommendations || [],
    });
    setUrl(audit.url);
    setShowHistory(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <DashboardNav />

      <main className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Link
              href="/dashboard/audit"
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              ← Back to Audits
            </Link>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            AI Searchability Diagnostic
          </h1>
          <p className="text-lg text-slate-600">
            Check if your website is visible to ChatGPT, Perplexity, and other AI search engines.
            Get actionable fixes categorized by who can implement them.
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🤖</span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 mb-2">What This Diagnostic Checks:</h3>
              <ul className="text-sm text-slate-700 space-y-1">
                <li>• <strong>Agency Can Fix:</strong> robots.txt, JavaScript rendering, schema markup, page speed, sitemaps (billable services $500-$5K each)</li>
                <li>• <strong>Owner Must Change:</strong> paywall, CAPTCHA, platform limitations, rate limiting (business decisions)</li>
                <li>• <strong>AI Searchability Score:</strong> How visible your content is to ChatGPT, Claude, Perplexity, and Google SGE</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Scan Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 mb-8">
          <form onSubmit={handleScan} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Enter Website URL
              </label>
              <div className="flex gap-3">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="flex-1 rounded-lg border-2 border-slate-200 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  disabled={isScanning}
                />
                <button
                  type="submit"
                  disabled={isScanning}
                  className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 font-semibold text-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 whitespace-nowrap"
                >
                  {isScanning ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Scanning...
                    </span>
                  ) : (
                    'Run Diagnostic'
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                <strong>Unlimited diagnostics</strong> on your plan. Checks 14 different AI searchability factors.
              </p>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border-2 border-red-200 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="flex items-center gap-4 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={loadPastAudits}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                📋 View Past Diagnostics
              </button>
            </div>
          </form>
        </div>

        {/* Past Audits History */}
        {showHistory && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Past Diagnostics</h2>
              <button
                onClick={() => setShowHistory(false)}
                className="text-sm text-slate-600 hover:text-slate-900"
              >
                ✕ Close
              </button>
            </div>

            {pastAudits.length === 0 ? (
              <p className="text-slate-600 text-center py-8">No past diagnostics found.</p>
            ) : (
              <div className="space-y-3">
                {pastAudits.map((audit) => (
                  <div
                    key={audit.id}
                    className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => loadAudit(audit)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 mb-1">{audit.url}</p>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <span>Overall: <strong>{audit.overallScore}</strong></span>
                          <span>AI Searchability: <strong>{audit.aiSearchabilityScore}</strong></span>
                          <span>Technical SEO: <strong>{audit.technicalSeoScore}</strong></span>
                        </div>
                      </div>
                      <div className="text-right text-xs text-slate-500">
                        {new Date(audit.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    {audit.agencyFixableCount > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-200">
                        <span className="text-xs font-semibold text-green-600">
                          💰 {audit.agencyFixableCount} billable fix{audit.agencyFixableCount !== 1 ? 'es' : ''} found
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="animate-in fade-in duration-500">
            <TechnicalSEOResults
              result={result}
              userData={userData}
            />
          </div>
        )}

        {/* Empty State */}
        {!result && !isScanning && !showHistory && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Ready to Check AI Searchability
            </h3>
            <p className="text-slate-600">
              Enter a URL above to discover if ChatGPT and other AI search engines can access your content.
            </p>
          </div>
        )}

        {/* Conditional Features Grid - Only show if no results or user is not signed in */}
        {!result && userData && (
          <div className="mt-12">
            {userData.isAgency && userData.agencyStatus === 'certified' ? (
              /* Certified Agency */
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-8">
                <h3 className="text-xl font-bold text-slate-900 mb-3">💼 Your Agency Benefits</h3>
                <ul className="text-sm text-slate-700 space-y-2">
                  <li>• See exact billable opportunities ($5K-$10K per diagnostic)</li>
                  <li>• Get time and cost estimates for client proposals</li>
                  <li>• Know what you can fix vs what needs owner action</li>
                  <li>• Access lead referrals from AISO Studio marketplace</li>
                </ul>
              </div>
            ) : userData.isAgency && userData.agencyStatus === 'pending' ? (
              /* Pending Agency */
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-8">
                <h3 className="text-xl font-bold text-slate-900 mb-3">⏳ Agency Application Pending</h3>
                <p className="text-sm text-slate-700 mb-4">
                  Your agency certification is being reviewed. Once approved, you'll be able to receive lead referrals
                  and appear in our marketplace directory.
                </p>
                <p className="text-xs text-slate-600">
                  You can still use the diagnostic tool to identify billable opportunities with your existing clients.
                </p>
              </div>
            ) : userData.subscriptionTier === 'trial' ? (
              /* Trial User - Upsell */
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-8">
                <h3 className="text-xl font-bold text-slate-900 mb-3">🚀 Upgrade for More Features</h3>
                <ul className="text-sm text-slate-700 space-y-2 mb-4">
                  <li>• <strong>Unlimited</strong> AI searchability diagnostics</li>
                  <li>• Track multiple websites and projects</li>
                  <li>• Get matched with certified agencies for fixes</li>
                  <li>• Priority support and implementation guidance</li>
                </ul>
                <Link
                  href="/dashboard/settings"
                  className="inline-block rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-bold text-white shadow-md hover:shadow-lg transition-all hover:scale-105"
                >
                  View Plans →
                </Link>
              </div>
            ) : (
              /* Paid User - Agency Matching */
              <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-8">
                <h3 className="text-xl font-bold text-slate-900 mb-3">🔧 Need Help Fixing Issues?</h3>
                <p className="text-sm text-slate-700 mb-4">
                  Get matched with certified agencies who specialize in AI searchability fixes.
                  See cost estimates before committing to anything.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/find-agency"
                    className="flex-1 text-center rounded-lg bg-gradient-to-r from-orange-600 to-red-600 px-6 py-3 font-bold text-white shadow-md hover:shadow-lg transition-all hover:scale-105"
                  >
                    Find an Agency
                  </Link>
                  <a
                    href="mailto:support@aiso.studio?subject=Help%20With%20AI%20Searchability%20Fixes"
                    className="flex-1 text-center rounded-lg border-2 border-orange-600 bg-white px-6 py-3 font-bold text-orange-600 hover:bg-orange-50 transition-all"
                  >
                    Contact Support
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function TechnicalSEOAuditPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-600">Loading diagnostic tool...</p>
        </div>
      </div>
    }>
      <TechnicalSEOAuditContent />
    </Suspense>
  );
}
