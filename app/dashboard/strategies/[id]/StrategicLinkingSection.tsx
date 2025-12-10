'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MoneyPageForm from './MoneyPageForm';
import ClusterForm from './ClusterForm';

interface StrategicLinkingSectionProps {
  strategyId: string;
  initialMoneyPages: any[];
  initialClusters: any[];
}

export default function StrategicLinkingSection({
  strategyId,
  initialMoneyPages,
  initialClusters,
}: StrategicLinkingSectionProps) {
  const router = useRouter();
  const [moneyPages, setMoneyPages] = useState(initialMoneyPages);
  const [clusters, setClusters] = useState(initialClusters);

  // Edit/Delete state
  const [editingMoneyPage, setEditingMoneyPage] = useState<any | null>(null);
  const [editingCluster, setEditingCluster] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleMoneyPageAdded = (newPage: any) => {
    setMoneyPages([...moneyPages, newPage]);
  };

  const handleClusterAdded = (newCluster: any) => {
    setClusters([...clusters, newCluster]);
  };

  const handleDeleteMoneyPage = async (pageId: string) => {
    if (!confirm('Are you sure you want to delete this money page? This will also remove it from any clusters.')) {
      return;
    }

    setDeletingId(pageId);
    try {
      const response = await fetch(`/api/money-pages/${pageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete');
      }

      setMoneyPages(moneyPages.filter(p => p.id !== pageId));
      // Also update clusters that referenced this money page
      setClusters(clusters.map(c =>
        c.primary_money_page_id === pageId
          ? { ...c, primary_money_page_id: null, primary_money_page_url: null, primary_money_page_title: null }
          : c
      ));
    } catch (error: any) {
      alert(error.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteCluster = async (clusterId: string) => {
    if (!confirm('Are you sure you want to delete this topic cluster?')) {
      return;
    }

    setDeletingId(clusterId);
    try {
      const response = await fetch(`/api/strategies/${strategyId}/clusters/${clusterId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete');
      }

      setClusters(clusters.filter(c => c.id !== clusterId));
    } catch (error: any) {
      alert(error.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleUpdateMoneyPage = async (pageId: string, updates: any) => {
    try {
      const response = await fetch(`/api/money-pages/${pageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update');
      }

      const updatedPage = await response.json();
      setMoneyPages(moneyPages.map(p => p.id === pageId ? { ...p, ...updatedPage.moneyPage } : p));
      setEditingMoneyPage(null);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleUpdateCluster = async (clusterId: string, updates: any) => {
    try {
      const response = await fetch(`/api/strategies/${strategyId}/clusters/${clusterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update');
      }

      const updatedCluster = await response.json();
      setClusters(clusters.map(c => c.id === clusterId ? { ...c, ...updatedCluster.cluster } : c));
      setEditingCluster(null);
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <>
      {/* Money Pages Section */}
      <div className="mb-12">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black bg-gradient-to-r from-deep-indigo via-blue-600 to-deep-indigo bg-clip-text text-transparent mb-2">
              Money Pages
            </h2>
            <p className="text-lg text-slate-600">
              High-value pages to promote through content ({moneyPages.length} pages)
            </p>
          </div>
          <MoneyPageForm strategyId={strategyId} onSuccess={handleMoneyPageAdded} />
        </div>

        {moneyPages.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xl">
            <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-slate-600 mb-4 font-semibold">No money pages defined yet</p>
            <p className="text-sm text-slate-500">Define high-value pages (products, services, signup) to target with your content</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {moneyPages.map((page: any) => (
              <div key={page.id} className="p-6 rounded-xl border border-slate-200 bg-white shadow-lg hover:shadow-xl transition-all duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-slate-900">{page.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        page.priority === 1 ? 'bg-red-100 text-red-700' :
                        page.priority === 2 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {page.priority === 1 ? 'HIGH' : page.priority === 2 ? 'MEDIUM' : 'LOW'}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase">
                        {page.page_type}
                      </span>
                    </div>
                    <a href={page.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-mono text-sm">
                      {page.url}
                    </a>
                    {page.description && (
                      <p className="text-slate-600 mt-2">{page.description}</p>
                    )}
                    {page.target_keywords && page.target_keywords.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {page.target_keywords.map((keyword: string, idx: number) => (
                          <span key={idx} className="px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Edit/Delete Buttons */}
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => setEditingMoneyPage(page)}
                      className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Edit"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteMoneyPage(page.id)}
                      disabled={deletingId === page.id}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      {deletingId === page.id ? (
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Topic Clusters Section */}
      <div className="mb-12">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black bg-gradient-to-r from-deep-indigo via-blue-600 to-deep-indigo bg-clip-text text-transparent mb-2">
              Topic Clusters
            </h2>
            <p className="text-lg text-slate-600">
              Campaign-based content groups ({clusters.length} clusters)
            </p>
          </div>
          <ClusterForm
            strategyId={strategyId}
            moneyPages={moneyPages}
            onSuccess={handleClusterAdded}
          />
        </div>

        {clusters.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xl">
            <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-slate-600 mb-4 font-semibold">No clusters created yet</p>
            <p className="text-sm text-slate-500">Create topic clusters to organize content campaigns around your money pages</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {clusters.map((cluster: any) => (
              <div key={cluster.id} className="p-6 rounded-xl border border-slate-200 bg-white shadow-lg hover:shadow-xl transition-all duration-200">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold text-slate-900">{cluster.name}</h3>

                  {/* Edit/Delete Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingCluster(cluster)}
                      className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteCluster(cluster.id)}
                      disabled={deletingId === cluster.id}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      {deletingId === cluster.id ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {cluster.description && (
                  <p className="text-slate-600 mb-3">{cluster.description}</p>
                )}
                {cluster.primary_money_page_url && (
                  <div className="mb-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Target Page:</p>
                    <a href={cluster.primary_money_page_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm font-mono">
                      {cluster.primary_money_page_url}
                    </a>
                    {cluster.primary_money_page_title && (
                      <p className="text-xs text-slate-600 mt-1">{cluster.primary_money_page_title}</p>
                    )}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {cluster.funnel_stage && (
                      <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold uppercase">
                        {cluster.funnel_stage}
                      </span>
                    )}
                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                      {cluster.topic_count || 0} topics
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Money Page Modal */}
      {editingMoneyPage && (
        <EditMoneyPageModal
          page={editingMoneyPage}
          onSave={(updates) => handleUpdateMoneyPage(editingMoneyPage.id, updates)}
          onClose={() => setEditingMoneyPage(null)}
        />
      )}

      {/* Edit Cluster Modal */}
      {editingCluster && (
        <EditClusterModal
          cluster={editingCluster}
          moneyPages={moneyPages}
          onSave={(updates) => handleUpdateCluster(editingCluster.id, updates)}
          onClose={() => setEditingCluster(null)}
        />
      )}
    </>
  );
}

// Edit Money Page Modal Component
function EditMoneyPageModal({
  page,
  onSave,
  onClose
}: {
  page: any;
  onSave: (updates: any) => void;
  onClose: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: page.title || '',
    url: page.url || '',
    page_type: page.page_type || 'product',
    priority: page.priority || 2,
    description: page.description || '',
    target_keywords: (page.target_keywords || []).join(', '),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave({
      ...formData,
      target_keywords: formData.target_keywords.split(',').map((k: string) => k.trim()).filter(Boolean),
    });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <h3 className="text-2xl font-black text-slate-900 mb-6">Edit Money Page</h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Page URL *</label>
              <input
                type="url"
                required
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sunset-orange focus:border-sunset-orange"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Page Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sunset-orange focus:border-sunset-orange"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Page Type</label>
                <select
                  value={formData.page_type}
                  onChange={(e) => setFormData({ ...formData, page_type: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sunset-orange focus:border-sunset-orange"
                >
                  <option value="product">Product</option>
                  <option value="service">Service</option>
                  <option value="signup">Signup</option>
                  <option value="contact">Contact</option>
                  <option value="pricing">Pricing</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sunset-orange focus:border-sunset-orange"
                >
                  <option value={1}>High</option>
                  <option value={2}>Medium</option>
                  <option value={3}>Low</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sunset-orange focus:border-sunset-orange"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Target Keywords</label>
              <input
                type="text"
                value={formData.target_keywords}
                onChange={(e) => setFormData({ ...formData, target_keywords: e.target.value })}
                placeholder="keyword1, keyword2, keyword3"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sunset-orange focus:border-sunset-orange"
              />
              <p className="text-xs text-slate-500 mt-1">Comma-separated list</p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-sunset-orange to-orange-600 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Edit Cluster Modal Component
function EditClusterModal({
  cluster,
  moneyPages,
  onSave,
  onClose
}: {
  cluster: any;
  moneyPages: any[];
  onSave: (updates: any) => void;
  onClose: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: cluster.name || '',
    description: cluster.description || '',
    primary_money_page_id: cluster.primary_money_page_id || '',
    funnel_stage: cluster.funnel_stage || 'awareness',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave(formData);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <h3 className="text-2xl font-black text-slate-900 mb-6">Edit Topic Cluster</h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Cluster Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-deep-indigo focus:border-deep-indigo"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-deep-indigo focus:border-deep-indigo"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Target Money Page</label>
              <select
                value={formData.primary_money_page_id}
                onChange={(e) => setFormData({ ...formData, primary_money_page_id: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-deep-indigo focus:border-deep-indigo"
              >
                <option value="">No money page selected</option>
                {moneyPages.map((page) => (
                  <option key={page.id} value={page.id}>
                    {page.title} ({page.page_type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Funnel Stage</label>
              <select
                value={formData.funnel_stage}
                onChange={(e) => setFormData({ ...formData, funnel_stage: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-deep-indigo focus:border-deep-indigo"
              >
                <option value="awareness">Awareness</option>
                <option value="consideration">Consideration</option>
                <option value="decision">Decision</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-deep-indigo to-blue-600 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
