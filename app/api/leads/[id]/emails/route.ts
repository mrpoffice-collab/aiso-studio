import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.getUserByClerkId(clerkId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id } = await params;
    const leadId = parseInt(id);

    // Get emails sent to this lead
    const emails = await sql`
      SELECT
        id,
        to_email,
        from_email,
        subject,
        template_used,
        status,
        sent_at,
        opened_at,
        clicked_at
      FROM lead_emails
      WHERE lead_id = ${leadId}
        AND user_id = ${user.id}::uuid
      ORDER BY sent_at DESC
    `;

    return NextResponse.json({ emails });
  } catch (error) {
    console.error('Error fetching lead emails:', error);
    return NextResponse.json({ emails: [] });
  }
}
