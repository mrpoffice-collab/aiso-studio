'use client';

import Link from 'next/link';

interface CaseStudy {
  id: string;
  title: string;
  subtitle: string;
  industry: string;
  clientType: string;
  metrics: {
    label: string;
    before: string;
    after: string;
    improvement: string;
  }[];
  quote: string;
  quoteName: string;
  quoteRole: string;
  challenge: string;
  solution: string;
  results: string[];
  timeframe: string;
}

const caseStudies: CaseStudy[] = [
  {
    id: 'digital-marketing-agency',
    title: 'How a 5-Person Agency 10x\'d Their Content Output',
    subtitle: 'Digital marketing agency scales content production without hiring',
    industry: 'Marketing Agency',
    clientType: 'Small Agency (5 employees)',
    metrics: [
      { label: 'Blog Posts/Month', before: '12', after: '120', improvement: '10x' },
      { label: 'Hours per Post', before: '4', after: '0.5', improvement: '-87%' },
      { label: 'Client Capacity', before: '3', after: '12', improvement: '4x' },
      { label: 'Monthly Revenue', before: '$15K', after: '$45K', improvement: '3x' },
    ],
    quote: "We went from turning down clients to actively seeking them. AISO Studio completely changed our capacity equation.",
    quoteName: 'Sarah Chen',
    quoteRole: 'Founder, Horizon Digital',
    challenge: 'Horizon Digital was a 5-person agency struggling to scale. Each blog post took 4+ hours to research, write, optimize, and publish. They were turning down new clients because they couldn\'t keep up with existing content demands.',
    solution: 'They implemented AISO Studio\'s content generation workflow: generate 15 topics per client strategy, bulk-generate articles, run improvement passes, and publish to WordPress with one click. The team shifted from writing to editing and client strategy.',
    results: [
      'Reduced content creation time from 4 hours to 30 minutes per post',
      'Scaled from 3 content clients to 12 without hiring',
      'Increased monthly retainers by offering more content at same price',
      'Won 3 new clients using free audit as sales tool',
      'Achieved 85+ AISO score average across all content',
    ],
    timeframe: '90 days',
  },
  {
    id: 'seo-consultant',
    title: 'Solo SEO Consultant Doubles Client Base in 60 Days',
    subtitle: 'Freelancer uses audits and proposals to win more business',
    industry: 'SEO Consulting',
    clientType: 'Solo Consultant',
    metrics: [
      { label: 'Active Clients', before: '4', after: '8', improvement: '2x' },
      { label: 'Proposals Sent/Week', before: '2', after: '15', improvement: '7.5x' },
      { label: 'Proposal Win Rate', before: '25%', after: '40%', improvement: '+60%' },
      { label: 'Monthly Income', before: '$6K', after: '$14K', improvement: '+133%' },
    ],
    quote: "The free audit became my secret weapon. Prospects see their score, panic a little, and want to know how to fix it. I just have to show up with the solution.",
    quoteName: 'Marcus Williams',
    quoteRole: 'Independent SEO Consultant',
    challenge: 'Marcus was spending most of his time doing manual site audits and writing proposals. He could only pitch 2-3 prospects per week, and his win rate was low because he couldn\'t show clear, quantifiable problems.',
    solution: 'He started using AISO\'s free audit as a lead magnet, running audits on prospect sites before calls. The AISO score gave him a concrete number to discuss. He used the proposal generator to create ROI-focused pitches in minutes instead of hours.',
    results: [
      'Sends 15+ personalized proposals per week (was 2)',
      'Uses AISO score as conversation starter on every sales call',
      'Doubled active client roster in 60 days',
      'Reduced proposal creation time from 2 hours to 15 minutes',
      'Increased close rate by showing before/after score projections',
    ],
    timeframe: '60 days',
  },
  {
    id: 'content-studio',
    title: 'Content Studio Adds AI Services as New Revenue Stream',
    subtitle: 'Traditional content agency launches AI optimization package',
    industry: 'Content Production',
    clientType: 'Mid-size Agency (15 employees)',
    metrics: [
      { label: 'New Service Revenue', before: '$0', after: '$12K/mo', improvement: 'New' },
      { label: 'Client Upsell Rate', before: '10%', after: '45%', improvement: '4.5x' },
      { label: 'Avg Client Value', before: '$2,500/mo', after: '$4,200/mo', improvement: '+68%' },
      { label: 'Content AI Score', before: '52 avg', after: '84 avg', improvement: '+61%' },
    ],
    quote: "Our clients kept asking about AI. Now we can actually deliver AI-optimized content with proof that it works. It\'s the easiest upsell we\'ve ever had.",
    quoteName: 'Jennifer Park',
    quoteRole: 'Managing Director, Spark Content',
    challenge: 'Spark Content was a traditional content agency facing pressure from clients asking about AI optimization. They didn\'t have the technical expertise to audit for AI visibility, and their existing content wasn\'t performing in AI search results.',
    solution: 'They white-labeled AISO Studio as their "AI Optimization Suite." They audit all client content, show the scores, then offer optimization packages. The before/after reporting proved ROI and justified premium pricing.',
    results: [
      'Launched "AI-Ready Content" package at $800/month premium',
      '45% of existing clients upgraded to new package',
      'Average client value increased 68%',
      'Client content now averages 84 AISO score (was 52)',
      'Won 4 new clients specifically seeking AI optimization',
    ],
    timeframe: '120 days',
  },
];

