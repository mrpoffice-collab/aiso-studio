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
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-bold">Content Command Studio</h1>
          <div className="flex gap-4">
            <Link
              href="/sign-in"
              className="rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-100"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="mb-4 text-5xl font-bold tracking-tight">
            Automate Your Content Strategy
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600">
            Generate AI-powered content strategies and blog posts with built-in fact-checking.
            Built for marketing agencies managing multiple clients.
          </p>

          <div className="mb-16 flex justify-center gap-4">
            <Link
              href="/sign-up"
              className="rounded-md bg-black px-6 py-3 text-lg font-medium text-white hover:bg-gray-800"
            >
              Start Free Trial
            </Link>
            <Link
              href="/sign-in"
              className="rounded-md border border-gray-300 px-6 py-3 text-lg font-medium hover:bg-gray-50"
            >
              Sign In
            </Link>
          </div>

          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            <div className="rounded-lg border p-6">
              <h3 className="mb-2 text-xl font-semibold">Strategy Builder</h3>
              <p className="text-gray-600">
                Generate 12-topic content calendars tailored to your client's industry and goals
              </p>
            </div>
            <div className="rounded-lg border p-6">
              <h3 className="mb-2 text-xl font-semibold">AI Content Generation</h3>
              <p className="text-gray-600">
                Create complete blog posts with GPT-4, optimized for SEO and your brand voice
              </p>
            </div>
            <div className="rounded-lg border p-6">
              <h3 className="mb-2 text-xl font-semibold">Fact-Checking</h3>
              <p className="text-gray-600">
                Automated fact verification with Claude AI to ensure accuracy and credibility
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          © 2024 Content Command Studio. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
