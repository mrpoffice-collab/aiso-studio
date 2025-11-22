import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

/**
 * GET /api/assets/[id]/usage
 * Gets usage information for an asset (where it's used in posts, MOUs, strategies)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await db.getUserByClerkId(clerkId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id: assetId } = await params;

    // Get the asset to verify ownership
    const asset = await db.getAssetById(assetId);

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    // Verify the asset belongs to the user
    if (asset.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to view this asset' },
        { status: 403 }
      );
    }

    // Get usage information
    const usage = await db.getAssetUsage(assetId);
    const usageCount = await db.getAssetUsageCount(assetId);

    return NextResponse.json({
      success: true,
      assetId,
      usage,
      count: usageCount,
      isInUse: usageCount > 0,
    });

  } catch (error: any) {
    console.error('Get asset usage error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get asset usage' },
      { status: 500 }
    );
  }
}
