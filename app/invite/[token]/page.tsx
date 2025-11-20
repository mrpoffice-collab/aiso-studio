import { redirect } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface InvitePageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;

  console.log('[INVITE] Processing invitation request for token:', token.slice(0, 20) + '...');

  try {
    // Validate invitation token
    console.log('[INVITE] Calling db.getInvitationByToken...');
    const invitation = await db.getInvitationByToken(token);
    console.log('[INVITE] Got invitation result:', invitation ? 'Found' : 'Not found');

    if (!invitation) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mb-2">Invalid Invitation</h1>
            <p className="text-slate-600 mb-6">
              This invitation link is invalid or has expired.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-lg hover:shadow-lg transition-all"
            >
              Go to Home
            </Link>
          </div>
        </div>
      );
    }

    // Check if invitation has expired
    const now = new Date();
    const expiresAt = new Date(invitation.invitation_expires_at);
    if (now > expiresAt) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mb-2">Invitation Expired</h1>
            <p className="text-slate-600 mb-6">
              This invitation link has expired. Please contact support for a new invitation.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-lg hover:shadow-lg transition-all"
            >
              Go to Home
            </Link>
          </div>
        </div>
      );
    }

    // Store invitation token in cookie for post-signup processing
    // This will be used by the sign-up callback to link the account
    const response = redirect(`/sign-up?invite=${token}`);
    return response;

  } catch (error) {
    console.error('Error processing invitation:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      token: token.slice(0, 20) + '...'
    });
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">Something Went Wrong</h1>
          <p className="text-slate-600 mb-6">
            We encountered an error processing your invitation. Please try again or contact support.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-lg hover:shadow-lg transition-all"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }
}
