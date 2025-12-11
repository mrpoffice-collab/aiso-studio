import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculateAISOScore, HtmlStructure } from '@/lib/content-scoring';
import * as cheerio from 'cheerio';

const FREE_AUDIT_LIMIT = 3; // Per IP per day
const HOURS_WINDOW = 24;

/**
 * POST /api/audit/free
 * Free audit for unauthenticated users (limited by IP and domain)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { url } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Get IP address from request
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ipAddress = forwardedFor?.split(',')[0].trim() || realIp || 'unknown';

    if (ipAddress === 'unknown') {
      return NextResponse.json(
        { error: 'Could not determine IP address' },
        { status: 400 }
      );
    }

    // Normalize URL
    url = url.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    // Extract domain from URL
    let domain: string;
    try {
      const urlObj = new URL(url);
      domain = urlObj.hostname.replace(/^www\./, ''); // Remove www. for consistency

      // Add www. if domain has only 2 parts (e.g., example.com)
      const parts = urlObj.hostname.split('.');
      if (parts.length === 2 && !urlObj.hostname.startsWith('www.')) {
        urlObj.hostname = 'www.' + urlObj.hostname;
        url = urlObj.toString();
      }
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Check IP limit (3 audits per 24 hours)
    const ipAuditCount = await db.getFreeAuditCount(ipAddress, HOURS_WINDOW);
    if (ipAuditCount >= FREE_AUDIT_LIMIT) {
      return NextResponse.json(
        {
          error: `You've reached the limit of ${FREE_AUDIT_LIMIT} free audits per day. Sign up for unlimited audits!`,
          limitReached: true,
          limitType: 'ip',
          auditsUsed: ipAuditCount,
          auditsRemaining: 0,
        },
        { status: 429 }
      );
    }

    // Check domain limit (1 audit per domain ever)
    const existingDomainAudit = await db.getFreeAuditByDomain(domain);
    if (existingDomainAudit) {
      return NextResponse.json(
        {
          error: `This domain (${domain}) has already been audited. Each domain can only be audited once for free. Sign up for unlimited audits!`,
          limitReached: true,
          limitType: 'domain',
          previousAuditDate: existingDomainAudit.created_at,
        },
        { status: 429 }
      );
    }

    console.log(`Free audit: Scraping content from ${url} (IP: ${ipAddress}, Domain: ${domain})`);

    // Scrape content from URL
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AISStudio/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract title and meta description
    const title = $('title').text() || $('h1').first().text() || '';
    const metaDescription = $('meta[name="description"]').attr('content') || '';

    // Extract HTML structure BEFORE removing elements (for consistent scoring)
    const htmlStructure: HtmlStructure = {
      h1Count: $('h1').length,
      h2Count: $('h2').length,
      h3Count: $('h3').length,
      h4Count: $('h4').length,
      internalLinkCount: 0,
      externalLinkCount: 0,
      imageCount: $('img').length,
      imagesWithAlt: $('img[alt]').filter((_, el) => ($(el).attr('alt')?.trim().length || 0) > 0).length,
      hasSchema: $('script[type="application/ld+json"]').length > 0,
      hasFaqSchema: html.includes('"@type":"FAQPage"') || html.includes('"@type": "FAQPage"'),
      hasCanonical: $('link[rel="canonical"]').length > 0,
      hasOpenGraph: $('meta[property^="og:"]').length > 0,
    };

    // Count internal vs external links
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href') || '';
      if (href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:')) return;
      try {
        if (href.startsWith('/') || href.startsWith('./') || href.startsWith('../')) {
          htmlStructure.internalLinkCount++;
        } else if (href.startsWith('http')) {
          const linkDomain = new URL(href).hostname.replace(/^www\./, '');
          if (linkDomain === domain || linkDomain.includes(domain)) {
            htmlStructure.internalLinkCount++;
          } else {
            htmlStructure.externalLinkCount++;
          }
        }
      } catch {
        // Invalid URL
      }
    });

    // Remove scripts, styles, nav, footer
    $('script, style, nav, footer, header, .sidebar, aside, #sidebar, #comments, .comments, .comment-form').remove();

    // Try to find main content area
    let contentElement = null;
    const selectors = [
      'article',
      '.post-content',
      '.entry-content',
      '.content-area',
      '.blog-post',
      '.post',
      'main',
      '#content',
      '.site-content',
      '[role="main"]',
      '.blog',
      '#main',
      '.main-content',
    ];

    for (const selector of selectors) {
      const elem = $(selector).first();
      if (elem && elem.length > 0) {
        const text = elem.text().trim();
        if (text.length >= 100) {
          contentElement = elem;
          console.log(`Found content with selector: ${selector}`);
          break;
        }
      }
    }

    if (!contentElement || contentElement.length === 0) {
      throw new Error('Could not extract content from this page. The site may use JavaScript to load content.');
    }

    // Convert HTML to text
    const htmlContent = contentElement.html() || '';
    const $content = cheerio.load(htmlContent);

    // Remove remaining unwanted elements
    $content('script, style, iframe, object, embed').remove();

    const content = $content.text().trim();

    if (!content || content.length < 100) {
      throw new Error('Could not extract meaningful content from URL. Content is too short.');
    }

    console.log(`Scraped ${content.length} characters. Running AISO audit...`);

    // Run AISO audit (without fact-checking to save cost for free tier)
    // Pass htmlStructure for consistent scoring with paid audits
    const aisoResult = calculateAISOScore(
      content,
      title,
      metaDescription,
      undefined, // Skip expensive fact-checking for free audits
      undefined, // localContext
      undefined, // targetFleschScore
      htmlStructure // HTML structure for accurate element counting
    );

    // Capture user agent and referrer for analytics
    const userAgent = request.headers.get('user-agent') || '';
    const referrer = request.headers.get('referer') || request.headers.get('referrer') || '';

    // Save audit record
    const auditRecord = await db.createFreeAuditRecord({
      ip_address: ipAddress,
      domain,
      url,
      audit_data: {
        scores: aisoResult,
        title,
        metaDescription,
        contentLength: content.length,
      },
    });

    // Update metadata asynchronously (non-blocking)
    if (auditRecord?.id) {
      db.updateFreeAuditMetadata(auditRecord.id, userAgent, referrer).catch(err =>
        console.error('Failed to update audit metadata:', err)
      );
    }

    // Calculate remaining audits for this IP
    const newIpAuditCount = ipAuditCount + 1;
    const auditsRemaining = FREE_AUDIT_LIMIT - newIpAuditCount;

    console.log(`Free audit complete. IP: ${ipAddress}, Used: ${newIpAuditCount}/${FREE_AUDIT_LIMIT}, Remaining: ${auditsRemaining}`);

    return NextResponse.json({
      success: true,
      url,
      domain,
      title,
      metaDescription,
      aisoScore: aisoResult.overallScore,
      scores: {
        seo: aisoResult.seoScore,
        readability: aisoResult.readabilityScore,
        engagement: aisoResult.engagementScore,
      },
      details: aisoResult,
      wordCount: content.split(/\s+/).length,
      contentLength: content.length,
      auditsUsed: newIpAuditCount,
      auditsRemaining,
      totalFreeAudits: FREE_AUDIT_LIMIT,
      upgradePrompt: auditsRemaining === 0
        ? "You've used all your free audits! Sign up for unlimited audits + content rewriting."
        : auditsRemaining === 1
        ? `${auditsRemaining} free audit remaining. Sign up for unlimited audits!`
        : `${auditsRemaining} free audits remaining.`,
    });
  } catch (error: any) {
    console.error('Free audit error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to audit content' },
      { status: 500 }
    );
  }
}
