'use client';

import { useState } from 'react';
import Link from 'next/link';

interface ROIResults {
  monthlyTimeSaved: number;
  monthlyValueSaved: number;
  annualValueSaved: number;
  contentVelocity: number;
  aisoMonthlyCost: number;
  netAnnualROI: number;
  roiPercentage: number;
  paybackDays: number;
}

export default function ROICalculatorPage() {
  // Inputs
  const [clientCount, setClientCount] = useState(5);
  const [postsPerClient, setPostsPerClient] = useState(4);
  const [hoursPerPost, setHoursPerPost] = useState(3);
  const [hourlyRate, setHourlyRate] = useState(75);
  const [auditsPerWeek, setAuditsPerWeek] = useState(10);
  const [hoursPerAudit, setHoursPerAudit] = useState(1);
  const [selectedTier, setSelectedTier] = useState<'professional' | 'agency'>('agency');

  // Results
  const [results, setResults] = useState<ROIResults | null>(null);
  const [showResults, setShowResults] = useState(false);

  const tierPrices = {
    professional: 249,
    agency: 599,
  };

  const calculateROI = () => {
    // Content creation time saved
    const totalPostsPerMonth = clientCount * postsPerClient;
    const currentContentHours = totalPostsPerMonth * hoursPerPost;
    const aisoContentHours = totalPostsPerMonth * 0.5; // 30 min per post with AISO
    const contentTimeSaved = currentContentHours - aisoContentHours;

    // Audit time saved
    const auditsPerMonth = auditsPerWeek * 4;
    const currentAuditHours = auditsPerMonth * hoursPerAudit;
    const aisoAuditHours = auditsPerMonth * 0.1; // 6 min per audit with AISO
    const auditTimeSaved = currentAuditHours - aisoAuditHours;

    // Total time saved
    const monthlyTimeSaved = contentTimeSaved + auditTimeSaved;
    const monthlyValueSaved = monthlyTimeSaved * hourlyRate;
    const annualValueSaved = monthlyValueSaved * 12;

    // AISO costs
    const aisoMonthlyCost = tierPrices[selectedTier];
    const aisoAnnualCost = aisoMonthlyCost * 12;

    // ROI
    const netAnnualROI = annualValueSaved - aisoAnnualCost;
    const roiPercentage = Math.round((netAnnualROI / aisoAnnualCost) * 100);
    const paybackDays = Math.round((aisoMonthlyCost / (monthlyValueSaved / 30)));

    // Content velocity (posts per month capability)
    const contentVelocity = Math.round(totalPostsPerMonth * (hoursPerPost / 0.5));

    setResults({
      monthlyTimeSaved: Math.round(monthlyTimeSaved),
      monthlyValueSaved: Math.round(monthlyValueSaved),
      annualValueSaved: Math.round(annualValueSaved),
      contentVelocity,
      aisoMonthlyCost,
      netAnnualROI: Math.round(netAnnualROI),
      roiPercentage,
      paybackDays: Math.max(1, paybackDays),
    });
    setShowResults(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-sm sticky top-0 z-50">
        <div className="container mx-auto flex h-20 items-center justify-between px-6">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-sunset-orange to-orange-600 bg-clip-text text-transparent">
            AISO Studio
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/case-studies"
              className="text-sm font-semibold text-slate-600 hover:text-deep-indigo transition-colors"
            >
              Case Studies
            </Link>
            <Link
              href="/compare"
              className="text-sm font-semibold text-slate-600 hover:text-deep-indigo transition-colors"
            >
              Compare
            </Link>
            <Link
              href="/sign-up"
              className="rounded-lg bg-gradient-to-r from-sunset-orange to-orange-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-5xl">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-semibold">
            For Marketing Agencies
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            ROI Calculator
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            See how much time and money your agency could save with AISO Studio's AI-powered content tools.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Calculator Inputs */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Your Agency Details</h2>

            {/* Tier Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Which plan are you considering?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedTier('professional')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedTier === 'professional'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold text-slate-900">Professional</div>
                  <div className="text-2xl font-bold text-blue-600">$249<span className="text-sm font-normal text-slate-500">/mo</span></div>
                  <div className="text-xs text-slate-500 mt-1">Up to 5 clients</div>
                </button>
                <button
                  onClick={() => setSelectedTier('agency')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedTier === 'agency'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold text-slate-900">Agency</div>
                  <div className="text-2xl font-bold text-purple-600">$599<span className="text-sm font-normal text-slate-500">/mo</span></div>
                  <div className="text-xs text-slate-500 mt-1">Unlimited clients</div>
                </button>
              </div>
            </div>

            {/* Client Count */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                How many content clients do you have?
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={clientCount}
                  onChange={(e) => setClientCount(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sunset-orange"
                />
                <span className="w-12 text-center text-lg font-bold text-slate-900">{clientCount}</span>
              </div>
            </div>

            {/* Posts per Client */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Blog posts per client per month
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={postsPerClient}
                  onChange={(e) => setPostsPerClient(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sunset-orange"
                />
                <span className="w-12 text-center text-lg font-bold text-slate-900">{postsPerClient}</span>
              </div>
            </div>

            {/* Hours per Post */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Hours to create one blog post (currently)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="0.5"
                  value={hoursPerPost}
                  onChange={(e) => setHoursPerPost(parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sunset-orange"
                />
                <span className="w-12 text-center text-lg font-bold text-slate-900">{hoursPerPost}h</span>
              </div>
            </div>

            {/* Hourly Rate */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Your effective hourly rate ($)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="25"
                  max="200"
                  step="5"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sunset-orange"
                />
                <span className="w-16 text-center text-lg font-bold text-slate-900">${hourlyRate}</span>
              </div>
            </div>

            {/* Audits per Week */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Site audits you run per week
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={auditsPerWeek}
                  onChange={(e) => setAuditsPerWeek(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sunset-orange"
                />
                <span className="w-12 text-center text-lg font-bold text-slate-900">{auditsPerWeek}</span>
              </div>
            </div>

            {/* Hours per Audit */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Hours per manual audit (currently)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0.25"
                  max="4"
                  step="0.25"
                  value={hoursPerAudit}
                  onChange={(e) => setHoursPerAudit(parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sunset-orange"
                />
                <span className="w-12 text-center text-lg font-bold text-slate-900">{hoursPerAudit}h</span>
              </div>
            </div>

            <button
              onClick={calculateROI}
              className="w-full rounded-xl bg-gradient-to-r from-sunset-orange to-orange-600 px-8 py-4 font-bold text-lg text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
            >
              Calculate My ROI
            </button>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {!showResults ? (
              <div className="bg-slate-100 rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center h-full flex flex-col items-center justify-center">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">Your ROI Results</h3>
                <p className="text-slate-500">Adjust the sliders and click "Calculate My ROI" to see your potential savings.</p>
              </div>
            ) : results && (
              <>
                {/* Main ROI Card */}
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl p-8 text-white">
                  <div className="text-center">
                    <p className="text-green-100 font-semibold mb-2">Your Annual ROI</p>
                    <p className="text-5xl font-black mb-2">${results.netAnnualROI.toLocaleString()}</p>
                    <p className="text-green-100">{results.roiPercentage}% return on investment</p>
                  </div>
                </div>

                {/* Time Saved */}
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-2xl">⏱️</span>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Monthly Time Saved</p>
                      <p className="text-2xl font-bold text-slate-900">{results.monthlyTimeSaved} hours</p>
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm">
                    That's <strong>{Math.round(results.monthlyTimeSaved / 8)} full work days</strong> you get back every month.
                  </p>
                </div>

                {/* Value Saved */}
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-2xl">💰</span>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Monthly Value of Time Saved</p>
                      <p className="text-2xl font-bold text-slate-900">${results.monthlyValueSaved.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500">AISO Cost</p>
                      <p className="font-semibold text-slate-900">-${results.aisoMonthlyCost}/mo</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Net Monthly Savings</p>
                      <p className="font-semibold text-green-600">+${(results.monthlyValueSaved - results.aisoMonthlyCost).toLocaleString()}/mo</p>
                    </div>
                  </div>
                </div>

                {/* Payback Period */}
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                      <span className="text-2xl">🚀</span>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Payback Period</p>
                      <p className="text-2xl font-bold text-slate-900">{results.paybackDays} days</p>
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm">
                    Your investment pays for itself in less than {results.paybackDays < 30 ? 'a month' : `${Math.ceil(results.paybackDays / 30)} months`}.
                  </p>
                </div>

                {/* Content Velocity */}
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                      <span className="text-2xl">📝</span>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Content Capacity</p>
                      <p className="text-2xl font-bold text-slate-900">{results.contentVelocity} posts/month</p>
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm">
                    With the same hours, you could produce <strong>{results.contentVelocity} posts</strong> instead of {clientCount * postsPerClient}.
                  </p>
                </div>

                {/* CTA */}
                <div className="bg-gradient-to-r from-sunset-orange to-orange-600 rounded-2xl shadow-xl p-6 text-white text-center">
                  <h3 className="text-xl font-bold mb-2">Ready to see these results?</h3>
                  <p className="opacity-90 mb-4">Start your free 7-day trial. No credit card required.</p>
                  <Link
                    href="/sign-up"
                    className="inline-block rounded-lg bg-white px-8 py-3 font-bold text-sunset-orange shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                  >
                    Start Free Trial
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        {/* How We Calculate Section */}
        <div className="mt-16 bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">How We Calculate Your ROI</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Content Time Savings</h3>
              <p className="text-slate-600 text-sm">
                AISO Studio generates full blog posts in ~30 minutes vs. 2-4 hours manually. We calculate the time saved per post times your hourly rate.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-green-600">2</span>
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Audit Time Savings</h3>
              <p className="text-slate-600 text-sm">
                Manual SEO audits take 30-60 minutes. AISO audits complete in seconds with AI-powered analysis and recommendations.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Net ROI</h3>
              <p className="text-slate-600 text-sm">
                Total time savings × your hourly rate - AISO subscription cost = your net annual ROI. Most agencies see 500%+ return.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-16 py-8 bg-white">
        <div className="container mx-auto px-6 text-center text-slate-500 text-sm">
          <p>&copy; 2025 AISO Studio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
