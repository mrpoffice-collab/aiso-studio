import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

/**
 * GET /api/assets
 * Lists all assets for the authenticated user with optional filtering
 */
export async function GET(request: NextRequest) {
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

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get('folderId');
    const fileType = searchParams.get('fileType');
    const tags = searchParams.get('tags');

    // Get all assets for the user
    const allAssets = await db.getAssetsByUserId(user.id);

    // Convert to array and apply filters
    let assets = [...allAssets];

    // Apply filters if provided
    if (folderId) {
      assets = assets.filter(asset => asset.folder_id === folderId);
    }

    if (fileType) {
      const validFileTypes = ['image', 'pdf', 'video', 'document'];
      if (validFileTypes.includes(fileType)) {
        assets = assets.filter(asset => asset.file_type === fileType);
      }
    }

    if (tags) {
      const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
      if (tagArray.length > 0) {
        assets = assets.filter(asset =>
          asset.tags && asset.tags.some(tag => tagArray.includes(tag))
        );
      }
    }

    // Sort by created_at descending (newest first)
    assets.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return NextResponse.json({
      success: true,
      assets,
      count: assets.length,
    });

  } catch (error: any) {
    console.error('List assets error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list assets' },
      { status: 500 }
    );
  }
}
