import Link from 'next/link';

export default function PrivacyPolicyPage() {
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
        <h1 className="text-4xl font-black text-slate-900 mb-2">Privacy Policy</h1>
        <p className="text-slate-600 mb-8">Last updated: [DATE]</p>

        <div className="prose prose-slate max-w-none">
          {/* DRAFT NOTICE */}
          <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-6 mb-8">
            <p className="text-amber-800 font-bold m-0">
              DRAFT - This document is under legal review and will be finalized before public launch.
            </p>
          </div>

          <h2>1. Introduction</h2>
          <p>
            AISO Studio ("we", "our", "us") respects your privacy. This Privacy Policy explains how we collect,
            use, disclose, and safeguard your information when you use our Service.
          </p>

          <h2>2. Information We Collect</h2>

          <h3>2.1 Account Information</h3>
          <ul>
            <li>Email address</li>
            <li>Name</li>
            <li>Authentication data (managed by Clerk)</li>
          </ul>

          <h3>2.2 Payment Information</h3>
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 my-4">
            <p className="text-blue-700 m-0">
              Payment processing is handled by Stripe. We do not store credit card numbers.
              We receive: last 4 digits, card type, billing address, subscription status.
            </p>
          </div>

          <h3>2.3 Content Data</h3>
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 my-4">
            <p className="text-red-800 font-bold">KEY CONCERN - CONTENT STORAGE</p>
            <p className="text-red-700">We store:</p>
            <ul className="text-red-700">
              <li>URLs submitted for audit</li>
              <li>Content scraped from those URLs</li>
              <li>Audit results and scores</li>
              <li>AI-generated/improved content</li>
              <li>Content strategies and topics</li>
              <li>Lead discovery data</li>
            </ul>
            <p className="text-red-700">
              Need to clarify: retention periods, deletion rights, what happens on account closure.
            </p>
          </div>

          <h3>2.4 Usage Data</h3>
          <ul>
            <li>Pages visited</li>
            <li>Features used</li>
            <li>Time spent on Service</li>
            <li>Browser/device information</li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          <ul>
            <li>To provide and maintain the Service</li>
            <li>To process your subscription and payments</li>
            <li>To send service-related communications</li>
            <li>To improve the Service</li>
            <li>To respond to support requests</li>
            <li>To detect and prevent fraud or abuse</li>
          </ul>

          <h2>4. Third-Party Services</h2>
          <p>We share data with the following services:</p>

          <table className="w-full border-collapse border border-slate-300 my-4">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-300 p-2 text-left">Service</th>
                <th className="border border-slate-300 p-2 text-left">Purpose</th>
                <th className="border border-slate-300 p-2 text-left">Data Shared</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-300 p-2">Clerk</td>
                <td className="border border-slate-300 p-2">Authentication</td>
                <td className="border border-slate-300 p-2">Email, name, auth tokens</td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2">Stripe</td>
                <td className="border border-slate-300 p-2">Payments</td>
                <td className="border border-slate-300 p-2">Payment info, billing address</td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2">Anthropic (Claude)</td>
                <td className="border border-slate-300 p-2">AI Processing</td>
                <td className="border border-slate-300 p-2">Content submitted for audit/generation</td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2">Neon</td>
                <td className="border border-slate-300 p-2">Database</td>
                <td className="border border-slate-300 p-2">All stored data</td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2">Vercel</td>
                <td className="border border-slate-300 p-2">Hosting</td>
                <td className="border border-slate-300 p-2">Request logs, IP addresses</td>
              </tr>
            </tbody>
          </table>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 my-4">
            <p className="text-blue-800 font-bold">CONCERN - ANTHROPIC DATA</p>
            <p className="text-blue-700">
              Content is sent to Anthropic's Claude API for processing. Need to review Anthropic's
              data retention and training policies. As of current knowledge, Anthropic does not use
              API inputs for training, but this should be verified and disclosed.
            </p>
          </div>

          <h2>5. Data Retention</h2>
          <p>[NEED TO ADDRESS:]</p>
          <ul>
            <li>How long we keep audit history</li>
            <li>How long we keep generated content</li>
            <li>Tier-based retention (Agency = unlimited, others = limited)</li>
            <li>Data deletion upon account closure</li>
          </ul>

          <h2>6. Data Security</h2>
          <p>
            We implement security measures including:
          </p>
          <ul>
            <li>SSL/TLS encryption for data in transit</li>
            <li>Encrypted database connections</li>
            <li>Secure authentication via Clerk</li>
            <li>Access controls for employee access</li>
          </ul>
          <p>
            However, no method of transmission or storage is 100% secure.
          </p>

          <h2>7. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Export your data</li>
            <li>Opt out of marketing communications</li>
          </ul>

          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6 my-4">
            <p className="text-amber-800 font-bold">CONCERN - GDPR/CCPA</p>
            <p className="text-amber-700">
              If serving EU users (GDPR) or California users (CCPA), additional disclosures
              and rights may be required. Current target market is US marketing agencies.
            </p>
          </div>

          <h2>8. Cookies</h2>
          <p>
            [NEED TO ADDRESS: What cookies we use, Clerk cookies, analytics cookies if any]
          </p>

          <h2>9. Children's Privacy</h2>
          <p>
            The Service is not intended for users under 18. We do not knowingly collect
            information from children.
          </p>

          <h2>10. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy. We will notify you of changes by posting
            the new policy on this page and updating the "Last updated" date.
          </p>

          <h2>11. Contact Us</h2>
          <p>
            Questions about this Privacy Policy? Contact us at [EMAIL].
          </p>

          {/* LAWYER NOTES */}
          <div className="bg-slate-100 border-2 border-slate-300 rounded-xl p-6 mt-12">
            <h3 className="text-slate-800 font-bold">Notes for Legal Review</h3>
            <ul className="text-slate-700">
              <li><strong>Business type:</strong> B2B SaaS for marketing agencies</li>
              <li><strong>Primary market:</strong> United States</li>
              <li><strong>Key data concern:</strong> We process/store content from URLs users submit (may be third-party content)</li>
              <li><strong>AI processing:</strong> Content sent to Anthropic Claude API</li>
              <li><strong>Payment:</strong> Stripe handles all payment data</li>
              <li><strong>Auth:</strong> Clerk handles authentication</li>
              <li><strong>Database:</strong> Neon PostgreSQL (hosted)</li>
              <li><strong>Hosting:</strong> Vercel</li>
              <li><strong>No analytics currently:</strong> May add in future</li>
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
