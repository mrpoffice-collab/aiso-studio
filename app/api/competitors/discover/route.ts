import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { searchBusinesses } from '@/lib/serper-client';
import * as cheerio from 'cheerio';

/**
 * POST /api/competitors/discover
 * Auto-discover competitors based on a prospect's website
 *
 * Analyzes the prospect's site to detect:
 * - Industry/business type
 * - Services offered
 * - Location
 * Then searches for similar businesses in the same space
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.getUserByClerkId(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    let { url, domain, limit = 3 } = body;

    // Normalize domain
    if (url && !domain) {
      try {
        const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
        domain = urlObj.hostname.replace('www.', '');
      } catch {
        return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
      }
    }

    if (!domain) {
      return NextResponse.json({ error: 'Domain or URL required' }, { status: 400 });
    }

    console.log(`🔍 Discovering competitors for: ${domain}`);

    // Step 1: Analyze the prospect's website
    const siteAnalysis = await analyzeSite(domain);

    if (!siteAnalysis.industry) {
      return NextResponse.json({
        success: false,
        error: 'Could not determine business type from website',
        suggestion: 'Try entering competitors manually',
      }, { status: 200 });
    }

    console.log(`📊 Site analysis:`, siteAnalysis);

    // Step 2: Build search query for competitors
    const searchQueries = buildCompetitorQueries(siteAnalysis, domain);

    // Step 3: Search for competitors
    const competitors: Array<{ name: string; domain: string; url: string }> = [];
    const seenDomains = new Set<string>([domain.toLowerCase()]);

    for (const query of searchQueries) {
      if (competitors.length >= limit) break;

      console.log(`🔎 Searching: "${query}"`);
      const results = await searchBusinesses(query, 20);

      for (const result of results) {
        // Skip the prospect's own domain
        if (result.domain.toLowerCase() === domain.toLowerCase()) continue;
        if (seenDomains.has(result.domain.toLowerCase())) continue;

        seenDomains.add(result.domain.toLowerCase());
        competitors.push({
          name: cleanBusinessName(result.name),
          domain: result.domain,
          url: `https://${result.domain}`,
        });

        if (competitors.length >= limit) break;
      }
    }

    // Log usage
    await db.logUsage({
      user_id: user.id,
      operation_type: 'lead_discovery',
      cost_usd: 0.01,
      tokens_used: 100,
      metadata: {
        type: 'competitor_discovery',
        prospect_domain: domain,
        competitors_found: competitors.length,
        industry: siteAnalysis.industry,
      },
    });

    return NextResponse.json({
      success: true,
      prospect: {
        domain,
        industry: siteAnalysis.industry,
        services: siteAnalysis.services,
        location: siteAnalysis.location,
      },
      competitors,
      searchQueries,
    });

  } catch (error: any) {
    console.error('Competitor discovery error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to discover competitors' },
      { status: 500 }
    );
  }
}

/**
 * Analyze a website to extract industry, services, and location
 */
