import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

/**
 * GET /api/leads/[id]
 * Get a single lead by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await db.getUserByClerkId(clerkUserId);
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id } = await params;
    const leadId = parseInt(id, 10);

    const lead = await db.getLeadById(leadId);
    if (!lead || lead.user_id !== dbUser.id) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    return NextResponse.json({ lead });
  } catch (error) {
    console.error('Failed to get lead:', error);
    return NextResponse.json({ error: 'Failed to get lead' }, { status: 500 });
  }
}

/**
 * PATCH /api/leads/[id]
 * Update a lead's fields including accessibility scores
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await db.getUserByClerkId(clerkUserId);
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id } = await params;
    const leadId = parseInt(id, 10);

    // Verify lead belongs to user
    const lead = await db.getLeadById(leadId);
    if (!lead || lead.user_id !== dbUser.id) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    const body = await request.json();

    // Build dynamic update query for all provided fields
    const allowedFields = [
      'status', 'project_id', 'opportunity_rating', 'notes',
      'accessibility_score', 'wcag_critical_violations', 'wcag_serious_violations',
      'wcag_moderate_violations', 'wcag_minor_violations', 'wcag_total_violations',
      'accessibility_audit_id', 'aiso_opportunity_score', 'primary_pain_point',
      'estimated_monthly_value', 'time_to_close'
    ];

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates.push(`${field} = $${paramIndex}`);
        values.push(body[field]);
        paramIndex++;
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    // Add updated_at
    updates.push(`updated_at = NOW()`);

    // Add lead ID as final parameter
    values.push(leadId);

    const updateQuery = `
      UPDATE leads SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const [updatedLead] = await sql(updateQuery, values);

    return NextResponse.json({ success: true, lead: updatedLead });
  } catch (error) {
    console.error('Failed to update lead:', error);
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
  }
}

/**
 * DELETE /api/leads/[id]
 * Delete a lead
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await db.getUserByClerkId(clerkUserId);
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id } = await params;
    const leadId = parseInt(id, 10);

    // Verify lead belongs to user
    const lead = await db.getLeadById(leadId);
    if (!lead || lead.user_id !== dbUser.id) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    await sql`DELETE FROM leads WHERE id = ${leadId}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete lead:', error);
    return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 });
  }
}
