import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * POST /api/leads/capture
 * Capture email from free audit flow (public endpoint)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, persona, source, domain, url, aisoScore } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Get IP address for tracking
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ipAddress = forwardedFor?.split(',')[0].trim() || realIp || 'unknown';

    // Get user agent and referrer
    const userAgent = request.headers.get('user-agent') || '';
    const referrer = request.headers.get('referer') || '';

    // Check if email already exists in captured_leads
    const existingLead = await db.getCapturedLeadByEmail(email);

    if (existingLead) {
      // Update existing lead with new audit info
      await db.updateCapturedLead(existingLead.id, {
        last_domain: domain,
        last_url: url,
        last_aiso_score: aisoScore,
        audit_count: (existingLead.audit_count || 0) + 1,
        updated_at: new Date(),
      });

      return NextResponse.json({
        success: true,
        message: 'Lead updated',
        isNew: false,
      });
    }

    // Create new captured lead
    const lead = await db.createCapturedLead({
      email,
      persona: persona || 'unknown',
      source: source || 'free_audit',
      domain,
      url,
      aiso_score: aisoScore,
      ip_address: ipAddress,
      user_agent: userAgent,
      referrer,
    });

    // Trigger welcome email sequence (async, don't wait)
    if (lead?.id) {
      triggerEmailSequence(lead.id, email, persona, domain, aisoScore).catch(err => {
        console.error('Failed to trigger email sequence:', err);
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Lead captured',
      isNew: true,
      leadId: lead?.id,
    });
  } catch (error: any) {
    console.error('Error capturing lead:', error);
    return NextResponse.json(
      { error: 'Failed to capture lead' },
      { status: 500 }
    );
  }
}

/**
 * Trigger email sequence based on persona
 */
async function triggerEmailSequence(
  leadId: string,
  email: string,
  persona: string,
  domain: string | undefined,
  aisoScore: number | undefined
) {
  console.log(`[Email Sequence] Triggering for ${email}`);
  console.log(`  Lead ID: ${leadId}`);
  console.log(`  Persona: ${persona}`);
  console.log(`  Domain: ${domain || 'N/A'}`);
  console.log(`  AISO Score: ${aisoScore || 'N/A'}`);

  try {
    // Import dynamically to avoid circular dependencies
    const { sendSequenceEmail } = await import('@/lib/email-sequences');

    // Send first email immediately
    await sendSequenceEmail(
      leadId,
      email,
      persona,
      1, // Email 1
      {
        email,
        domain,
        aisoScore,
        persona,
      }
    );

    console.log(`[Email Sequence] First email sent to ${email}`);
  } catch (error) {
    console.error(`[Email Sequence] Failed to send first email to ${email}:`, error);
  }
}
