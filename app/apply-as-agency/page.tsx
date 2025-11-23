'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

export default function ApplyAsAgencyPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    agencyName: '',
    contactEmail: '',
    contactPhone: '',
    websiteUrl: '',
    city: '',
    state: '',
    country: 'USA',
    verticalSpecialization: [] as string[],
    servicesOffered: [] as string[],
    portfolioUrl: '',
    clientCount: 0,
    baseAuditPrice: '',
    hourlyRate: '',
    maxActiveClients: 10,
  });

  const verticalOptions = [
    'restaurants',
    'real-estate',
    'legal',
    'healthcare',
    'e-commerce',
    'saas',
    'local-services',
    'professional-services',
    'finance',
    'education',
  ];

  const serviceOptions = [
    'technical-seo',
    'content-writing',
    'ai-searchability',
    'schema-markup',
    'site-speed-optimization',
    'javascript-rendering',
    'sitemap-management',
    'robots-txt-optimization',
  ];

  const handleCheckboxChange = (field: 'verticalSpecialization' | 'servicesOffered', value: string) => {
    setFormData((prev) => {
      const current = prev[field];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [field]: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.agencyName || !formData.contactEmail) {
        throw new Error('Agency name and contact email are required');
      }

      if (formData.verticalSpecialization.length === 0) {
        throw new Error('Please select at least one vertical specialization');
      }

      if (formData.servicesOffered.length === 0) {
        throw new Error('Please select at least one service you offer');
      }

      // Convert pricing to cents
      const baseAuditPriceCents = formData.baseAuditPrice
        ? Math.round(parseFloat(formData.baseAuditPrice) * 100)
        : undefined;
      const hourlyRateCents = formData.hourlyRate
        ? Math.round(parseFloat(formData.hourlyRate) * 100)
        : undefined;

      const response = await fetch('/api/agencies/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          baseAuditPriceCents,
          hourlyRateCents,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application');
      }

      // Redirect to success page or dashboard
      router.push('/agency-application-submitted');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Sign In Required</h1>
          <p className="text-slate-600 mb-6">
            Please sign in or create an account to apply as a certified agency partner.
          </p>
          <button
            onClick={() => router.push('/sign-in?redirect=/apply-as-agency')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors w-full"
          >
            Sign In to Apply
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Apply as Certified Agency Partner
            </h1>
            <p className="text-slate-600">
              Join our marketplace and receive qualified leads for AI searchability fixes.
              Earn revenue from clients who discover their sites are invisible to ChatGPT,
              Perplexity, and other AI search engines.
            </p>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-green-900 mb-2">Why Join?</h3>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Get matched with clients who need $5K-$10K AI searchability fixes</li>
              <li>• We handle lead generation, you deliver the service</li>
              <li>• 15-25% referral fee on closed deals (you keep 75-85%)</li>
              <li>• Access to exclusive agency tools and playbooks</li>
            </ul>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Agency Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.agencyName}
                    onChange={(e) => setFormData({ ...formData, agencyName: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Digital Boost Marketing"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Contact Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="contact@agency.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={formData.websiteUrl}
                    onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://agency.com"
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4">Location</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="San Francisco"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="CA"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="USA"
                  />
                </div>
              </div>
            </div>

            {/* Specialization */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4">Specialization</h2>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Vertical Specialization * (Select all that apply)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {verticalOptions.map((vertical) => (
                    <label key={vertical} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.verticalSpecialization.includes(vertical)}
                        onChange={() => handleCheckboxChange('verticalSpecialization', vertical)}
                        className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700 capitalize">
                        {vertical.replace('-', ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Services Offered * (Select all that apply)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {serviceOptions.map((service) => (
                    <label key={service} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.servicesOffered.includes(service)}
                        onChange={() => handleCheckboxChange('servicesOffered', service)}
                        className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700 capitalize">
                        {service.replace(/-/g, ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Portfolio & Experience */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4">Portfolio & Experience</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Portfolio URL
                  </label>
                  <input
                    type="url"
                    value={formData.portfolioUrl}
                    onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://agency.com/portfolio"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Link to case studies, testimonials, or portfolio work
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Current Client Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.clientCount}
                    onChange={(e) => setFormData({ ...formData, clientCount: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="15"
                  />
                </div>
              </div>
            </div>

            {/* Pricing (Optional) */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4">Pricing (Optional)</h2>
              <p className="text-sm text-slate-600 mb-4">
                Help us match you with clients by sharing your typical rates. This information
                is used internally and won't be displayed publicly.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Base AI Searchability Audit Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-500">$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.baseAuditPrice}
                      onChange={(e) => setFormData({ ...formData, baseAuditPrice: e.target.value })}
                      className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="2500.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Hourly Rate
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-500">$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.hourlyRate}
                      onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                      className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="150.00"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Capacity */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4">Lead Capacity</h2>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Maximum Active Clients
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.maxActiveClients}
                  onChange={(e) => setFormData({ ...formData, maxActiveClients: parseInt(e.target.value) || 10 })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="10"
                />
                <p className="text-xs text-slate-500 mt-1">
                  How many active clients can you take on at once? We'll pause leads when you reach capacity.
                </p>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-6 border-t border-slate-200">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
              </button>
              <p className="text-xs text-slate-500 text-center mt-3">
                Applications are typically reviewed within 1-2 business days. You'll receive an email
                when your application status changes.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