async function analyzeSite(domain: string): Promise<{
  industry: string | null;
  services: string[];
  location: string | null;
  businessName: string | null;
}> {
  try {
    const url = `https://${domain}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AISOStudio/1.0)',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract text content
    const title = $('title').text().toLowerCase();
    const metaDescription = $('meta[name="description"]').attr('content')?.toLowerCase() || '';
    const h1Text = $('h1').first().text().toLowerCase();
    const bodyText = $('body').text().toLowerCase().substring(0, 5000);
    const fullText = `${title} ${metaDescription} ${h1Text} ${bodyText}`;

    // Detect industry based on keywords
    const industryPatterns: Record<string, string[]> = {
      'dental practice': ['dentist', 'dental', 'orthodont', 'teeth', 'smile', 'oral health'],
      'law firm': ['attorney', 'lawyer', 'law firm', 'legal', 'litigation', 'counsel'],
      'medical practice': ['doctor', 'physician', 'medical', 'clinic', 'healthcare', 'patient care'],
      'real estate agency': ['real estate', 'realtor', 'property', 'homes for sale', 'buying a home'],
      'marketing agency': ['marketing', 'digital agency', 'advertising', 'seo', 'branding', 'web design'],
      'accounting firm': ['accountant', 'cpa', 'tax', 'bookkeeping', 'financial services'],
      'restaurant': ['restaurant', 'dining', 'menu', 'cuisine', 'chef', 'reservation'],
      'fitness center': ['gym', 'fitness', 'workout', 'personal training', 'health club'],
      'salon/spa': ['salon', 'spa', 'beauty', 'hair', 'nails', 'skincare', 'massage'],
      'auto service': ['auto repair', 'mechanic', 'car service', 'automotive', 'oil change'],
      'plumbing service': ['plumber', 'plumbing', 'drain', 'pipe', 'water heater'],
      'hvac service': ['hvac', 'heating', 'cooling', 'air conditioning', 'furnace'],
      'roofing company': ['roofing', 'roof repair', 'shingles', 'gutters'],
      'landscaping': ['landscaping', 'lawn care', 'garden', 'tree service', 'hardscape'],
      'insurance agency': ['insurance', 'coverage', 'policy', 'claims', 'quote'],
      'veterinary clinic': ['veterinar', 'pet', 'animal hospital', 'dog', 'cat'],
      'photography studio': ['photograph', 'portrait', 'wedding photo', 'studio'],
      'consulting firm': ['consulting', 'consultant', 'advisory', 'strategy'],
      'construction company': ['construction', 'contractor', 'builder', 'renovation', 'remodel'],
      'it services': ['it services', 'tech support', 'managed services', 'cybersecurity', 'network'],
    };

    let detectedIndustry: string | null = null;
    let maxMatches = 0;

    for (const [industry, keywords] of Object.entries(industryPatterns)) {
      const matches = keywords.filter(kw => fullText.includes(kw)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        detectedIndustry = industry;
      }
    }

    // Only accept if we have at least 2 keyword matches
    if (maxMatches < 2) {
      detectedIndustry = null;
    }

    // Extract services mentioned
    const serviceKeywords = [
      'services', 'solutions', 'offerings', 'specializ', 'expert in',
      'we offer', 'we provide', 'our services'
    ];
    const services: string[] = [];

    // Try to extract from structured data
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const data = JSON.parse($(el).html() || '');
        if (data.hasOwnProperty) {
          // LocalBusiness schema often has service info
          if (data['@type'] === 'LocalBusiness' && data.description) {
            // Could extract more specific services
          }
        }
      } catch {
        // Invalid JSON
      }
    });

    // Extract location
    let location: string | null = null;

    // Look for city, state pattern
    const locationMatch = bodyText.match(/\b([a-z]+(?:\s+[a-z]+)*),?\s+([a-z]{2})\b/i);
    if (locationMatch) {
      location = `${locationMatch[1]}, ${locationMatch[2].toUpperCase()}`;
    }

    // Try structured data for location
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const data = JSON.parse($(el).html() || '');
        if (data.address) {
          const addr = data.address;
          if (addr.addressLocality && addr.addressRegion) {
            location = `${addr.addressLocality}, ${addr.addressRegion}`;
          }
        }
      } catch {
        // Invalid JSON
      }
    });

    // Extract business name from title or OG tags
    let businessName = $('meta[property="og:site_name"]').attr('content') || null;
    if (!businessName) {
      // Try to extract from title (usually "Business Name | Tagline" or "Business Name - Services")
      const titleText = $('title').text();
      const titleParts = titleText.split(/[|\-–—]/);
      if (titleParts.length > 0) {
        businessName = titleParts[0].trim();
      }
    }

    return {
      industry: detectedIndustry,
      services,
      location,
      businessName,
    };

  } catch (error: any) {
    console.error(`Site analysis error for ${domain}:`, error.message);
    return {
      industry: null,
      services: [],
      location: null,
      businessName: null,
    };
  }
}

/**
 * Build search queries to find competitors
 */
function buildCompetitorQueries(
  analysis: { industry: string | null; location: string | null; services: string[] },
  excludeDomain: string
): string[] {
  const queries: string[] = [];

  if (!analysis.industry) return queries;

  // Primary query: industry + location
  if (analysis.location) {
    queries.push(`${analysis.industry} ${analysis.location}`);
    queries.push(`best ${analysis.industry} ${analysis.location}`);
  }

  // Fallback: just industry (will get national results)
  queries.push(`${analysis.industry} near me`);
  queries.push(`top ${analysis.industry}`);

  return queries.slice(0, 3); // Limit to 3 queries to control API costs
}

/**
 * Clean up business name from search results
 */
function cleanBusinessName(name: string): string {
  // Remove common suffixes that aren't part of the actual name
  return name
    .replace(/\s*[-|–—]\s*.+$/, '') // Remove everything after dash/pipe
    .replace(/\s*\|\s*.+$/, '')
    .replace(/\s*:\s*.+$/, '')
    .trim()
    .substring(0, 50); // Limit length
}
