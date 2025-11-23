import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

// POST - Submit agency application
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.getUserByClerkId(clerkId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user already has an agency application
    const existingAgency = await db.getAgencyByUserId(user.id);
    if (existingAgency) {
      return NextResponse.json(
        {
          error: 'You already have an agency application',
          status: existingAgency.certification_status,
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      agencyName,
      contactEmail,
      contactPhone,
      websiteUrl,
      city,
      state,
      country,
      verticalSpecialization,
      servicesOffered,
      portfolioUrl,
      clientCount,
      baseAuditPriceCents,
      hourlyRateCents,
      maxActiveClients,
    } = body;

    // Validate required fields
    if (!agencyName || !contactEmail) {
      return NextResponse.json(
        { error: 'Agency name and contact email are required' },
        { status: 400 }
      );
    }

    if (!verticalSpecialization || verticalSpecialization.length === 0) {
      return NextResponse.json(
        { error: 'Please select at least one vertical specialization' },
        { status: 400 }
      );
    }

    if (!servicesOffered || servicesOffered.length === 0) {
      return NextResponse.json(
        { error: 'Please select at least one service you offer' },
        { status: 400 }
      );
    }

    // Create agency application
    const agency = await db.createAgency({
      user_id: user.id,
      agency_name: agencyName,
      contact_email: contactEmail,
      contact_phone: contactPhone || null,
      website_url: websiteUrl || null,
      city: city || null,
      state: state || null,
      country: country || 'USA',
      vertical_specialization: verticalSpecialization,
      services_offered: servicesOffered,
      portfolio_url: portfolioUrl || null,
      client_count: clientCount || 0,
      base_audit_price_cents: baseAuditPriceCents || null,
      hourly_rate_cents: hourlyRateCents || null,
      max_active_clients: maxActiveClients || 10,
      certification_status: 'pending',
      accepting_leads: false, // Don't accept leads until approved
    });

    // TODO: Send notification email to admin about new application
    // TODO: Send confirmation email to agency

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      agency: {
        id: agency.id,
        agencyName: agency.agency_name,
        certificationStatus: agency.certification_status,
        createdAt: agency.created_at,
      },
    });
  } catch (error: any) {
    console.error('Agency application error:', error);
    return NextResponse.json(
      { error: `Failed to submit application: ${error.message || error}` },
      { status: 500 }
    );
  }
}
