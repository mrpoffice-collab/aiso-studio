import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import * as cheerio from 'cheerio';

/**
 * POST /api/strategies/[id]/discover-urls
 * Discover all blog post URLs from a sitemap or blog index page
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: strategyId } = await params;
    const body = await request.json();
    const { pattern } = body;

    if (!pattern || typeof pattern !== 'string') {
      return NextResponse.json(
        { error: 'Please provide a URL pattern (e.g., https://example.com/blog/)' },
        { status: 400 }
      );
    }

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

    // Discover URLs
    console.log(`Discovering URLs from pattern: ${pattern}`);
    const discoveredUrls = await discoverBlogUrls(pattern);

    if (discoveredUrls.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No blog post URLs found at this location',
        urls: [],
        count: 0,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Discovered ${discoveredUrls.length} blog post URLs`,
      urls: discoveredUrls,
      count: discoveredUrls.length,
    });
  } catch (error: any) {
    console.error('Discover URLs error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to discover URLs' },
      { status: 500 }
    );
  }
}

/**
 * Discover blog post URLs from a base URL
 * Tries multiple strategies:
 * 1. Check for sitemap.xml
 * 2. Scrape the blog index page for links
 * 3. Check for RSS feed
 */
async function discoverBlogUrls(pattern: string): Promise<string[]> {
  const urls: Set<string> = new Set();

  // Parse the base URL
  const baseUrl = pattern.replace(/\/\*.*$/, ''); // Remove wildcard
  const urlObj = new URL(baseUrl);
  const domain = `${urlObj.protocol}//${urlObj.host}`;

  // Strategy 1: Try sitemap.xml
  try {
    console.log('Trying sitemap.xml...');
    const sitemapUrls = await fetchFromSitemap(`${domain}/sitemap.xml`, baseUrl);
    sitemapUrls.forEach((url) => urls.add(url));
    console.log(`Found ${sitemapUrls.length} URLs from sitemap`);
  } catch (error) {
    console.log('No sitemap.xml found or error:', error);
  }

  // Strategy 2: Scrape the blog index page
  try {
    console.log(`Scraping blog index page: ${baseUrl}`);
    const indexUrls = await scrapeIndexPage(baseUrl, domain);
    indexUrls.forEach((url) => urls.add(url));
    console.log(`Found ${indexUrls.length} URLs from index page`);
  } catch (error) {
    console.log('Error scraping index page:', error);
  }

  // Strategy 3: Try RSS feed
  try {
    console.log('Trying RSS feed...');
    const rssUrls = await fetchFromRSS(`${baseUrl}/feed`, domain);
    rssUrls.forEach((url) => urls.add(url));
    console.log(`Found ${rssUrls.length} URLs from RSS feed`);
  } catch (error) {
    console.log('No RSS feed found or error:', error);
  }

  return Array.from(urls);
}

/**
 * Fetch URLs from sitemap.xml
 */
async function fetchFromSitemap(
  sitemapUrl: string,
  baseUrl: string
): Promise<string[]> {
  const response = await fetch(sitemapUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; AISOStudio/1.0; +https://aiso.studio)',
    },
  });

  if (!response.ok) {
    throw new Error(`Sitemap not found: ${response.status}`);
  }

  const xml = await response.text();
  const $ = cheerio.load(xml, { xmlMode: true });

  const urls: string[] = [];
  $('url loc').each((_, element) => {
    const url = $(element).text().trim();
    // Only include URLs that match the base pattern
    if (url.startsWith(baseUrl)) {
      urls.push(url);
    }
  });

  return urls;
}

/**
 * Scrape blog index page for post links
 */
async function scrapeIndexPage(indexUrl: string, domain: string): Promise<string[]> {
  const response = await fetch(indexUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; AISOStudio/1.0; +https://aiso.studio)',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch index page: ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const urls: Set<string> = new Set();

  // Find all links that look like blog posts
  $('a').each((_, element) => {
    const href = $(element).attr('href');
    if (!href) return;

    // Convert relative URLs to absolute
    let absoluteUrl = href;
    if (href.startsWith('/')) {
      absoluteUrl = `${domain}${href}`;
    } else if (!href.startsWith('http')) {
      absoluteUrl = `${indexUrl}/${href}`;
    }

    // Filter: Must start with the index URL and not be the index itself
    if (
      absoluteUrl.startsWith(indexUrl) &&
      absoluteUrl !== indexUrl &&
      !absoluteUrl.endsWith('/') // Exclude category pages
    ) {
      urls.add(absoluteUrl);
    }
  });

  return Array.from(urls);
}

/**
 * Fetch URLs from RSS feed
 */
async function fetchFromRSS(feedUrl: string, domain: string): Promise<string[]> {
  const response = await fetch(feedUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; AISOStudio/1.0; +https://aiso.studio)',
    },
  });

  if (!response.ok) {
    throw new Error(`RSS feed not found: ${response.status}`);
  }

  const xml = await response.text();
  const $ = cheerio.load(xml, { xmlMode: true });

  const urls: string[] = [];

  // RSS 2.0 format
  $('item link').each((_, element) => {
    const url = $(element).text().trim();
    if (url && url.startsWith('http')) {
      urls.push(url);
    }
  });

  // Atom format
  $('entry link').each((_, element) => {
    const url = $(element).attr('href');
    if (url && url.startsWith('http')) {
      urls.push(url);
    }
  });

  return urls;
}
