'use client';

import { useState, useEffect } from 'react';
import DashboardNav from '@/components/DashboardNav';
import { AISOMascotLoading } from '@/components/AISOMascot';
import Link from 'next/link';

interface ClientHealth {
  id: number;
  business_name: string;
  domain: string;
  industry: string | null;
  status: string;
  overall_score: number | null;
  estimated_monthly_value: number | null;
  last_audit_date: string | null;
  total_audits: number;
  total_strategies: number;
  total_emails: number;
  health: {
    status: 'healthy' | 'attention' | 'at-risk' | 'new';
    reason: string;
    daysSinceLastAudit: number | null;
    score: number;
  };
}

interface Summary {
  total: number;
  healthy: number;
  attention: number;
  atRisk: number;
  new: number;
  totalMRR: number;
  avgScore: number;
}

export default function ClientHealthDashboard() {
  const [clients, setClients] = useState<ClientHealth[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadClientHealth();
  }, []);

  const loadClientHealth = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/clients/health');
      if (response.ok) {
        const data = await response.json();
        setClients(data.clients || []);
        setSummary(data.summary || null);
      }
    } catch (err) {
      console.error('Failed to load client health:', err);
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'attention':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'at-risk':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'new':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return '✓';
      case 'attention':
        return '!';
      case 'at-risk':
        return '⚠';
      case 'new':
        return '★';
      default:
        return '•';
    }
  };

  const filteredClients = filter === 'all'
    ? clients
    : clients.filter((c) => c.health.status === filter);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <DashboardNav />
        <main className="container mx-auto px-6 py-12">
          <AISOMascotLoading message="Loading client health..." />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <DashboardNav />

      <main className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900">Client Health Dashboard</h1>
          <p className="text-slate-600 mt-1">
            Monitor client status and identify accounts that need attention
          </p>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
            <button
              onClick={() => setFilter('all')}
              className={`p-4 rounded-xl border transition ${
                filter === 'all'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="text-3xl font-black">{summary.total}</div>
              <div className="text-sm opacity-80">Total Clients</div>
            </button>

            <button
              onClick={() => setFilter('healthy')}
              className={`p-4 rounded-xl border transition ${
                filter === 'healthy'
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-green-50 border-green-200 hover:border-green-300'
              }`}
            >
              <div className={`text-3xl font-black ${filter === 'healthy' ? 'text-white' : 'text-green-600'}`}>
                {summary.healthy}
              </div>
              <div className={`text-sm ${filter === 'healthy' ? 'text-green-100' : 'text-green-600'}`}>Healthy</div>
            </button>

            <button
              onClick={() => setFilter('attention')}
              className={`p-4 rounded-xl border transition ${
                filter === 'attention'
                  ? 'bg-yellow-500 text-white border-yellow-500'
                  : 'bg-yellow-50 border-yellow-200 hover:border-yellow-300'
              }`}
            >
              <div className={`text-3xl font-black ${filter === 'attention' ? 'text-white' : 'text-yellow-600'}`}>
                {summary.attention}
              </div>
              <div className={`text-sm ${filter === 'attention' ? 'text-yellow-100' : 'text-yellow-600'}`}>Attention</div>
            </button>

            <button
              onClick={() => setFilter('at-risk')}
              className={`p-4 rounded-xl border transition ${
                filter === 'at-risk'
                  ? 'bg-red-600 text-white border-red-600'
                  : 'bg-red-50 border-red-200 hover:border-red-300'
              }`}
            >
              <div className={`text-3xl font-black ${filter === 'at-risk' ? 'text-white' : 'text-red-600'}`}>
                {summary.atRisk}
              </div>
              <div className={`text-sm ${filter === 'at-risk' ? 'text-red-100' : 'text-red-600'}`}>At Risk</div>
            </button>

            <button
              onClick={() => setFilter('new')}
              className={`p-4 rounded-xl border transition ${
                filter === 'new'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-blue-50 border-blue-200 hover:border-blue-300'
              }`}
            >
              <div className={`text-3xl font-black ${filter === 'new' ? 'text-white' : 'text-blue-600'}`}>
                {summary.new}
              </div>
              <div className={`text-sm ${filter === 'new' ? 'text-blue-100' : 'text-blue-600'}`}>New</div>
            </button>

            <div className="p-4 rounded-xl bg-white border border-slate-200">
              <div className="text-3xl font-black text-slate-900">
                ${summary.totalMRR.toLocaleString()}
              </div>
              <div className="text-sm text-slate-600">Total MRR</div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200">
              <div className="text-3xl font-black text-slate-900">{summary.avgScore}</div>
              <div className="text-sm text-slate-600">Avg Score</div>
            </div>
          </div>
        )}

        {/* Client List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              {filter === 'all' ? 'All Clients' : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Clients`}
              <span className="ml-2 text-sm font-normal text-slate-500">({filteredClients.length})</span>
            </h2>
            <Link
              href="/dashboard/clients"
              className="text-sm text-orange-600 hover:underline"
            >
              View All Clients →
            </Link>
          </div>

          {filteredClients.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-slate-500">No clients in this category</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  className="p-4 hover:bg-slate-50 transition flex items-center gap-4"
                >
                  {/* Health Status Badge */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold border ${getHealthColor(
                      client.health.status
                    )}`}
                  >
                    {getHealthIcon(client.health.status)}
                  </div>

                  {/* Client Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900 truncate">{client.business_name}</h3>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded border ${getHealthColor(client.health.status)}`}>
                        {client.health.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 truncate">{client.domain}</p>
                    <p className="text-xs text-slate-400 mt-1">{client.health.reason}</p>
                  </div>

                  {/* Stats */}
                  <div className="hidden md:flex items-center gap-6 text-center">
                    <div>
                      <div className="text-lg font-bold text-slate-900">{client.health.score}</div>
                      <div className="text-xs text-slate-500">Score</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-slate-900">{client.total_audits}</div>
                      <div className="text-xs text-slate-500">Audits</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-slate-900">{client.total_strategies}</div>
                      <div className="text-xs text-slate-500">Strategies</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-slate-900">
                        ${(client.estimated_monthly_value || 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-500">MRR</div>
                    </div>
                  </div>

                  {/* Last Audit */}
                  <div className="hidden lg:block text-right">
                    <div className="text-sm font-medium text-slate-700">
                      {client.last_audit_date
                        ? new Date(client.last_audit_date).toLocaleDateString()
                        : 'Never'}
                    </div>
                    <div className="text-xs text-slate-500">Last Audit</div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/audit?domain=${client.domain}`}
                      className="px-3 py-1.5 text-sm font-medium text-orange-600 hover:bg-orange-50 rounded-lg transition"
                    >
                      Audit
                    </Link>
                    <Link
                      href={`/dashboard/clients?client=${client.id}`}
                      className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions for At-Risk */}
        {summary && summary.atRisk > 0 && filter === 'all' && (
          <div className="mt-8 bg-red-50 border border-red-200 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-red-800 mb-2">
              {summary.atRisk} Client{summary.atRisk > 1 ? 's' : ''} Need Attention
            </h3>
            <p className="text-red-700 mb-4">
              These clients haven't been audited in over 60 days. Consider reaching out to maintain the relationship.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setFilter('at-risk')}
                className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition"
              >
                View At-Risk Clients
              </button>
              <button
                className="px-4 py-2 bg-white text-red-700 font-medium rounded-lg border border-red-300 hover:bg-red-50 transition"
                onClick={() => {
                  // TODO: Schedule batch audit
                  alert('Batch audit scheduling coming soon!');
                }}
              >
                Schedule Batch Audit
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
