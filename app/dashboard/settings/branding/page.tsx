'use client';

import { useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { useRouter } from 'next/navigation';
import { AISOMascotLoading } from '@/components/AISOMascot';
import LogoUpload from '@/components/LogoUpload';

export default function BrandingSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    agency_name: '',
    agency_logo_url: '',
    agency_primary_color: '#f97316',
    agency_secondary_color: '#3b82f6',
    agency_email: '',
    agency_phone: '',
    agency_website: '',
    agency_address: '',
    agency_tagline: '',
    signature_name: '',
    signature_title: '',
    signature_phone: '',
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
          agency_primary_color: data.branding.agency_primary_color || '#f97316',
          agency_secondary_color: data.branding.agency_secondary_color || '#3b82f6',
          agency_email: data.branding.agency_email || '',
          agency_phone: data.branding.agency_phone || '',
          agency_website: data.branding.agency_website || '',
          agency_address: data.branding.agency_address || '',
          agency_tagline: data.branding.agency_tagline || '',
          signature_name: data.branding.signature_name || '',
          signature_title: data.branding.signature_title || '',
          signature_phone: data.branding.signature_phone || '',
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
    return <AISOMascotLoading message="Loading branding settings..." />;
  }

  // Calculate completion progress
  const completionItems = [
    !!formData.agency_name,
    !!formData.agency_logo_url,
    formData.agency_primary_color !== '#f97316',
    !!(formData.agency_email || formData.agency_phone),
    !!(formData.signature_name && formData.signature_title),
  ];
  const completedCount = completionItems.filter(Boolean).length;
  const completionPercent = Math.round((completedCount / completionItems.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="mx-auto max-w-4xl p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Agency Branding</h1>
              <p className="mt-2 text-slate-600">
                Customize your agency branding for professional emails and documents
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-500">Profile Completion</div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-24 rounded-full bg-slate-200">
                  <div
                    className="h-2 rounded-full bg-orange-500 transition-all duration-300"
                    style={{ width: `${completionPercent}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-slate-700">{completionPercent}%</span>
              </div>
            </div>
          </div>
        </div>

        {message && (
          <div
            className={`mb-6 rounded-lg p-4 ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Quick Navigation */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {['Agency Info', 'Logo', 'Colors', 'Contact', 'Signature'].map((section) => (
              <button
                key={section}
                type="button"
                onClick={() => {
                  const el = document.getElementById(section.toLowerCase().replace(' ', '-'));
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex-shrink-0 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200"
              >
                {section}
              </button>
            ))}
          </div>

          {/* Agency Info Section */}
          <div id="agency-info" className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                1
              </span>
              Agency Information
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Agency Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.agency_name}
                  onChange={(e) => setFormData({ ...formData, agency_name: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="Your Agency Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Tagline</label>
                <input
                  type="text"
                  value={formData.agency_tagline}
                  onChange={(e) => setFormData({ ...formData, agency_tagline: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="Your Content Marketing Partner"
                  maxLength={100}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700">Address</label>
                <textarea
                  value={formData.agency_address}
                  onChange={(e) => setFormData({ ...formData, agency_address: e.target.value })}
                  rows={2}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="123 Main Street, Suite 400, City, State 12345"
                />
              </div>
            </div>
          </div>

          {/* Logo Section */}
          <div id="logo" className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                2
              </span>
              Logo
            </h2>
            <LogoUpload
              currentLogoUrl={formData.agency_logo_url}
              onUpload={(url) => setFormData({ ...formData, agency_logo_url: url })}
            />
          </div>

          {/* Brand Colors */}
          <div id="colors" className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                3
              </span>
              Brand Colors
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">Primary Color</label>
                <p className="text-xs text-slate-500 mb-2">Used for buttons, links, and highlights</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.agency_primary_color}
                    onChange={(e) => setFormData({ ...formData, agency_primary_color: e.target.value })}
                    className="block w-32 rounded-lg border border-slate-300 px-3 py-2.5 font-mono text-sm shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    placeholder="#f97316"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPrimaryPicker(!showPrimaryPicker)}
                    className="h-11 w-11 rounded-lg border-2 border-slate-300 shadow-sm transition-transform hover:scale-105"
                    style={{ backgroundColor: formData.agency_primary_color }}
                  />
                </div>
                {showPrimaryPicker && (
                  <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
                    <HexColorPicker
                      color={formData.agency_primary_color}
                      onChange={(color) => setFormData({ ...formData, agency_primary_color: color })}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Secondary Color</label>
                <p className="text-xs text-slate-500 mb-2">Used for accents and secondary elements</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.agency_secondary_color}
                    onChange={(e) => setFormData({ ...formData, agency_secondary_color: e.target.value })}
                    className="block w-32 rounded-lg border border-slate-300 px-3 py-2.5 font-mono text-sm shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    placeholder="#3b82f6"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecondaryPicker(!showSecondaryPicker)}
                    className="h-11 w-11 rounded-lg border-2 border-slate-300 shadow-sm transition-transform hover:scale-105"
                    style={{ backgroundColor: formData.agency_secondary_color }}
                  />
                </div>
                {showSecondaryPicker && (
                  <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
                    <HexColorPicker
                      color={formData.agency_secondary_color}
                      onChange={(color) => setFormData({ ...formData, agency_secondary_color: color })}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Color Preview */}
            <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-700 mb-3">Preview</p>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-white"
                  style={{ backgroundColor: formData.agency_primary_color }}
                >
                  Primary Button
                </button>
                <button
                  type="button"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-white"
                  style={{ backgroundColor: formData.agency_secondary_color }}
                >
                  Secondary Button
                </button>
                <span
                  className="text-sm font-medium"
                  style={{ color: formData.agency_primary_color }}
                >
                  Link Text
                </span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div id="contact" className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                4
              </span>
              Contact Information
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  value={formData.agency_email}
                  onChange={(e) => setFormData({ ...formData, agency_email: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="hello@agency.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Phone</label>
                <input
                  type="tel"
                  value={formData.agency_phone}
                  onChange={(e) => setFormData({ ...formData, agency_phone: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700">Website</label>
                <input
                  type="url"
                  value={formData.agency_website}
                  onChange={(e) => setFormData({ ...formData, agency_website: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="https://agency.com"
                />
              </div>
            </div>
          </div>

          {/* Email Signature */}
          <div id="signature" className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                5
              </span>
              Email Signature
            </h2>
            <p className="text-sm text-slate-600 mb-4">
              This information appears in your branded emails to clients.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">Your Name</label>
                <input
                  type="text"
                  value={formData.signature_name}
                  onChange={(e) => setFormData({ ...formData, signature_name: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="John Smith"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Your Title</label>
                <input
                  type="text"
                  value={formData.signature_title}
                  onChange={(e) => setFormData({ ...formData, signature_title: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="Founder & CEO"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700">Direct Phone (optional)</label>
                <input
                  type="tel"
                  value={formData.signature_phone}
                  onChange={(e) => setFormData({ ...formData, signature_phone: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="(555) 123-4567 x100"
                />
                <p className="mt-1 text-xs text-slate-500">
                  If different from agency phone. Falls back to agency phone if empty.
                </p>
              </div>
            </div>

            {/* Signature Preview */}
            {(formData.signature_name || formData.signature_title) && (
              <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-700 mb-3">Signature Preview</p>
                <div className="border-l-4 pl-4" style={{ borderColor: formData.agency_primary_color }}>
                  <p className="font-semibold text-slate-900">{formData.signature_name || 'Your Name'}</p>
                  <p className="text-sm text-slate-600">{formData.signature_title || 'Your Title'}</p>
                  {formData.agency_name && (
                    <p className="text-sm font-medium" style={{ color: formData.agency_primary_color }}>
                      {formData.agency_name}
                    </p>
                  )}
                  <p className="text-sm text-slate-500">
                    {formData.signature_phone || formData.agency_phone || '(555) 123-4567'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="rounded-lg border border-slate-300 px-6 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Back to Dashboard
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-orange-500 px-8 py-2.5 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Branding'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
