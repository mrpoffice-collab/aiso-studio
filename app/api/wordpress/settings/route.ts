import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { encryptCredential } from '@/lib/wordpress-client';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      strategyId,
      wordpress_enabled,
      wordpress_url,
      wordpress_username,
      wordpress_app_password,
      wordpress_category_id,
      wordpress_category_name,
      wordpress_author_id,
      wordpress_author_name,
      wordpress_default_status,
      wordpress_connection_verified,
    } = body;

    if (!strategyId) {
      return NextResponse.json(
        { error: 'Missing required field: strategyId' },
        { status: 400 }
      );
    }

    // Verify user owns this strategy
    const strategy = await db.getStrategyById(strategyId);
    if (!strategy) {
      return NextResponse.json({ error: 'Strategy not found' }, { status: 404 });
    }

    const user = await db.getUserByClerkId(userId);
    if (!user || strategy.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Encrypt password if provided
    const encryptedPassword = wordpress_app_password
      ? encryptCredential(wordpress_app_password)
      : undefined;

    // Update WordPress settings
    const updatedStrategy = await db.updateStrategyWordPress(strategyId, {
      wordpress_enabled,
      wordpress_url,
      wordpress_username,
      wordpress_app_password: encryptedPassword,
      wordpress_category_id,
      wordpress_category_name,
      wordpress_author_id,
      wordpress_author_name,
      wordpress_default_status,
      wordpress_connection_verified,
      wordpress_last_test_at: wordpress_connection_verified ? new Date() : undefined,
    });

    return NextResponse.json({
      success: true,
      strategy: {
        ...updatedStrategy,
        // Don't return the encrypted password
        wordpress_app_password: updatedStrategy.wordpress_app_password ? '********' : null,
      },
    });
  } catch (error: any) {
    console.error('WordPress settings update error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
