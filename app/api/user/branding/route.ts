import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

/**
 * GET /api/user/branding
 * Fetches the current user's branding settings
 */
export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await db.getUserByClerkId(clerkId);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get branding info
    const branding = await db.getUserBranding(user.id);

    // Check if user is on Agency tier (for white-label PDF access)
    const isAgencyTier = user.subscription_tier === 'agency';

    return NextResponse.json({
      success: true,
      isAgencyTier,
      branding: branding || {
        agency_name: null,
        agency_logo_url: null,
        agency_primary_color: '#6366f1',
        agency_secondary_color: '#3b82f6',
        agency_email: null,
        agency_phone: null,
        agency_website: null,
        agency_address: null,
        agency_tagline: null,
        signature_name: null,
        signature_title: null,
        signature_phone: null,
      }
    });

  } catch (error: any) {
    console.error('Get branding error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch branding' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/branding
 * Updates the current user's branding settings
 */
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await db.getUserByClerkId(clerkId);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse request body
    const body = await request.json();

    // Validate color codes if provided
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
    
    if (body.agency_primary_color && !hexColorRegex.test(body.agency_primary_color)) {
      return NextResponse.json(
        { error: 'Invalid primary color format. Use hex code (e.g., #6366f1)' },
        { status: 400 }
      );
    }

    if (body.agency_secondary_color && !hexColorRegex.test(body.agency_secondary_color)) {
      return NextResponse.json(
        { error: 'Invalid secondary color format. Use hex code (e.g., #3b82f6)' },
        { status: 400 }
      );
    }

    // Validate email if provided
    if (body.agency_email && !body.agency_email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate URL if provided
    if (body.agency_website) {
      try {
        new URL(body.agency_website.startsWith('http') ? body.agency_website : `https://${body.agency_website}`);
      } catch {
        return NextResponse.json(
          { error: 'Invalid website URL' },
          { status: 400 }
        );
      }
    }

    // Update branding
    const updatedBranding = await db.updateUserBranding(user.id, {
      agency_name: body.agency_name,
      agency_logo_url: body.agency_logo_url,
      agency_primary_color: body.agency_primary_color,
      agency_secondary_color: body.agency_secondary_color,
      agency_email: body.agency_email,
      agency_phone: body.agency_phone,
      agency_website: body.agency_website,
      agency_address: body.agency_address,
      agency_tagline: body.agency_tagline,
      signature_name: body.signature_name,
      signature_title: body.signature_title,
      signature_phone: body.signature_phone,
    });

    return NextResponse.json({
      success: true,
      message: 'Branding updated successfully',
      branding: updatedBranding
    });

  } catch (error: any) {
    console.error('Update branding error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update branding' },
      { status: 500 }
    );
  }
}
