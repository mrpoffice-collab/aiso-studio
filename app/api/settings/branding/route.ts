import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db, query } from '@/lib/db';

export const runtime = 'nodejs';

// GET - Get agency branding
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

    return NextResponse.json({
      branding: {
        agency_name: user.name || '',
        logo_url: user.agency_logo_url || '',
        primary_color: user.agency_primary_color || '#f97316',
        secondary_color: user.agency_secondary_color || '#3b82f6',
        reply_to_email: user.agency_email || user.email || '',
        phone: user.agency_phone || '',
        website: user.agency_website || '',
        address: user.agency_address || '',
        tagline: user.agency_tagline || '',
        signature_name: user.signature_name || user.name || '',
        signature_title: user.signature_title || '',
        signature_phone: user.signature_phone || user.agency_phone || '',
      },
    });
  } catch (error: any) {
    console.error('Error fetching branding:', error);
    return NextResponse.json(
      { error: 'Failed to fetch branding' },
      { status: 500 }
    );
  }
}

// PATCH - Update agency branding
export async function PATCH(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.getUserByClerkId(clerkId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      agency_name,
      logo_url,
      primary_color,
      secondary_color,
      reply_to_email,
      phone,
      website,
      address,
      tagline,
      signature_name,
      signature_title,
      signature_phone,
    } = body;

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (agency_name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(agency_name);
    }
    if (logo_url !== undefined) {
      updates.push(`agency_logo_url = $${paramCount++}`);
      values.push(logo_url);
    }
    if (primary_color !== undefined) {
      updates.push(`agency_primary_color = $${paramCount++}`);
      values.push(primary_color);
    }
    if (secondary_color !== undefined) {
      updates.push(`agency_secondary_color = $${paramCount++}`);
      values.push(secondary_color);
    }
    if (reply_to_email !== undefined) {
      updates.push(`agency_email = $${paramCount++}`);
      values.push(reply_to_email);
    }
    if (phone !== undefined) {
      updates.push(`agency_phone = $${paramCount++}`);
      values.push(phone);
    }
    if (website !== undefined) {
      updates.push(`agency_website = $${paramCount++}`);
      values.push(website);
    }
    if (address !== undefined) {
      updates.push(`agency_address = $${paramCount++}`);
      values.push(address);
    }
    if (tagline !== undefined) {
      updates.push(`agency_tagline = $${paramCount++}`);
      values.push(tagline);
    }
    if (signature_name !== undefined) {
      updates.push(`signature_name = $${paramCount++}`);
      values.push(signature_name);
    }
    if (signature_title !== undefined) {
      updates.push(`signature_title = $${paramCount++}`);
      values.push(signature_title);
    }
    if (signature_phone !== undefined) {
      updates.push(`signature_phone = $${paramCount++}`);
      values.push(signature_phone);
    }

    if (updates.length === 0) {
      return NextResponse.json({ branding: {} });
    }

    values.push(user.id);
    await query(
      `UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${paramCount}`,
      values
    );

    // Fetch and return updated branding
    const updatedUser = await db.getUserById(user.id);

    return NextResponse.json({
      branding: {
        agency_name: updatedUser.name || '',
        logo_url: updatedUser.agency_logo_url || '',
        primary_color: updatedUser.agency_primary_color || '#f97316',
        secondary_color: updatedUser.agency_secondary_color || '#3b82f6',
        reply_to_email: updatedUser.agency_email || updatedUser.email || '',
        phone: updatedUser.agency_phone || '',
        website: updatedUser.agency_website || '',
        address: updatedUser.agency_address || '',
        tagline: updatedUser.agency_tagline || '',
        signature_name: updatedUser.signature_name || updatedUser.name || '',
        signature_title: updatedUser.signature_title || '',
        signature_phone: updatedUser.signature_phone || updatedUser.agency_phone || '',
      },
    });
  } catch (error: any) {
    console.error('Error updating branding:', error);
    return NextResponse.json(
      { error: 'Failed to update branding' },
      { status: 500 }
    );
  }
}