export default function CaseStudiesPage() {
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
              href="/roi-calculator"
              className="text-sm font-semibold text-slate-600 hover:text-deep-indigo transition-colors"
            >
              ROI Calculator
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

      <main className="container mx-auto px-6 py-12 max-w-6xl">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4 px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm font-semibold">
            Real Results
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Case Studies
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            See how marketing agencies and consultants are using AISO Studio to scale their businesses.
          </p>
        </div>

        {/* Case Studies */}
        <div className="space-y-16">
          {caseStudies.map((study, index) => (
            <div key={study.id} className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
              {/* Header */}
              <div className={`p-8 ${
                index === 0 ? 'bg-gradient-to-r from-blue-600 to-indigo-600' :
                index === 1 ? 'bg-gradient-to-r from-purple-600 to-pink-600' :
                'bg-gradient-to-r from-orange-500 to-red-500'
              } text-white`}>
                <div className="flex flex-wrap gap-3 mb-4">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                    {study.industry}
                  </span>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                    {study.clientType}
                  </span>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                    {study.timeframe}
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">{study.title}</h2>
                <p className="text-white/80 text-lg">{study.subtitle}</p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 border-b border-slate-200">
                {study.metrics.map((metric, i) => (
                  <div key={i} className={`p-6 text-center ${i < study.metrics.length - 1 ? 'border-r border-slate-200' : ''}`}>
                    <p className="text-sm text-slate-500 mb-1">{metric.label}</p>
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <span className="text-slate-400 line-through text-sm">{metric.before}</span>
                      <span className="text-slate-900 font-bold text-xl">{metric.after}</span>
                    </div>
                    <span className={`text-sm font-bold ${
                      metric.improvement.startsWith('+') || metric.improvement.endsWith('x') ? 'text-green-600' :
                      metric.improvement.startsWith('-') ? 'text-blue-600' : 'text-purple-600'
                    }`}>
                      {metric.improvement}
                    </span>
                  </div>
                ))}
              </div>

              {/* Quote */}
              <div className="p-8 bg-slate-50 border-b border-slate-200">
                <blockquote className="text-xl text-slate-700 italic mb-4">
                  "{study.quote}"
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-slate-700 to-slate-900 flex items-center justify-center text-white font-bold">
                    {study.quoteName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{study.quoteName}</p>
                    <p className="text-sm text-slate-500">{study.quoteRole}</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 grid md:grid-cols-3 gap-8">
                <div>
                  <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <span className="text-red-500">🎯</span> The Challenge
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{study.challenge}</p>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <span className="text-blue-500">💡</span> The Solution
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{study.solution}</p>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <span className="text-green-500">🏆</span> The Results
                  </h3>
                  <ul className="space-y-2">
                    {study.results.map((result, i) => (
                      <li key={i} className="text-slate-600 text-sm flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        {result}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-r from-sunset-orange to-orange-600 rounded-3xl shadow-xl p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Write Your Success Story?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join hundreds of agencies using AISO Studio to scale their content operations and win more clients.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/sign-up"
              className="rounded-xl bg-white px-8 py-4 font-bold text-lg text-sunset-orange shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              Start Free Trial
            </Link>
            <Link
              href="/roi-calculator"
              className="rounded-xl border-2 border-white px-8 py-4 font-bold text-lg text-white hover:bg-white/10 transition-all duration-200"
            >
              Calculate Your ROI
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
            Case studies represent composite examples based on typical user experiences. Individual results may vary.
          </p>
        </div>
      </footer>
    </div>
  );
}
