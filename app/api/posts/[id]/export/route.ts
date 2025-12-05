import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db, query } from '@/lib/db';

/**
 * GET /api/posts/[id]/export
 * Export post content in various formats (HTML, Markdown, WordPress XML)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.getUserByClerkId(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id } = await params;
    const postId = parseInt(id);

    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'html';

    // Get the post
    const [post] = await query(
      `SELECT p.*, t.title as topic_title, s.client_name
       FROM posts p
       LEFT JOIN topics t ON p.topic_id = t.id
       LEFT JOIN strategies s ON t.strategy_id = s.id
       WHERE p.id = $1`,
      [postId]
    );

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const title = post.topic_title || post.title || 'Untitled Post';
    const content = post.content || post.generated_content || '';

    switch (format) {
      case 'markdown':
        return new NextResponse(content, {
          headers: {
            'Content-Type': 'text/markdown',
            'Content-Disposition': `attachment; filename="${slugify(title)}.md"`,
          },
        });

      case 'html':
        const htmlContent = markdownToHtml(content);
        return new NextResponse(htmlContent, {
          headers: {
            'Content-Type': 'text/html',
            'Content-Disposition': `attachment; filename="${slugify(title)}.html"`,
          },
        });

      case 'wordpress':
        const wxrContent = generateWordPressXML(title, content, post);
        return new NextResponse(wxrContent, {
          headers: {
            'Content-Type': 'application/xml',
            'Content-Disposition': `attachment; filename="${slugify(title)}.xml"`,
          },
        });

      case 'json':
        return NextResponse.json({
          title,
          content,
          html: markdownToHtml(content),
          excerpt: generateExcerpt(content),
          slug: slugify(title),
          meta: {
            client: post.client_name,
            createdAt: post.created_at,
            wordCount: content.split(/\s+/).length,
          },
        });

      default:
        return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Export post error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to export post' },
      { status: 500 }
    );
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100);
}

function generateExcerpt(content: string, maxLength: number = 160): string {
  // Remove markdown formatting
  const plainText = content
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\n+/g, ' ')
    .trim();

  if (plainText.length <= maxLength) return plainText;

  return plainText.substring(0, maxLength - 3).trim() + '...';
}

function markdownToHtml(markdown: string): string {
  // Basic markdown to HTML conversion
  let html = markdown
    // Headers
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    // Lists
    .replace(/^\- (.*$)/gm, '<li>$1</li>')
    .replace(/^\d+\. (.*$)/gm, '<li>$1</li>');

  // Wrap in paragraphs
  html = '<p>' + html + '</p>';

  // Clean up list items
  html = html.replace(/<\/p><li>/g, '<ul><li>');
  html = html.replace(/<\/li><p>/g, '</li></ul>');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Exported Content</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
    h1, h2, h3 { margin-top: 1.5em; }
    p { margin: 1em 0; }
    ul, ol { margin: 1em 0; padding-left: 2em; }
    a { color: #0066cc; }
  </style>
</head>
<body>
${html}
</body>
</html>`;
}

function generateWordPressXML(title: string, content: string, post: any): string {
  const now = new Date().toISOString();
  const slug = slugify(title);
  const excerpt = generateExcerpt(content);

  // Convert markdown to WordPress-compatible HTML
  const htmlContent = content
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\n\n/g, '\n\n')
    .replace(/^\- (.*$)/gm, '<li>$1</li>');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:excerpt="http://wordpress.org/export/1.2/excerpt/"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:wfw="http://wellformedweb.org/CommentAPI/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:wp="http://wordpress.org/export/1.2/">
<channel>
  <title>AISO Export</title>
  <link>https://aiso.studio</link>
  <description>Content exported from AISO Studio</description>
  <pubDate>${now}</pubDate>
  <language>en-US</language>
  <wp:wxr_version>1.2</wp:wxr_version>

  <item>
    <title><![CDATA[${title}]]></title>
    <link></link>
    <pubDate>${now}</pubDate>
    <dc:creator><![CDATA[admin]]></dc:creator>
    <guid isPermaLink="false"></guid>
    <description></description>
    <content:encoded><![CDATA[${htmlContent}]]></content:encoded>
    <excerpt:encoded><![CDATA[${excerpt}]]></excerpt:encoded>
    <wp:post_id>0</wp:post_id>
    <wp:post_date><![CDATA[${now}]]></wp:post_date>
    <wp:post_date_gmt><![CDATA[${now}]]></wp:post_date_gmt>
    <wp:post_modified><![CDATA[${now}]]></wp:post_modified>
    <wp:post_modified_gmt><![CDATA[${now}]]></wp:post_modified_gmt>
    <wp:comment_status><![CDATA[open]]></wp:comment_status>
    <wp:ping_status><![CDATA[open]]></wp:ping_status>
    <wp:post_name><![CDATA[${slug}]]></wp:post_name>
    <wp:status><![CDATA[draft]]></wp:status>
    <wp:post_parent>0</wp:post_parent>
    <wp:menu_order>0</wp:menu_order>
    <wp:post_type><![CDATA[post]]></wp:post_type>
    <wp:post_password><![CDATA[]]></wp:post_password>
    <wp:is_sticky>0</wp:is_sticky>
  </item>
</channel>
</rss>`;
}
