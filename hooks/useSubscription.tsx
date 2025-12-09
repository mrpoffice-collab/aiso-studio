'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type SubscriptionTier = 'trial' | 'starter' | 'professional' | 'agency' | 'enterprise';

interface SubscriptionInfo {
  tier: SubscriptionTier;
  status: string;
  articleLimit: number;
  articlesUsed: number;
  lockedDomain?: string;
  isLoading: boolean;
  error: string | null;
}

interface SubscriptionContextType extends SubscriptionInfo {
  // Feature access helpers
  canAccessSales: boolean;
  canAccessClients: boolean;
  canAccessWinClient: boolean;
  canAccessMultipleDomains: boolean;
  // Refresh function
  refresh: () => Promise<void>;
  // Check if a feature requires upgrade
  requiresUpgrade: (feature: 'sales' | 'clients' | 'win-client' | 'multi-domain') => boolean;
  // Domain locking
  setLockedDomain: (domain: string) => Promise<string | null>;
  isDomainAllowed: (domain: string) => boolean;
  // Tier simulation (admin only)
  actualTier: SubscriptionTier;
  simulatedTier: SubscriptionTier | null;
  setSimulatedTier: (tier: SubscriptionTier | null) => void;
  isSimulating: boolean;
}

const defaultContext: SubscriptionContextType = {
  tier: 'trial',
  status: 'trialing',
  articleLimit: 10,
  articlesUsed: 0,
  lockedDomain: undefined,
  isLoading: true,
  error: null,
  canAccessSales: false,
  canAccessClients: false,
  canAccessWinClient: false,
  canAccessMultipleDomains: false,
  refresh: async () => {},
  requiresUpgrade: () => true,
  setLockedDomain: async () => null,
  isDomainAllowed: () => true,
  actualTier: 'trial',
  simulatedTier: null,
  setSimulatedTier: () => {},
  isSimulating: false,
};

const SubscriptionContext = createContext<SubscriptionContextType>(defaultContext);

// Tier hierarchy for feature access
const TIER_FEATURES = {
  trial: ['audit', 'strategies', 'posts', 'vault'],
  starter: ['audit', 'strategies', 'posts', 'vault'],
  professional: ['audit', 'strategies', 'posts', 'vault', 'sales', 'clients', 'win-client', 'multi-domain'],
  agency: ['audit', 'strategies', 'posts', 'vault', 'sales', 'clients', 'win-client', 'multi-domain'],
  enterprise: ['audit', 'strategies', 'posts', 'vault', 'sales', 'clients', 'win-client', 'multi-domain'],
} as const;

// Check if a tier has access to a feature
function tierHasFeature(tier: SubscriptionTier, feature: string): boolean {
  return TIER_FEATURES[tier]?.includes(feature as any) ?? false;
}

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscription, setSubscription] = useState<SubscriptionInfo>({
    tier: 'trial',
    status: 'trialing',
    articleLimit: 10,
    articlesUsed: 0,
    lockedDomain: undefined,
    isLoading: true,
    error: null,
  });

  // Simulation state - stored in sessionStorage so it persists across page loads but not sessions
  const [simulatedTier, setSimulatedTierState] = useState<SubscriptionTier | null>(null);

  // Load simulated tier from sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem('aiso_simulated_tier');
    if (stored && ['trial', 'starter', 'professional', 'agency', 'enterprise'].includes(stored)) {
      setSimulatedTierState(stored as SubscriptionTier);
    }
  }, []);

  // Set simulated tier and persist to sessionStorage
  const setSimulatedTier = (tier: SubscriptionTier | null) => {
    setSimulatedTierState(tier);
    if (tier) {
      sessionStorage.setItem('aiso_simulated_tier', tier);
    } else {
      sessionStorage.removeItem('aiso_simulated_tier');
    }
  };

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (!response.ok) {
        throw new Error('Failed to fetch subscription');
      }
      const data = await response.json();

      setSubscription({
        tier: data.user?.subscription_tier || 'trial',
        status: data.user?.subscription_status || 'trialing',
        articleLimit: data.user?.article_limit || 10,
        articlesUsed: data.user?.articles_used_this_month || 0,
        lockedDomain: data.user?.locked_domain || undefined,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      setSubscription(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      }));
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  // Helper to normalize domain
  const normalizeDomain = (domain: string): string => {
    try {
      if (domain.includes('://')) {
        const url = new URL(domain);
        return url.hostname.replace(/^www\./, '').toLowerCase();
      }
      return domain.replace(/^www\./, '').toLowerCase().split('/')[0];
    } catch {
      return domain.replace(/^www\./, '').toLowerCase().split('/')[0];
    }
  };

  // Set locked domain for Starter users
  const setLockedDomain = async (domain: string): Promise<string | null> => {
    try {
      const response = await fetch('/api/user/domain-lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
      });
      if (!response.ok) return null;
      const data = await response.json();
      if (data.lockedDomain) {
        setSubscription(prev => ({ ...prev, lockedDomain: data.lockedDomain }));
      }
      return data.lockedDomain || null;
    } catch {
      return null;
    }
  };

  // Check if a domain is allowed for current user
  const isDomainAllowed = (domain: string): boolean => {
    const effectiveTier = simulatedTier || subscription.tier;
    if (tierHasFeature(effectiveTier, 'multi-domain')) return true;
    if (!subscription.lockedDomain) return true;
    return normalizeDomain(domain) === normalizeDomain(subscription.lockedDomain);
  };

  // The effective tier used for feature checks (simulated or actual)
  const effectiveTier = simulatedTier || subscription.tier;
  const isSimulating = simulatedTier !== null;

  const contextValue: SubscriptionContextType = {
    ...subscription,
    // Override tier with simulated tier if active
    tier: effectiveTier,
    canAccessSales: tierHasFeature(effectiveTier, 'sales'),
    canAccessClients: tierHasFeature(effectiveTier, 'clients'),
    canAccessWinClient: tierHasFeature(effectiveTier, 'win-client'),
    canAccessMultipleDomains: tierHasFeature(effectiveTier, 'multi-domain'),
    refresh: fetchSubscription,
    requiresUpgrade: (feature) => !tierHasFeature(effectiveTier, feature),
    setLockedDomain,
    isDomainAllowed,
    // Simulation props
    actualTier: subscription.tier,
    simulatedTier,
    setSimulatedTier,
    isSimulating,
  };

  return (
    <SubscriptionContext.Provider value={contextValue}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}

// Export tier display names and prices
export const TIER_INFO = {
  trial: { name: 'Trial', price: 0, label: 'Free Trial' },
  starter: { name: 'Starter', price: 39, label: '$39/mo' },
  professional: { name: 'Pro', price: 249, label: '$249/mo' },
  agency: { name: 'Agency', price: 599, label: '$599/mo' },
  enterprise: { name: 'Enterprise', price: 999, label: 'Custom' },
} as const;
