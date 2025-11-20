'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import UserDropdown from '@/components/UserDropdown';

export default function DashboardNav() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === path;
    }
    return pathname?.startsWith(path);
  };

  const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/dashboard/leads', label: 'Leads' },
    { href: '/dashboard/pipeline', label: 'Pipeline' },
    { href: '/dashboard/strategies', label: 'Strategies' },
    { href: '/dashboard/posts', label: 'Posts' },
    { href: '/dashboard/audit', label: 'AISO Audit' },
  ];

  return (
    <header className="border-b border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-sm sticky top-0 z-50">
      <div className="container mx-auto flex h-20 items-center justify-between px-6">
        <div className="flex items-center gap-12">
          <Link href="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-sunset-orange to-orange-600 bg-clip-text text-transparent">
            AISO Studio
          </Link>
          <nav className="flex gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-semibold transition-all duration-200 ${
                  isActive(item.href)
                    ? 'text-deep-indigo border-b-2 border-sunset-orange pb-1'
                    : 'text-slate-600 hover:text-deep-indigo hover:scale-105'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <UserDropdown />
      </div>
    </header>
  );
}
