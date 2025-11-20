import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

/**
 * POST /api/audits
 * Save a content audit result
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.getUserByClerkId(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      url,
      title,
      originalContent,
      originalScore,
      originalBreakdown,
      improvedContent,
      improvedScore,
      improvedBreakdown,
      iterations,
      costUsd,
    } = body;

    if (!url || !originalContent || originalScore === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: url, originalContent, originalScore' },
        { status: 400 }
      );
    }

    const audit = await db.createContentAudit({
      user_id: user.id,
      url,
      title,
      original_content: originalContent,
      original_score: originalScore,
      original_breakdown: originalBreakdown,
      improved_content: improvedContent,
      improved_score: improvedScore,
      improved_breakdown: improvedBreakdown,
      iterations,
      cost_usd: costUsd,
    });

    return NextResponse.json({ success: true, audit }, { status: 201 });
  } catch (error) {
    console.error('Error saving audit:', error);
    return NextResponse.json(
      { error: 'Failed to save audit' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/audits
 * Get user's audit history
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.getUserByClerkId(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const audits = await db.getContentAuditsByUserId(user.id, limit);

    return NextResponse.json({ audits }, { status: 200 });
  } catch (error) {
    console.error('Error fetching audits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audits' },
      { status: 500 }
    );
  }
}
