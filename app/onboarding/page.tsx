'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoaded, userId } = useAuth();
  const [status, setStatus] = useState<'linking' | 'success' | 'error'>('linking');
  const [error, setError] = useState('');

  useEffect(() => {
    const linkInvitation = async () => {
      if (!isLoaded || !userId) return;

      const isInvited = searchParams.get('invited') === 'true';

      if (!isInvited) {
        // No invitation, just redirect to dashboard
        router.push('/dashboard');
        return;
      }

      // Get invitation token from sessionStorage
      const invitationToken = sessionStorage.getItem('pendingInvitation');

      if (!invitationToken) {
        // No token found, redirect to dashboard with default account
        router.push('/dashboard');
        return;
      }

      try {
        // Link the invitation to the Clerk account
        const response = await fetch('/api/link-invitation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ invitationToken }),
        });

        if (!response.ok) {
          throw new Error('Failed to link invitation');
        }

        const data = await response.json();

        // Clear the token from sessionStorage
        sessionStorage.removeItem('pendingInvitation');

        setStatus('success');

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);

      } catch (err) {
        console.error('Error linking invitation:', err);
        setError('Failed to link your invitation. Redirecting to dashboard...');
        setStatus('error');

        // Still redirect to dashboard after error
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      }
    };

    linkInvitation();
  }, [isLoaded, userId, searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {status === 'linking' && (
          <>
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mb-2">Setting Up Your Account</h1>
            <p className="text-slate-600">
              Activating your Agency plan...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mb-2">Welcome to AISO Studio!</h1>
            <p className="text-slate-600">
              Your Agency plan is now active. Redirecting to dashboard...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mb-2">Almost There</h1>
            <p className="text-slate-600">
              {error || 'Redirecting to dashboard...'}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
