import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import nodemailer from 'nodemailer';
import { sql } from '@/lib/db';

// Create SMTP transporter for AWS SES
const createTransporter = () => {
  const host = process.env.AWS_SES_SMTP_HOST;
  const port = parseInt(process.env.AWS_SES_SMTP_PORT || '587');
  const user = process.env.AWS_SES_SMTP_USER;
  const pass = process.env.AWS_SES_SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const leadId = id; // Keep as string for UUID

    const body = await request.json();
    const { to, subject, body: emailBody, template } = body;

    if (!to || !subject || !emailBody) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, body' },
        { status: 400 }
      );
    }

    // Verify the lead exists and belongs to the user
    const leadResult = await sql`
      SELECT id, business_name, domain, email
      FROM leads
      WHERE id = ${leadId}::uuid
    `;

    if (leadResult.length === 0) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    const lead = leadResult[0];

    // Get the sender email from environment
    const senderEmail = process.env.AWS_SES_FROM_EMAIL;
    if (!senderEmail) {
      console.error('AWS_SES_FROM_EMAIL not configured');
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }

    // Create transporter
    const transporter = createTransporter();
    if (!transporter) {
      console.error('AWS SES SMTP credentials not configured');
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }

    // Send email via SMTP
    const mailResult = await transporter.sendMail({
      from: `"AISO Studio" <${senderEmail}>`,
      to: to,
      subject: subject,
      text: emailBody,
      html: formatEmailAsHtml(emailBody, senderEmail),
    });

    console.log(`✅ Email sent to ${to} - MessageID: ${mailResult.messageId}`);

    // Log the email in the database
    try {
      await sql`
        INSERT INTO lead_emails (
          lead_id,
          user_id,
          to_email,
          from_email,
          subject,
          body,
          template_used,
          ses_message_id,
          status,
          sent_at
        ) VALUES (
          ${leadId}::uuid,
          ${userId},
          ${to},
          ${senderEmail},
          ${subject},
          ${emailBody},
          ${template || 'custom'},
          ${mailResult.messageId || null},
          'sent',
          NOW()
        )
      `;
    } catch (logError) {
      // Email sent but logging failed - don't fail the request
      console.error('Failed to log email:', logError);
    }

    // Update lead contact count and last contact date
    try {
      await sql`
        UPDATE leads
        SET
          contact_count = COALESCE(contact_count, 0) + 1,
          last_contact_date = NOW()
        WHERE id = ${leadId}::uuid
      `;
    } catch (updateError) {
      console.error('Failed to update lead:', updateError);
    }

    // Log in lead_outreach table
    try {
      await sql`
        INSERT INTO lead_outreach (
          lead_id,
          user_id,
          outreach_type,
          subject,
          message,
          sent_at
        ) VALUES (
          ${leadId}::uuid,
          ${userId},
          'email',
          ${subject},
          ${emailBody},
          NOW()
        )
      `;
    } catch (outreachError) {
      console.error('Failed to log outreach:', outreachError);
    }

    return NextResponse.json({
      success: true,
      messageId: mailResult.messageId,
      message: `Email sent to ${to}`,
    });
  } catch (error) {
    console.error('Failed to send email:', error);

    // Check for specific errors
    if (error instanceof Error) {
      if (error.message.includes('Message rejected')) {
        return NextResponse.json(
          { error: 'Email rejected. You may still be in SES sandbox mode.' },
          { status: 400 }
        );
      }
      if (error.message.includes('Invalid login')) {
        return NextResponse.json(
          { error: 'Invalid SMTP credentials. Check your AWS SES settings.' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to send email. Please try again.' },
      { status: 500 }
    );
  }
}

// Helper function to format plain text email as HTML
function formatEmailAsHtml(plainText: string, senderEmail: string): string {
  const htmlBody = plainText
    .split('\n\n')
    .map(paragraph => `<p style="margin: 0 0 16px 0; line-height: 1.6;">${paragraph.replace(/\n/g, '<br>')}</p>`)
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px;">
  ${htmlBody}
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
  <p style="font-size: 12px; color: #6b7280; margin: 0;">
    Sent via <a href="https://aiso.studio" style="color: #f97316; text-decoration: none;">AISO.studio</a>
  </p>
</body>
</html>
  `.trim();
}
