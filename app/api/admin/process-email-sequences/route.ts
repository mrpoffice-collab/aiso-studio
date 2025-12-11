import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db, query } from '@/lib/db';
import { processEmailSequences } from '@/lib/email-sequences';

const ADMIN_EMAILS = ['mrpoffice@gmail.com', 'kim@aliidesign.com'];

/**
 * POST /api/admin/process-email-sequences
 * Process pending email sequences (admin only or cron)
 */
export async function POST(request: NextRequest) {
  try {
    // Check for cron secret (for scheduled jobs)
    const cronSecret = request.headers.get('x-cron-secret');
    const expectedSecret = process.env.CRON_SECRET;

    let isAuthorized = false;

    // Allow cron jobs with secret
    if (cronSecret && expectedSecret && cronSecret === expectedSecret) {
      isAuthorized = true;
    } else {
      // Check admin auth
      const { userId } = await auth();
      if (userId) {
        const user = await db.getUserByClerkId(userId);
        if (user && ADMIN_EMAILS.includes(user.email)) {
          isAuthorized = true;
        }
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Process email sequences
    const stats = await processEmailSequences();

    return NextResponse.json({
      success: true,
      ...stats,
      message: `Processed ${stats.processed} leads, sent ${stats.sent} emails, ${stats.errors} errors`,
    });
  } catch (error: any) {
    console.error('Error processing email sequences:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process email sequences' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/process-email-sequences
 * Get email sequence stats
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.getUserByClerkId(userId);
    if (!user || !ADMIN_EMAILS.includes(user.email)) {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 });
    }

    // Get captured lead stats
    const leadStats = await db.getCapturedLeadStats();

    // Get sequence status breakdown
    const sequenceStats = await query(`
      SELECT
        email_sequence_status,
        COUNT(*) as count
      FROM captured_leads
      GROUP BY email_sequence_status
      ORDER BY count DESC
    `);

    // Get recent emails sent
    const recentEmails = await query(`
      SELECT
        esl.*,
        cl.email,
        cl.persona
      FROM email_sequence_logs esl
      JOIN captured_leads cl ON esl.captured_lead_id = cl.id
      ORDER BY esl.sent_at DESC
      LIMIT 20
    `);

    return NextResponse.json({
      leadStats,
      sequenceStats,
      recentEmails,
    });
  } catch (error: any) {
    console.error('Error getting email sequence stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get stats' },
      { status: 500 }
    );
  }
}
