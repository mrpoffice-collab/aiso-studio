'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TIER_INFO } from '@/hooks/useSubscription';

interface UpgradeCTAProps {
  feature: 'sales' | 'clients' | 'win-client' | 'multi-domain';
  isOpen: boolean;
  onClose: () => void;
}

const FEATURE_INFO = {
  sales: {
    title: 'Prospecting Tools',
    description: 'Find and track leads from discovery to close',
    benefits: [
      'Lead discovery by industry & location',
      'Pipeline stages (New, Contacted, Qualified, Won)',
      'Activity tracking & notes',
      'Email outreach tools',
    ],
  },
  clients: {
    title: 'Client Management',
    description: 'Manage multiple clients with dedicated profiles and audits',
    benefits: [
      'Client profiles with contact info',
      'Audit history per client',
      'Performance tracking',
      'White-label reports',
    ],
  },
  'win-client': {
    title: 'New Business Wizard',
    description: 'Guided workflow to turn audit prospects into paying clients',
    benefits: [
      'Step-by-step client acquisition',
      'Automated proposal generation',
      'Email templates',
      'Follow-up reminders',
    ],
  },
  'multi-domain': {
    title: 'Multiple Domains',
    description: 'Audit and optimize content across unlimited domains',
    benefits: [
      'Unlimited domain audits',
      'Compare performance across sites',
      'Batch content optimization',
      'Agency workflow support',
    ],
  },
};

export default function UpgradeCTA({ feature, isOpen, onClose }: UpgradeCTAProps) {
  const info = FEATURE_INFO[feature];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-8 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-purple-200">Upgrade to Pro</p>
              <h2 className="text-2xl font-black">{info.title}</h2>
            </div>
          </div>
          <p className="text-purple-100">{info.description}</p>
        </div>

        {/* Benefits */}
        <div className="px-6 py-6">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">
            What You'll Get
          </h3>
          <ul className="space-y-3">
            {info.benefits.map((benefit, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-slate-700">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="px-6 pb-6 space-y-3">
          <Link
            href="/dashboard/account?upgrade=pro"
            className="block w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-center hover:shadow-lg hover:scale-[1.02] transition-all"
          >
            Upgrade to Pro - {TIER_INFO.professional.label}
          </Link>
          <button
            onClick={onClose}
            className="block w-full py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-semibold text-center hover:bg-slate-50 transition-colors"
          >
            Maybe Later
          </button>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Inline CTA banner for pages
export function UpgradeBanner({ feature }: { feature: 'sales' | 'clients' | 'win-client' | 'multi-domain' }) {
  const info = FEATURE_INFO[feature];

  return (
    <div className="rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-900 mb-1">{info.title}</h3>
          <p className="text-sm text-slate-600 mb-4">{info.description}</p>
          <Link
            href="/dashboard/account?upgrade=pro"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-sm hover:shadow-lg transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Upgrade to Pro - {TIER_INFO.professional.label}
          </Link>
        </div>
      </div>
    </div>
  );
}
