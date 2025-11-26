import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db, query } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.getUserByClerkId(clerkId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check what's completed
    const hasAgencyName = !!user.name && user.name.length > 0;
    const hasLogo = !!user.agency_logo_url && user.agency_logo_url.length > 0;
    const hasColors = !!user.agency_primary_color && user.agency_primary_color !== '#6366f1';
    const hasContactInfo = !!(user.agency_email || user.agency_phone);
    const hasSignature = !!(user.signature_name && user.signature_title);

    // Check if user has run at least one audit
    let hasAudit = false;
    try {
      const auditResult = await query(
        'SELECT id FROM accessibility_audits WHERE user_id = $1 LIMIT 1',
        [user.id]
      );
      hasAudit = auditResult.length > 0;
    } catch (error) {
      // Table might not exist, ignore
    }

    // Check if user has at least one client (won lead)
    let hasClient = false;
    try {
      const clientResult = await query(
        `SELECT id FROM leads WHERE user_id = $1 AND status = 'won' LIMIT 1`,
        [user.id]
      );
      hasClient = clientResult.length > 0;
    } catch (error) {
      // Ignore
    }

    const steps = [
      {
        id: 'agency-name',
        title: 'Set your agency name',
        description: 'Tell us what to call your agency',
        completed: hasAgencyName,
        href: '/dashboard/settings/branding',
        action: 'Add Name',
      },
      {
        id: 'logo',
        title: 'Upload your logo',
        description: 'Add your agency logo for branded materials',
        completed: hasLogo,
        href: '/dashboard/settings/branding',
        action: 'Add Logo',
      },
      {
        id: 'colors',
        title: 'Choose brand colors',
        description: 'Set your primary and secondary brand colors',
        completed: hasColors,
        href: '/dashboard/settings/branding',
        action: 'Set Colors',
      },
      {
        id: 'contact',
        title: 'Add contact information',
        description: 'Email and phone for client communication',
        completed: hasContactInfo,
        href: '/dashboard/settings/branding',
        action: 'Add Contact',
      },
      {
        id: 'signature',
        title: 'Create email signature',
        description: 'Your name and title for professional emails',
        completed: hasSignature,
        href: '/dashboard/settings/branding',
        action: 'Add Signature',
      },
      {
        id: 'first-audit',
        title: 'Run your first AISO Audit',
        description: 'Try the AI-powered content audit tool',
        completed: hasAudit,
        href: '/dashboard/audit',
        action: 'Run Audit',
      },
    ];

    const completedCount = steps.filter(s => s.completed).length;
    const isComplete = completedCount === steps.length;

    return NextResponse.json({
      steps,
      completedCount,
      totalSteps: steps.length,
      isComplete,
      progress: Math.round((completedCount / steps.length) * 100),
    });
  } catch (error: any) {
    console.error('Error fetching onboarding status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch onboarding status' },
      { status: 500 }
    );
  }
}
