'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardNav from '@/components/DashboardNav';
import { useFormPersistence } from '@/hooks/useFormPersistence';

interface BatchJob {
  id: string;
  industry: string;
  city: string;
  state: string;
  target_count: number;
  status: string;
  progress: number;
  businesses_searched: number;
  sweet_spot_found: number;
  total_leads_saved: number;
  error_message?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

export default function BatchLeadDiscoveryPage() {
  // Auto-save form data to localStorage (expires after 2 hours)
  const [formData, setFormData, clearFormData] = useFormPersistence('batch-lead-form', {
    industry: '',
    city: '',
    state: '',
    targetCount: 50,
    filterRange: 'sweet-spot' as 'all' | 'sweet-spot' | 'high' | 'low',
  }, 120);

  const [isCreating, setIsCreating] = useState(false);
  const [batches, setBatches] = useState<BatchJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBatches();
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchBatches, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchBatches = async () => {
    try {
      const response = await fetch('/api/leads/batch');
      const data = await response.json();
      if (data.success) {
        setBatches(data.batches);
      }
    } catch (err) {
      console.error('Failed to fetch batches:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBatch = async () => {
    if (!formData.industry.trim() || !formData.city.trim()) {
      setError('Industry and city are required');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      const response = await fetch('/api/leads/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industry: formData.industry,
          city: formData.city,
          state: formData.state,
          targetCount: formData.targetCount,
          filterRange: formData.filterRange,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create batch');
      }

      alert(`✓ ${data.message}\n\nYou can track progress below. This may take 10-30 minutes.`);

      // Clear saved form data after successful creation
      clearFormData();

      // Refresh batches
      fetchBatches();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };

  const estimatedCost = (formData.targetCount / 20) * 1.5; // Rough estimate
  const estimatedTime = Math.ceil(formData.targetCount / 3); // Minutes

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      <DashboardNav />

      <main className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-5xl font-black bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 leading-tight">
                Batch Lead Discovery
              </h1>
              <p className="text-lg text-slate-700">
                Find 50-200 sweet spot leads automatically. Runs in background, saves to pipeline.
              </p>
            </div>
            <Link
              href="/dashboard/leads"
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Discovery
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm font-bold text-red-800">{error}</p>
          </div>
        )}

        {/* Create Batch Form */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl mb-8">
          <h2 className="text-2xl font-black text-slate-900 mb-6">Start New Batch Discovery</h2>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Industry / Business Type *
              </label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                placeholder="e.g., dentists, chiropractors, law firms"
                className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                style={{ color: '#0f172a' }}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                City *
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g., Miami, Phoenix, Chicago"
                className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                style={{ color: '#0f172a' }}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                State (Optional)
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="e.g., FL, AZ, IL"
                className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                style={{ color: '#0f172a' }}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Target Lead Count (50-200)
              </label>
              <input
                type="number"
                min="50"
                max="200"
                value={formData.targetCount}
                onChange={(e) => setFormData({ ...formData, targetCount: parseInt(e.target.value) })}
                className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                style={{ color: '#0f172a' }}
              />
              <p className="mt-2 text-xs text-slate-600">
                Estimated: ~{estimatedTime} minutes
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Filter Type
              </label>
              <select
                value={formData.filterRange}
                onChange={(e) => setFormData({ ...formData, filterRange: e.target.value as 'all' | 'sweet-spot' | 'high' | 'low' })}
                className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                style={{ color: '#0f172a' }}
              >
                <option value="sweet-spot">Sweet Spot (45-75 score)</option>
                <option value="high">High Scores (76-100)</option>
                <option value="low">Low Scores (0-44)</option>
                <option value="all">All Results</option>
              </select>
              <p className="mt-2 text-xs text-slate-600">
                Choose which leads to save based on AISO score
              </p>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-blue-50 border-2 border-blue-200 mb-6">
            <h3 className="text-sm font-bold text-blue-900 mb-3">How Batch Discovery Works:</h3>
            <ol className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600">1.</span>
                <span>Runs in background - no waiting around!</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600">2.</span>
                <span>Searches hundreds of businesses automatically</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600">3.</span>
                <span>Saves leads matching your selected filter to your pipeline</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600">4.</span>
                <span>Track progress below, check pipeline when complete</span>
              </li>
            </ol>
          </div>

          <button
            onClick={handleCreateBatch}
            disabled={isCreating || !formData.industry.trim() || !formData.city.trim()}
            className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {isCreating ? (
              <>
                <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Starting Batch...
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Start Batch Discovery
              </>
            )}
          </button>
        </div>

        {/* Batch Jobs List */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
          <h2 className="text-2xl font-black text-slate-900 mb-6">Your Batch Jobs</h2>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              <p className="mt-4 text-slate-600">Loading batches...</p>
            </div>
          ) : batches.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600">No batch jobs yet. Create one above to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {batches.map((batch) => (
                <div
                  key={batch.id}
                  className="p-6 rounded-xl border-2 border-slate-200 hover:border-purple-300 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-black text-slate-900">
                        {batch.industry} in {batch.city}{batch.state ? `, ${batch.state}` : ''}
                      </h3>
                      <p className="text-sm text-slate-600 mt-1">
                        Target: {batch.target_count} sweet spot leads
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(batch.status)}`}>
                      {batch.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  {batch.status === 'processing' && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-slate-700">
                          Progress: {batch.sweet_spot_found} / {batch.target_count}
                        </span>
                        <span className="text-sm text-slate-600">
                          {batch.businesses_searched} searched
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full transition-all"
                          style={{ width: `${Math.min((batch.sweet_spot_found / batch.target_count) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 rounded-lg bg-slate-50">
                      <div className="text-2xl font-bold text-slate-900">{batch.sweet_spot_found || 0}</div>
                      <div className="text-xs text-slate-600">Sweet Spot</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-slate-50">
                      <div className="text-2xl font-bold text-slate-900">{batch.businesses_searched || 0}</div>
                      <div className="text-xs text-slate-600">Searched</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-slate-50">
                      <div className="text-2xl font-bold text-slate-900">{batch.total_leads_saved || 0}</div>
                      <div className="text-xs text-slate-600">Saved</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-slate-50">
                      <div className="text-2xl font-bold text-slate-900">
                        {batch.status === 'completed' ? '100%' : batch.status === 'processing' ? `${Math.round((batch.sweet_spot_found / batch.target_count) * 100)}%` : '0%'}
                      </div>
                      <div className="text-xs text-slate-600">Complete</div>
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div className="flex items-center gap-6 text-xs text-slate-600">
                    <span>Created: {formatDate(batch.created_at)}</span>
                    {batch.started_at && <span>Started: {formatDate(batch.started_at)}</span>}
                    {batch.completed_at && <span>Completed: {formatDate(batch.completed_at)}</span>}
                  </div>

                  {batch.error_message && (
                    <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200">
                      <p className="text-sm text-red-800">{batch.error_message}</p>
                    </div>
                  )}

                  {batch.status === 'completed' && (
                    <Link
                      href="/dashboard/pipeline"
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      View in Pipeline
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
