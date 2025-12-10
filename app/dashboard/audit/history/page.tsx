'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardNav from '@/components/DashboardNav';

interface Audit {
  id: string | number;
  type: 'content' | 'site';
  url: string;
  title: string | null;
  score: number;
  originalScore?: number;
  improvedScore?: number;
  iterations?: number;
  pagesFound?: number;
  imagesFound?: number;
  status: string;
  strategyId?: string;
  createdAt: string;
  completedAt?: string;
}

export default function AuditHistory() {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'content' | 'site'>('all');

  useEffect(() => {
    fetchAudits();
  }, []);

  const fetchAudits = async () => {
    try {
      const response = await fetch('/api/audits');
      if (!response.ok) throw new Error('Failed to fetch audits');

      const data = await response.json();
      setAudits(data.audits);
    } catch (err) {
      setError('Failed to load audit history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getScoreColor = (score: number | null | undefined) => {
    if (score === null || score === undefined) return 'text-slate-400';
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Completed</span>;
      case 'crawling':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">In Progress</span>;
      case 'failed':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">Failed</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  const filteredAudits = filter === 'all'
    ? audits
    : audits.filter(a => a.type === filter);

  return (
    <div className="min-h-screen bg-warm-white">
      <DashboardNav />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            href="/dashboard/audit"
            className="text-sunset-orange hover:underline flex items-center gap-2 mb-4"
          >
            ← Back to Audit
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-slate-900">Audit History</h1>
              <p className="text-slate-600 mt-2">View your past content and site audits</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  filter === 'all'
                    ? 'bg-sunset-orange text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                All ({audits.length})
              </button>
              <button
                onClick={() => setFilter('content')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  filter === 'content'
                    ? 'bg-sunset-orange text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Content ({audits.filter(a => a.type === 'content').length})
              </button>
              <button
                onClick={() => setFilter('site')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  filter === 'site'
                    ? 'bg-sunset-orange text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Site ({audits.filter(a => a.type === 'site').length})
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-sunset-orange border-t-transparent"></div>
            <p className="text-slate-600 mt-4">Loading audits...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-800 font-bold">{error}</p>
          </div>
        ) : filteredAudits.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-12 text-center">
            <p className="text-slate-600 text-lg">
              {filter === 'all'
                ? 'No audits yet. Start by auditing some content!'
                : `No ${filter} audits found.`}
            </p>
            <Link
              href="/dashboard/audit"
              className="mt-4 inline-block px-6 py-3 bg-sunset-orange text-white rounded-lg hover:bg-opacity-90"
            >
              Audit Content
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAudits.map((audit) => (
              <div
                key={`${audit.type}-${audit.id}`}
                className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {/* Type Badge */}
                      <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                        audit.type === 'site'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {audit.type === 'site' ? 'Site Audit' : 'Content Audit'}
                      </span>
                      {getStatusBadge(audit.status)}
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      {audit.title || 'Untitled Audit'}
                    </h3>
                    <p className="text-sm text-slate-600 mb-3 truncate">{audit.url}</p>

                    <div className="flex items-center gap-6 text-sm">
                      {/* Score Display */}
                      <div>
                        <span className="text-slate-600">
                          {audit.type === 'site' ? 'Avg Score: ' : 'Original: '}
                        </span>
                        <span className={`font-bold ${getScoreColor(audit.type === 'site' ? audit.score : audit.originalScore)}`}>
                          {audit.type === 'site' ? (audit.score ?? 'N/A') : (audit.originalScore ?? 'N/A')}
                        </span>
                      </div>

                      {/* Improved Score (content audits only) */}
                      {audit.type === 'content' && audit.improvedScore && (
                        <>
                          <span className="text-slate-400">→</span>
                          <div>
                            <span className="text-slate-600">Improved: </span>
                            <span className={`font-bold ${getScoreColor(audit.improvedScore)}`}>
                              {audit.improvedScore}
                            </span>
                          </div>
                          <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-bold">
                            +{audit.improvedScore - (audit.originalScore || 0)}
                          </div>
                        </>
                      )}

                      {/* Site Audit Stats */}
                      {audit.type === 'site' && (
                        <>
                          <div className="text-slate-600">
                            <span className="font-semibold">{audit.pagesFound || 0}</span> pages
                          </div>
                          <div className="text-slate-600">
                            <span className="font-semibold">{audit.imagesFound || 0}</span> images
                          </div>
                        </>
                      )}

                      {/* Iterations (content audits) */}
                      {audit.type === 'content' && audit.iterations !== undefined && (
                        <div className="text-slate-500">
                          {audit.iterations} {audit.iterations === 1 ? 'iteration' : 'iterations'}
                        </div>
                      )}

                      {/* AI Badge */}
                      <div className="px-3 py-1 bg-gradient-to-r from-sunset-orange to-deep-indigo text-white rounded-full font-bold text-xs flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        AI-Analyzed
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="text-sm text-slate-500">
                      {formatDate(audit.createdAt)}
                    </div>

                    {/* View Details Link */}
                    {audit.type === 'site' && audit.strategyId && audit.status === 'completed' && (
                      <Link
                        href={`/dashboard/strategies/${audit.strategyId}?tab=audit`}
                        className="text-sm text-sunset-orange hover:underline font-semibold"
                      >
                        View Details →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
