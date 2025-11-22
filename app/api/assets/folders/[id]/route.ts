import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

/**
 * GET /api/assets/folders/[id]
 * Gets a single folder by ID
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

    const { id: folderId } = await params;
    const folder = await db.getAssetFolderById(folderId);

    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    // Verify the folder belongs to the user
    if (folder.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to view this folder' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      folder,
    });

  } catch (error: any) {
    console.error('Get folder error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get folder' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/assets/folders/[id]
 * Updates a folder
 */
export async function PUT(
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

    const { id: folderId } = await params;

    // Get the folder to verify ownership
    const folder = await db.getAssetFolderById(folderId);

    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    // Verify the folder belongs to the user
    if (folder.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to update this folder' },
        { status: 403 }
      );
    }

    // Get request body
    const body = await request.json();
    const { name, description, color, parent_folder_id, strategy_id } = body;

    // Validate name if provided
    if (name !== undefined) {
      if (!name || name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Folder name cannot be empty' },
          { status: 400 }
        );
      }

      if (name.length > 255) {
        return NextResponse.json(
          { error: 'Folder name must be 255 characters or less' },
          { status: 400 }
        );
      }
    }

    // Validate color format if provided
    if (color) {
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
      if (!hexColorRegex.test(color)) {
        return NextResponse.json(
          { error: 'Invalid color format. Use hex format like #FF5733' },
          { status: 400 }
        );
      }
    }

    // Update the folder
    const updatedFolder = await db.updateAssetFolder(folderId, {
      name: name?.trim(),
      description: description?.trim(),
      color,
      parent_folder_id,
      strategy_id,
    });

    return NextResponse.json({
      success: true,
      folder: updatedFolder,
      message: 'Folder updated successfully',
    });

  } catch (error: any) {
    console.error('Update folder error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update folder' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/assets/folders/[id]
 * Deletes a folder (sets assets in folder to folder_id = null)
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

    const { id: folderId } = await params;

    // Get the folder to verify ownership
    const folder = await db.getAssetFolderById(folderId);

    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    // Verify the folder belongs to the user
    if (folder.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to delete this folder' },
        { status: 403 }
      );
    }

    // Delete the folder (CASCADE will handle child folders and set assets to null)
    await db.deleteAssetFolder(folderId);

    return NextResponse.json({
      success: true,
      message: 'Folder deleted successfully',
      folderId,
    });

  } catch (error: any) {
    console.error('Delete folder error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete folder' },
      { status: 500 }
    );
  }
}
