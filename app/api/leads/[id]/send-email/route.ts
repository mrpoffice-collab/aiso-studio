import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { sql } from '@/lib/db';

// Initialize AWS SES client
const sesClient = new SESClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

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
    const leadId = parseInt(id);

    if (isNaN(leadId)) {
      return NextResponse.json({ error: 'Invalid lead ID' }, { status: 400 });
    }

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
      WHERE id = ${leadId} AND user_id = ${userId}
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

    // Send email via AWS SES
    const sendEmailCommand = new SendEmailCommand({
      Source: senderEmail,
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8',
        },
        Body: {
          Text: {
            Data: emailBody,
            Charset: 'UTF-8',
          },
          Html: {
            Data: formatEmailAsHtml(emailBody, senderEmail),
            Charset: 'UTF-8',
          },
        },
      },
    });

    const sesResponse = await sesClient.send(sendEmailCommand);

    // Log the email in the database
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
        ${userId},
        ${to},
        ${senderEmail},
        ${subject},
        ${emailBody},
        ${template || 'custom'},
        ${sesResponse.MessageId || null},
        'sent',
        NOW()
      )
    `;

    // Update lead contact count and last contact date
    await sql`
      UPDATE leads
      SET
        contact_count = COALESCE(contact_count, 0) + 1,
        last_contact_date = NOW()
      WHERE id = ${leadId}
    `;

    // Log in lead_outreach table
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
        ${userId},
        'email',
        ${subject},
        ${emailBody},
        NOW()
      )
    `;

    return NextResponse.json({
      success: true,
      messageId: sesResponse.MessageId,
      message: `Email sent to ${to}`,
    });
  } catch (error) {
    console.error('Failed to send email:', error);

    // Check for specific AWS SES errors
    if (error instanceof Error) {
      if (error.name === 'MessageRejected') {
        return NextResponse.json(
          { error: 'Email rejected by AWS SES. Check sender verification.' },
          { status: 400 }
        );
      }
      if (error.name === 'MailFromDomainNotVerifiedException') {
        return NextResponse.json(
          { error: 'Sender email domain not verified in AWS SES.' },
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
