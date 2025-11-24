import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import * as cheerio from 'cheerio';

interface LeadResult {
  domain: string;
  businessName: string;
  city: string;
  state: string;
  overallScore: number;
  technicalSEO: number;
  onPageSEO: number;
  contentMarketing: number;
  localSEO: number;
  hasBlog: boolean;
  blogPostCount: number;
  lastBlogUpdate?: string;
  phone?: string;
  address?: string;
  email?: string;
  opportunityRating: 'high' | 'medium' | 'low';
  seoIssues: Array<{
    category: string;
    issue: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    fix: string;
  }>;
  opportunityType?: 'missing-technical-seo' | 'no-content-strategy' | 'weak-local-seo' | 'needs-optimization';
}

/**
 * POST /api/leads/discover
 * Discover and score potential leads based on industry and location
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { industry, city, state, limit = 15, internal = false, internalUserId } = body;

    let user;

    // Handle internal calls from Inngest functions
    if (internal && internalUserId) {
      user = await db.getUserById(internalUserId);
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
    } else {
      // Check authentication for external calls
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Get user from database
      user = await db.getUserByClerkId(userId);
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
    }

    if (!industry || !city) {
      return NextResponse.json(
        { error: 'Industry and city are required' },
        { status: 400 }
      );
    }

    console.log(`Discovering leads: ${industry} in ${city}, ${state || 'USA'}`);

    // Step 1 & 2: Search and score businesses until we have enough qualified leads
    const searchQuery = state
      ? `${industry} ${city} ${state}`
      : `${industry} ${city}`;

    const qualifiedLeads: LeadResult[] = [];
    const allLeads: LeadResult[] = [];
    let searchAttempts = 0;
    const maxSearchAttempts = 3;
    let searchOffset = 0;

    // Keep searching until we have enough qualified leads (sweet spot 50-75)
    while (qualifiedLeads.length < limit && searchAttempts < maxSearchAttempts) {
      searchAttempts++;
      console.log(`Search attempt ${searchAttempts}, found ${qualifiedLeads.length}/${limit} qualified leads so far...`);

      // Search for more businesses (Brave API max is 20 per request)
      const searchLimit = 20;
      const businesses = await searchBusinesses(searchQuery, searchLimit, searchOffset);

      if (businesses.length === 0) {
        console.error(`❌ Search returned 0 businesses on attempt ${searchAttempts}/${maxSearchAttempts}`);
        console.error(`Query: "${searchQuery}", Limit: ${searchLimit}, Offset: ${searchOffset}`);
        break;
      }

      console.log(`Found ${businesses.length} businesses to score...`);

      searchOffset += businesses.length;

      // Score each business
      for (const business of businesses) {
        // Skip if we already have this domain
        if (allLeads.some(l => l.domain === business.domain)) {
          continue;
        }

        try {
          const scores = await scoreWebsite(business.domain);

          // Calculate opportunity rating
          let opportunityRating: 'high' | 'medium' | 'low' = 'low';
          if (scores.overallScore >= 45 && scores.overallScore <= 70) {
            opportunityRating = 'high'; // Sweet spot - needs help but has foundation
          } else if (scores.overallScore > 70 && scores.overallScore < 85) {
            opportunityRating = 'medium'; // Could still use optimization
          }

          // Determine specific opportunity type based on SEO issues
          let opportunityType: 'missing-technical-seo' | 'no-content-strategy' | 'weak-local-seo' | 'needs-optimization' | undefined;

          const criticalIssues = scores.seoIssues.filter(i => i.severity === 'critical');
          const highIssues = scores.seoIssues.filter(i => i.severity === 'high');

          if (scores.technicalSEO < 60 || criticalIssues.some(i => i.category === 'Technical SEO')) {
            // Critical technical SEO issues
            opportunityType = 'missing-technical-seo';
          } else if (!scores.hasBlog || scores.contentMarketing < 50) {
            // No blog or weak content strategy
            opportunityType = 'no-content-strategy';
          } else if (scores.localSEO < 50) {
            // Weak local SEO
            opportunityType = 'weak-local-seo';
          } else if (scores.overallScore < 70) {
            // General optimization needed
            opportunityType = 'needs-optimization';
          }

          const lead: LeadResult = {
            domain: business.domain,
            businessName: business.name,
            city: business.city || city,
            state: business.state || state || 'USA',
            overallScore: scores.overallScore,
            technicalSEO: scores.technicalSEO,
            onPageSEO: scores.onPageSEO,
            contentMarketing: scores.contentMarketing,
            localSEO: scores.localSEO,
            hasBlog: scores.hasBlog,
            blogPostCount: scores.blogPostCount,
            lastBlogUpdate: scores.lastBlogUpdate,
            phone: scores.phone,
            address: scores.address,
            email: scores.email,
            opportunityRating,
            seoIssues: scores.seoIssues,
            opportunityType,
          };

          allLeads.push(lead);

          // Add to qualified leads if it's in the sweet spot
          if (opportunityRating === 'high') {
            qualifiedLeads.push(lead);
            console.log(`✓ Qualified lead found: ${business.domain} (Score: ${scores.overallScore})`);

            // Stop if we have enough qualified leads
            if (qualifiedLeads.length >= limit) {
              break;
            }
          }
        } catch (error: any) {
          console.error(`Failed to score ${business.domain}:`, error.message);
          // Continue with other businesses
        }
      }
    }

    // If we didn't find enough qualified leads, use all leads instead
    let scoredLeads: LeadResult[];
    if (qualifiedLeads.length === 0 && allLeads.length === 0) {
      return NextResponse.json(
        { error: 'No leads found. Try a different search or expand your criteria.' },
        { status: 404 }
      );
    } else if (qualifiedLeads.length < limit && allLeads.length > 0) {
      // Not enough qualified leads, use all leads we found
      console.log(`Found ${qualifiedLeads.length} qualified leads and ${allLeads.length - qualifiedLeads.length} other leads`);
      scoredLeads = allLeads.slice(0, limit);
    } else {
      console.log(`Found ${qualifiedLeads.length} qualified leads after ${searchAttempts} search attempt(s)`);
      scoredLeads = qualifiedLeads;
    }

    // Step 3: Sort by opportunity (sweet spot first)
    scoredLeads.sort((a, b) => {
      const ratingOrder = { high: 0, medium: 1, low: 2 };
      return ratingOrder[a.opportunityRating] - ratingOrder[b.opportunityRating];
    });

    // Log usage
    const estimatedCost = scoredLeads.length * 0.05; // $0.05 per lead
    await db.logUsage({
      user_id: user.id,
      operation_type: 'lead_discovery',
      cost_usd: estimatedCost,
      tokens_used: scoredLeads.length * 100,
      metadata: {
        industry,
        city,
        state,
        leads_found: scoredLeads.length,
        sweet_spot_count: scoredLeads.filter(l => l.opportunityRating === 'high').length,
      },
    });

    return NextResponse.json({
      success: true,
      leads: scoredLeads,
      summary: {
        total: scoredLeads.length,
        sweetSpot: scoredLeads.filter(l => l.opportunityRating === 'high').length,
        highScoring: scoredLeads.filter(l => l.overallScore > 75).length,
        lowScoring: scoredLeads.filter(l => l.overallScore < 50).length,
      },
    });
  } catch (error: any) {
    console.error('Lead discovery error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to discover leads' },
      { status: 500 }
    );
  }
}

/**
 * Helper: Check if domain is likely high-authority (score >75, outside sweet spot)
 * Skip these to focus on businesses that need help
 */
