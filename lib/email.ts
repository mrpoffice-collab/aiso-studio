import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

// Initialize AWS SES Client
const sesClient = new SESClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function sendVIPWelcomeEmail(
  to: string,
  name: string,
  htmlContent: string
) {
  try {
    const command = new SendEmailCommand({
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: htmlContent,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: '🎉 Welcome to Agency Tier - Your VIP Access is Live!',
        },
      },
      Source: 'AISO Studio <onboarding@aiso.studio>',
    });

    const response = await sesClient.send(command);

    console.log('✅ Email sent successfully:', response.MessageId);
    return { success: true, data: { id: response.MessageId } };
  } catch (error: any) {
    console.error('❌ Email send exception:', error.message);
    return { success: false, error: error.message };
  }
}

export async function sendEmail({
  to,
  subject,
  html,
  from = 'AISO Studio <noreply@aiso.studio>',
}: {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}) {
  try {
    const toAddresses = Array.isArray(to) ? to : [to];

    const command = new SendEmailCommand({
      Destination: {
        ToAddresses: toAddresses,
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: html,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: subject,
        },
      },
      Source: from,
    });

    const response = await sesClient.send(command);

    console.log('✅ Email sent successfully:', response.MessageId);
    return { success: true, data: { id: response.MessageId } };
  } catch (error: any) {
    console.error('❌ Email send exception:', error.message);
    return { success: false, error: error.message };
  }
}
