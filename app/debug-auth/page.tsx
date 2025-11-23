'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export default function DebugAuthPage() {
  const { isSignedIn, userId } = useAuth();
  const { user, isLoaded } = useUser();
  const [dbUser, setDbUser] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function checkDbUser() {
      try {
        const response = await fetch('/api/debug/user');
        const data = await response.json();
        setDbUser(data);
      } catch (err: any) {
        setError(err.message);
      }
    }

    if (isSignedIn) {
      checkDbUser();
    }
  }, [isSignedIn]);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Authentication Debug Info</h1>

        {/* Clerk Auth Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Clerk Authentication</h2>
          <div className="space-y-2 font-mono text-sm">
            <div>
              <strong>isLoaded:</strong>{' '}
              <span className={isLoaded ? 'text-green-600' : 'text-red-600'}>
                {String(isLoaded)}
              </span>
            </div>
            <div>
              <strong>isSignedIn:</strong>{' '}
              <span className={isSignedIn ? 'text-green-600' : 'text-red-600'}>
                {String(isSignedIn)}
              </span>
            </div>
            <div>
              <strong>Clerk User ID:</strong> {userId || 'null'}
            </div>
            {user && (
              <>
                <div>
                  <strong>Email:</strong> {user.primaryEmailAddress?.emailAddress}
                </div>
                <div>
                  <strong>Name:</strong> {user.firstName} {user.lastName}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Database User */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Database User</h2>
          {error ? (
            <div className="text-red-600 font-mono text-sm">{error}</div>
          ) : dbUser ? (
            <pre className="bg-slate-100 p-4 rounded overflow-auto text-xs">
              {JSON.stringify(dbUser, null, 2)}
            </pre>
          ) : (
            <div className="text-slate-500">Loading...</div>
          )}
        </div>

        {/* Environment Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Environment</h2>
          <div className="space-y-2 font-mono text-sm">
            <div>
              <strong>Window Location:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}
            </div>
            <div>
              <strong>Has Clerk Object:</strong>{' '}
              <span className={typeof window !== 'undefined' && (window as any).Clerk ? 'text-green-600' : 'text-red-600'}>
                {String(typeof window !== 'undefined' && !!(window as any).Clerk)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <a
              href="/sign-in"
              className="block px-4 py-2 bg-blue-600 text-white rounded text-center hover:bg-blue-700"
            >
              Go to Sign In
            </a>
            <a
              href="/dashboard"
              className="block px-4 py-2 bg-green-600 text-white rounded text-center hover:bg-green-700"
            >
              Go to Dashboard
            </a>
            <button
              onClick={() => window.location.reload()}
              className="block w-full px-4 py-2 bg-slate-600 text-white rounded hover:bg-slate-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