function isLikelyHighAuthority(domain: string): boolean {
  const lowercaseDomain = domain.toLowerCase();

  // Skip big brands and franchises (they usually have great sites)
  const bigBrands = [
    'aspen', 'heartland', 'perfect', 'smile', 'bright', 'gentle',
    'affordable', 'family', 'comfort', 'clear', 'lumino', 'pacific'
  ];

  // Check for franchise/chain patterns
  if (bigBrands.some(brand => lowercaseDomain.includes(brand))) {
    // Only skip if it looks like a franchise (has numbers or multiple locations implied)
    if (/\d/.test(domain) || lowercaseDomain.includes('location') || lowercaseDomain.includes('group')) {
      return true;
    }
  }

  // Skip .org and .gov (usually well-maintained)
  if (lowercaseDomain.endsWith('.org') || lowercaseDomain.endsWith('.gov')) {
    return true;
  }

  // Skip domains with common high-authority patterns
  const highAuthorityPatterns = [
    'corp', 'inc', 'group', 'partners', 'associates',
    'solutions', 'services', 'healthcare', 'medical',
    'premier', 'elite', 'professional', 'advanced'
  ];

  const domainParts = lowercaseDomain.split('.');
  const subdomain = domainParts[0];

  // Skip if domain has multiple high-authority indicators
  const matchCount = highAuthorityPatterns.filter(p => subdomain.includes(p)).length;
  if (matchCount >= 2) {
    return true;
  }

  return false;
}

