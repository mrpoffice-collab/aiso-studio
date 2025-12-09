'use client';

import { useSubscription, TIER_INFO } from '@/hooks/useSubscription';
import Link from 'next/link';

interface DomainLockGateProps {
  domain: string;
  children: React.ReactNode;
  onDomainLocked?: (lockedDomain: string) => void;
}

/**
 * Extract base domain from a URL or domain string
 */
function extractDomain(input: string): string {
  try {
    // If it looks like a full URL, parse it
    if (input.includes('://')) {
      const url = new URL(input);
      return url.hostname.replace(/^www\./, '').toLowerCase();
    }
    // Otherwise treat as domain
    return input.replace(/^www\./, '').toLowerCase().split('/')[0];
  } catch {
    return input.replace(/^www\./, '').toLowerCase().split('/')[0];
  }
}

/**
 * Component that gates access to audit features for Starter tier users
 * who are trying to audit a domain different from their locked domain.
 */
export default function DomainLockGate({ domain, children, onDomainLocked }: DomainLockGateProps) {
  const { tier, lockedDomain, canAccessMultipleDomains, isLoading } = useSubscription();

  // Show loading state
  if (isLoading) {
    return <>{children}</>;
  }

  // Users with multi-domain access (Pro+) can audit any domain
  if (canAccessMultipleDomains) {
    return <>{children}</>;
  }

  // Trial and Starter users are limited
  const normalizedDomain = extractDomain(domain);
  const normalizedLockedDomain = lockedDomain ? extractDomain(lockedDomain) : null;

  // If no locked domain yet, allow (will be set on first audit)
  if (!normalizedLockedDomain) {
    return <>{children}</>;
  }

  // Check if trying to audit a different domain
  if (normalizedDomain !== normalizedLockedDomain) {
    return (
      <div className="rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Domain Limit Reached</h3>
            <p className="text-slate-600">
              Your {TIER_INFO[tier].name} plan is limited to one domain. You're currently locked to{' '}
              <span className="font-bold text-amber-700">{normalizedLockedDomain}</span>.
            </p>
          </div>
        </div>

        <div className="bg-white/70 rounded-xl p-5 mb-6 border border-amber-100">
          <p className="text-sm text-slate-600 mb-3">
            <span className="font-bold text-slate-800">Want to audit {normalizedDomain}?</span>
          </p>
          <p className="text-sm text-slate-500">
            Upgrade to Pro to audit unlimited domains, manage multiple clients, and access lead discovery tools.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/dashboard/account?upgrade=pro"
            className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-center hover:shadow-lg hover:scale-[1.02] transition-all"
          >
            Upgrade to Pro - {TIER_INFO.professional.label}
          </Link>
          <Link
            href={`/dashboard/audit?url=https://${normalizedLockedDomain}`}
            className="flex-1 py-3 px-6 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold text-center hover:bg-slate-50 transition-colors"
          >
            Continue with {normalizedLockedDomain}
          </Link>
        </div>
      </div>
    );
  }

  // Domain matches, allow access
  return <>{children}</>;
}

/**
 * Hook to check if a domain is allowed for the current user
 */
export function useDomainLock() {
  const { tier, lockedDomain, canAccessMultipleDomains, isLoading } = useSubscription();

  const isDomainAllowed = (domain: string): boolean => {
    if (isLoading) return true; // Optimistic during load
    if (canAccessMultipleDomains) return true;
    if (!lockedDomain) return true; // No lock set yet

    const normalizedDomain = extractDomain(domain);
    const normalizedLockedDomain = extractDomain(lockedDomain);
    return normalizedDomain === normalizedLockedDomain;
  };

  const getLockedDomainMessage = (attemptedDomain: string): string | null => {
    if (canAccessMultipleDomains) return null;
    if (!lockedDomain) return null;

    const normalizedDomain = extractDomain(attemptedDomain);
    const normalizedLockedDomain = extractDomain(lockedDomain);

    if (normalizedDomain !== normalizedLockedDomain) {
      return `Your ${TIER_INFO[tier].name} plan is locked to ${normalizedLockedDomain}. Upgrade to Pro to audit multiple domains.`;
    }

    return null;
  };

  return {
    isDomainAllowed,
    getLockedDomainMessage,
    lockedDomain,
    canAccessMultipleDomains,
  };
}
