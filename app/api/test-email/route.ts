import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { sendEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { to } = await request.json();

    // Send test email
    const result = await sendEmail({
      to: to || user.emailAddresses[0]?.emailAddress,
      subject: 'Test Email from AISO Studio',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">🎉 AWS SES is Working!</h1>
          <p>Hello ${user.firstName || 'there'},</p>
          <p>Your AWS SES integration is configured correctly.</p>
          <p>This test email was sent from <strong>AISO Studio</strong> using AWS SES.</p>
          <hr style="border: 1px solid #E5E7EB; margin: 20px 0;">
          <p style="color: #6B7280; font-size: 14px;">
            Sent via AWS Simple Email Service<br>
            Region: ${process.env.AWS_REGION || 'us-east-1'}
          </p>
        </div>
      `,
      from: 'AISO Studio <noreply@aiso.studio>'
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully!',
        messageId: result.data?.id
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Test email error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
