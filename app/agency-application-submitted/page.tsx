'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AgencyApplicationSubmittedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Application Submitted Successfully!
          </h1>
          <p className="text-slate-600">
            Thank you for applying to become a certified AISO Studio agency partner.
          </p>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="font-bold text-slate-900 mb-3">What Happens Next?</h2>
          <ol className="space-y-3 text-sm text-slate-700">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-xs font-bold">
                1
              </span>
              <div>
                <strong>Review (1-2 business days)</strong>
                <p className="text-slate-600">
                  Our team will review your application, portfolio, and service offerings.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-xs font-bold">
                2
              </span>
              <div>
                <strong>Email Notification</strong>
                <p className="text-slate-600">
                  You'll receive an email when your application is approved or if we need more information.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-xs font-bold">
                3
              </span>
              <div>
                <strong>Start Receiving Leads</strong>
                <p className="text-slate-600">
                  Once approved, we'll start matching you with qualified leads who need AI searchability fixes.
                </p>
              </div>
            </li>
          </ol>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 mb-6">
          <h3 className="font-bold text-green-900 mb-2">While You Wait...</h3>
          <ul className="text-sm text-green-800 space-y-2">
            <li>• Review our agency playbook (coming soon) to understand the lead flow</li>
            <li>• Prepare your AI searchability audit process and pricing</li>
            <li>• Set up email templates for quick lead responses (24hr response time)</li>
            <li>• Ensure your team is ready to handle $5K-$10K technical SEO engagements</li>
          </ul>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-6">
          <h3 className="font-bold text-slate-900 mb-3">Expected Lead Value</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">$2,500</div>
              <div className="text-xs text-slate-600">Average Audit Price</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">$5-8K</div>
              <div className="text-xs text-slate-600">Fix Implementation</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">$800-1.2K/mo</div>
              <div className="text-xs text-slate-600">Ongoing Monitoring</div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="block w-full bg-blue-600 text-white text-center px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Go to Dashboard
          </Link>
          <button
            onClick={() => router.push('/')}
            className="block w-full bg-white text-slate-700 text-center px-6 py-3 rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors"
          >
            Return to Home
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-200 text-center">
          <p className="text-sm text-slate-600">
            Questions about your application?{' '}
            <a
              href="mailto:support@aisostudio.com"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
