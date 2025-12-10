import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db, query } from '@/lib/db';
import JSZip from 'jszip';

export const runtime = 'nodejs';

/**
 * GET /api/strategies/[id]/bulk-export
 * Export all approved posts as a ZIP file containing markdown files
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: strategyId } = await params;
    const format = request.nextUrl.searchParams.get('format') || 'markdown';

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

    // Check if user is on Agency tier
    if (user.subscription_tier !== 'agency') {
      return NextResponse.json(
        {
          error: 'Agency tier required',
          message: 'Bulk export is available on the Agency plan.',
          upgrade_url: '/pricing'
        },
        { status: 403 }
      );
    }

    // Get all posts for topics in this strategy (approved or draft)
    const posts = await query(
      `SELECT p.id, p.title, p.content, p.meta_description, p.word_count,
              p.aiso_score, p.status, p.created_at,
              t.keyword, t.seo_intent
       FROM posts p
       JOIN topics t ON p.topic_id = t.id
       WHERE t.strategy_id = $1 AND p.user_id = $2
       ORDER BY t.position ASC`,
      [strategyId, user.id]
    );

    if (posts.length === 0) {
      return NextResponse.json(
        { error: 'No posts to export', message: 'Generate some content first.' },
        { status: 400 }
      );
    }

    // Create ZIP file
    const zip = new JSZip();

    // Add each post as a file
    for (const post of posts) {
      const safeTitle = post.title
        .replace(/[^a-zA-Z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .toLowerCase()
        .substring(0, 50);

      if (format === 'html') {
        // HTML format
        const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${post.meta_description || ''}">
  <title>${post.title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      color: #333;
    }
    h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
    h2 { font-size: 1.75rem; margin-top: 2rem; }
    h3 { font-size: 1.25rem; margin-top: 1.5rem; }
    p { margin: 1rem 0; }
    ul, ol { margin: 1rem 0; padding-left: 2rem; }
    a { color: #2563eb; }
    blockquote { border-left: 4px solid #e2e8f0; padding-left: 1rem; margin: 1rem 0; }
    code { background: #f1f5f9; padding: 0.2rem 0.4rem; border-radius: 4px; }
    pre { background: #f1f5f9; padding: 1rem; border-radius: 8px; overflow-x: auto; }
    .meta { color: #64748b; font-size: 0.875rem; margin-bottom: 2rem; }
  </style>
</head>
<body>
  <article>
    <h1>${post.title}</h1>
    <div class="meta">
      <p>Target Keyword: ${post.keyword || 'N/A'} | Intent: ${post.seo_intent || 'N/A'} | AISO Score: ${post.aiso_score || 0}</p>
    </div>
    ${markdownToHtml(post.content)}
  </article>
</body>
</html>`;
        zip.file(`${safeTitle}.html`, htmlContent);
      } else {
        // Markdown format (default)
        const frontmatter = `---
title: "${post.title}"
meta_description: "${post.meta_description || ''}"
keyword: "${post.keyword || ''}"
seo_intent: "${post.seo_intent || ''}"
word_count: ${post.word_count || 0}
aiso_score: ${post.aiso_score || 0}
status: "${post.status}"
created_at: "${post.created_at}"
---

`;
        zip.file(`${safeTitle}.md`, frontmatter + post.content);
      }
    }

    // Add a manifest file
    const manifest = {
      strategy: {
        id: strategy.id,
        client_name: strategy.client_name,
        industry: strategy.industry,
        exported_at: new Date().toISOString(),
      },
      posts: posts.map((p: any) => ({
        id: p.id,
        title: p.title,
        keyword: p.keyword,
        word_count: p.word_count,
        aiso_score: p.aiso_score,
        status: p.status,
      })),
      total_posts: posts.length,
      format,
    };
    zip.file('manifest.json', JSON.stringify(manifest, null, 2));

    // Generate ZIP buffer
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    // Create filename
    const clientSlug = strategy.client_name
      ?.replace(/[^a-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase()
      .substring(0, 30) || 'strategy';
    const filename = `${clientSlug}-content-${Date.now()}.zip`;

    // Convert Buffer to Uint8Array for NextResponse compatibility
    const zipData = new Uint8Array(zipBuffer);

    return new NextResponse(zipData, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': zipBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error('Bulk export error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to export posts' },
      { status: 500 }
    );
  }
}

/**
 * Simple markdown to HTML converter for basic formatting
 */
function markdownToHtml(markdown: string): string {
  if (!markdown) return '';

  let html = markdown
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    // Links
    .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>')
    // Code blocks
    .replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
    // Inline code
    .replace(/`(.*?)`/gim, '<code>$1</code>')
    // Blockquotes
    .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
    // Unordered lists
    .replace(/^\- (.*$)/gim, '<li>$1</li>')
    .replace(/^\* (.*$)/gim, '<li>$1</li>')
    // Paragraphs
    .replace(/\n\n/gim, '</p><p>')
    // Line breaks
    .replace(/\n/gim, '<br>');

  // Wrap in paragraph tags
  html = '<p>' + html + '</p>';

  // Wrap consecutive li tags in ul
  html = html.replace(/(<li>.*<\/li>)+/gim, '<ul>$&</ul>');

  return html;
}
