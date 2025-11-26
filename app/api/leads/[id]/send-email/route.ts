import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import nodemailer from 'nodemailer';
import { sql, db } from '@/lib/db';

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
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get database user ID from Clerk ID
    const dbUser = await db.getUserByClerkId(clerkUserId);
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const dbUserId = dbUser.id;

    const { id } = await params;
    const leadId = parseInt(id, 10); // leads.id is integer

    const body = await request.json();
    const { to, subject, body: emailBody, html: brandedHtml, template } = body;

    if (!to || !subject || (!emailBody && !brandedHtml)) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, and body or html' },
        { status: 400 }
      );
    }

    // Verify the lead exists and belongs to the user
    const leadResult = await sql`
      SELECT id, business_name, domain, email
      FROM leads
      WHERE id = ${leadId}
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
    // Use branded HTML if provided, otherwise format plain text body
    const htmlContent = brandedHtml || formatEmailAsHtml(emailBody, senderEmail);
    const textContent = emailBody || 'Please view this email in an HTML-capable email client.';

    const mailResult = await transporter.sendMail({
      from: `"AISO Studio" <${senderEmail}>`,
      to: to,
      subject: subject,
      text: textContent,
      html: htmlContent,
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
          ${leadId},
          ${dbUserId}::uuid,
          ${to},
          ${senderEmail},
          ${subject},
          ${htmlContent},
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
        WHERE id = ${leadId}
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
          ${leadId},
          ${dbUserId}::uuid,
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

// Helper function to format plain text email as HTML with professional branding
function formatEmailAsHtml(plainText: string, senderEmail: string): string {
  // Parse the email content
  const lines = plainText.split('\n');
  let bodyLines: string[] = [];
  let signatureLines: string[] = [];
  let inSignature = false;

  for (const line of lines) {
    if (line.trim() === '—' || line.trim() === '--') {
      inSignature = true;
      continue;
    }
    if (inSignature) {
      signatureLines.push(line);
    } else {
      bodyLines.push(line);
    }
  }

  // Format body paragraphs
  const bodyText = bodyLines.join('\n');
  const htmlBody = bodyText
    .split('\n\n')
    .map(paragraph => {
      // Handle bullet points
      if (paragraph.includes('•')) {
        const items = paragraph.split('\n').map(line => {
          if (line.trim().startsWith('•')) {
            return `<li style="margin: 8px 0; color: #374151;">${line.trim().substring(1).trim()}</li>`;
          }
          return `<p style="margin: 0 0 8px 0;">${line}</p>`;
        }).join('');
        return `<ul style="margin: 16px 0; padding-left: 20px; list-style: none;">${items}</ul>`;
      }
      return `<p style="margin: 0 0 16px 0; line-height: 1.7; color: #374151;">${paragraph.replace(/\n/g, '<br>')}</p>`;
    })
    .join('');

  // Format signature
  const signatureName = signatureLines[0] || 'The AISO Team';
  const signatureTitle = signatureLines[1] || 'AI Search Optimization';
  const signatureCompany = signatureLines[2] || 'aiso.studio';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Message from AISO</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%;">

          <!-- Header -->
          <tr>
            <td style="padding: 0 0 32px 0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 12px 20px; border-radius: 8px;">
                      <span style="font-size: 24px; font-weight: 700; color: white; letter-spacing: -0.5px;">AISO</span>
                      <span style="font-size: 14px; color: rgba(255,255,255,0.9); margin-left: 4px;">.studio</span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Card -->
          <tr>
            <td>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <tr>
                  <td style="padding: 40px;">
                    <!-- Email Body -->
                    <div style="font-size: 16px; line-height: 1.7;">
                      ${htmlBody}
                    </div>

                    <!-- Signature -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 24px;">
                      <tr>
                        <td>
                          <p style="margin: 0 0 4px 0; font-weight: 600; color: #111827; font-size: 15px;">${signatureName}</p>
                          <p style="margin: 0 0 2px 0; color: #6b7280; font-size: 14px;">${signatureTitle}</p>
                          <a href="https://aiso.studio" style="color: #f97316; text-decoration: none; font-size: 14px; font-weight: 500;">${signatureCompany}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 32px 0 0 0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 16px 0; color: #9ca3af; font-size: 13px;">
                      AI-Powered Search Optimization for Local Businesses
                    </p>
                    <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                      <a href="https://aiso.studio" style="color: #f97316; text-decoration: none;">aiso.studio</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
