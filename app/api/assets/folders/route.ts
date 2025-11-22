import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

/**
 * GET /api/assets/folders
 * Lists all folders for the authenticated user
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

    // Get all folders for the user
    const folders = await db.getAssetFoldersByUserId(user.id);

    return NextResponse.json({
      success: true,
      folders,
      count: folders.length,
    });

  } catch (error: any) {
    console.error('List folders error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list folders' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/assets/folders
 * Creates a new folder
 */
export async function POST(request: NextRequest) {
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

    // Get request body
    const body = await request.json();
    const { name, description, color, parent_folder_id, strategy_id } = body;

    // Validate required fields
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Folder name is required' },
        { status: 400 }
      );
    }

    if (name.length > 255) {
      return NextResponse.json(
        { error: 'Folder name must be 255 characters or less' },
        { status: 400 }
      );
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

    // Create the folder
    const folder = await db.createAssetFolder({
      user_id: user.id,
      name: name.trim(),
      description: description?.trim() || undefined,
      color: color || undefined,
      parent_folder_id: parent_folder_id || undefined,
      strategy_id: strategy_id || undefined,
    });

    return NextResponse.json({
      success: true,
      folder,
      message: 'Folder created successfully',
    });

  } catch (error: any) {
    console.error('Create folder error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create folder' },
      { status: 500 }
    );
  }
}
