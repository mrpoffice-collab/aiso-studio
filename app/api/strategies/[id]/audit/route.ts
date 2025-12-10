import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db, query } from '@/lib/db';
import { crawlWebsite } from '@/lib/site-crawler';
import { calculateAISOScore } from '@/lib/content-scoring';


/**
 * POST /api/strategies/[id]/audit
 * Trigger website audit and content discovery
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: strategyId } = await params;

    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await db.getUserByClerkId(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get strategy and verify ownership
    const strategy = await db.getStrategyById(strategyId);
    if (!strategy) {
      return NextResponse.json({ error: 'Strategy not found' }, { status: 404 });
    }

    if (strategy.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if strategy has a website URL
    if (!strategy.website_url) {
      return NextResponse.json(
        { error: 'No website URL configured for this strategy' },
        { status: 400 }
      );
    }

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log('🔍 WEBSITE AUDIT STARTED');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`   Strategy: ${strategy.client_name}`);
    console.log(`   Website: ${strategy.website_url}\n`);

    // Create audit record
    const auditResult = await query(
      `INSERT INTO site_audits (strategy_id, site_url, status, started_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`,
      [strategyId, strategy.website_url, 'crawling']
    );
    const audit = auditResult[0];

    console.log(`   ✅ Audit record created: ${audit.id}\n`);

    // Crawl the website
    let crawledPages;
    try {
      crawledPages = await crawlWebsite(strategy.website_url, 50); // Max 50 pages
    } catch (error: any) {
      console.error(`   ❌ Crawl failed: ${error.message}`);

      // Update audit status to failed
      await query(
        `UPDATE site_audits
         SET status = $1, error_message = $2, completed_at = NOW()
         WHERE id = $3`,
        ['failed', error.message, audit.id]
      );

      return NextResponse.json(
        { error: `Failed to crawl website: ${error.message}` },
        { status: 500 }
      );
    }

    console.log(`\n📊 Processing ${crawledPages.length} pages...\n`);

    // Process and store each page
    let totalAisoScore = 0;
    let pagesStored = 0;
    let imagesStored = 0;

    for (const page of crawledPages) {
      // Calculate AISO score for the page
      const aisoScores = calculateAISOScore(
        page.contentPreview,
        page.title,
        page.metaDescription,
        undefined, // factCheckScore - not available for crawled pages
        strategy.content_type === 'local' || strategy.content_type === 'hybrid'
          ? {
              city: strategy.city,
              state: strategy.state,
              serviceArea: strategy.service_area,
            }
          : undefined
      );

      // Use overallScore if aisoScore is undefined (when no fact-checking)
      const pageAisoScore = aisoScores.aisoScore ?? aisoScores.overallScore;
      totalAisoScore += pageAisoScore;

      // Store page in database
      try {
        await query(
          `INSERT INTO site_pages (
            audit_id, strategy_id, url, title, meta_description,
            content_preview, word_count, aiso_score, aeo_score,
            seo_score, readability_score, engagement_score, flesch_score
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
          [
            audit.id,
            strategyId,
            page.url,
            page.title,
            page.metaDescription,
            page.contentPreview,
            page.wordCount,
            pageAisoScore,
            aisoScores.aeoScore,
            aisoScores.seoScore,
            aisoScores.readabilityScore,
            aisoScores.engagementScore,
            aisoScores.readabilityDetails.fleschScore,
          ]
        );
      } catch (insertError: any) {
        // Skip duplicates (same URL in same audit)
        if (!insertError.message?.includes('duplicate')) {
          throw insertError;
        }
        console.log(`   ⚠️ Skipping duplicate URL: ${page.url}`);
      }

      pagesStored++;

      // Store images
      for (const image of page.images) {
        // Determine image context based on alt text and URL
        let context = 'other';
        const altLower = image.alt.toLowerCase();
        const urlLower = image.url.toLowerCase();

        if (altLower.includes('logo') || urlLower.includes('logo')) {
          context = 'logo';
        } else if (altLower.includes('staff') || altLower.includes('team') || urlLower.includes('staff')) {
          context = 'staff';
        } else if (altLower.includes('location') || altLower.includes('building') || urlLower.includes('location')) {
          context = 'location';
        } else if (altLower.includes('product') || altLower.includes('service')) {
          context = 'product';
        }

        try {
          await query(
            `INSERT INTO site_images (
              audit_id, strategy_id, url, alt_text, source_page_url,
              context, width, height
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT DO NOTHING`,
            [
              audit.id,
              strategyId,
              image.url,
              image.alt,
              page.url,
              context,
              image.width || null,
              image.height || null,
            ]
          );
          imagesStored++;
        } catch (error) {
          // Skip duplicate images
        }
      }

      console.log(`   ✅ Stored: ${page.title} (AISO: ${pageAisoScore}, ${page.images.length} images)`);
    }

    // Calculate average AISO score
    const avgAisoScore = pagesStored > 0 ? Math.round(totalAisoScore / pagesStored) : 0;

    // Update audit record
    await query(
      `UPDATE site_audits
       SET status = $1,
           pages_found = $2,
           images_found = $3,
           avg_aiso_score = $4,
           completed_at = NOW()
       WHERE id = $5`,
      ['completed', pagesStored, imagesStored, avgAisoScore, audit.id]
    );

    // Update strategy's last_audit_at timestamp
    await query(
      `UPDATE strategies
       SET last_audit_at = NOW()
       WHERE id = $1`,
      [strategyId]
    );

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log('✅ AUDIT COMPLETE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`   📄 Pages: ${pagesStored}`);
    console.log(`   🖼️  Images: ${imagesStored}`);
    console.log(`   📊 Avg AISO: ${avgAisoScore}/100\n`);

    return NextResponse.json({
      success: true,
      audit: {
        id: audit.id,
        pagesFound: pagesStored,
        imagesFound: imagesStored,
        avgAisoScore,
      },
    });

  } catch (error: any) {
    console.error('Audit error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to audit website' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/strategies/[id]/audit
 * Get audit results for a strategy
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: strategyId } = await params;

    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await db.getUserByClerkId(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get strategy and verify ownership
    const strategy = await db.getStrategyById(strategyId);
    if (!strategy) {
      return NextResponse.json({ error: 'Strategy not found' }, { status: 404 });
    }

    if (strategy.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get most recent audit - handle case where table doesn't exist
    let audits: any[] = [];
    try {
      audits = await query(
        `SELECT * FROM site_audits
         WHERE strategy_id = $1
         ORDER BY created_at DESC
         LIMIT 1`,
        [strategyId]
      );
    } catch (e: any) {
      // Table might not exist yet
      if (e.message?.includes('does not exist') || e.code === '42P01') {
        return NextResponse.json({ audit: null, pages: [], images: [] });
      }
      throw e;
    }

    if (audits.length === 0) {
      return NextResponse.json({ audit: null, pages: [], images: [] });
    }

    const audit = audits[0];

    // Get pages
    let pages: any[] = [];
    try {
      pages = await query(
        `SELECT * FROM site_pages
         WHERE audit_id = $1
         ORDER BY aiso_score DESC`,
        [audit.id]
      );
    } catch (e: any) {
      // Table might not exist
      console.error('Error fetching site pages:', e);
    }

    // Get images
    let images: any[] = [];
    try {
      images = await query(
        `SELECT * FROM site_images
         WHERE audit_id = $1
         ORDER BY created_at DESC`,
        [audit.id]
      );
    } catch (e: any) {
      // Table might not exist
      console.error('Error fetching site images:', e);
    }

    return NextResponse.json({
      audit,
      pages,
      images,
    });

  } catch (error: any) {
    console.error('Get audit error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get audit results' },
      { status: 500 }
    );
  }
}
