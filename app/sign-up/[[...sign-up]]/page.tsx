import { Suspense } from 'react';
import SignUpWithInvite from './SignUpWithInvite';

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-slate-600">Loading...</div>
        </div>
      }
    >
      <SignUpWithInvite />
    </Suspense>
  );
}
