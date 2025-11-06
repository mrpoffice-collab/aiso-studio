'use client';

import { useState } from 'react';

interface ClusterFormProps {
  strategyId: string;
  moneyPages: any[];
  onSuccess: () => void;
}

export default function ClusterForm({ strategyId, moneyPages, onSuccess }: ClusterFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    primary_money_page_id: '',
    funnel_stage: 'awareness',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Submitting cluster:', formData);

      const response = await fetch(`/api/strategies/${strategyId}/clusters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const data = await response.json();
        console.error('API error:', data);
        throw new Error(data.error || 'Failed to create cluster');
      }

      const result = await response.json();
      console.log('Cluster created:', result);

      // Reset form and close
      setFormData({
        name: '',
        description: '',
        primary_money_page_id: '',
        funnel_stage: 'awareness',
      });
      setIsOpen(false);

      // Small delay before refresh
      setTimeout(() => {
        onSuccess();
      }, 100);
    } catch (err: any) {
      console.error('Form submission error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        disabled={moneyPages.length === 0}
        className="px-6 py-3 rounded-xl bg-gradient-to-r from-deep-indigo to-blue-600 text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        title={moneyPages.length === 0 ? 'Create a money page first' : 'Create a new topic cluster'}
      >
        + Add Cluster
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <h3 className="text-2xl font-black text-slate-900 mb-6">Create Topic Cluster</h3>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Cluster Name */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Cluster Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="SoundArt Product Campaign"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-deep-indigo focus:border-deep-indigo"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Build awareness and drive traffic to SoundArt product"
                rows={3}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-deep-indigo focus:border-deep-indigo"
              />
            </div>

            {/* Primary Money Page */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Target Money Page *
              </label>
              <select
                required
                value={formData.primary_money_page_id}
                onChange={(e) => setFormData({ ...formData, primary_money_page_id: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-deep-indigo focus:border-deep-indigo"
              >
                <option value="">Select a money page...</option>
                {moneyPages.map((page) => (
                  <option key={page.id} value={page.id}>
                    {page.title} ({page.page_type})
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">
                All topics in this cluster will link to this page
              </p>
            </div>

            {/* Funnel Stage */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Funnel Stage *
              </label>
              <select
                value={formData.funnel_stage}
                onChange={(e) => setFormData({ ...formData, funnel_stage: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-deep-indigo focus:border-deep-indigo"
              >
                <option value="awareness">Awareness</option>
                <option value="consideration">Consideration</option>
                <option value="decision">Decision</option>
              </select>
              <p className="text-xs text-slate-500 mt-1">
                Where prospects are in their buying journey
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={loading}
                className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-deep-indigo to-blue-600 text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Cluster'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
