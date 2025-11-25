import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { put } from '@vercel/blob';
import { db } from '@/lib/db';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

/**
 * POST /api/assets/upload
 * Uploads a file to Vercel Blob and saves metadata to database
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

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folderId = formData.get('folderId') as string | null;
    const tags = formData.get('tags') as string | null;
    const description = formData.get('description') as string | null;
    const altText = formData.get('altText') as string | null;
    const domain = formData.get('domain') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size (25MB limit)
    const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 25MB.' },
        { status: 400 }
      );
    }

    // Determine file type
    const mimeType = file.type;
    let fileType: 'image' | 'pdf' | 'video' | 'document';

    if (mimeType.startsWith('image/')) {
      fileType = 'image';
    } else if (mimeType === 'application/pdf') {
      fileType = 'pdf';
    } else if (mimeType.startsWith('video/')) {
      fileType = 'video';
    } else {
      fileType = 'document';
    }

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${user.id}/${timestamp}-${sanitizedName}`;

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: false,
    });

    // Get image dimensions if it's an image
    let width: number | undefined;
    let height: number | undefined;

    if (fileType === 'image') {
      // For images, we'd ideally extract dimensions here
      // This requires reading the file buffer and using a library like 'sharp'
      // For MVP, we'll leave this as undefined and add it in Phase 2
    }

    // Parse tags
    const parsedTags = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];

    // Save to database
    const asset = await db.createAsset({
      user_id: user.id,
      folder_id: folderId || undefined,
      filename: sanitizedName,
      original_filename: file.name,
      file_type: fileType,
      mime_type: mimeType,
      file_size: file.size,
      blob_url: blob.url,
      public_url: blob.url,
      width,
      height,
      tags: parsedTags,
      description: description || undefined,
      alt_text: altText || undefined,
    });

    // Link asset to domain if provided
    let linkedDomain = null;
    if (domain && domain.trim()) {
      const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
      await sql`
        INSERT INTO asset_domains (asset_id, domain, link_type, linked_by)
        VALUES (${asset.id}, ${cleanDomain}, 'primary', ${user.id})
        ON CONFLICT (asset_id, domain) DO NOTHING
      `;
      linkedDomain = cleanDomain;
    }

    return NextResponse.json({
      success: true,
      asset: { ...asset, linked_domain: linkedDomain },
      message: 'File uploaded successfully',
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload file' },
      { status: 500 }
    );
  }
}
