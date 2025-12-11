'use client';

import Link from 'next/link';
import { useState } from 'react';

interface Competitor {
  name: string;
  description: string;
  pricing: string;
  focus: string;
  aiSearchOptimization: 'none' | 'limited' | 'full';
  contentGeneration: boolean;
  auditTool: boolean;
  leadGeneration: boolean;
  proposalGenerator: boolean;
  wordpressIntegration: boolean;
  bulkOperations: boolean;
  whiteLabelReports: boolean;
  bestFor: string;
}

const competitors: Competitor[] = [
  {
    name: 'SurferSEO',
    description: 'Popular on-page SEO tool focused on content optimization scores',
    pricing: '$89-$299/mo',
    focus: 'Traditional SEO',
    aiSearchOptimization: 'none',
    contentGeneration: true,
    auditTool: true,
    leadGeneration: false,
    proposalGenerator: false,
    wordpressIntegration: true,
    bulkOperations: false,
    whiteLabelReports: false,
    bestFor: 'Content teams focused on Google rankings',
  },
  {
    name: 'Clearscope',
    description: 'Enterprise content optimization platform',
    pricing: '$170-$1,200/mo',
    focus: 'Traditional SEO',
    aiSearchOptimization: 'none',
    contentGeneration: false,
    auditTool: true,
    leadGeneration: false,
    proposalGenerator: false,
    wordpressIntegration: true,
    bulkOperations: false,
    whiteLabelReports: false,
    bestFor: 'Enterprise teams with big budgets',
  },
  {
    name: 'MarketMuse',
    description: 'AI-powered content planning and optimization',
    pricing: '$149-$999/mo',
    focus: 'Traditional SEO',
    aiSearchOptimization: 'limited',
    contentGeneration: true,
    auditTool: true,
    leadGeneration: false,
    proposalGenerator: false,
    wordpressIntegration: false,
    bulkOperations: false,
    whiteLabelReports: false,
    bestFor: 'Content strategists at large companies',
  },
  {
    name: 'Frase',
    description: 'AI writing assistant with SEO features',
    pricing: '$15-$115/mo',
    focus: 'Traditional SEO',
    aiSearchOptimization: 'none',
    contentGeneration: true,
    auditTool: true,
    leadGeneration: false,
    proposalGenerator: false,
    wordpressIntegration: false,
    bulkOperations: false,
    whiteLabelReports: false,
    bestFor: 'Budget-conscious content writers',
  },
  {
    name: 'AISO Studio',
    description: 'AI Search Optimization platform built for agencies',
    pricing: '$39-$599/mo',
    focus: 'AI Search (ChatGPT, Claude, Perplexity)',
    aiSearchOptimization: 'full',
    contentGeneration: true,
    auditTool: true,
    leadGeneration: true,
    proposalGenerator: true,
    wordpressIntegration: true,
    bulkOperations: true,
    whiteLabelReports: true,
    bestFor: 'Marketing agencies preparing for AI search',
  },
];

const features = [
  { key: 'aiSearchOptimization', label: 'AI Search Optimization', description: 'Optimize for ChatGPT, Claude, Perplexity citations' },
  { key: 'contentGeneration', label: 'AI Content Generation', description: 'Generate full articles with AI' },
  { key: 'auditTool', label: 'Content Audit Tool', description: 'Analyze and score existing content' },
  { key: 'leadGeneration', label: 'Lead Discovery', description: 'Find prospects with low AI visibility scores' },
  { key: 'proposalGenerator', label: 'Proposal Generator', description: 'Create ROI-focused sales proposals' },
  { key: 'wordpressIntegration', label: 'WordPress Integration', description: 'Publish directly to WordPress' },
  { key: 'bulkOperations', label: 'Bulk Operations', description: 'Generate/approve/export multiple posts at once' },
  { key: 'whiteLabelReports', label: 'White-Label Reports', description: 'Branded PDFs with your logo' },
];

function FeatureIcon({ value }: { value: boolean | 'none' | 'limited' | 'full' }) {
  if (value === true || value === 'full') {
    return <span className="text-green-600 font-bold text-lg">&#10003;</span>;
  }
  if (value === 'limited') {
    return <span className="text-yellow-600 font-medium text-sm">Partial</span>;
  }
  return <span className="text-slate-300 text-lg">&#10005;</span>;
}

