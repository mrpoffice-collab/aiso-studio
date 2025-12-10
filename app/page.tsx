'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();
  const [auditUrl, setAuditUrl] = useState('');

  const handleQuickAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (auditUrl.trim()) {
      router.push(`/audit?url=${encodeURIComponent(auditUrl.trim())}`);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-xl shadow-sm sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link href="/" className="text-xl font-black bg-gradient-to-r from-sunset-orange to-orange-600 bg-clip-text text-transparent">
            AISO Studio
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#how-it-works" className="text-sm font-semibold text-slate-600 hover:text-sunset-orange transition-colors">
              How It Works
            </a>
            <a href="#pricing" className="text-sm font-semibold text-slate-600 hover:text-sunset-orange transition-colors">
              Pricing
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/sign-in" className="text-sm font-semibold text-slate-600 hover:text-sunset-orange">
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="rounded-lg bg-gradient-to-r from-sunset-orange to-orange-600 px-5 py-2 text-sm font-bold text-white shadow-md hover:shadow-lg transition-all hover:scale-105"
            >
              Start Free
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* HERO - Simple, Clear */}
        <section className="bg-gradient-to-br from-slate-50 via-white to-orange-50/30 py-16 lg:py-24">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl lg:text-6xl font-black text-slate-900 mb-6 leading-tight">
                Your Content Is Invisible to AI.{' '}
                <span className="bg-gradient-to-r from-sunset-orange to-orange-600 bg-clip-text text-transparent">
                  Let's Fix That.
                </span>
              </h1>

              <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
                ChatGPT, Perplexity, and Google's AI can't read most websites properly.
                AISO Studio audits your content, shows you exactly what's broken, and rewrites it so AI actually understands it.
              </p>

              {/* Audit Input */}
              <form onSubmit={handleQuickAudit} className="max-w-xl mx-auto mb-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="url"
                    value={auditUrl}
                    onChange={(e) => setAuditUrl(e.target.value)}
                    placeholder="Enter any URL to audit..."
                    className="flex-1 rounded-lg border-2 border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-sunset-orange focus:outline-none transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!auditUrl.trim()}
                    className="rounded-lg bg-gradient-to-r from-sunset-orange to-orange-600 px-6 py-3 font-bold text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 whitespace-nowrap"
                  >
                    Free Audit
                  </button>
                </div>
                <p className="text-sm text-slate-500 mt-3">
                  No signup required. See your score in 30 seconds.
                </p>
              </form>
            </div>
          </div>
        </section>

        {/* THE PROBLEM */}
        <section className="py-16 bg-white border-y border-slate-100">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-black text-slate-900 mb-8 text-center">
                Why Your Content Isn't Getting Found
              </h2>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-6 rounded-xl bg-red-50 border border-red-200">
                  <div className="text-3xl mb-3">🤖</div>
                  <h3 className="font-bold text-slate-900 mb-2">AI Can't Parse It</h3>
                  <p className="text-sm text-slate-600">
                    No clear structure, no FAQ sections, no direct answers. AI engines skip over your content entirely.
                  </p>
                </div>

                <div className="p-6 rounded-xl bg-yellow-50 border border-yellow-200">
                  <div className="text-3xl mb-3">📖</div>
                  <h3 className="font-bold text-slate-900 mb-2">Hard to Read</h3>
                  <p className="text-sm text-slate-600">
                    Dense paragraphs, jargon, passive voice. Both humans and AI struggle to extract value.
                  </p>
                </div>

                <div className="p-6 rounded-xl bg-orange-50 border border-orange-200">
                  <div className="text-3xl mb-3">🔍</div>
                  <h3 className="font-bold text-slate-900 mb-2">SEO Alone Isn't Enough</h3>
                  <p className="text-sm text-slate-600">
                    Traditional SEO doesn't optimize for AI answer engines. You need both.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="py-16 bg-gradient-to-br from-slate-50 to-white">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-black text-slate-900 mb-4 text-center">
                How AISO Studio Works
              </h2>
              <p className="text-lg text-slate-600 mb-12 text-center">
                Three steps to content that AI actually understands.
              </p>

              <div className="space-y-8">
                {/* Step 1 */}
                <div className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-sunset-orange to-orange-600 flex items-center justify-center text-white font-black text-xl">
                    1
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Audit</h3>
                    <p className="text-slate-600">
                      Paste a URL or your content. Get a transparent 0-100 AISO score across 6 dimensions:
                      AI optimization, SEO, readability, engagement, fact-checking, and accessibility.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-sunset-orange to-orange-600 flex items-center justify-center text-white font-black text-xl">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Fix</h3>
                    <p className="text-slate-600">
                      See exactly what's wrong. One-click rewrites target specific weaknesses—improve readability
                      without losing your voice, add AI-friendly structure, fix SEO gaps.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-sunset-orange to-orange-600 flex items-center justify-center text-white font-black text-xl">
                    3
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Publish</h3>
                    <p className="text-slate-600">
                      Export your optimized content. Track score improvements over time.
                      Watch your content start appearing in AI answers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WHAT YOU GET */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-black text-slate-900 mb-12 text-center">
                What's Included
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 rounded-xl border-2 border-slate-200 hover:border-orange-300 transition-all">
                  <div className="text-2xl mb-3">📊</div>
                  <h3 className="font-bold text-slate-900 mb-2">AISO Content Audit</h3>
                  <p className="text-sm text-slate-600">
                    Transparent 0-100 scoring. See exactly where your content falls short and why.
                  </p>
                </div>

                <div className="p-6 rounded-xl border-2 border-slate-200 hover:border-orange-300 transition-all">
                  <div className="text-2xl mb-3">✏️</div>
                  <h3 className="font-bold text-slate-900 mb-2">AI-Powered Rewrites</h3>
                  <p className="text-sm text-slate-600">
                    Selective optimization passes. Fix readability, SEO, or AI structure without losing your voice.
                  </p>
                </div>

                <div className="p-6 rounded-xl border-2 border-slate-200 hover:border-orange-300 transition-all">
                  <div className="text-2xl mb-3">🔍</div>
                  <h3 className="font-bold text-slate-900 mb-2">Fact-Checking</h3>
                  <p className="text-sm text-slate-600">
                    Automatic claim verification. Catch errors before they hurt your credibility.
                  </p>
                </div>

                <div className="p-6 rounded-xl border-2 border-slate-200 hover:border-orange-300 transition-all">
                  <div className="text-2xl mb-3">♿</div>
                  <h3 className="font-bold text-slate-900 mb-2">Accessibility Scanning</h3>
                  <p className="text-sm text-slate-600">
                    WCAG compliance checks. Make your content accessible to everyone.
                  </p>
                </div>

                <div className="p-6 rounded-xl border-2 border-slate-200 hover:border-orange-300 transition-all">
                  <div className="text-2xl mb-3">📅</div>
                  <h3 className="font-bold text-slate-900 mb-2">Content Strategy</h3>
                  <p className="text-sm text-slate-600">
                    AI-generated content calendars. Know what to write next for your audience.
                  </p>
                </div>

                <div className="p-6 rounded-xl border-2 border-slate-200 hover:border-orange-300 transition-all">
                  <div className="text-2xl mb-3">📁</div>
                  <h3 className="font-bold text-slate-900 mb-2">Asset Vault</h3>
                  <p className="text-sm text-slate-600">
                    Organize images, documents, and brand assets. Everything in one place.
                  </p>
                </div>
              </div>

              {/* Agency Add-on callout */}
              <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">🎯</div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">For Agencies: Client Acquisition Tools</h3>
                    <p className="text-sm text-slate-600">
                      Pro and Agency tiers include lead discovery, pipeline management, proposal generation,
                      and a guided "Win a Client" workflow. Turn audits into paying clients.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="py-16 bg-gradient-to-br from-slate-50 to-white">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-black text-slate-900 mb-4 text-center">
                Simple Pricing
              </h2>
              <p className="text-lg text-slate-600 mb-12 text-center">
                Start free. Upgrade when you need more.
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Starter */}
                <div className="rounded-2xl border-2 border-slate-200 bg-white p-6">
                  <h3 className="text-xl font-black text-slate-900 mb-1">Starter</h3>
                  <p className="text-sm text-slate-500 mb-4">For DIYers</p>
                  <div className="mb-6">
                    <span className="text-4xl font-black text-slate-900">$39</span>
                    <span className="text-slate-500">/mo</span>
                  </div>
                  <ul className="space-y-2 mb-6 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span className="text-slate-900">Unlimited audits</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span className="text-slate-900">25 article rewrites/mo</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span className="text-slate-900">Content strategies</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span className="text-slate-900">5GB asset storage</span>
                    </li>
                  </ul>
                  <Link
                    href="/sign-up"
                    className="block w-full text-center rounded-lg border-2 border-slate-300 px-4 py-2.5 font-bold text-slate-700 hover:bg-slate-50 transition-all"
                  >
                    Start Free Trial
                  </Link>
                </div>

                {/* Pro */}
                <div className="rounded-2xl border-2 border-blue-500 bg-white p-6 relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-blue-500 text-white text-xs font-bold">
                    POPULAR
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-1">Pro</h3>
                  <p className="text-sm text-slate-500 mb-4">For freelancers & small agencies</p>
                  <div className="mb-6">
                    <span className="text-4xl font-black text-blue-600">$249</span>
                    <span className="text-slate-500">/mo</span>
                  </div>
                  <ul className="space-y-2 mb-6 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="text-blue-600">✓</span>
                      <span className="text-slate-900">Everything in Starter</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-600">✓</span>
                      <span className="text-slate-900">100 article rewrites/mo</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-600">✓</span>
                      <span className="text-slate-900">Lead discovery & pipeline</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-600">✓</span>
                      <span className="text-slate-900">Win a Client wizard</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-600">✓</span>
                      <span className="text-slate-900">25GB storage, 3 seats</span>
                    </li>
                  </ul>
                  <Link
                    href="/sign-up"
                    className="block w-full text-center rounded-lg bg-blue-500 px-4 py-2.5 font-bold text-white hover:bg-blue-600 transition-all"
                  >
                    Start Free Trial
                  </Link>
                </div>

                {/* Agency */}
                <div className="rounded-2xl border-2 border-orange-400 bg-white p-6">
                  <h3 className="text-xl font-black text-slate-900 mb-1">Agency</h3>
                  <p className="text-sm text-slate-500 mb-4">For growing agencies</p>
                  <div className="mb-6">
                    <span className="text-4xl font-black text-sunset-orange">$599</span>
                    <span className="text-slate-500">/mo</span>
                  </div>
                  <ul className="space-y-2 mb-6 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="text-sunset-orange">✓</span>
                      <span className="text-slate-900">Everything in Pro</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-sunset-orange">✓</span>
                      <span className="text-slate-900">500 article rewrites/mo</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-sunset-orange">✓</span>
                      <span className="text-slate-900">White-label PDF reports</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-sunset-orange">✓</span>
                      <span className="text-slate-900">100GB storage, 10 seats</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-sunset-orange">✓</span>
                      <span className="text-slate-900">Priority support</span>
                    </li>
                  </ul>
                  <Link
                    href="/sign-up"
                    className="block w-full text-center rounded-lg bg-gradient-to-r from-sunset-orange to-orange-600 px-4 py-2.5 font-bold text-white hover:shadow-lg transition-all"
                  >
                    Start Free Trial
                  </Link>
                </div>
              </div>

              <p className="text-center text-sm text-slate-500 mt-8">
                7-day free trial on all plans. No credit card required.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ - Short */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl font-black text-slate-900 mb-8 text-center">
                Questions
              </h2>

              <div className="space-y-4">
                <details className="bg-slate-50 rounded-lg p-4 group">
                  <summary className="font-bold text-slate-900 cursor-pointer list-none flex justify-between items-center">
                    What is AISO scoring?
                    <span className="text-sunset-orange group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="text-slate-600 mt-3 text-sm">
                    AISO = AI Search Optimization. It's a 0-100 score measuring how well AI systems can understand and cite your content.
                    We check readability, structure, SEO, fact accuracy, and AI-specific formatting.
                  </p>
                </details>

                <details className="bg-slate-50 rounded-lg p-4 group">
                  <summary className="font-bold text-slate-900 cursor-pointer list-none flex justify-between items-center">
                    Will rewrites sound like me?
                    <span className="text-sunset-orange group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="text-slate-600 mt-3 text-sm">
                    Yes. We use selective optimization—fixing specific issues rather than regenerating everything.
                    Your voice stays intact while the structure improves.
                  </p>
                </details>

                <details className="bg-slate-50 rounded-lg p-4 group">
                  <summary className="font-bold text-slate-900 cursor-pointer list-none flex justify-between items-center">
                    What if a URL won't scan?
                    <span className="text-sunset-orange group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="text-slate-600 mt-3 text-sm">
                    Some sites block automated access. Just copy/paste your content directly instead—the audit works the same way.
                  </p>
                </details>

                <details className="bg-slate-50 rounded-lg p-4 group">
                  <summary className="font-bold text-slate-900 cursor-pointer list-none flex justify-between items-center">
                    Can I cancel anytime?
                    <span className="text-sunset-orange group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="text-slate-600 mt-3 text-sm">
                    Yes. No contracts, no cancellation fees. Your trial is free for 7 days with no credit card required.
                  </p>
                </details>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-16 bg-gradient-to-r from-sunset-orange to-orange-600">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl mx-auto text-center text-white">
              <h2 className="text-3xl font-black mb-4">
                See How Your Content Scores
              </h2>
              <p className="text-lg mb-8 opacity-95">
                Free audit. No signup. 30 seconds.
              </p>
              <Link
                href="/audit"
                className="inline-block rounded-xl bg-white px-8 py-4 font-bold text-sunset-orange shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
              >
                Run Free Audit
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER - Minimal */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-slate-600">
              © 2025 AISO Studio
            </div>
            <div className="flex gap-6 text-sm text-slate-600">
              <Link href="/audit" className="hover:text-sunset-orange">Free Audit</Link>
              <Link href="/sign-up" className="hover:text-sunset-orange">Sign Up</Link>
              <Link href="/sign-in" className="hover:text-sunset-orange">Sign In</Link>
              <Link href="/terms" className="hover:text-sunset-orange">Terms</Link>
              <Link href="/privacy" className="hover:text-sunset-orange">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
