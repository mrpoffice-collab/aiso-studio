'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardNav from '@/components/DashboardNav';

interface Analytics {
  total_audits: number;
  unique_ips: number;
  unique_domains: number;
  converted_count: number;
  domain_owner_conversions: number;
  agency_conversions: number;
  conversion_rate: number;
}

interface DailyStats {
  date: string;
  audits: number;
  unique_users: number;
  conversions: number;
}

interface Domain {
  domain: string;
  audit_count: number;
  unique_auditors: number;
  conversions: number;
  avg_seo_score: number;
  avg_readability_score: number;
}

interface Audit {
  id: number;
  ip_address: string;
  domain: string;
  url: string;
  created_at: string;
  converted: boolean;
  converted_user_email: string;
  converted_user_name: string;
  subscription_tier: string;
  is_domain_owner: boolean;
  audit_data: any;
}

export default function FreeAuditAnalyticsPage() {
  const [view, setView] = useState<'overview' | 'audits' | 'domains' | 'issues'>('overview');
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [audits, setAudits] = useState<Audit[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [view]);

  const fetchData = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/free-audit-analytics?view=${view}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch analytics');
      }

      if (view === 'overview') {
        setAnalytics(result.data.summary);
        setDailyStats(result.data.dailyStats || []);
      } else if (view === 'audits') {
        setAudits(result.data.audits || []);
      } else if (view === 'domains') {
        setDomains(result.data.domains || []);
      } else if (view === 'issues') {
        setIssues(result.data.issues || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav />
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-slate-900">Free Audit Analytics</h1>
              <p className="text-slate-600 mt-1">Marketing and conversion analysis for free audits</p>
            </div>
            <Link
              href="/dashboard/admin"
              className="text-sm font-semibold text-slate-600 hover:text-sunset-orange transition-colors"
            >
              ← Back to Admin
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-slate-200">
          <button
            onClick={() => setView('overview')}
            className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
              view === 'overview'
                ? 'border-sunset-orange text-sunset-orange'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setView('audits')}
            className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
              view === 'audits'
                ? 'border-sunset-orange text-sunset-orange'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            All Audits
          </button>
          <button
            onClick={() => setView('domains')}
            className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
              view === 'domains'
                ? 'border-sunset-orange text-sunset-orange'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Top Domains
          </button>
          <button
            onClick={() => setView('issues')}
            className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
              view === 'issues'
                ? 'border-sunset-orange text-sunset-orange'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Scoring Issues
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 font-semibold">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-sunset-orange border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-600 mt-4">Loading analytics...</p>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {view === 'overview' && analytics && (
              <div className="space-y-8">
                {/* Summary Cards */}
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <div className="text-sm font-semibold text-slate-500 mb-2">Total Audits</div>
                    <div className="text-3xl font-black text-slate-900">{analytics.total_audits.toLocaleString()}</div>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <div className="text-sm font-semibold text-slate-500 mb-2">Unique Users (IPs)</div>
                    <div className="text-3xl font-black text-slate-900">{analytics.unique_ips.toLocaleString()}</div>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <div className="text-sm font-semibold text-slate-500 mb-2">Conversions</div>
                    <div className="text-3xl font-black text-green-600">{analytics.converted_count.toLocaleString()}</div>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <div className="text-sm font-semibold text-slate-500 mb-2">Conversion Rate</div>
                    <div className="text-3xl font-black text-sunset-orange">{analytics.conversion_rate}%</div>
                  </div>
                </div>

                {/* Conversion Breakdown */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Conversion Type</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Domain Owners</span>
                        <span className="font-bold text-slate-900">{analytics.domain_owner_conversions}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Agencies/Consultants</span>
                        <span className="font-bold text-slate-900">{analytics.agency_conversions}</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <p className="text-xs text-slate-500">
                        Domain owners have email domains matching audited URLs. Agencies audit client sites.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Key Insights</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm text-slate-600">Avg Audits per User</div>
                        <div className="text-2xl font-bold text-slate-900">
                          {(analytics.total_audits / analytics.unique_ips).toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-600">Unique Domains Audited</div>
                        <div className="text-2xl font-bold text-slate-900">
                          {analytics.unique_domains.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Daily Stats Table */}
                {dailyStats.length > 0 && (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-200">
                      <h3 className="text-lg font-bold text-slate-900">Last 30 Days</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="text-left p-4 text-sm font-semibold text-slate-700">Date</th>
                            <th className="text-right p-4 text-sm font-semibold text-slate-700">Audits</th>
                            <th className="text-right p-4 text-sm font-semibold text-slate-700">Unique Users</th>
                            <th className="text-right p-4 text-sm font-semibold text-slate-700">Conversions</th>
                            <th className="text-right p-4 text-sm font-semibold text-slate-700">Conv. Rate</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dailyStats.map((day, i) => (
                            <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                              <td className="p-4 text-sm text-slate-900">{new Date(day.date).toLocaleDateString()}</td>
                              <td className="p-4 text-sm text-slate-900 text-right">{day.audits}</td>
                              <td className="p-4 text-sm text-slate-900 text-right">{day.unique_users}</td>
                              <td className="p-4 text-sm text-green-600 text-right font-semibold">{day.conversions}</td>
                              <td className="p-4 text-sm text-sunset-orange text-right font-semibold">
                                {day.unique_users > 0 ? ((day.conversions / day.unique_users) * 100).toFixed(1) : '0'}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Audits Tab */}
            {view === 'audits' && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900">All Free Audits</h3>
                  <p className="text-sm text-slate-600 mt-1">Showing most recent 100 audits</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left p-4 text-sm font-semibold text-slate-700">Date</th>
                        <th className="text-left p-4 text-sm font-semibold text-slate-700">Domain</th>
                        <th className="text-left p-4 text-sm font-semibold text-slate-700">IP</th>
                        <th className="text-left p-4 text-sm font-semibold text-slate-700">Converted</th>
                        <th className="text-left p-4 text-sm font-semibold text-slate-700">User Type</th>
                        <th className="text-left p-4 text-sm font-semibold text-slate-700">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {audits.map((audit) => (
                        <tr key={audit.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="p-4 text-xs text-slate-600">
                            {new Date(audit.created_at).toLocaleDateString()}
                          </td>
                          <td className="p-4 text-sm text-slate-900 max-w-xs truncate">
                            {audit.domain}
                          </td>
                          <td className="p-4 text-xs font-mono text-slate-600">{audit.ip_address}</td>
                          <td className="p-4">
                            {audit.converted ? (
                              <div>
                                <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                                  ✓ Yes
                                </span>
                                {audit.converted_user_email && (
                                  <div className="text-xs text-slate-600 mt-1">{audit.converted_user_email}</div>
                                )}
                              </div>
                            ) : (
                              <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">
                                No
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-sm">
                            {audit.converted && (
                              <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                                audit.is_domain_owner
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-purple-100 text-purple-700'
                              }`}>
                                {audit.is_domain_owner ? 'Owner' : 'Agency'}
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-sm font-semibold">
                            {audit.audit_data?.scores?.overallScore || 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Domains Tab */}
            {view === 'domains' && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900">Top Audited Domains</h3>
                  <p className="text-sm text-slate-600 mt-1">Most frequently audited domains and their conversion rates</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left p-4 text-sm font-semibold text-slate-700">Domain</th>
                        <th className="text-right p-4 text-sm font-semibold text-slate-700">Audits</th>
                        <th className="text-right p-4 text-sm font-semibold text-slate-700">Unique Users</th>
                        <th className="text-right p-4 text-sm font-semibold text-slate-700">Conversions</th>
                        <th className="text-right p-4 text-sm font-semibold text-slate-700">Avg SEO</th>
                        <th className="text-right p-4 text-sm font-semibold text-slate-700">Avg Read.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {domains.map((domain, i) => (
                        <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="p-4 text-sm text-slate-900 font-semibold">{domain.domain}</td>
                          <td className="p-4 text-sm text-slate-900 text-right">{domain.audit_count}</td>
                          <td className="p-4 text-sm text-slate-900 text-right">{domain.unique_auditors}</td>
                          <td className="p-4 text-sm text-green-600 text-right font-semibold">{domain.conversions}</td>
                          <td className="p-4 text-sm text-slate-900 text-right">
                            {domain.avg_seo_score ? Math.round(domain.avg_seo_score) : 'N/A'}
                          </td>
                          <td className="p-4 text-sm text-slate-900 text-right">
                            {domain.avg_readability_score ? Math.round(domain.avg_readability_score) : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Issues Tab */}
            {view === 'issues' && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900">Scoring Issues</h3>
                  <p className="text-sm text-slate-600 mt-1">Pages with any score component below 30 (potential scoring problems)</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left p-4 text-sm font-semibold text-slate-700">URL</th>
                        <th className="text-right p-4 text-sm font-semibold text-slate-700">SEO</th>
                        <th className="text-right p-4 text-sm font-semibold text-slate-700">Readability</th>
                        <th className="text-right p-4 text-sm font-semibold text-slate-700">Engagement</th>
                        <th className="text-left p-4 text-sm font-semibold text-slate-700">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {issues.map((issue, i) => (
                        <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="p-4 text-sm text-slate-900 max-w-md truncate">
                            <a href={issue.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              {issue.domain}
                            </a>
                          </td>
                          <td className={`p-4 text-sm text-right font-semibold ${
                            issue.scores?.seo < 30 ? 'text-red-600' : 'text-slate-900'
                          }`}>
                            {issue.scores?.seo || 'N/A'}
                          </td>
                          <td className={`p-4 text-sm text-right font-semibold ${
                            issue.scores?.readability < 30 ? 'text-red-600' : 'text-slate-900'
                          }`}>
                            {issue.scores?.readability || 'N/A'}
                          </td>
                          <td className={`p-4 text-sm text-right font-semibold ${
                            issue.scores?.engagement < 30 ? 'text-red-600' : 'text-slate-900'
                          }`}>
                            {issue.scores?.engagement || 'N/A'}
                          </td>
                          <td className="p-4 text-xs text-slate-600">
                            {new Date(issue.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
