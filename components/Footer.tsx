'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-xl font-black bg-gradient-to-r from-sunset-orange to-orange-600 bg-clip-text text-transparent">
              AISO Studio
            </Link>
            <p className="text-sm text-slate-600 mt-3">
              AI Search Optimization for agencies and content teams.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/audit" className="text-slate-600 hover:text-sunset-orange transition-colors">
                  Free Audit
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="text-slate-600 hover:text-sunset-orange transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="text-slate-600 hover:text-sunset-orange transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/compare" className="text-slate-600 hover:text-sunset-orange transition-colors">
                  Compare
                </Link>
              </li>
            </ul>
          </div>

          {/* Integrations */}
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Integrations</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://www.gohighlevel.com/?fp_ref=aiso"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 hover:text-sunset-orange transition-colors flex items-center gap-1.5"
                >
                  <span>GoHighLevel</span>
                  <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
              <li>
                <span className="text-slate-400">WordPress (Coming Soon)</span>
              </li>
              <li>
                <span className="text-slate-400">Zapier (Coming Soon)</span>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-slate-900 mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/sign-in" className="text-slate-600 hover:text-sunset-orange transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/sign-up" className="text-slate-600 hover:text-sunset-orange transition-colors">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-slate-600 hover:text-sunset-orange transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-slate-600 hover:text-sunset-orange transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} AISO Studio. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              {/* GoHighLevel Partner Badge */}
              <a
                href="https://www.gohighlevel.com/?fp_ref=aiso"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-600 hover:border-orange-300 hover:text-sunset-orange transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                GoHighLevel Partner
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
