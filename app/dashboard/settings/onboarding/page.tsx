'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { HexColorPicker } from 'react-colorful';
import { AISOMascotLoading, AISOMascotInline } from '@/components/AISOMascot';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    agency_name: '',
    agency_logo_url: '',
    agency_primary_color: '#f97316',
    agency_secondary_color: '#3b82f6',
    agency_email: '',
    agency_phone: '',
    agency_website: '',
    signature_name: '',
    signature_title: '',
    signature_phone: '',
  });

  const [showPrimaryPicker, setShowPrimaryPicker] = useState(false);
  const [showSecondaryPicker, setShowSecondaryPicker] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [brandingRes, statusRes] = await Promise.all([
        fetch('/api/user/branding'),
        fetch('/api/onboarding/status'),
      ]);

      const [brandingData, statusData] = await Promise.all([
        brandingRes.json(),
        statusRes.json(),
      ]);

      if (brandingData.success && brandingData.branding) {
        setFormData({
          agency_name: brandingData.branding.agency_name || '',
          agency_logo_url: brandingData.branding.agency_logo_url || '',
          agency_primary_color: brandingData.branding.agency_primary_color || '#f97316',
          agency_secondary_color: brandingData.branding.agency_secondary_color || '#3b82f6',
          agency_email: brandingData.branding.agency_email || '',
          agency_phone: brandingData.branding.agency_phone || '',
          agency_website: brandingData.branding.agency_website || '',
          signature_name: brandingData.branding.signature_name || '',
          signature_title: brandingData.branding.signature_title || '',
          signature_phone: brandingData.branding.signature_phone || '',
        });
      }

      if (statusData.steps) {
        setSteps(statusData.steps);
        // Find first incomplete step
        const firstIncomplete = statusData.steps.findIndex((s: OnboardingStep) => !s.completed);
        setCurrentStep(firstIncomplete >= 0 ? firstIncomplete : 0);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/user/branding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Refresh status
        const statusRes = await fetch('/api/onboarding/status');
        const statusData = await statusRes.json();
        if (statusData.steps) {
          setSteps(statusData.steps);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to save:', error);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    const saved = await saveProgress();
    if (saved) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      } else {
        // Final step - go to audit or dashboard
        router.push('/dashboard/audit');
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      router.push('/dashboard');
    }
  };

  const completedCount = steps.filter(s => s.completed).length;
  const progress = steps.length > 0 ? (completedCount / steps.length) * 100 : 0;

  if (loading) {
    return <AISOMascotLoading message="Loading your setup progress..." />;
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Agency Name
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">What's your agency called?</h2>
              <p className="mt-2 text-slate-600">
                This name will appear on all your professional documents and communications.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Agency Name</label>
              <input
                type="text"
                value={formData.agency_name}
                onChange={(e) => setFormData({ ...formData, agency_name: e.target.value })}
                className="mt-2 block w-full rounded-xl border border-slate-300 px-4 py-3 text-lg shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="Acme Digital Marketing"
                autoFocus
              />
            </div>
          </div>
        );

      case 1: // Logo
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Upload your logo</h2>
              <p className="mt-2 text-slate-600">
                Your logo will appear on emails, reports, and proposals. We recommend a horizontal logo (200x60px).
              </p>
            </div>
            {formData.agency_logo_url && (
              <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-8">
                <img
                  src={formData.agency_logo_url}
                  alt="Your logo"
                  className="max-h-24 w-auto"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700">Logo URL</label>
              <input
                type="url"
                value={formData.agency_logo_url}
                onChange={(e) => setFormData({ ...formData, agency_logo_url: e.target.value })}
                className="mt-2 block w-full rounded-xl border border-slate-300 px-4 py-3 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="https://your-site.com/logo.png"
              />
              <p className="mt-2 text-sm text-slate-500">
                Upload to <a href="https://cloudinary.com" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">Cloudinary</a>,{' '}
                <a href="https://imgur.com" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">Imgur</a>, or your own website
              </p>
            </div>
          </div>
        );

      case 2: // Colors
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Choose your brand colors</h2>
              <p className="mt-2 text-slate-600">
                These colors will be used throughout your branded materials.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">Primary Color</label>
                <p className="text-xs text-slate-500 mb-3">Buttons, links, accents</p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPrimaryPicker(!showPrimaryPicker);
                      setShowSecondaryPicker(false);
                    }}
                    className="h-14 w-14 rounded-xl border-2 border-slate-300 shadow-sm transition-transform hover:scale-105"
                    style={{ backgroundColor: formData.agency_primary_color }}
                  />
                  <input
                    type="text"
                    value={formData.agency_primary_color}
                    onChange={(e) => setFormData({ ...formData, agency_primary_color: e.target.value })}
                    className="block w-28 rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm shadow-sm"
                  />
                </div>
                {showPrimaryPicker && (
                  <div className="mt-3">
                    <HexColorPicker
                      color={formData.agency_primary_color}
                      onChange={(color) => setFormData({ ...formData, agency_primary_color: color })}
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Secondary Color</label>
                <p className="text-xs text-slate-500 mb-3">Secondary elements</p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSecondaryPicker(!showSecondaryPicker);
                      setShowPrimaryPicker(false);
                    }}
                    className="h-14 w-14 rounded-xl border-2 border-slate-300 shadow-sm transition-transform hover:scale-105"
                    style={{ backgroundColor: formData.agency_secondary_color }}
                  />
                  <input
                    type="text"
                    value={formData.agency_secondary_color}
                    onChange={(e) => setFormData({ ...formData, agency_secondary_color: e.target.value })}
                    className="block w-28 rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm shadow-sm"
                  />
                </div>
                {showSecondaryPicker && (
                  <div className="mt-3">
                    <HexColorPicker
                      color={formData.agency_secondary_color}
                      onChange={(color) => setFormData({ ...formData, agency_secondary_color: color })}
                    />
                  </div>
                )}
              </div>
            </div>
            {/* Preview */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm font-medium text-slate-600 mb-4">Preview</p>
              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  className="rounded-lg px-5 py-2.5 text-sm font-medium text-white"
                  style={{ backgroundColor: formData.agency_primary_color }}
                >
                  Send Email
                </button>
                <button
                  type="button"
                  className="rounded-lg px-5 py-2.5 text-sm font-medium text-white"
                  style={{ backgroundColor: formData.agency_secondary_color }}
                >
                  View Report
                </button>
                <a
                  href="#"
                  className="text-sm font-medium hover:underline"
                  style={{ color: formData.agency_primary_color }}
                  onClick={(e) => e.preventDefault()}
                >
                  Learn More
                </a>
              </div>
            </div>
          </div>
        );

      case 3: // Contact
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Contact information</h2>
              <p className="mt-2 text-slate-600">
                How can clients reach you? This appears in your email footer.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  value={formData.agency_email}
                  onChange={(e) => setFormData({ ...formData, agency_email: e.target.value })}
                  className="mt-2 block w-full rounded-xl border border-slate-300 px-4 py-3 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="hello@agency.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Phone</label>
                <input
                  type="tel"
                  value={formData.agency_phone}
                  onChange={(e) => setFormData({ ...formData, agency_phone: e.target.value })}
                  className="mt-2 block w-full rounded-xl border border-slate-300 px-4 py-3 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="(555) 123-4567"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700">Website</label>
                <input
                  type="url"
                  value={formData.agency_website}
                  onChange={(e) => setFormData({ ...formData, agency_website: e.target.value })}
                  className="mt-2 block w-full rounded-xl border border-slate-300 px-4 py-3 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="https://your-agency.com"
                />
              </div>
            </div>
          </div>
        );

      case 4: // Signature
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Create your email signature</h2>
              <p className="mt-2 text-slate-600">
                This is how you'll sign off on client emails.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">Your Name</label>
                <input
                  type="text"
                  value={formData.signature_name}
                  onChange={(e) => setFormData({ ...formData, signature_name: e.target.value })}
                  className="mt-2 block w-full rounded-xl border border-slate-300 px-4 py-3 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="John Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Your Title</label>
                <input
                  type="text"
                  value={formData.signature_title}
                  onChange={(e) => setFormData({ ...formData, signature_title: e.target.value })}
                  className="mt-2 block w-full rounded-xl border border-slate-300 px-4 py-3 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="Founder & CEO"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700">Direct Phone (optional)</label>
                <input
                  type="tel"
                  value={formData.signature_phone}
                  onChange={(e) => setFormData({ ...formData, signature_phone: e.target.value })}
                  className="mt-2 block w-full rounded-xl border border-slate-300 px-4 py-3 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
            {/* Signature Preview */}
            {(formData.signature_name || formData.signature_title) && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
                <p className="text-sm font-medium text-slate-600 mb-4">Preview</p>
                <div className="border-l-4 pl-4" style={{ borderColor: formData.agency_primary_color }}>
                  <p className="font-semibold text-slate-900">{formData.signature_name || 'Your Name'}</p>
                  <p className="text-sm text-slate-600">{formData.signature_title || 'Your Title'}</p>
                  {formData.agency_name && (
                    <p className="text-sm font-medium" style={{ color: formData.agency_primary_color }}>
                      {formData.agency_name}
                    </p>
                  )}
                  {(formData.signature_phone || formData.agency_phone) && (
                    <p className="text-sm text-slate-500">
                      {formData.signature_phone || formData.agency_phone}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const stepTitles = [
    'Agency Name',
    'Logo',
    'Brand Colors',
    'Contact Info',
    'Signature',
    'First Audit',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">Set Up Your Agency</h1>
          <p className="mt-2 text-slate-600">
            Let's get your agency ready to impress clients
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">
              Step {currentStep + 1} of 5
            </span>
            <span className="text-sm text-slate-500">
              {Math.round(((currentStep + 1) / 5) * 100)}% complete
            </span>
          </div>
          <div className="h-2 rounded-full bg-slate-200">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
              style={{ width: `${((currentStep + 1) / 5) * 100}%` }}
            />
          </div>
          {/* Step indicators */}
          <div className="mt-4 flex justify-between">
            {stepTitles.slice(0, 5).map((title, index) => (
              <button
                key={title}
                onClick={() => setCurrentStep(index)}
                className={`flex flex-col items-center ${
                  index <= currentStep ? 'text-orange-600' : 'text-slate-400'
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                    index < currentStep
                      ? 'bg-orange-500 text-white'
                      : index === currentStep
                      ? 'border-2 border-orange-500 text-orange-600'
                      : 'border-2 border-slate-300 text-slate-400'
                  }`}
                >
                  {index < currentStep ? (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="mt-1 text-xs hidden sm:block">{title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          {renderStepContent()}
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-between">
          <div>
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSkip}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700"
            >
              Skip for now
            </button>
            <button
              onClick={handleNext}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <AISOMascotInline state="running" />
                  Saving...
                </>
              ) : currentStep === 4 ? (
                <>
                  Continue to First Audit
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              ) : (
                <>
                  Continue
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Skip all link */}
        <div className="mt-8 text-center">
          <Link
            href="/dashboard"
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            I'll do this later - take me to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
