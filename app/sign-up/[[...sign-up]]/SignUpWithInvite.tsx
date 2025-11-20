'use client';

import { SignUp } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function SignUpWithInvite() {
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get('invite');

  useEffect(() => {
    if (inviteToken) {
      // Store invitation token in sessionStorage for later use
      sessionStorage.setItem('pendingInvitation', inviteToken);
    }
  }, [inviteToken]);

  // If there's an invitation, redirect to a custom callback page after sign-up
  const afterSignUpUrl = inviteToken
    ? '/onboarding?invited=true'
    : '/dashboard';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
      {inviteToken && (
        <div className="mb-6 max-w-md rounded-lg bg-blue-50 border border-blue-200 p-4 text-center">
          <p className="text-sm font-semibold text-blue-900">
            🎉 You've been invited to join AISO Studio with an Agency plan!
          </p>
          <p className="mt-1 text-xs text-blue-700">
            Complete your sign-up to get started.
          </p>
        </div>
      )}
      <SignUp
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'shadow-xl',
          },
        }}
        afterSignUpUrl={afterSignUpUrl}
        routing="path"
        path="/sign-up"
      />
    </div>
  );
}
