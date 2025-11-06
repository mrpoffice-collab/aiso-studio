'use client';

import { useState } from 'react';

interface MoneyPageFormProps {
  strategyId: string;
  onSuccess: () => void;
}

export default function MoneyPageForm({ strategyId, onSuccess }: MoneyPageFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    url: '',
    title: '',
    page_type: 'product',
    priority: 2,
    description: '',
    target_keywords: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Submitting money page:', formData);

      const response = await fetch(`/api/strategies/${strategyId}/money-pages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          target_keywords: formData.target_keywords
            .split(',')
            .map(k => k.trim())
            .filter(Boolean),
        }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const data = await response.json();
        console.error('API error:', data);
        throw new Error(data.error || 'Failed to create money page');
      }

      const result = await response.json();
      console.log('Money page created:', result);

      // Reset form and close
      setFormData({
        url: '',
        title: '',
        page_type: 'product',
        priority: 2,
        description: '',
        target_keywords: '',
      });
      setIsOpen(false);

      // Small delay before refresh to ensure state is updated
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
        className="px-6 py-3 rounded-xl bg-gradient-to-r from-sunset-orange to-orange-600 text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
      >
        + Add Money Page
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <h3 className="text-2xl font-black text-slate-900 mb-6">Add Money Page</h3>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* URL */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Page URL *
              </label>
              <input
                type="url"
                required
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://example.com/product"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sunset-orange focus:border-sunset-orange"
              />
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Page Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Product Name or Page Title"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sunset-orange focus:border-sunset-orange"
              />
            </div>

            {/* Page Type & Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Page Type *
                </label>
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
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Priority *
                </label>
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

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of what this page offers"
                rows={3}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sunset-orange focus:border-sunset-orange"
              />
            </div>

            {/* Target Keywords */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Target Keywords
              </label>
              <input
                type="text"
                value={formData.target_keywords}
                onChange={(e) => setFormData({ ...formData, target_keywords: e.target.value })}
                placeholder="keyword1, keyword2, keyword3"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sunset-orange focus:border-sunset-orange"
              />
              <p className="text-xs text-slate-500 mt-1">Comma-separated list</p>
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
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-sunset-orange to-orange-600 text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Money Page'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
