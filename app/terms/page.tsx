import Link from 'next/link';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black text-deep-indigo">
            AISO Studio
          </Link>
          <Link href="/" className="text-sm font-medium text-slate-600 hover:text-deep-indigo">
            ← Back to Home
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <h1 className="text-4xl font-black text-slate-900 mb-2">Terms of Service</h1>
        <p className="text-slate-600 mb-8">Last updated: [DATE]</p>

        <div className="prose prose-slate max-w-none">
          {/* DRAFT NOTICE */}
          <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-6 mb-8">
            <p className="text-amber-800 font-bold m-0">
              DRAFT - This document is under legal review and will be finalized before public launch.
            </p>
          </div>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using AISO Studio ("Service"), you agree to be bound by these Terms of Service.
            If you do not agree, do not use the Service.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            AISO Studio is an AI-powered content optimization platform for marketing agencies. The Service includes:
          </p>
          <ul>
            <li>Content auditing and scoring (AISO Score)</li>
            <li>AI-powered content generation and improvement</li>
            <li>Content adaptation across industry verticals</li>
            <li>Lead discovery and sales pipeline tools</li>
            <li>WordPress publishing integration</li>
            <li>White-label PDF report generation</li>
          </ul>

          <h2>3. User Accounts</h2>
          <p>
            [NEED TO ADDRESS: Account creation, authentication via Clerk, account security responsibilities]
          </p>

          <h2>4. Subscription and Billing</h2>
          <p>
            [NEED TO ADDRESS: Subscription tiers (Starter, Pro, Agency), billing cycles, refund policy,
            cancellation terms, price changes, free trial terms]
          </p>

          <h2>5. Content Rights and Responsibilities</h2>
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 my-4">
            <p className="text-red-800 font-bold">KEY CONCERN - CONTENT OWNERSHIP</p>
            <p className="text-red-700">
              Users can audit and rewrite content from any URL. We need to clearly state:
            </p>
            <ul className="text-red-700">
              <li>Users are solely responsible for having rights to content they process</li>
              <li>Users must own or have permission to modify/republish content</li>
              <li>AISO Studio is not responsible for copyright infringement by users</li>
              <li>We do not verify ownership of audited content</li>
              <li>Intended use: agencies working with their own clients' content</li>
            </ul>
          </div>
          <p>
            You retain ownership of content you create using our Service. You grant us a limited license
            to process your content solely to provide the Service.
          </p>

          <h2>6. Acceptable Use</h2>
          <p>You agree NOT to:</p>
          <ul>
            <li>Use the Service to process content you do not have rights to modify</li>
            <li>Plagiarize or republish others' content without permission</li>
            <li>Generate content that is illegal, harmful, or violates third-party rights</li>
            <li>Attempt to reverse engineer or exploit the Service</li>
            <li>Exceed rate limits or abuse API access</li>
            <li>Share account credentials</li>
          </ul>

          <h2>7. AI-Generated Content Disclaimer</h2>
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 my-4">
            <p className="text-blue-800 font-bold">CONCERN - AI ACCURACY</p>
            <p className="text-blue-700">
              Need to address:
            </p>
            <ul className="text-blue-700">
              <li>AI-generated content may contain errors</li>
              <li>Fact-checking feature provides guidance, not guarantees</li>
              <li>Users should review all content before publishing</li>
              <li>We are not liable for inaccuracies in generated content</li>
            </ul>
          </div>

          <h2>8. Data Storage and Retention</h2>
          <p>
            [NEED TO ADDRESS: How long we store content, audit history, user data.
            Tier-based retention limits. Data deletion upon account closure.]
          </p>

          <h2>9. Third-Party Integrations</h2>
          <p>
            [NEED TO ADDRESS: WordPress integration, Clerk authentication, Stripe payments,
            Anthropic AI - user data shared with these services]
          </p>

          <h2>10. Limitation of Liability</h2>
          <p>
            [NEED TO ADDRESS: Standard SaaS liability limitations, no warranty,
            service provided "as is", limitation of damages]
          </p>

          <h2>11. Indemnification</h2>
          <p>
            You agree to indemnify AISO Studio against claims arising from your use of the Service,
            including but not limited to claims of copyright infringement for content you process.
          </p>

          <h2>12. Termination</h2>
          <p>
            [NEED TO ADDRESS: Our right to terminate accounts, user right to cancel,
            effect of termination on data]
          </p>

          <h2>13. Changes to Terms</h2>
          <p>
            We may update these terms. Continued use constitutes acceptance of changes.
          </p>

          <h2>14. Contact</h2>
          <p>
            Questions about these Terms? Contact us at [EMAIL].
          </p>

          {/* LAWYER NOTES */}
          <div className="bg-slate-100 border-2 border-slate-300 rounded-xl p-6 mt-12">
            <h3 className="text-slate-800 font-bold">Notes for Legal Review</h3>
            <ul className="text-slate-700">
              <li><strong>Primary concern:</strong> Content ownership/plagiarism - users can audit any URL and rewrite the content</li>
              <li><strong>Business model:</strong> SaaS subscription (Starter $29, Pro $79, Agency $199/month)</li>
              <li><strong>Target market:</strong> Marketing agencies in the US</li>
              <li><strong>Third parties:</strong> Clerk (auth), Stripe (payments), Anthropic (AI), Neon (database), Vercel (hosting)</li>
              <li><strong>Data:</strong> We store user content, audit results, generated articles</li>
              <li><strong>AI:</strong> Content is generated/improved by Claude (Anthropic)</li>
            </ul>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="container mx-auto px-6 py-8 text-center text-sm text-slate-600">
          <p>&copy; {new Date().getFullYear()} AISO Studio. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <Link href="/terms" className="hover:text-deep-indigo">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-deep-indigo">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
