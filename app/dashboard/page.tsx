import { currentUser } from '@clerk/nextjs/server';
import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { syncUser } from '@/lib/user';

export default async function DashboardPage() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect('/sign-in');
  }

  // Sync user to our database
  await syncUser();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold">
              Content Command Studio
            </Link>
            <nav className="flex gap-6">
              <Link href="/dashboard" className="text-sm font-medium">
                Dashboard
              </Link>
              <Link href="/dashboard/strategies" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Strategies
              </Link>
              <Link href="/dashboard/posts" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Posts
              </Link>
            </nav>
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">
            Welcome back, {clerkUser.firstName || 'there'}!
          </h1>
          <p className="text-gray-600">
            Manage your content strategies and generated posts
          </p>
        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border bg-white p-6">
            <h3 className="mb-2 text-sm font-medium text-gray-600">Total Strategies</h3>
            <p className="text-3xl font-bold">0</p>
          </div>
          <div className="rounded-lg border bg-white p-6">
            <h3 className="mb-2 text-sm font-medium text-gray-600">Posts Generated</h3>
            <p className="text-3xl font-bold">0</p>
          </div>
          <div className="rounded-lg border bg-white p-6">
            <h3 className="mb-2 text-sm font-medium text-gray-600">Posts Approved</h3>
            <p className="text-3xl font-bold">0</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold">Quick Actions</h2>
            <div className="flex flex-col gap-3">
              <Link
                href="/dashboard/strategies/new"
                className="rounded-md bg-black px-4 py-3 text-center font-medium text-white hover:bg-gray-800"
              >
                Create New Strategy
              </Link>
              <Link
                href="/dashboard/strategies"
                className="rounded-md border px-4 py-3 text-center font-medium hover:bg-gray-50"
              >
                View All Strategies
              </Link>
              <Link
                href="/dashboard/posts"
                className="rounded-md border px-4 py-3 text-center font-medium hover:bg-gray-50"
              >
                View All Posts
              </Link>
            </div>
          </div>

          <div className="rounded-lg border bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold">Getting Started</h2>
            <ol className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-xs font-medium text-white">
                  1
                </span>
                <span>Create a content strategy for your first client</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-xs font-medium text-white">
                  2
                </span>
                <span>Review and customize the generated topics</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-xs font-medium text-white">
                  3
                </span>
                <span>Generate blog posts from your topics</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-xs font-medium text-white">
                  4
                </span>
                <span>Review fact-checks and edit content</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-xs font-medium text-white">
                  5
                </span>
                <span>Export and publish your content</span>
              </li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  );
}
