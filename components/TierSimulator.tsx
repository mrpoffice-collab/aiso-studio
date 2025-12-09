'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { SubscriptionTier, TIER_INFO } from '@/hooks/useSubscription';

// Admin emails allowed to use the simulator
const ADMIN_EMAILS = ['mrpoffice@gmail.com', 'kim@example.com']; // Add Kim's email here

interface TierSimulatorProps {
  onTierChange: (tier: SubscriptionTier | null) => void;
  currentSimulatedTier: SubscriptionTier | null;
  actualTier: SubscriptionTier;
}

export default function TierSimulator({
  onTierChange,
  currentSimulatedTier,
  actualTier
}: TierSimulatorProps) {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user?.emailAddresses?.[0]?.emailAddress) {
      setIsAdmin(ADMIN_EMAILS.includes(user.emailAddresses[0].emailAddress));
    }
  }, [user]);

  // Don't render for non-admins
  if (!isAdmin) return null;

  const tiers: SubscriptionTier[] = ['trial', 'starter', 'professional', 'agency'];
  const isSimulating = currentSimulatedTier !== null;

  return (
    <>
      {/* Floating badge - always visible when simulating */}
      {isSimulating && (
        <div className="fixed bottom-4 left-4 z-50">
          <div className="bg-amber-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-bold">
            <span className="animate-pulse w-2 h-2 bg-white rounded-full"></span>
            Simulating: {TIER_INFO[currentSimulatedTier].name}
            <button
              onClick={() => onTierChange(null)}
              className="ml-2 bg-white/20 hover:bg-white/30 rounded-full p-1"
              title="Exit simulation"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 w-12 h-12 rounded-full bg-slate-800 text-white shadow-lg hover:bg-slate-700 flex items-center justify-center transition-all"
        title="Tier Simulator (Admin Only)"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {/* Simulator Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-800 text-white px-4 py-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">Tier Simulator</h3>
              <span className="text-xs bg-amber-500 px-2 py-0.5 rounded-full">Admin Only</span>
            </div>
            <p className="text-xs text-slate-300 mt-1">Test the app as different subscription tiers</p>
          </div>

          <div className="p-4">
            {/* Actual tier display */}
            <div className="mb-4 p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Your Actual Tier</p>
              <p className="font-bold text-slate-900">{TIER_INFO[actualTier].name} ({TIER_INFO[actualTier].label})</p>
            </div>

            {/* Tier selection */}
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Simulate As</p>
            <div className="space-y-2">
              {tiers.map(tier => (
                <button
                  key={tier}
                  onClick={() => onTierChange(tier === actualTier ? null : tier)}
                  className={`w-full px-4 py-3 rounded-xl text-left flex items-center justify-between transition-all ${
                    currentSimulatedTier === tier
                      ? 'bg-amber-100 border-2 border-amber-400 text-amber-900'
                      : tier === actualTier
                      ? 'bg-green-50 border-2 border-green-200 text-green-800'
                      : 'bg-slate-50 border-2 border-transparent hover:border-slate-200 text-slate-700'
                  }`}
                >
                  <div>
                    <p className="font-semibold">{TIER_INFO[tier].name}</p>
                    <p className="text-xs opacity-70">{TIER_INFO[tier].label}</p>
                  </div>
                  {currentSimulatedTier === tier && (
                    <span className="text-xs bg-amber-500 text-white px-2 py-1 rounded-full">Simulating</span>
                  )}
                  {tier === actualTier && currentSimulatedTier !== tier && (
                    <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">Actual</span>
                  )}
                </button>
              ))}
            </div>

            {/* Reset button */}
            {isSimulating && (
              <button
                onClick={() => onTierChange(null)}
                className="w-full mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-colors"
              >
                Reset to Actual Tier
              </button>
            )}

            {/* Info */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>Note:</strong> Simulation only affects what you see. Your actual data and subscription remain unchanged.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
