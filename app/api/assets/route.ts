import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

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
    const domain = searchParams.get('domain');

    // Get all assets for the user
    const allAssets = await db.getAssetsByUserId(user.id);

    // Convert to array and apply filters
    let assets = [...allAssets];

    // Filter by domain if provided (uses asset_domains linking table)
    if (domain) {
      const domainLinks = await sql`
        SELECT asset_id FROM asset_domains
        WHERE LOWER(domain) LIKE LOWER(${'%' + domain + '%'})
      `;
      const linkedAssetIds = new Set(domainLinks.map(d => d.asset_id));
      assets = assets.filter(asset => linkedAssetIds.has(asset.id));
    }

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
          asset.tags && asset.tags.some((tag: string) => tagArray.includes(tag))
        );
      }
    }

    // Sort by created_at descending (newest first)
    assets.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Add usage counts and linked domains to each asset
    const assetsWithMetadata = await Promise.all(
      assets.map(async (asset) => {
        const usageCount = await db.getAssetUsageCount(asset.id);

        // Get linked domains for this asset
        const linkedDomains = await sql`
          SELECT domain, link_type, linked_at FROM asset_domains
          WHERE asset_id = ${asset.id}
          ORDER BY linked_at DESC
        `;

        return {
          ...asset,
          usage_count: usageCount,
          linked_domains: linkedDomains,
        };
      })
    );

    // Get all unique domains from assets AND audits
    const allDomains = await sql`
      SELECT DISTINCT domain FROM (
        SELECT domain FROM asset_domains
        UNION
        SELECT domain FROM lead_audits WHERE domain IS NOT NULL
        UNION
        SELECT REPLACE(REPLACE(url, 'https://', ''), 'http://', '') as domain
        FROM accessibility_audits WHERE url IS NOT NULL
      ) combined
      ORDER BY domain
    `;

    return NextResponse.json({
      success: true,
      assets: assetsWithMetadata,
      count: assetsWithMetadata.length,
      domains: allDomains.map(d => d.domain),
    });

  } catch (error: any) {
    console.error('List assets error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list assets' },
      { status: 500 }
    );
  }
}
