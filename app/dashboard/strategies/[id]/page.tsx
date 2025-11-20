import { currentUser } from '@clerk/nextjs/server';
import DashboardNav from '@/components/DashboardNav';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import TopicCard from './TopicCard';
import ResetStrategyButton from './ResetStrategyButton';
import RegenerateTopicsButton from './RegenerateTopicsButton';
import ExistingContentManager from './ExistingContentManager';
import AuditWebsiteButton from './AuditWebsiteButton';
import AuditResults from './AuditResults';
import StrategicLinkingSection from './StrategicLinkingSection';

export default async function StrategyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect('/sign-in');
  }

  // Get user from database
  const user = await db.getUserByClerkId(clerkUser.id);
  if (!user) {
    redirect('/sign-in');
  }

  // Fetch strategy
  const strategy = await db.getStrategyById(id);
  if (!strategy) {
    redirect('/dashboard/strategies');
  }

  // Verify ownership
  if (strategy.user_id !== user.id) {
    redirect('/dashboard/strategies');
  }

  // Fetch topics
  const topics = await db.getTopicsByStrategyId(id);

  // Fetch money pages and clusters
  const moneyPages = await db.getMoneyPagesByStrategyId(id);
  const clusters = await db.getTopicClustersByStrategyId(id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <DashboardNav />

      <main className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <Link
            href="/dashboard/strategies"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-sunset-orange transition-all duration-200 group"
          >
            <span className="transition-transform group-hover:-translate-x-1">←</span>
            Back to Strategies
          </Link>
        </div>

        {/* Strategy Header */}
        <div className="mb-12 rounded-2xl border border-slate-200/60 bg-white p-8 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-300/50 transition-all duration-300">
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="mb-3 text-4xl font-black bg-gradient-to-r from-deep-indigo via-blue-600 to-deep-indigo bg-clip-text text-transparent">
                {strategy.client_name || 'Unnamed Client'}
              </h1>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-deep-indigo/10 to-blue-600/10 border border-deep-indigo/20">
                  <svg className="w-5 h-5 text-deep-indigo" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-lg font-bold text-deep-indigo">{strategy.industry || 'N/A'}</span>
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <AuditWebsiteButton strategyId={id} websiteUrl={strategy.website_url} />
              <Link
                href={`/dashboard/strategies/${id}/mou`}
                className="group relative px-6 py-3 rounded-xl bg-gradient-to-r from-sunset-orange to-orange-600 text-white font-bold shadow-xl shadow-orange-300/50 hover:shadow-orange-400/60 hover:scale-105 transition-all duration-200 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Generate MOU
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </Link>
              <Link
                href={`/dashboard/strategies/${id}/edit`}
                className="group flex items-center gap-2 rounded-xl border-2 border-deep-indigo bg-white px-6 py-3 font-bold text-deep-indigo hover:bg-deep-indigo hover:text-white transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Strategy
              </Link>
              <ResetStrategyButton strategyId={id} clientName={strategy.client_name} />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="p-5 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50/30 border border-slate-200">
              <h3 className="mb-3 text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Target Audience
              </h3>
              <p className="text-slate-700 font-semibold">{strategy.target_audience || 'N/A'}</p>
            </div>
            <div className="p-5 rounded-xl bg-gradient-to-br from-slate-50 to-purple-50/30 border border-slate-200">
              <h3 className="mb-3 text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                Brand Voice
              </h3>
              <p className="text-slate-700 font-semibold">{strategy.brand_voice || 'N/A'}</p>
            </div>
            <div className="p-5 rounded-xl bg-gradient-to-br from-slate-50 to-green-50/30 border border-slate-200">
              <h3 className="mb-3 text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                Content Goals
              </h3>
              <ul className="space-y-1.5 text-slate-700 font-semibold">
                {Array.isArray(strategy.goals) ? (
                  strategy.goals.map((goal: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      {goal || 'N/A'}
                    </li>
                  ))
                ) : (
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    {strategy.goals || 'No goals specified'}
                  </li>
                )}
              </ul>
            </div>
            <div className="p-5 rounded-xl bg-gradient-to-br from-slate-50 to-orange-50/30 border border-slate-200">
              <h3 className="mb-3 text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Publishing Schedule
              </h3>
              <p className="text-slate-700 font-semibold">
                <span className="capitalize">{strategy.frequency || 'N/A'}</span> • {' '}
                <span className="capitalize">{strategy.content_length || 'N/A'}</span> posts
              </p>
            </div>
          </div>

          {strategy.keywords && Array.isArray(strategy.keywords) && strategy.keywords.length > 0 && (
            <div className="mt-6 p-5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
              <h3 className="mb-3 text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.87 18.87 0 01-1.724 4.78c.29.354.596.696.914 1.026a1 1 0 11-1.44 1.389c-.188-.196-.373-.396-.554-.6a19.098 19.098 0 01-3.107 3.567 1 1 0 01-1.334-1.49 17.087 17.087 0 003.13-3.733 18.992 18.992 0 01-1.487-2.494 1 1 0 111.79-.89c.234.47.489.928.764 1.372.417-.934.752-1.913.997-2.927H3a1 1 0 110-2h3V3a1 1 0 011-1zm6 6a1 1 0 01.894.553l2.991 5.982a.869.869 0 01.02.037l.99 1.98a1 1 0 11-1.79.894L15.383 16h-4.764l-.724 1.447a1 1 0 11-1.788-.894l.99-1.98.019-.038 2.99-5.982A1 1 0 0113 8zm-1.382 6h2.764L13 11.236 11.618 14z" clipRule="evenodd" />
                </svg>
                Target Keywords
              </h3>
              <div className="flex flex-wrap gap-2">
                {strategy.keywords.map((keyword: string, idx: number) => (
                  <span key={idx} className="px-3 py-1.5 rounded-lg bg-white border border-blue-200 text-blue-700 font-semibold text-sm shadow-sm">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Readability Gut Check */}
          {strategy.target_flesch_score && (
            <div className="mt-6 p-6 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-300 shadow-lg">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="text-2xl">📖</span>
                Reading Level Target
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-white/70 border border-blue-200">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Target Flesch Score</p>
                  <p className="text-3xl font-black text-deep-indigo">{strategy.target_flesch_score}</p>
                  <p className="text-xs text-slate-600 mt-1">
                    {strategy.target_flesch_score >= 70 ? '7th Grade (General Public)' :
                     strategy.target_flesch_score >= 60 ? '8th-9th Grade (Standard)' :
                     strategy.target_flesch_score >= 50 ? '10th Grade (Educated Adults)' :
                     strategy.target_flesch_score >= 40 ? 'College Level (Professionals)' :
                     'Graduate Level (Technical Experts)'}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-white/70 border border-purple-200">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Target Sentence Length</p>
                  <p className="text-2xl font-black text-purple-700">
                    {strategy.target_flesch_score >= 70 ? '10-12' :
                     strategy.target_flesch_score >= 60 ? '12-15' :
                     strategy.target_flesch_score >= 50 ? '15-18' :
                     '15-20'} words
                  </p>
                  <p className="text-xs text-slate-600 mt-1">Per sentence average</p>
                </div>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-blue-100/50 border border-blue-300">
                <p className="text-xs font-bold text-blue-900 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  All topics and content will be generated at this reading level
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Existing Content Section */}
        <div className="mb-12">
          <ExistingContentManager strategyId={id} />
        </div>

        {/* Audit Results Section */}
        {strategy.website_url && (
          <AuditResults strategyId={id} />
        )}

        {/* Strategic Linking Section (Money Pages + Clusters) */}
        <StrategicLinkingSection
          strategyId={id}
          initialMoneyPages={moneyPages}
          initialClusters={clusters}
        />

        {/* Topics Section */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-black bg-gradient-to-r from-deep-indigo via-blue-600 to-deep-indigo bg-clip-text text-transparent mb-2">
              Generated Blog Topics
            </h2>
            <p className="text-lg text-slate-600">{topics.length} SEO-optimized topics tailored to your content strategy</p>
          </div>
          {topics.length > 0 && (
            <RegenerateTopicsButton strategyId={id} clusters={clusters} />
          )}
        </div>

        {topics.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center shadow-xl">
            <div className="max-w-md mx-auto">
              <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Topics Yet</h3>
              <p className="text-slate-600 font-semibold mb-6">
                Generate blog topics tailored to this strategy to get started.
              </p>
              <RegenerateTopicsButton strategyId={id} clusters={clusters} />
            </div>
          </div>
        ) : (
          <div id="topics" className="grid gap-6 md:grid-cols-2">
            {topics.map((topic: any) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                strategyFleschScore={strategy.target_flesch_score || 55}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
