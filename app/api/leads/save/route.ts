import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

/**
 * POST /api/leads/save
 * Save a discovered lead to the pipeline
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await db.getUserByClerkId(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      project_id,
      domain,
      business_name,
      city,
      state,
      industry,
      overall_score,
      content_score,
      seo_score,
      design_score,
      speed_score,
      has_blog,
      blog_post_count,
      last_blog_update,
      phone,
      address,
      email,
      opportunity_rating,
      seoIssues,
      opportunityType,
      technicalSEO,
      onPageSEO,
      contentMarketing,
      localSEO,
    } = body;

    if (!domain || !business_name) {
      return NextResponse.json(
        { error: 'Domain and business name are required' },
        { status: 400 }
      );
    }

    // Auto-calculate opportunity rating if not provided
    let rating = opportunity_rating;
    if (!rating) {
      if (overall_score >= 45 && overall_score <= 70) {
        rating = 'high';
      } else if (overall_score < 45) {
        rating = 'medium';
      } else {
        rating = 'low';
      }
    }

    // Create the lead (provide defaults for required NOT NULL fields)
    const leadData: any = {
      user_id: user.id,
      domain,
      business_name,
      status: 'new',
      opportunity_rating: rating,
      // Required NOT NULL fields with defaults
      overall_score: overall_score ?? 0,
      content_score: content_score ?? 0,
      seo_score: seo_score ?? 0,
      design_score: design_score ?? 0,
      speed_score: speed_score ?? 0,
    };

    // Only add defined optional fields
    if (project_id !== undefined) leadData.project_id = project_id;
    if (city !== undefined) leadData.city = city;
    if (state !== undefined) leadData.state = state;
    if (industry !== undefined) leadData.industry = industry;
    if (has_blog !== undefined) leadData.has_blog = has_blog;
    if (blog_post_count !== undefined) leadData.blog_post_count = blog_post_count;
    if (last_blog_update !== undefined) leadData.last_blog_update = last_blog_update;
    if (phone !== undefined) leadData.phone = phone;
    if (address !== undefined) leadData.address = address;
    if (email !== undefined) leadData.email = email;

    // Add discovery data (SEO issues, opportunity type, score breakdown)
    if (seoIssues || opportunityType || technicalSEO !== undefined) {
      leadData.discovery_data = {
        seoIssues: seoIssues || [],
        opportunityType,
        technicalSEO,
        onPageSEO,
        contentMarketing,
        localSEO,
      };
    }

    const lead = await db.createLead(leadData);

    // Log the activity
    await db.createLeadActivity({
      lead_id: lead.id,
      user_id: user.id,
      activity_type: 'note',
      description: 'Lead discovered and added to pipeline',
    });

    return NextResponse.json({ success: true, lead });

  } catch (error: any) {
    console.error('Save lead error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save lead' },
      { status: 500 }
    );
  }
}
