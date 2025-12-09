'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import UserDropdown from '@/components/UserDropdown';
import UpgradeCTA from '@/components/UpgradeCTA';
import { useSubscription, TIER_INFO } from '@/hooks/useSubscription';

type NavItem = {
  href: string;
  label: string;
  highlight?: boolean;
  requiresFeature?: 'sales' | 'clients' | 'win-client' | 'multi-domain';
};

export default function DashboardNav() {
  const pathname = usePathname();
  const { tier, canAccessSales, canAccessClients, canAccessWinClient, isLoading } = useSubscription();
  const [upgradeModal, setUpgradeModal] = useState<{
    isOpen: boolean;
    feature: 'sales' | 'clients' | 'win-client' | 'multi-domain';
  }>({ isOpen: false, feature: 'sales' });

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === path;
    }
    return pathname?.startsWith(path);
  };

  // All nav items with their feature requirements
  const allNavItems: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/dashboard/win-client', label: 'Win a Client', highlight: true, requiresFeature: 'win-client' },
    { href: '/dashboard/sales', label: 'Sales', requiresFeature: 'sales' },
    { href: '/dashboard/clients', label: 'Clients', requiresFeature: 'clients' },
    { href: '/dashboard/strategies', label: 'Strategies' },
    { href: '/dashboard/posts', label: 'Posts' },
    { href: '/dashboard/assets', label: 'Vault' },
    { href: '/dashboard/audit', label: 'AISO Audit' },
  ];

  // Filter items based on tier access
  const visibleNavItems = allNavItems.filter(item => {
    if (!item.requiresFeature) return true;
    if (item.requiresFeature === 'sales') return canAccessSales;
    if (item.requiresFeature === 'clients') return canAccessClients;
    if (item.requiresFeature === 'win-client') return canAccessWinClient;
    return true;
  });

  // Items that are locked for current tier (shown with lock icon)
  const lockedItems = allNavItems.filter(item => {
    if (!item.requiresFeature) return false;
    if (item.requiresFeature === 'sales') return !canAccessSales;
    if (item.requiresFeature === 'clients') return !canAccessClients;
    if (item.requiresFeature === 'win-client') return !canAccessWinClient;
    return false;
  });

  const handleLockedClick = (feature: 'sales' | 'clients' | 'win-client' | 'multi-domain') => {
    setUpgradeModal({ isOpen: true, feature });
  };

  // Show tier badge for starter users
  const showUpgradeHint = tier === 'trial' || tier === 'starter';

  return (
    <>
      <header className="border-b border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-sm sticky top-0 z-50">
        <div className="container mx-auto flex h-20 items-center justify-between px-6">
          <div className="flex items-center gap-12">
            <Link href="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-sunset-orange to-orange-600 bg-clip-text text-transparent">
              AISO Studio
            </Link>
            <nav className="flex gap-6 items-center">
              {/* Visible nav items */}
              {visibleNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-semibold transition-all duration-200 ${
                    item.highlight
                      ? isActive(item.href)
                        ? 'bg-gradient-to-r from-sunset-orange to-orange-500 text-white px-4 py-2 rounded-full shadow-lg'
                        : 'bg-gradient-to-r from-sunset-orange to-orange-500 text-white px-4 py-2 rounded-full hover:shadow-lg hover:scale-105'
                      : isActive(item.href)
                        ? 'text-deep-indigo border-b-2 border-sunset-orange pb-1'
                        : 'text-slate-600 hover:text-deep-indigo hover:scale-105'
                  }`}
                >
                  {item.highlight && '🎯 '}{item.label}
                </Link>
              ))}

              {/* Locked items shown with lock icon */}
              {lockedItems.length > 0 && showUpgradeHint && (
                <>
                  <div className="h-6 w-px bg-slate-200" />
                  {lockedItems.map((item) => (
                    <button
                      key={item.href}
                      onClick={() => handleLockedClick(item.requiresFeature!)}
                      className="flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-purple-600 transition-colors group"
                    >
                      <svg className="w-3.5 h-3.5 text-slate-300 group-hover:text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      {item.label}
                    </button>
                  ))}
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Tier badge */}
            {!isLoading && showUpgradeHint && (
              <Link
                href="/dashboard/account?upgrade=pro"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 text-xs font-semibold hover:from-purple-200 hover:to-indigo-200 transition-colors"
              >
                <span>{TIER_INFO[tier].name}</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </Link>
            )}
            <UserDropdown />
          </div>
        </div>
      </header>

      {/* Upgrade modal */}
      <UpgradeCTA
        feature={upgradeModal.feature}
        isOpen={upgradeModal.isOpen}
        onClose={() => setUpgradeModal({ ...upgradeModal, isOpen: false })}
      />
    </>
  );
}
