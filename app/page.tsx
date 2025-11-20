import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function Home() {
  const { userId } = await auth();

  // Redirect to dashboard if already signed in
  if (userId) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-sm sticky top-0 z-50">
        <div className="container mx-auto flex h-20 items-center justify-between px-6">
          <h1 className="text-2xl font-black bg-gradient-to-r from-sunset-orange to-orange-600 bg-clip-text text-transparent">
            AISO Studio
          </h1>
          <div className="flex gap-4">
            <Link
              href="/sign-in"
              className="rounded-lg px-6 py-2.5 text-sm font-semibold text-slate-700 hover:text-deep-indigo transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-6 py-20 text-center">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-purple-100 border border-purple-300">
            <span className="text-sm font-bold text-purple-700">Honest Scoring • Real Results</span>
          </div>

          <h1 className="mb-6 text-6xl md:text-7xl font-black tracking-tight bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
            Turn Mediocre Content<br/>Into Top-Tier Quality
          </h1>

          <p className="mx-auto mb-10 max-w-3xl text-xl md:text-2xl text-slate-700 leading-relaxed">
            Audit your blog, get brutally honest scores, and rewrite content until it's actually good.
            No grade inflation. No BS. Just professional-quality content that performs.
          </p>

          <div className="mb-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/sign-up"
              className="rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-4 text-lg font-bold text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
            >
              Start Free Audit
            </Link>
            <Link
              href="#demo"
              className="rounded-xl border-2 border-purple-600 bg-white px-8 py-4 text-lg font-bold text-purple-600 hover:bg-purple-600 hover:text-white transition-all"
            >
              Watch Demo
            </Link>
          </div>

          <p className="text-sm text-slate-500">
            No credit card required • First 3 audits free • See results in 30 seconds
          </p>
        </section>

        {/* Social Proof / Stats */}
        <section className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-black text-purple-600 mb-2">80+</div>
              <div className="text-sm font-semibold text-slate-600">Target Score<br/>"Good Quality"</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-blue-600 mb-2">3x</div>
              <div className="text-sm font-semibold text-slate-600">Iterative<br/>Rewrites</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-orange-600 mb-2">$0.10</div>
              <div className="text-sm font-semibold text-slate-600">Cost Per<br/>Rewrite</div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-6 py-20">
          <h2 className="text-center text-4xl font-black text-slate-900 mb-4">
            Two Products. One Mission.
          </h2>
          <p className="text-center text-xl text-slate-600 mb-16 max-w-2xl mx-auto">
            Whether you're optimizing existing content or building from scratch, we've got you covered.
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Content Audit */}
            <div className="rounded-2xl border-2 border-purple-200 bg-white p-8 shadow-xl hover:shadow-2xl hover:scale-105 transition-all">
              <div className="inline-block mb-4 px-4 py-2 rounded-lg bg-purple-100">
                <span className="text-sm font-bold text-purple-700">Content Audit</span>
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-4">
                Fix What You Have
              </h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Analyze existing blog posts with honest scoring. Get actionable insights on SEO, readability, and engagement. Rewrite until you hit 80+ (Good quality).
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-700"><strong>Batch audit</strong> up to 50 posts at once</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-700"><strong>Recalibrated scoring</strong> (90-100 = Excellent, 80-89 = Good)</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-700"><strong>Iterative rewrites</strong> with side-by-side comparison</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-700"><strong>PDF reports</strong> for client deliverables</span>
                </li>
              </ul>
              <Link
                href="/sign-up"
                className="block w-full text-center rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 font-bold text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                Start Audit
              </Link>
            </div>

            {/* Content Strategy */}
            <div className="rounded-2xl border-2 border-blue-200 bg-white p-8 shadow-xl hover:shadow-2xl hover:scale-105 transition-all">
              <div className="inline-block mb-4 px-4 py-2 rounded-lg bg-blue-100">
                <span className="text-sm font-bold text-blue-700">Content Strategy</span>
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-4">
                Build From Scratch
              </h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Generate complete content strategies and blog posts from scratch. AI-powered with fact-checking, SEO optimization, and brand voice matching.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-700"><strong>12-topic content calendar</strong> tailored to your industry</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-700"><strong>AI content generation</strong> with Claude Sonnet 4</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-700"><strong>Automated fact-checking</strong> for accuracy</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-700"><strong>Multi-client management</strong> for agencies</span>
                </li>
              </ul>
              <Link
                href="/sign-up"
                className="block w-full text-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-bold text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                Start Strategy
              </Link>
            </div>
          </div>
        </section>

        {/* Demo Video Section */}
        <section id="demo" className="container mx-auto px-6 py-20">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-center text-4xl font-black text-slate-900 mb-4">
              See It In Action
            </h2>
            <p className="text-center text-xl text-slate-600 mb-12">
              Watch how AISO Studio turns mediocre content into professional-quality posts in minutes.
            </p>

            {/* Demo Video Placeholder */}
            <div className="aspect-video rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 shadow-2xl flex items-center justify-center border-4 border-slate-700">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm mb-4">
                  <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
                <p className="text-white text-lg font-semibold">Demo Video Coming Soon</p>
                <p className="text-slate-400 text-sm mt-2">3-minute walkthrough of key features</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="container mx-auto px-6 py-20">
          <h2 className="text-center text-4xl font-black text-slate-900 mb-4">
            Simple, Pay-As-You-Go Pricing
          </h2>
          <p className="text-center text-xl text-slate-600 mb-16 max-w-2xl mx-auto">
            No monthly fees. No subscriptions. Just pay for what you use.
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter */}
            <div className="rounded-2xl border-2 border-slate-200 bg-white p-8 shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-2xl font-black text-slate-900 mb-2">Starter</h3>
              <p className="text-slate-600 mb-6">Perfect for trying out the platform</p>
              <div className="mb-6">
                <span className="text-5xl font-black text-slate-900">$0</span>
                <span className="text-slate-600 ml-2">to start</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-slate-700">3 free content audits</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-slate-700">1 free strategy generation</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-slate-700">PDF report generation</span>
                </li>
              </ul>
              <Link
                href="/sign-up"
                className="block w-full text-center rounded-lg border-2 border-slate-300 bg-white px-6 py-3 font-bold text-slate-700 hover:bg-slate-50 transition-all"
              >
                Get Started
              </Link>
            </div>

            {/* Growth (Recommended) */}
            <div className="rounded-2xl border-4 border-purple-400 bg-white p-8 shadow-xl relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-bold">
                Recommended
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Growth</h3>
              <p className="text-slate-600 mb-6">For agencies and power users</p>
              <div className="mb-6">
                <span className="text-5xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Pay</span>
                <span className="text-slate-600 ml-2">per use</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-slate-700"><strong>$0.01</strong> per content audit</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-slate-700"><strong>$0.10</strong> per content rewrite</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-slate-700"><strong>$0.50</strong> per strategy generation</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-slate-700">Unlimited PDF exports</span>
                </li>
              </ul>
              <Link
                href="/sign-up"
                className="block w-full text-center rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 font-bold text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                Start Growing
              </Link>
            </div>

            {/* Enterprise */}
            <div className="rounded-2xl border-2 border-slate-200 bg-white p-8 shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-2xl font-black text-slate-900 mb-2">Enterprise</h3>
              <p className="text-slate-600 mb-6">For large teams and agencies</p>
              <div className="mb-6">
                <span className="text-4xl font-black text-slate-900">Custom</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-slate-700">Volume discounts</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-slate-700">White-label branding</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-slate-700">Dedicated support</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-slate-700">Custom integrations</span>
                </li>
              </ul>
              <Link
                href="mailto:contact@aiso.studio"
                className="block w-full text-center rounded-lg border-2 border-slate-300 bg-white px-6 py-3 font-bold text-slate-700 hover:bg-slate-50 transition-all"
              >
                Contact Sales
              </Link>
            </div>
          </div>

          <p className="text-center text-sm text-slate-500 mt-12">
            All pricing is transparent and usage-based. No hidden fees. Cancel anytime.
          </p>
        </section>

        {/* Final CTA */}
        <section className="container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto rounded-2xl bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 p-12 text-center shadow-2xl">
            <h2 className="text-4xl font-black text-white mb-4">
              Ready to Fix Your Content?
            </h2>
            <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
              Start with 3 free audits. No credit card required. See your scores in 30 seconds.
            </p>
            <Link
              href="/sign-up"
              className="inline-block rounded-xl bg-white px-10 py-4 text-lg font-bold text-purple-600 shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
            >
              Start Free Audit Now
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-black text-slate-900 mb-4">AISO Studio</h3>
              <p className="text-sm text-slate-600">
                Professional content optimization and strategy tools for agencies and creators.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link href="/sign-up" className="hover:text-purple-600">Content Audit</Link></li>
                <li><Link href="/sign-up" className="hover:text-purple-600">Content Strategy</Link></li>
                <li><Link href="#demo" className="hover:text-purple-600">Demo</Link></li>
                <li><Link href="/sign-up" className="hover:text-purple-600">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link href="#" className="hover:text-purple-600">About</Link></li>
                <li><Link href="#" className="hover:text-purple-600">Blog</Link></li>
                <li><Link href="mailto:contact@aiso.studio" className="hover:text-purple-600">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link href="#" className="hover:text-purple-600">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-purple-600">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 pt-8 text-center text-sm text-slate-600">
            © 2025 AISO Studio. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
