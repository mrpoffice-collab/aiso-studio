import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { db } from '@/lib/db';

/**
 * Clerk Webhook: user.created
 * Triggers when a new user signs up
 * Links their free audit history to their account for conversion tracking
 */
export async function POST(request: NextRequest) {
  try {
    // Get headers
    const headersList = await headers();
    const svixId = headersList.get('svix-id');
    const svixTimestamp = headersList.get('svix-timestamp');
    const svixSignature = headersList.get('svix-signature');

    if (!svixId || !svixTimestamp || !svixSignature) {
      return NextResponse.json(
        { error: 'Missing svix headers' },
        { status: 400 }
      );
    }

    // Get body
    const payload = await request.json();
    const body = JSON.stringify(payload);

    // Verify webhook signature
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('CLERK_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    const wh = new Webhook(webhookSecret);
    let evt: any;

    try {
      evt = wh.verify(body, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      });
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle user.created event
    if (evt.type === 'user.created') {
      const { id: clerkId, email_addresses, primary_email_address_id } = evt.data;

      // Get primary email
      const primaryEmail = email_addresses.find(
        (email: any) => email.id === primary_email_address_id
      );

      if (!primaryEmail) {
        console.error('No primary email found for user');
        return NextResponse.json({ error: 'No email found' }, { status: 400 });
      }

      const email = primaryEmail.email_address;

      // Find user in database
      const user = await db.getUserByClerkId(clerkId);

      if (!user) {
        console.error('User not found in database:', clerkId);
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // Get IP address from request (for linking free audits)
      const forwardedFor = request.headers.get('x-forwarded-for');
      const realIp = request.headers.get('x-real-ip');
      const ipAddress = forwardedFor?.split(',')[0].trim() || realIp || 'unknown';

      // Link free audits to this user
      console.log(`Linking free audits for IP ${ipAddress} to user ${user.id}`);

      const result = await db.markFreeAuditConverted(ipAddress, user.id, email);

      console.log(`✅ Linked ${result.updated} free audits to user ${user.id}`);
      console.log(`  Email: ${email}`);
      console.log(`  IP: ${ipAddress}`);

      if (result.audits && result.audits.length > 0) {
        const domainOwned = result.audits.filter((a: any) =>
          a.domain?.toLowerCase().includes(email.split('@')[1]?.toLowerCase())
        ).length;

        const agencyWork = result.audits.length - domainOwned;

        console.log(`  Domain Owner Audits: ${domainOwned}`);
        console.log(`  Agency/Client Work: ${agencyWork}`);
      }

      return NextResponse.json({
        success: true,
        linked_audits: result.updated,
      });
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Clerk webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