/**
 * Search for businesses using Brave Search API
 */
async function searchBusinesses(
  query: string,
  limit: number,
  offset: number = 0
): Promise<Array<{ name: string; domain: string; city?: string; state?: string }>> {
  const businesses: Array<{ name: string; domain: string; city?: string; state?: string }> = [];

  // Check if Brave API key is configured
  const braveApiKey = process.env.BRAVE_SEARCH_API_KEY;

  if (!braveApiKey) {
    console.warn('⚠️  BRAVE_SEARCH_API_KEY not configured. Using fallback method.');
    return fallbackBusinessSearch(query, limit);
  }

  console.log('✓ Brave API key found, using Brave Search');

  try {
    // Use Brave Search API
    const endpoint = 'https://api.search.brave.com/res/v1/web/search';
    const searchUrl = `${endpoint}?q=${encodeURIComponent(query)}&count=${limit}&offset=${offset}`;

    console.log('🔍 Calling Brave API with query:', query);

    const response = await fetch(searchUrl, {
      headers: {
        'Accept': 'application/json',
        'X-Subscription-Token': braveApiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Brave API error:', response.status, errorText);
      console.error('Falling back to DuckDuckGo...');
      return fallbackBusinessSearch(query, limit);
    }

    const data = await response.json();
    console.log('✓ Brave API returned', data.web?.results?.length || 0, 'raw results');

    // Extract domains from web results
    const domains = new Set<string>();

    if (data.web?.results) {
      for (const result of data.web.results) {
        try {
          const url = new URL(result.url);
          const domain = url.hostname.replace('www.', '');

          // Filter out directories, social media, review sites, aggregators, etc.
          const isDirectory =
            domain.includes('yelp.') ||
            domain.includes('yellowpages.') ||
            domain.includes('facebook.') ||
            domain.includes('linkedin.') ||
            domain.includes('instagram.') ||
            domain.includes('twitter.') ||
            domain.includes('healthgrades.') ||
            domain.includes('vitals.') ||
            domain.includes('wikipedia.') ||
            domain.includes('tripadvisor.') ||
            domain.includes('google.') ||
            domain.includes('maps.') ||
            domain.includes('mapquest.') ||
            domain.includes('foursquare.') ||
            domain.includes('bbb.org') ||
            domain.includes('angieslist.') ||
            domain.includes('thumbtack.') ||
            domain.includes('houzz.') ||
            domain.includes('zillow.') ||
            domain.includes('realtor.') ||
            domain.includes('apartments.') ||
            domain.includes('glassdoor.') ||
            domain.includes('indeed.');

          // Smart filtering: Skip high-authority domains likely to score >75
          const isHighAuthority = isLikelyHighAuthority(domain);

          if (
            !isDirectory &&
            !isHighAuthority &&
            domain.length > 4 &&
            domains.size < limit
          ) {
            domains.add(domain);
            businesses.push({
              name: result.title || domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1),
              domain,
            });
          } else if (isHighAuthority) {
            console.log(`⚡ Skipping high-authority domain: ${domain}`);
          }
        } catch (e) {
          // Invalid URL, skip
        }
      }
    }

    console.log(`✓ Brave API found ${businesses.length} businesses after filtering`);

    if (businesses.length === 0) {
      console.warn('⚠️  All Brave results were filtered out! Raw result count:', data.web?.results?.length || 0);
      console.warn('Falling back to DuckDuckGo...');
      return fallbackBusinessSearch(query, limit);
    }

    return businesses;

  } catch (error: any) {
    console.error('❌ Brave search error:', error.message);
    console.error('Falling back to DuckDuckGo...');
    return fallbackBusinessSearch(query, limit);
  }
}

/**
 * Fallback: Use DuckDuckGo HTML search (no API key required)
 */
async function fallbackBusinessSearch(
  query: string,
  limit: number
): Promise<Array<{ name: string; domain: string; city?: string; state?: string }>> {
  const businesses: Array<{ name: string; domain: string; city?: string; state?: string }> = [];

  try {
    // DuckDuckGo HTML search (more lenient than Google)
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      console.error('Fallback search failed');
      return [];
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const domains = new Set<string>();

    // DuckDuckGo results are in .result__url
    $('.result__url').each((i, elem) => {
      if (domains.size >= limit) return false;

      const urlText = $(elem).text().trim();
      try {
        // Clean up the URL text (DuckDuckGo shows domain without protocol)
        const domain = urlText
          .replace(/^https?:\/\//, '')
          .replace(/^www\./, '')
          .split('/')[0]
          .toLowerCase();

        // Filter out directories, social media, review sites, aggregators, etc.
        if (
          domain &&
          !domain.includes('yelp.') &&
          !domain.includes('yellowpages.') &&
          !domain.includes('facebook.') &&
          !domain.includes('linkedin.') &&
          !domain.includes('instagram.') &&
          !domain.includes('twitter.') &&
          !domain.includes('healthgrades.') &&
          !domain.includes('vitals.') &&
          !domain.includes('wikipedia.') &&
          !domain.includes('tripadvisor.') &&
          !domain.includes('google.') &&
          !domain.includes('maps.') &&
          !domain.includes('mapquest.') &&
          !domain.includes('foursquare.') &&
          !domain.includes('bbb.org') &&
          !domain.includes('angieslist.') &&
          !domain.includes('thumbtack.') &&
          !domain.includes('houzz.') &&
          !domain.includes('zillow.') &&
          !domain.includes('realtor.') &&
          !domain.includes('apartments.') &&
          !domain.includes('glassdoor.') &&
          !domain.includes('indeed.') &&
          domain.length > 4
        ) {
          domains.add(domain);
          businesses.push({
            name: domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1),
            domain,
          });
        }
      } catch (e) {
        // Skip invalid domains
      }
    });

    console.log(`✓ Fallback search found ${businesses.length} businesses`);

    if (businesses.length === 0) {
      console.error('❌ Fallback search also returned 0 results');
    }

    return businesses;

  } catch (error: any) {
    console.error('❌ Fallback search error:', error.message);
    return [];
  }
}

/**
 * Score a website based on SEO fundamentals only
 * Focus on what we can reliably detect and fix
 */
async function scoreWebsite(domain: string): Promise<{
  overallScore: number;
  technicalSEO: number;
  onPageSEO: number;
  contentMarketing: number;
  localSEO: number;
  hasBlog: boolean;
  blogPostCount: number;
  lastBlogUpdate?: string;
  phone?: string;
  address?: string;
  email?: string;
  seoIssues: Array<{
    category: string;
    issue: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    fix: string;
  }>;
}> {
  let technicalSEO = 0;
  let onPageSEO = 0;
  let contentMarketing = 0;
  let localSEO = 0;
  let hasBlog = false;
  let blogPostCount = 0;
  let lastBlogUpdate: string | undefined;
  let phone: string | undefined;
  let address: string | undefined;
  let email: string | undefined;
  const seoIssues: Array<{
    category: string;
    issue: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    fix: string;
  }> = [];

  try {
    const startTime = Date.now();
    const url = `https://${domain}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ContentCommandStudio/1.0)',
      },
      signal: AbortSignal.timeout(15000), // 15 second timeout for slower sites
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // ============================================
    // TECHNICAL SEO SCORING (40 points max)
    // ============================================

    // Title Tag (10 points)
    const title = $('title').text();
    if (!title) {
      seoIssues.push({
        category: 'Technical SEO',
        issue: 'Missing title tag',
        severity: 'critical',
        fix: 'Add a unique, descriptive title tag (50-60 characters) to every page'
      });
    } else if (title.length < 30) {
      seoIssues.push({
        category: 'Technical SEO',
        issue: 'Title tag too short',
        severity: 'high',
        fix: `Expand title from ${title.length} to 50-60 characters with relevant keywords`
      });
      technicalSEO += 5;
    } else if (title.length > 70) {
      seoIssues.push({
        category: 'Technical SEO',
        issue: 'Title tag too long',
        severity: 'medium',
        fix: `Shorten title from ${title.length} to 50-60 characters`
      });
      technicalSEO += 7;
    } else {
      technicalSEO += 10;
    }

    // Meta Description (10 points)
    const metaDescription = $('meta[name="description"]').attr('content');
    if (!metaDescription) {
      seoIssues.push({
        category: 'Technical SEO',
        issue: 'Missing meta description',
        severity: 'critical',
        fix: 'Add compelling meta descriptions (150-160 characters) to improve click-through rates'
      });
    } else if (metaDescription.length < 120) {
      seoIssues.push({
        category: 'Technical SEO',
        issue: 'Meta description too short',
        severity: 'high',
        fix: `Expand meta description from ${metaDescription.length} to 150-160 characters`
      });
      technicalSEO += 5;
    } else if (metaDescription.length > 160) {
      seoIssues.push({
        category: 'Technical SEO',
        issue: 'Meta description too long',
        severity: 'low',
        fix: `Shorten meta description from ${metaDescription.length} to 150-160 characters`
      });
      technicalSEO += 8;
    } else {
      technicalSEO += 10;
    }

    // Structured Data / Schema Markup (10 points)
    const hasStructuredData = $('script[type="application/ld+json"]').length > 0;
    if (!hasStructuredData) {
      seoIssues.push({
        category: 'Technical SEO',
        issue: 'No structured data (Schema.org)',
        severity: 'high',
        fix: 'Implement LocalBusiness, Organization, or Product schema to appear in rich snippets'
      });
    } else {
      technicalSEO += 10;
    }

    // Mobile Responsiveness (5 points)
    const hasResponsive = $('meta[name="viewport"]').length > 0;
    if (!hasResponsive) {
      seoIssues.push({
        category: 'Technical SEO',
        issue: 'Not mobile-responsive',
        severity: 'critical',
        fix: 'Add viewport meta tag and implement responsive design (60%+ of traffic is mobile)'
      });
    } else {
      technicalSEO += 5;
    }

    // Image Optimization (5 points)
    const imgWithAlt = $('img[alt]').length;
    const imgTotal = $('img').length;
    if (imgTotal > 0) {
      const altTextRatio = imgWithAlt / imgTotal;
      if (altTextRatio < 0.5) {
        seoIssues.push({
          category: 'Technical SEO',
          issue: `Only ${Math.round(altTextRatio * 100)}% of images have alt text`,
          severity: 'high',
          fix: 'Add descriptive alt text to all images for accessibility and image SEO'
        });
        technicalSEO += 2;
      } else if (altTextRatio < 0.9) {
        seoIssues.push({
          category: 'Technical SEO',
          issue: `${Math.round(altTextRatio * 100)}% of images have alt text (should be 100%)`,
          severity: 'medium',
          fix: 'Complete alt text coverage for remaining images'
        });
        technicalSEO += 4;
      } else {
        technicalSEO += 5;
      }
    }

    // ============================================
    // ON-PAGE SEO SCORING (30 points max)
    // ============================================

    // H1 Tags (10 points)
    const h1Count = $('h1').length;
    const h1Text = $('h1').first().text();
    if (h1Count === 0) {
      seoIssues.push({
        category: 'On-Page SEO',
        issue: 'No H1 tag found',
        severity: 'critical',
        fix: 'Add one H1 tag per page with primary keyword'
      });
    } else if (h1Count > 1) {
      seoIssues.push({
        category: 'On-Page SEO',
        issue: `Multiple H1 tags (${h1Count} found)`,
        severity: 'medium',
        fix: 'Use only one H1 per page for clear content hierarchy'
      });
      onPageSEO += 7;
    } else if (h1Text.length < 20) {
      seoIssues.push({
        category: 'On-Page SEO',
        issue: 'H1 tag too short/generic',
        severity: 'medium',
        fix: 'Use descriptive H1 with target keywords (20-70 characters)'
      });
      onPageSEO += 8;
    } else {
      onPageSEO += 10;
    }

    // Header Hierarchy (10 points)
    const h2Count = $('h2').length;
    const h3Count = $('h3').length;
    if (h2Count === 0) {
      seoIssues.push({
        category: 'On-Page SEO',
        issue: 'No H2 tags (poor content structure)',
        severity: 'high',
        fix: 'Use H2-H6 tags to organize content and include related keywords'
      });
      onPageSEO += 3;
    } else if (h2Count >= 2) {
      onPageSEO += 10;
    } else {
      onPageSEO += 7;
    }

    // Internal Linking (10 points)
    const internalLinks = $('a').filter((i, el) => {
      const href = $(el).attr('href');
      return !!(href && (href.startsWith('/') || href.includes(domain)));
    }).length;

    if (internalLinks < 3) {
      seoIssues.push({
        category: 'On-Page SEO',
        issue: 'Weak internal linking structure',
        severity: 'medium',
        fix: 'Add internal links to related pages/posts to improve site structure and rankings'
      });
      onPageSEO += 4;
    } else if (internalLinks < 10) {
      onPageSEO += 7;
    } else {
      onPageSEO += 10;
    }

    // ============================================
    // CONTENT MARKETING SCORING (20 points max)
    // ============================================

    // Page Content Quality (5 points)
    const bodyText = $('body').text();
    const wordCount = bodyText.trim().split(/\s+/).length;

    if (wordCount < 300) {
      seoIssues.push({
        category: 'Content Marketing',
        issue: `Thin content (only ${wordCount} words)`,
        severity: 'high',
        fix: 'Expand content to 500+ words for better rankings and user value'
      });
      contentMarketing += 2;
    } else if (wordCount < 500) {
      contentMarketing += 4;
    } else {
      contentMarketing += 5;
    }

    // Blog Presence (10 points)
    const blogSelectors = ['/blog', '/news', '/articles', '/insights', 'blog.', 'news.'];
    const pageLinks = $('a').map((i, el) => $(el).attr('href')).get();
    hasBlog = pageLinks.some(link =>
      link && blogSelectors.some(selector => link.includes(selector))
    );

    if (!hasBlog) {
      seoIssues.push({
        category: 'Content Marketing',
        issue: 'No blog or content hub detected',
        severity: 'critical',
        fix: 'Start a blog to capture organic search traffic and establish thought leadership'
      });
    } else {
      contentMarketing += 10;
      // Try to estimate blog post count (rough estimate)
      blogPostCount = Math.floor(Math.random() * 20) + 5; // Mock for now
    }

    // Content Freshness (5 points)
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;
    if (bodyText.includes(currentYear.toString())) {
      contentMarketing += 5;
    } else if (bodyText.includes(lastYear.toString())) {
      seoIssues.push({
        category: 'Content Marketing',
        issue: 'Content appears outdated (last year)',
        severity: 'low',
        fix: 'Update content regularly to signal freshness to search engines'
      });
      contentMarketing += 3;
    } else {
      seoIssues.push({
        category: 'Content Marketing',
        issue: 'Content appears very outdated',
        severity: 'medium',
        fix: 'Refresh content with current information and dates to improve rankings'
      });
      contentMarketing += 1;
    }

    // ============================================
    // LOCAL SEO SCORING (10 points max)
    // ============================================

    // NAP (Name, Address, Phone) Detection (5 points)
    const phoneMatch = bodyText.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    const addressMatch = bodyText.match(/\d+\s+[\w\s]+(?:street|st|avenue|ave|road|rd|boulevard|blvd|lane|ln|drive|dr|court|ct|way|place|pl)[.,\s]*/i);
    const emailMatch = bodyText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);

    // Extract contact info
    if (phoneMatch) phone = phoneMatch[0].trim();
    if (addressMatch) address = addressMatch[0].trim();
    if (emailMatch) email = emailMatch[0].toLowerCase();

    const hasPhone = !!phoneMatch;
    const hasAddress = !!addressMatch;

    if (!hasPhone && !hasAddress) {
      seoIssues.push({
        category: 'Local SEO',
        issue: 'No contact info (phone/address) found',
        severity: 'high',
        fix: 'Add NAP (Name, Address, Phone) consistently across all pages for local SEO'
      });
    } else if (!hasPhone || !hasAddress) {
      seoIssues.push({
        category: 'Local SEO',
        issue: hasPhone ? 'Address not found on homepage' : 'Phone number not found on homepage',
        severity: 'medium',
        fix: 'Display complete NAP info on every page for local search rankings'
      });
      localSEO += 3;
    } else {
      localSEO += 5;
    }

    // Location Keywords (5 points)
    const cityStatePattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),?\s+([A-Z]{2})\b/;
    const hasLocationKeywords = cityStatePattern.test(bodyText);

    if (!hasLocationKeywords) {
      seoIssues.push({
        category: 'Local SEO',
        issue: 'Missing location keywords in content',
        severity: 'medium',
        fix: 'Include city/state keywords in titles, headers, and content for local rankings'
      });
      localSEO += 2;
    } else {
      localSEO += 5;
    }

    // Calculate overall SEO score (weighted average)
    // Technical SEO: 40%, On-Page SEO: 30%, Content Marketing: 20%, Local SEO: 10%
    const overallScore = Math.round(
      (technicalSEO * 0.40) +
      (onPageSEO * 0.30) +
      (contentMarketing * 0.20) +
      (localSEO * 0.10)
    );

    return {
      overallScore: Math.min(100, overallScore),
      technicalSEO: Math.min(100, technicalSEO),
      onPageSEO: Math.min(100, onPageSEO),
      contentMarketing: Math.min(100, contentMarketing),
      localSEO: Math.min(100, localSEO),
      hasBlog,
      blogPostCount,
      lastBlogUpdate,
      phone,
      address,
      email,
      seoIssues,
    };
  } catch (error: any) {
    console.error(`Scoring error for ${domain}:`, error.message);

    // Determine severity and messaging based on error type
    const isTimeout = error.message?.includes('timeout') || error.message?.includes('aborted');
    const severity = isTimeout ? 'medium' : 'high';
    const issue = isTimeout
      ? 'Website took too long to respond'
      : 'Could not access website for analysis';
    const fix = isTimeout
      ? 'Website may be slow or have protective measures. Try visiting manually to verify it works, then proceed with outreach.'
      : error.message || 'Check if website is accessible and try again';

    // Return neutral scores if we can't access the site
    return {
      overallScore: 50,
      technicalSEO: 50,
      onPageSEO: 50,
      contentMarketing: 50,
      localSEO: 50,
      hasBlog: false,
      blogPostCount: 0,
      phone: undefined,
      address: undefined,
      email: undefined,
      seoIssues: [{
        category: 'Website Access',
        issue,
        severity,
        fix
      }],
    };
  }
}
