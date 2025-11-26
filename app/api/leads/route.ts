import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

/**
 * GET /api/leads
 * Get all leads with optional filtering (same as /api/leads/pipeline)
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.getUserByClerkId(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const project_id = searchParams.get('project_id');
    const status = searchParams.get('status');
    const min_score = searchParams.get('min_score');
    const max_score = searchParams.get('max_score');

    const filters: any = {};
    if (project_id) filters.project_id = parseInt(project_id);
    if (status) filters.status = status;
    if (min_score) filters.min_score = parseInt(min_score);
    if (max_score) filters.max_score = parseInt(max_score);

    // Get leads with filters
    const leads = await db.getLeadsByUserId(user.id, filters);

    // Parse discovery_data from JSON string to object
    const parsedLeads = leads.map(lead => ({
      ...lead,
      discovery_data: lead.discovery_data && typeof lead.discovery_data === 'string'
        ? JSON.parse(lead.discovery_data)
        : lead.discovery_data
    }));

    return NextResponse.json({ leads: parsedLeads });

  } catch (error: any) {
    console.error('Get leads error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get leads' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/leads
 * Create a new lead manually
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.getUserByClerkId(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { business_name, domain, email, phone, address, city, state, industry, notes } = body;

    if (!business_name || !domain) {
      return NextResponse.json(
        { error: 'Business name and domain are required' },
        { status: 400 }
      );
    }

    // Create the lead
    const lead = await db.createLead({
      user_id: user.id,
      business_name,
      domain,
      email: email || null,
      phone: phone || null,
      address: address || null,
      city: city || null,
      state: state || null,
      industry: industry || null,
      status: 'new',
      overall_score: 0,
      content_score: 0,
      seo_score: 0,
      design_score: 0,
      speed_score: 0,
    });

    return NextResponse.json({ success: true, lead });

  } catch (error: any) {
    console.error('Create lead error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create lead' },
      { status: 500 }
    );
  }
}
