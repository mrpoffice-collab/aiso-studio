import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { del } from '@vercel/blob';
import { db } from '@/lib/db';

/**
 * DELETE /api/assets/[id]
 * Soft deletes an asset and removes it from Vercel Blob storage
 */
export async function DELETE(
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

    // Get the asset to verify ownership and get blob URL
    const asset = await db.getAssetById(assetId);

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    // Verify the asset belongs to the user
    if (asset.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to delete this asset' },
        { status: 403 }
      );
    }

    // Check if already deleted
    if (asset.deleted_at) {
      return NextResponse.json(
        { error: 'Asset already deleted' },
        { status: 400 }
      );
    }

    // Delete from Vercel Blob storage
    try {
      await del(asset.blob_url);
    } catch (blobError: any) {
      console.error('Blob deletion error:', blobError);
      // Continue with soft delete even if blob deletion fails
      // The blob may have been manually deleted or the URL may be invalid
    }

    // Soft delete in database
    await db.deleteAsset(assetId);

    return NextResponse.json({
      success: true,
      message: 'Asset deleted successfully',
      assetId,
    });

  } catch (error: any) {
    console.error('Delete asset error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete asset' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/assets/[id]
 * Gets a single asset by ID
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

    // Don't return soft-deleted assets
    if (asset.deleted_at) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      asset,
    });

  } catch (error: any) {
    console.error('Get asset error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get asset' },
      { status: 500 }
    );
  }
}