export default function ComparePage() {
  const [selectedCompetitors, setSelectedCompetitors] = useState<string[]>(['SurferSEO', 'Clearscope', 'AISO Studio']);

  const filteredCompetitors = competitors.filter(c => selectedCompetitors.includes(c.name));

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
              href="/roi-calculator"
              className="text-sm font-semibold text-slate-600 hover:text-deep-indigo transition-colors"
            >
              ROI Calculator
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

      <main className="container mx-auto px-6 py-12 max-w-7xl">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4 px-4 py-2 bg-orange-50 text-orange-700 rounded-full text-sm font-semibold">
            Comparison Guide
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            AISO Studio vs. Traditional SEO Tools
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Most SEO tools optimize for Google. AISO Studio optimizes for the future: <strong>AI search engines</strong> like ChatGPT, Claude, and Perplexity.
          </p>
        </div>

        {/* The Big Difference */}
        <div className="bg-gradient-to-r from-deep-indigo to-purple-600 rounded-3xl shadow-xl p-8 md:p-12 text-white mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">The Shift You Can't Ignore</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <span className="text-2xl">&#128269;</span> Traditional SEO Tools
              </h3>
              <ul className="space-y-2 text-white/90">
                <li>&#8226; Optimize for Google's 10 blue links</li>
                <li>&#8226; Focus on keyword rankings</li>
                <li>&#8226; Built for a world of search results pages</li>
                <li>&#8226; Success = higher position on page 1</li>
              </ul>
            </div>
            <div className="bg-white/20 rounded-2xl p-6 border-2 border-white/30">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <span className="text-2xl">&#129302;</span> AISO Studio
              </h3>
              <ul className="space-y-2 text-white/90">
                <li>&#8226; Optimize for AI citation and mention</li>
                <li>&#8226; Focus on being the source AI models trust</li>
                <li>&#8226; Built for AI-generated answers</li>
                <li>&#8226; Success = being cited by ChatGPT, Claude, Perplexity</li>
              </ul>
            </div>
          </div>
          <p className="mt-6 text-white/80 text-center">
            By 2025, <strong>40%+ of search</strong> is expected to happen through AI assistants. Is your content ready?
          </p>
        </div>

        {/* Filter */}
        <div className="mb-8">
          <p className="text-sm text-slate-600 mb-3">Select tools to compare:</p>
          <div className="flex flex-wrap gap-2">
            {competitors.map(c => (
              <button
                key={c.name}
                onClick={() => {
                  if (c.name === 'AISO Studio') return; // Always show AISO
                  setSelectedCompetitors(prev =>
                    prev.includes(c.name)
                      ? prev.filter(name => name !== c.name)
                      : [...prev, c.name]
                  );
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCompetitors.includes(c.name)
                    ? c.name === 'AISO Studio'
                      ? 'bg-orange-500 text-white cursor-default'
                      : 'bg-slate-800 text-white hover:bg-slate-700'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c.name} {c.name === 'AISO Studio' && '(Always shown)'}
              </button>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden mb-12">
          {/* Header Row */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left p-4 font-bold text-slate-900 w-64">Feature</th>
                  {filteredCompetitors.map(c => (
                    <th
                      key={c.name}
                      className={`p-4 text-center font-bold ${
                        c.name === 'AISO Studio'
                          ? 'bg-orange-50 text-orange-700'
                          : 'text-slate-900'
                      }`}
                    >
                      <div>{c.name}</div>
                      <div className="text-sm font-normal text-slate-500">{c.pricing}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Focus Row */}
                <tr className="border-b border-slate-100">
                  <td className="p-4 font-medium text-slate-900">
                    <div>Primary Focus</div>
                    <div className="text-sm text-slate-500">What it optimizes for</div>
                  </td>
                  {filteredCompetitors.map(c => (
                    <td
                      key={c.name}
                      className={`p-4 text-center ${c.name === 'AISO Studio' ? 'bg-orange-50/50' : ''}`}
                    >
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        c.focus === 'AI Search (ChatGPT, Claude, Perplexity)'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {c.focus}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Feature Rows */}
                {features.map(feature => (
                  <tr key={feature.key} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-4">
                      <div className="font-medium text-slate-900">{feature.label}</div>
                      <div className="text-sm text-slate-500">{feature.description}</div>
                    </td>
                    {filteredCompetitors.map(c => (
                      <td
                        key={c.name}
                        className={`p-4 text-center ${c.name === 'AISO Studio' ? 'bg-orange-50/50' : ''}`}
                      >
                        <FeatureIcon value={c[feature.key as keyof Competitor] as boolean | 'none' | 'limited' | 'full'} />
                      </td>
                    ))}
                  </tr>
                ))}

                {/* Best For Row */}
                <tr className="bg-slate-50">
                  <td className="p-4 font-medium text-slate-900">
                    <div>Best For</div>
                  </td>
                  {filteredCompetitors.map(c => (
                    <td
                      key={c.name}
                      className={`p-4 text-center text-sm ${c.name === 'AISO Studio' ? 'bg-orange-50' : ''}`}
                    >
                      <span className={c.name === 'AISO Studio' ? 'font-bold text-orange-700' : 'text-slate-600'}>
                        {c.bestFor}
                      </span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Why AISO for Agencies */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Why Agencies Choose AISO Studio</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl">
              <div className="text-4xl mb-3">&#127919;</div>
              <h3 className="font-bold text-slate-900 mb-2">Future-Proof Offering</h3>
              <p className="text-slate-600 text-sm">
                While competitors optimize for yesterday's search, you'll offer AI-ready content that clients actually need.
              </p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl">
              <div className="text-4xl mb-3">&#128176;</div>
              <h3 className="font-bold text-slate-900 mb-2">Built-in Sales Tools</h3>
              <p className="text-slate-600 text-sm">
                Lead discovery, proposal generator, and ROI calculators help you sell more, not just deliver more.
              </p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl">
              <div className="text-4xl mb-3">&#9889;</div>
              <h3 className="font-bold text-slate-900 mb-2">Scale Without Hiring</h3>
              <p className="text-slate-600 text-sm">
                Bulk operations, white-label reports, and WordPress integration let you do more with your existing team.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-slate-50 rounded-3xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Common Questions</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <div>
              <h3 className="font-bold text-slate-900 mb-2">Do I still need traditional SEO?</h3>
              <p className="text-slate-600">
                Yes! Traditional SEO still matters. But AI search is growing fast, and the content that ranks well in Google often doesn't get cited by AI. AISO Studio helps you optimize for both.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2">Can I use AISO Studio alongside SurferSEO or Clearscope?</h3>
              <p className="text-slate-600">
                Absolutely. Many agencies use traditional SEO tools for Google optimization and AISO Studio specifically for AI search. They solve different problems.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2">How is AISO scoring different from other content scores?</h3>
              <p className="text-slate-600">
                Traditional tools score based on keyword density, word count, and Google ranking factors. AISO scores based on what makes AI models trust and cite your content: clear structure, authoritative claims, comprehensive coverage, and citation-worthy formatting.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2">Is AISO Studio only for agencies?</h3>
              <p className="text-slate-600">
                No! We have a Starter plan ($39/mo) perfect for solo marketers and freelancers. The Professional and Agency plans add features like lead discovery and white-label reports that agencies need.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-sunset-orange to-orange-600 rounded-3xl shadow-xl p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Optimize for the Future?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Start your free trial and see how your content scores for AI search engines.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/sign-up"
              className="rounded-xl bg-white px-8 py-4 font-bold text-lg text-sunset-orange shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              Start Free Trial
            </Link>
            <Link
              href="/audit"
              className="rounded-xl border-2 border-white px-8 py-4 font-bold text-lg text-white hover:bg-white/10 transition-all duration-200"
            >
              Run Free Audit
            </Link>
          </div>
          <p className="mt-4 text-white/70 text-sm">
            7-day free trial. No credit card required. Cancel anytime.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-16 py-8 bg-white">
        <div className="container mx-auto px-6 text-center text-slate-500 text-sm">
          <p>&copy; 2025 AISO Studio. All rights reserved.</p>
          <p className="mt-2 text-xs">
            Competitor information is based on publicly available data and may not reflect the latest features or pricing.
          </p>
        </div>
      </footer>
    </div>
  );
}
