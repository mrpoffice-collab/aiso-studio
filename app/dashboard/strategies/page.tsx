import { currentUser } from '@clerk/nextjs/server';
import DashboardNav from '@/components/DashboardNav';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';

export default async function StrategiesPage() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect('/sign-in');
  }

  // Get user from database
  const user = await db.getUserByClerkId(clerkUser.id);
  if (!user) {
    redirect('/sign-in');
  }

  // Fetch user's strategies
  const strategies = await db.getStrategiesByUserId(user.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <DashboardNav />

      <main className="container mx-auto px-6 py-12">
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="mb-3 text-5xl font-black bg-gradient-to-r from-deep-indigo via-blue-600 to-deep-indigo bg-clip-text text-transparent">
              Content Strategies
            </h1>
            <p className="text-lg text-slate-600">
              Manage your client content strategies and generated topics
            </p>
          </div>
          <Link
            href="/dashboard/strategies/new"
            className="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-sunset-orange to-orange-600 text-white font-bold text-lg shadow-2xl shadow-orange-300/50 hover:shadow-orange-400/60 hover:scale-105 transition-all duration-200 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-3">
              <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Strategy
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
          </Link>
        </div>

        {strategies.length === 0 ? (
          <div className="rounded-2xl border border-slate-200/60 bg-white p-16 text-center shadow-xl shadow-slate-200/50">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-sunset-orange to-orange-600 shadow-xl shadow-orange-200">
              <svg
                className="h-12 w-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="mb-3 text-3xl font-bold text-slate-900">No strategies yet</h3>
            <p className="mb-8 text-lg text-slate-600 max-w-md mx-auto">
              Create your first content strategy to get started with AI-powered topic generation
            </p>
            <Link
              href="/dashboard/strategies/new"
              className="group inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-sunset-orange to-orange-600 px-8 py-4 font-bold text-white shadow-xl shadow-orange-300/50 hover:shadow-orange-400/60 hover:scale-105 transition-all duration-200"
            >
              <svg className="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Your First Strategy
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {strategies.map((strategy: any) => (
              <Link
                key={strategy.id}
                href={`/dashboard/strategies/${strategy.id}`}
                className="group rounded-2xl border border-slate-200/60 bg-white p-6 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-300/50 transition-all duration-300 hover:-translate-y-2 hover:border-sunset-orange/50"
              >
                <div className="mb-5">
                  <h3 className="mb-2 text-2xl font-black text-slate-900 group-hover:bg-gradient-to-r group-hover:from-sunset-orange group-hover:to-orange-600 group-hover:bg-clip-text group-hover:text-transparent transition-all">
                    {strategy.client_name}
                  </h3>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-deep-indigo/10 to-blue-600/10 border border-deep-indigo/20">
                    <svg className="w-4 h-4 text-deep-indigo" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-bold text-deep-indigo">{strategy.industry}</span>
                  </div>
                </div>

                <div className="mb-5 space-y-3">
                  <div className="flex items-start gap-3 text-slate-700">
                    <div className="p-2 rounded-lg bg-blue-50 border border-blue-100">
                      <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Target Audience</p>
                      <span className="text-sm font-semibold line-clamp-2">{strategy.target_audience}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <div className="p-2 rounded-lg bg-orange-50 border border-orange-100">
                      <svg className="h-4 w-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Publishing</p>
                      <span className="text-sm font-semibold capitalize">{strategy.frequency}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {new Date(strategy.created_at).toLocaleDateString()}
                  </span>
                  <span className="inline-flex items-center gap-2 text-sm font-bold text-sunset-orange group-hover:gap-3 transition-all">
                    View Topics
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
