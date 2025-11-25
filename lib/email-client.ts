/**
 * AWS SES Email Client
 *
 * Sends emails via AWS SES SMTP
 */

import nodemailer from 'nodemailer';

// Create reusable transporter
const createTransporter = () => {
  const host = process.env.AWS_SES_SMTP_HOST;
  const port = parseInt(process.env.AWS_SES_SMTP_PORT || '587');
  const user = process.env.AWS_SES_SMTP_USER;
  const pass = process.env.AWS_SES_SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn('AWS SES credentials not configured. Email sending disabled.');
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for 587
    auth: {
      user,
      pass,
    },
  });
};

export interface SendEmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
  fromName?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send an email via AWS SES
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const transporter = createTransporter();

  if (!transporter) {
    return {
      success: false,
      error: 'Email service not configured. Please set AWS SES credentials.',
    };
  }

  const fromEmail = process.env.AWS_SES_FROM_EMAIL;
  if (!fromEmail) {
    return {
      success: false,
      error: 'FROM email address not configured.',
    };
  }

  const fromAddress = options.fromName
    ? `"${options.fromName}" <${fromEmail}>`
    : fromEmail;

  try {
    const result = await transporter.sendMail({
      from: fromAddress,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      replyTo: options.replyTo,
    });

    console.log(`✅ Email sent to ${options.to} - MessageID: ${result.messageId}`);

    return {
      success: true,
      messageId: result.messageId,
    };
  } catch (error: any) {
    console.error('❌ Email send error:', error.message);

    return {
      success: false,
      error: error.message || 'Failed to send email',
    };
  }
}

/**
 * Send outreach email to a lead
 */
export async function sendOutreachEmail(options: {
  to: string;
  businessName: string;
  subject: string;
  body: string;
  senderName?: string;
  replyTo?: string;
}): Promise<SendEmailResult> {
  // Convert plain text body to HTML with line breaks
  const htmlBody = options.body
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // Basic markdown bold

  return sendEmail({
    to: options.to,
    subject: options.subject,
    text: options.body,
    html: `
      <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333; line-height: 1.6;">
        ${htmlBody}
      </div>
    `,
    fromName: options.senderName || 'AISO Studio',
    replyTo: options.replyTo,
  });
}

/**
 * Test email configuration
 */
export async function testEmailConfig(): Promise<SendEmailResult> {
  const transporter = createTransporter();

  if (!transporter) {
    return {
      success: false,
      error: 'Email service not configured',
    };
  }

  try {
    // Verify connection
    await transporter.verify();
    return {
      success: true,
      messageId: 'connection-verified',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Connection verification failed',
    };
  }
}
