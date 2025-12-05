import { currentUser } from '@clerk/nextjs/server';
import DashboardNav from '@/components/DashboardNav';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { syncUser } from '@/lib/user';
import { db } from '@/lib/db';
import { logError, logInfo, AppError } from '@/lib/error-logger';

// Force dynamic rendering (required for authentication)
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  try {
    logInfo('Dashboard: Starting page render');

    const clerkUser = await currentUser();
    logInfo('Dashboard: Clerk user retrieved', { clerkId: clerkUser?.id });

    if (!clerkUser) {
      logInfo('Dashboard: No Clerk user found, redirecting to sign-in');
      redirect('/sign-in');
    }

    // Sync user to our database
    logInfo('Dashboard: Syncing user to database', { clerkId: clerkUser.id });
    await syncUser();

    // Get user from database
    logInfo('Dashboard: Fetching user from database', { clerkId: clerkUser.id });
    const user = await db.getUserByClerkId(clerkUser.id);

    if (!user) {
      logError(
        new AppError('User not found in database after sync', {
          clerkId: clerkUser.id,
          route: '/dashboard',
        })
      );
      redirect('/sign-in');
    }

    logInfo('Dashboard: User found', {
      userId: user.id,
      email: user.email,
      idType: typeof user.id
    });

    // Fetch all dashboard data
    const [strategies, posts, leads, taskStats] = await Promise.all([
      db.getStrategiesByUserId(user.id),
      db.getPostsByUserId(user.id),
      db.getLeadsByUserId(user.id),
      db.getTaskStats(user.id).catch(() => ({ total: 0, todo: 0, in_progress: 0, done: 0, overdue: 0 })),
    ]);

    // Calculate metrics
    const clients = leads.filter((l: any) => l.status === 'won');
    const clientsCount = clients.length;
    const pipelineValue = leads
      .filter((l: any) => l.status !== 'lost')
      .reduce((sum: number, l: any) => sum + (l.estimated_monthly_value || 0), 0);
    const leadsCount = leads.filter((l: any) => !['won', 'lost'].includes(l.status)).length;
    const postsThisMonth = posts.filter((p: any) => {
      const created = new Date(p.created_at);
      const now = new Date();
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length;

    // Calculate average AISO score
    const scoredPosts = posts.filter((p: any) => p.aiso_score > 0);
    const avgAisoScore = scoredPosts.length > 0
      ? Math.round(scoredPosts.reduce((sum: number, p: any) => sum + p.aiso_score, 0) / scoredPosts.length)
      : 0;

    // Get overdue tasks and upcoming tasks
    let overdueTasks: any[] = [];
    let upcomingTasks: any[] = [];
    try {
      overdueTasks = await db.getOverdueTasks(user.id);
      upcomingTasks = await db.getUpcomingTasks(user.id, 7);
    } catch (e) {
      // Tasks table might not exist yet
    }

    // Get clients needing attention (audits older than 30 days)
    const clientsNeedingAudit = clients.filter((c: any) => {
      // For now, flag all clients as potentially needing audit
      // In production, check last audit date
      return true;
    }).slice(0, 3);

    // Check if onboarding is complete
    const onboardingComplete = !!(
      user.name &&
      user.agency_logo_url &&
      user.agency_primary_color &&
      user.agency_primary_color !== '#6366f1' && // Not default color
      (user.agency_email || user.agency_phone) &&
      user.signature_name &&
      user.signature_title
    );

    logInfo('Dashboard: Rendering page successfully');

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <DashboardNav />

        <main className="container mx-auto px-6 py-8">
          {/* Onboarding Banner */}
          {!onboardingComplete && (
            <div className="mb-8 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100">
                    <span className="text-2xl">🚀</span>
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900">Complete your agency setup</h2>
                    <p className="text-sm text-slate-600">Add your branding, colors, and signature for professional client communications</p>
                  </div>
                </div>
                <Link
                  href="/dashboard/settings/onboarding"
                  className="px-5 py-2.5 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition flex items-center gap-2"
                >
                  Get Started
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          )}

          {/* Welcome */}
          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-900">
              Welcome back, {clerkUser.firstName || 'there'}!
            </h1>
            <p className="text-slate-600 mt-1">Here's what's happening with your agency today.</p>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-500">Clients</span>
                <span className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </span>
              </div>
              <p className="text-3xl font-black text-slate-900">{clientsCount}</p>
              <p className="text-xs text-slate-500 mt-1">Active clients</p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-500">Tasks</span>
                <span className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </span>
              </div>
              <p className="text-3xl font-black text-slate-900">{taskStats.todo + taskStats.in_progress}</p>
              <p className="text-xs text-slate-500 mt-1">
                {taskStats.overdue > 0 && <span className="text-red-500">{taskStats.overdue} overdue</span>}
                {taskStats.overdue === 0 && 'Open tasks'}
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-500">Pipeline</span>
                <span className="p-2 bg-orange-100 rounded-lg">
                  <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
              </div>
              <p className="text-3xl font-black text-slate-900">${pipelineValue.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-1">{leadsCount} leads</p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-500">Content</span>
                <span className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </span>
              </div>
              <p className="text-3xl font-black text-slate-900">{postsThisMonth}</p>
              <p className="text-xs text-slate-500 mt-1">Posts this month</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Needs Attention */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="text-red-500">🚨</span>
                  Needs Attention
                </h2>
                <Link href="/dashboard/clients" className="text-sm text-orange-600 hover:underline">
                  View All
                </Link>
              </div>
              <div className="divide-y divide-slate-100">
                {overdueTasks.length === 0 && clientsNeedingAudit.length === 0 && (
                  <div className="px-5 py-8 text-center text-slate-500">
                    <p>All caught up! 🎉</p>
                  </div>
                )}

                {overdueTasks.slice(0, 3).map((task: any) => (
                  <div key={task.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <p className="font-medium text-slate-900">{task.title}</p>
                      <p className="text-sm text-red-500">
                        Overdue {task.client_name ? `• ${task.client_name}` : ''}
                      </p>
                    </div>
                    <Link
                      href="/dashboard/clients"
                      className="px-3 py-1 text-sm bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition"
                    >
                      View
                    </Link>
                  </div>
                ))}

                {clientsNeedingAudit.slice(0, 3 - overdueTasks.length).map((client: any) => (
                  <div key={client.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <p className="font-medium text-slate-900">{client.business_name}</p>
                      <p className="text-sm text-slate-500">Consider running a fresh audit</p>
                    </div>
                    <Link
                      href={`/dashboard/audit?url=https://${client.domain}`}
                      className="px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition"
                    >
                      Run Audit
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="font-bold text-slate-900 flex items-center gap-2">
                  <span>⚡</span>
                  Quick Actions
                </h2>
              </div>
              <div className="p-5 space-y-3">
                <Link
                  href="/dashboard/audit"
                  className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl hover:shadow-lg transition flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Run AISO Audit
                </Link>
                <Link
                  href="/dashboard/clients"
                  className="w-full px-4 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Client
                </Link>
                <Link
                  href="/dashboard/strategies/new"
                  className="w-full px-4 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Create Strategy
                </Link>
                <Link
                  href="/dashboard/sales"
                  className="w-full px-4 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  View Pipeline
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Summary */}
          {avgAisoScore > 0 && (
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold mb-1">Content Performance</h3>
                  <p className="text-slate-300 text-sm">Your average AISO score across all content</p>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-black">{avgAisoScore}</p>
                  <p className="text-sm text-slate-400">Avg AISO Score</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  } catch (error) {
    // Log detailed error information
    logError(
      error instanceof Error ? error : new Error(String(error)),
      {
        route: '/dashboard',
        action: 'render_dashboard',
      }
    );

    // Return user-friendly error page
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-12 border border-red-100">
          <div className="text-center">
            <div className="mb-6">
              <span className="text-6xl">🚨</span>
            </div>
            <h1 className="text-3xl font-black text-red-600 mb-4">
              Dashboard Error
            </h1>
            <p className="text-lg text-slate-700 mb-8">
              We encountered an error loading your dashboard. Our team has been notified.
            </p>
            <div className="bg-red-50 rounded-xl p-6 mb-8 text-left">
              <p className="text-sm font-semibold text-red-800 mb-2">Error Details:</p>
              <p className="text-sm text-red-700 font-mono">
                {error instanceof Error ? error.message : String(error)}
              </p>
            </div>
            <div className="flex gap-4 justify-center">
              <Link
                href="/"
                className="px-6 py-3 bg-gradient-to-r from-sunset-orange to-orange-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
              >
                Go Home
              </Link>
              <Link
                href="/dashboard"
                className="px-6 py-3 border-2 border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all"
              >
                Try Again
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
