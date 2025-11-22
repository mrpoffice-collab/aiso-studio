'use client';

import { useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { useRouter } from 'next/navigation';

export default function BrandingSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    agency_name: '',
    agency_logo_url: '',
    agency_primary_color: '#6366f1',
    agency_secondary_color: '#3b82f6',
    agency_email: '',
    agency_phone: '',
    agency_website: '',
    agency_address: '',
    agency_tagline: '',
  });

  const [showPrimaryPicker, setShowPrimaryPicker] = useState(false);
  const [showSecondaryPicker, setShowSecondaryPicker] = useState(false);

  // Fetch current branding on mount
  useEffect(() => {
    fetchBranding();
  }, []);

  const fetchBranding = async () => {
    try {
      const response = await fetch('/api/user/branding');
      const data = await response.json();

      if (data.success) {
        setFormData({
          agency_name: data.branding.agency_name || '',
          agency_logo_url: data.branding.agency_logo_url || '',
          agency_primary_color: data.branding.agency_primary_color || '#6366f1',
          agency_secondary_color: data.branding.agency_secondary_color || '#3b82f6',
          agency_email: data.branding.agency_email || '',
          agency_phone: data.branding.agency_phone || '',
          agency_website: data.branding.agency_website || '',
          agency_address: data.branding.agency_address || '',
          agency_tagline: data.branding.agency_tagline || '',
        });
      }
    } catch (error) {
      console.error('Failed to fetch branding:', error);
      setMessage({ type: 'error', text: 'Failed to load branding settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/user/branding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Branding updated successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update branding' });
      }
    } catch (error) {
      console.error('Failed to save branding:', error);
      setMessage({ type: 'error', text: 'Failed to save branding settings' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-4 text-slate-600">Loading branding settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="mx-auto max-w-4xl p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Agency Branding</h1>
          <p className="mt-2 text-slate-600">
            Customize your agency branding for professional MOUs and documents
          </p>
        </div>

      {message && (
        <div
          className={`mb-6 rounded-lg p-4 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800'
              : 'bg-red-50 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Logo Section */}
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Logo</h2>
          <div className="space-y-4">
            {formData.agency_logo_url && (
              <div className="flex items-center gap-4">
                <img
                  src={formData.agency_logo_url}
                  alt="Agency logo"
                  className="h-16 w-auto rounded border border-slate-200"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700">Logo URL</label>
              <input
                type="url"
                value={formData.agency_logo_url}
                onChange={(e) => setFormData({ ...formData, agency_logo_url: e.target.value })}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="https://example.com/logo.png"
              />
              <p className="mt-1 text-sm text-slate-500">
                Upload your logo to a service like Cloudinary or Imgur and paste the URL here
              </p>
            </div>
          </div>
        </div>

        {/* Brand Colors */}
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Brand Colors</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Primary Color</label>
              <div className="mt-2 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.agency_primary_color}
                    onChange={(e) => setFormData({ ...formData, agency_primary_color: e.target.value })}
                    className="block w-32 rounded-md border border-slate-300 px-3 py-2 font-mono text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="#6366f1"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPrimaryPicker(!showPrimaryPicker)}
                    className="h-10 w-10 rounded border-2 border-slate-300 shadow-sm"
                    style={{ backgroundColor: formData.agency_primary_color }}
                  />
                </div>
                {showPrimaryPicker && (
                  <div className="mt-2">
                    <HexColorPicker
                      color={formData.agency_primary_color}
                      onChange={(color) => setFormData({ ...formData, agency_primary_color: color })}
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Secondary Color</label>
              <div className="mt-2 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.agency_secondary_color}
                    onChange={(e) => setFormData({ ...formData, agency_secondary_color: e.target.value })}
                    className="block w-32 rounded-md border border-slate-300 px-3 py-2 font-mono text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="#3b82f6"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecondaryPicker(!showSecondaryPicker)}
                    className="h-10 w-10 rounded border-2 border-slate-300 shadow-sm"
                    style={{ backgroundColor: formData.agency_secondary_color }}
                  />
                </div>
                {showSecondaryPicker && (
                  <div className="mt-2">
                    <HexColorPicker
                      color={formData.agency_secondary_color}
                      onChange={(color) => setFormData({ ...formData, agency_secondary_color: color })}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Company Information */}
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Company Information</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Agency Name</label>
              <input
                type="text"
                value={formData.agency_name}
                onChange={(e) => setFormData({ ...formData, agency_name: e.target.value })}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Your Agency Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                value={formData.agency_email}
                onChange={(e) => setFormData({ ...formData, agency_email: e.target.value })}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="hello@agency.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Phone</label>
              <input
                type="tel"
                value={formData.agency_phone}
                onChange={(e) => setFormData({ ...formData, agency_phone: e.target.value })}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Website</label>
              <input
                type="url"
                value={formData.agency_website}
                onChange={(e) => setFormData({ ...formData, agency_website: e.target.value })}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="https://agency.com"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Tagline</label>
              <input
                type="text"
                value={formData.agency_tagline}
                onChange={(e) => setFormData({ ...formData, agency_tagline: e.target.value })}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Your Content Marketing Partner"
                maxLength={100}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Address</label>
              <textarea
                value={formData.agency_address}
                onChange={(e) => setFormData({ ...formData, agency_address: e.target.value })}
                rows={3}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="123 Main Street, Suite 400"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="rounded-lg border border-slate-300 px-6 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Branding'}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
}
