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

    // Update lead with provided fields using tagged template
    const [updatedLead] = await sql`
      UPDATE leads SET
        status = COALESCE(${body.status ?? null}, status),
        project_id = COALESCE(${body.project_id ?? null}, project_id),
        opportunity_rating = COALESCE(${body.opportunity_rating ?? null}, opportunity_rating),
        notes = COALESCE(${body.notes ?? null}, notes),
        accessibility_score = COALESCE(${body.accessibility_score ?? null}, accessibility_score),
        wcag_critical_violations = COALESCE(${body.wcag_critical_violations ?? null}, wcag_critical_violations),
        wcag_serious_violations = COALESCE(${body.wcag_serious_violations ?? null}, wcag_serious_violations),
        wcag_moderate_violations = COALESCE(${body.wcag_moderate_violations ?? null}, wcag_moderate_violations),
        wcag_minor_violations = COALESCE(${body.wcag_minor_violations ?? null}, wcag_minor_violations),
        wcag_total_violations = COALESCE(${body.wcag_total_violations ?? null}, wcag_total_violations),
        accessibility_audit_id = COALESCE(${body.accessibility_audit_id ?? null}, accessibility_audit_id),
        aiso_opportunity_score = COALESCE(${body.aiso_opportunity_score ?? null}, aiso_opportunity_score),
        primary_pain_point = COALESCE(${body.primary_pain_point ?? null}, primary_pain_point),
        estimated_monthly_value = COALESCE(${body.estimated_monthly_value ?? null}, estimated_monthly_value),
        time_to_close = COALESCE(${body.time_to_close ?? null}, time_to_close),
        updated_at = NOW()
      WHERE id = ${leadId}
      RETURNING *
    `;

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
