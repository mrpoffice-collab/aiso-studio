'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EditStrategyPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [strategy, setStrategy] = useState<any>(null);

  const [formData, setFormData] = useState({
    clientName: '',
    industry: '',
    goals: '',
    targetAudience: '',
    brandVoice: '',
    frequency: 'weekly',
    contentLength: 'medium',
    keywords: '',
    contentType: 'national',
    city: '',
    state: '',
    serviceArea: '',
  });

  useEffect(() => {
    fetchStrategy();
  }, [id]);

  const fetchStrategy = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/strategies/${id}/edit`);

      if (!response.ok) {
        throw new Error('Failed to fetch strategy');
      }

      const data = await response.json();
      const strat = data.strategy;

      setStrategy(strat);
      setFormData({
        clientName: strat.client_name || '',
        industry: strat.industry || '',
        goals: Array.isArray(strat.goals) ? strat.goals.join(', ') : strat.goals || '',
        targetAudience: strat.target_audience || '',
        brandVoice: strat.brand_voice || '',
        frequency: strat.frequency || 'weekly',
        contentLength: strat.content_length || 'medium',
        keywords: Array.isArray(strat.keywords) ? strat.keywords.join(', ') : strat.keywords || '',
        contentType: strat.content_type || 'national',
        city: strat.city || '',
        state: strat.state || '',
        serviceArea: strat.service_area || '',
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch(`/api/strategies/${id}/edit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          goals: formData.goals.split(',').map(g => g.trim()).filter(Boolean),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update strategy');
      }

      setSuccess(true);

      // Redirect after 1 second
      setTimeout(() => {
        router.push(`/dashboard/strategies/${id}`);
      }, 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const isLocalOrHybrid = formData.contentType === 'local' || formData.contentType === 'hybrid';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-sunset-orange"></div>
          <p className="mt-4 text-slate-600 font-medium">Loading strategy...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <header className="border-b border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-sm sticky top-0 z-50">
        <div className="container mx-auto flex h-20 items-center justify-between px-6">
          <div className="flex items-center gap-12">
            <Link href="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-sunset-orange to-orange-600 bg-clip-text text-transparent">
              Content Command Studio
            </Link>
            <nav className="flex gap-8">
              <Link href="/dashboard" className="text-sm font-semibold text-slate-600 hover:text-deep-indigo transition-all duration-200 hover:scale-105">
                Dashboard
              </Link>
              <Link href="/dashboard/strategies" className="text-sm font-semibold text-deep-indigo border-b-2 border-sunset-orange pb-1">
                Strategies
              </Link>
              <Link href="/dashboard/posts" className="text-sm font-semibold text-slate-600 hover:text-deep-indigo transition-all duration-200 hover:scale-105">
                Posts
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="mb-8">
          <Link
            href={`/dashboard/strategies/${id}`}
            className="group inline-flex items-center gap-2 text-sm font-semibold text-deep-indigo hover:text-sunset-orange transition-all"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Strategy
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200/60 bg-white p-10 shadow-2xl shadow-slate-300/50">
          <div className="mb-8">
            <h1 className="mb-3 text-4xl font-black bg-gradient-to-r from-deep-indigo via-blue-600 to-deep-indigo bg-clip-text text-transparent">
              Edit Strategy
            </h1>
            <p className="text-lg text-slate-600 font-medium">
              Update your client details and AISO optimization settings.
            </p>
          </div>

          {error && (
            <div className="mb-8 rounded-xl bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 p-5 text-red-700 font-semibold flex items-start gap-3">
              <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {success && (
            <div className="mb-8 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 p-5 text-green-700 font-semibold flex items-start gap-3">
              <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Strategy updated successfully! Redirecting...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-7">
            {/* Client Name */}
            <div>
              <label htmlFor="clientName" className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-sunset-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Client Name *
              </label>
              <input
                type="text"
                id="clientName"
                name="clientName"
                required
                value={formData.clientName}
                onChange={handleChange}
                className="w-full rounded-xl border-2 border-slate-200 px-5 py-3.5 text-slate-900 font-medium focus:border-sunset-orange focus:outline-none focus:ring-4 focus:ring-sunset-orange/10 transition-all bg-slate-50/50"
                placeholder="Acme Corp"
              />
            </div>

            {/* Industry */}
            <div>
              <label htmlFor="industry" className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-sunset-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Industry *
              </label>
              <input
                type="text"
                id="industry"
                name="industry"
                required
                value={formData.industry}
                onChange={handleChange}
                className="w-full rounded-xl border-2 border-slate-200 px-5 py-3.5 text-slate-900 font-medium focus:border-sunset-orange focus:outline-none focus:ring-4 focus:ring-sunset-orange/10 transition-all bg-slate-50/50"
                placeholder="SaaS, Healthcare, E-commerce, etc."
              />
            </div>

            {/* Content Type (AISO) */}
            <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
              <label htmlFor="contentType" className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-sunset-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Content Type (AISO Optimization) *
              </label>
              <select
                id="contentType"
                name="contentType"
                value={formData.contentType}
                onChange={handleChange}
                className="w-full rounded-xl border-2 border-slate-200 px-5 py-3.5 text-slate-900 font-medium focus:border-sunset-orange focus:outline-none focus:ring-4 focus:ring-sunset-orange/10 transition-all bg-white"
              >
                <option value="national">National (General Audience)</option>
                <option value="local">Local Business (GBP Optimized)</option>
                <option value="hybrid">Hybrid (Local + National)</option>
              </select>
              <p className="mt-3 text-sm text-slate-600">
                {formData.contentType === 'national' && '🌍 Optimizes for SGE, ChatGPT, Perplexity (AEO 25% + Fact-Check 30%)'}
                {formData.contentType === 'local' && '📍 Optimizes for Google Business Profile + SGE (AEO 20% + GEO 10% + Fact-Check 25%)'}
                {formData.contentType === 'hybrid' && '🔀 Combines local and national optimization strategies'}
              </p>
            </div>

            {/* Local Business Fields (conditional) */}
            {isLocalOrHybrid && (
              <div className="rounded-xl border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-6 space-y-6">
                <div className="flex items-start gap-3 mb-4">
                  <svg className="w-5 h-5 text-green-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Local Business Details</h3>
                    <p className="text-sm text-slate-600 mt-1">For Google Business Profile (GBP) and local search optimization</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-bold text-slate-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      required={isLocalOrHybrid}
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full rounded-lg border-2 border-slate-200 px-4 py-2.5 text-slate-900 font-medium focus:border-sunset-orange focus:outline-none focus:ring-2 focus:ring-sunset-orange/10 transition-all bg-white"
                      placeholder="Austin"
                    />
                  </div>

                  <div>
                    <label htmlFor="state" className="block text-sm font-bold text-slate-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      required={isLocalOrHybrid}
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full rounded-lg border-2 border-slate-200 px-4 py-2.5 text-slate-900 font-medium focus:border-sunset-orange focus:outline-none focus:ring-2 focus:ring-sunset-orange/10 transition-all bg-white"
                      placeholder="Texas"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="serviceArea" className="block text-sm font-bold text-slate-700 mb-2">
                    Service Area (Optional)
                  </label>
                  <input
                    type="text"
                    id="serviceArea"
                    name="serviceArea"
                    value={formData.serviceArea}
                    onChange={handleChange}
                    className="w-full rounded-lg border-2 border-slate-200 px-4 py-2.5 text-slate-900 font-medium focus:border-sunset-orange focus:outline-none focus:ring-2 focus:ring-sunset-orange/10 transition-all bg-white"
                    placeholder="Greater Austin Metro, including Round Rock and Cedar Park"
                  />
                  <p className="mt-2 text-xs text-slate-600">
                    Include surrounding areas served (neighborhoods, nearby cities, etc.)
                  </p>
                </div>
              </div>
            )}

            {/* Goals */}
            <div>
              <label htmlFor="goals" className="block text-sm font-bold text-slate-700 mb-3">
                Business Goals
              </label>
              <textarea
                id="goals"
                name="goals"
                value={formData.goals}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-xl border-2 border-slate-200 px-5 py-3.5 text-slate-900 font-medium focus:border-sunset-orange focus:outline-none focus:ring-4 focus:ring-sunset-orange/10 transition-all bg-slate-50/50"
                placeholder="Increase brand awareness, Generate leads, Improve SEO"
              />
              <p className="mt-2 text-sm text-slate-500">Separate multiple goals with commas</p>
            </div>

            {/* Target Audience */}
            <div>
              <label htmlFor="targetAudience" className="block text-sm font-bold text-slate-700 mb-3">
                Target Audience *
              </label>
              <textarea
                id="targetAudience"
                name="targetAudience"
                required
                value={formData.targetAudience}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-xl border-2 border-slate-200 px-5 py-3.5 text-slate-900 font-medium focus:border-sunset-orange focus:outline-none focus:ring-4 focus:ring-sunset-orange/10 transition-all bg-slate-50/50"
                placeholder="Small business owners, entrepreneurs, marketing professionals"
              />
            </div>

            {/* Brand Voice */}
            <div>
              <label htmlFor="brandVoice" className="block text-sm font-bold text-slate-700 mb-3">
                Brand Voice *
              </label>
              <input
                type="text"
                id="brandVoice"
                name="brandVoice"
                required
                value={formData.brandVoice}
                onChange={handleChange}
                className="w-full rounded-xl border-2 border-slate-200 px-5 py-3.5 text-slate-900 font-medium focus:border-sunset-orange focus:outline-none focus:ring-4 focus:ring-sunset-orange/10 transition-all bg-slate-50/50"
                placeholder="Professional, friendly, authoritative"
              />
            </div>

            {/* Frequency and Content Length */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label htmlFor="frequency" className="block text-sm font-bold text-slate-700 mb-3">
                  Publishing Frequency
                </label>
                <select
                  id="frequency"
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleChange}
                  className="w-full rounded-xl border-2 border-slate-200 px-5 py-3.5 text-slate-900 font-medium focus:border-sunset-orange focus:outline-none focus:ring-4 focus:ring-sunset-orange/10 transition-all bg-slate-50/50"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label htmlFor="contentLength" className="block text-sm font-bold text-slate-700 mb-3">
                  Content Length
                </label>
                <select
                  id="contentLength"
                  name="contentLength"
                  value={formData.contentLength}
                  onChange={handleChange}
                  className="w-full rounded-xl border-2 border-slate-200 px-5 py-3.5 text-slate-900 font-medium focus:border-sunset-orange focus:outline-none focus:ring-4 focus:ring-sunset-orange/10 transition-all bg-slate-50/50"
                >
                  <option value="short">Short (500-800 words)</option>
                  <option value="medium">Medium (800-1200 words)</option>
                  <option value="long">Long (1200-2000 words)</option>
                </select>
              </div>
            </div>

            {/* Keywords */}
            <div>
              <label htmlFor="keywords" className="block text-sm font-bold text-slate-700 mb-3">
                Target Keywords (Optional)
              </label>
              <textarea
                id="keywords"
                name="keywords"
                value={formData.keywords}
                onChange={handleChange}
                rows={2}
                className="w-full rounded-xl border-2 border-slate-200 px-5 py-3.5 text-slate-900 font-medium focus:border-sunset-orange focus:outline-none focus:ring-4 focus:ring-sunset-orange/10 transition-all bg-slate-50/50"
                placeholder="content marketing, SEO, digital strategy"
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 rounded-xl bg-gradient-to-r from-sunset-orange to-orange-600 px-8 py-4 text-base font-bold text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isSaving ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating Strategy...
                  </span>
                ) : (
                  '💾 Save Changes'
                )}
              </button>

              <Link
                href={`/dashboard/strategies/${id}`}
                className="rounded-xl border-2 border-slate-300 px-8 py-4 text-base font-bold text-slate-700 hover:bg-slate-50 transition-all"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
