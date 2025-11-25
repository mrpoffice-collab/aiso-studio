/**
 * Serper API Client
 *
 * Gets search visibility metrics for domains:
 * - Ranking keywords count
 * - Average search position
 * - Estimated organic traffic
 */

interface SerperResult {
  rankingKeywords: number;
  avgPosition: number;
  organicTraffic: number;
}

/**
 * Get search visibility metrics for a domain using Serper API
 */
export async function getSearchVisibility(domain: string): Promise<SerperResult | null> {
  const apiKey = process.env.SERPER_API_KEY;

  if (!apiKey) {
    console.warn('⚠️  SERPER_API_KEY not configured. Skipping searchability metrics.');
    return null;
  }

  try {
    // Search for the domain to see where it ranks
    const query = `site:${domain}`;

    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: query,
        num: 100, // Get up to 100 results to count indexed pages
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Serper API error (${response.status}):`, errorText);
      return null;
    }

    const data = await response.json();

    // Calculate metrics from results
    const organicResults = data.organic || [];
    const rankingKeywords = organicResults.length; // Approximate keyword count by indexed pages

    // Calculate average position (1-100)
    let totalPosition = 0;
    organicResults.forEach((result: any, index: number) => {
      totalPosition += index + 1; // Position 1, 2, 3, etc.
    });
    const avgPosition = rankingKeywords > 0 ? Math.round(totalPosition / rankingKeywords) : 100;

    // Estimate organic traffic based on ranking keywords and positions
    // Formula: More keywords + better positions = more traffic
    // This is a rough estimate: each top-10 keyword = ~50 visitors/month, top-20 = ~20, etc.
    let estimatedTraffic = 0;
    organicResults.forEach((result: any, index: number) => {
      const position = index + 1;
      if (position <= 10) {
        estimatedTraffic += 50; // Top 10: ~50 visitors per keyword
      } else if (position <= 20) {
        estimatedTraffic += 20; // Top 20: ~20 visitors
      } else if (position <= 50) {
        estimatedTraffic += 5; // Top 50: ~5 visitors
      } else {
        estimatedTraffic += 1; // Beyond top 50: minimal traffic
      }
    });

    return {
      rankingKeywords,
      avgPosition,
      organicTraffic: estimatedTraffic,
    };
  } catch (error: any) {
    console.error('Serper API error:', error.message);
    return null;
  }
}

/**
 * Search for businesses using Serper (Google results)
 * Returns up to 100 businesses per search (1 credit)
 */
export async function searchBusinesses(
  query: string,
  limit: number = 100
): Promise<Array<{ name: string; domain: string; url: string }>> {
  const apiKey = process.env.SERPER_API_KEY;

  if (!apiKey) {
    console.warn('⚠️  SERPER_API_KEY not configured. Cannot search businesses.');
    return [];
  }

  try {
    console.log(`🔍 Serper search: "${query}" (limit: ${limit})`);

    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: query,
        num: Math.min(limit, 100), // Serper max is 100 per call
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Serper API error (${response.status}):`, errorText);
      return [];
    }

    const data = await response.json();
    const organicResults = data.organic || [];

    // Filter out directories, social media, etc. and extract businesses
    const businesses: Array<{ name: string; domain: string; url: string }> = [];
    const seenDomains = new Set<string>();

    // Core blocklist - major social/platforms that will never be leads
    const coreBlocklist = [
      'facebook.com', 'linkedin.com', 'instagram.com', 'twitter.com', 'x.com',
      'youtube.com', 'pinterest.com', 'tiktok.com', 'reddit.com',
      'wikipedia.org', 'google.com', 'maps.google.com',
    ];

    // Directory detection patterns - catches new directories automatically
    const isDirectory = (domain: string, url: string, title: string): boolean => {
      const domainLower = domain.toLowerCase();
      const urlLower = url.toLowerCase();
      const titleLower = title.toLowerCase();

      // URL path patterns that indicate a directory listing
      const directoryPathPatterns = [
        '/profile/', '/listing/', '/company/', '/business/', '/vendor/',
        '/provider/', '/firm/', '/agency/', '/contractor/', '/professional/',
        '/find/', '/search/', '/directory/', '/list/', '/top-', '/best-',
        '/reviews/', '/ratings/', '/compare/', '/hire/',
      ];
      if (directoryPathPatterns.some(p => urlLower.includes(p))) return true;

      // Title patterns that indicate aggregator/listicle content
      const titlePatterns = [
        /^top \d+/i, /^best \d+/i, /^\d+ best/i, /^\d+ top/i,
        /directory of/i, /list of/i, /find a /i, /hire a /i,
        /compare \d+/i, /\d+ (companies|agencies|firms|businesses)/i,
        /near you/i, /in your area/i, /reviews for/i,
      ];
      if (titlePatterns.some(p => p.test(titleLower))) return true;

      // Domain patterns that indicate directories/aggregators
      const directoryDomainPatterns = [
        'yelp', 'yellowpages', 'yp.com', 'whitepages', 'superpages',
        'bbb.org', 'angieslist', 'angi.com', 'homeadvisor', 'thumbtack',
        'houzz', 'zillow', 'realtor', 'apartments', 'trulia',
        'healthgrades', 'vitals', 'zocdoc', 'webmd', 'healthline',
        'tripadvisor', 'expedia', 'booking.com', 'kayak',
        'glassdoor', 'indeed', 'ziprecruiter', 'monster', 'careerbuilder',
        'manta', 'chamberofcommerce', 'alignable', 'nextdoor',
        'mapquest', 'foursquare', 'citysearch',
        // Marketing/Agency specific directories
        'clutch.co', 'upcity', 'sortlist', 'agency-list', 'agencyspotter',
        'designrush', 'expertise.com', 'bark.com', 'goodfirms',
        'topdesignfirms', 'digitalagencynetwork', 'awwwards', 'cssdesignawards',
        // General aggregators
        'g2.com', 'capterra', 'softwareadvice', 'getapp', 'trustpilot',
        'sitejabber', 'consumeraffairs', 'pissedconsumer', 'complaintsboard',
        'crunchbase', 'owler', 'zoominfo', 'apollo', 'clearbit',
        'improvado', 'databox', 'whatagraph',
      ];
      if (directoryDomainPatterns.some(p => domainLower.includes(p))) return true;

      // Check for common directory TLD patterns
      if (domainLower.endsWith('.directory') || domainLower.endsWith('.guide')) return true;

      return false;
    };

    for (const result of organicResults) {
      try {
        const url = new URL(result.link);
        const domain = url.hostname.replace('www.', '').toLowerCase();
        const title = result.title || '';

        // Skip if already seen
        if (seenDomains.has(domain)) continue;

        // Skip core blocklist (social/platforms)
        if (coreBlocklist.some(skip => domain.includes(skip))) continue;

        // Skip detected directories using pattern matching
        if (isDirectory(domain, result.link, title)) {
          console.log(`  ⏭️  Skipped directory: ${domain} - "${title.substring(0, 50)}..."`);
          continue;
        }

        // Skip very short domains (likely not real businesses)
        if (domain.length < 4) continue;

        seenDomains.add(domain);
        businesses.push({
          name: title || domain,
          domain,
          url: result.link,
        });
      } catch {
        // Invalid URL, skip
      }
    }

    console.log(`✅ Serper found ${businesses.length} businesses after filtering (${organicResults.length - businesses.length} directories filtered)`);
    return businesses;
  } catch (error: any) {
    console.error('Serper search error:', error.message);
    return [];
  }
}

/**
 * Get brand search visibility (how well the business ranks for their own name)
 */
export async function getBrandVisibility(
  businessName: string,
  domain: string
): Promise<{ brandPosition: number; hasBrandResult: boolean } | null> {
  const apiKey = process.env.SERPER_API_KEY;

  if (!apiKey) {
    return null;
  }

  try {
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: businessName,
        num: 10,
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const organicResults = data.organic || [];

    // Find where their domain appears in brand search results
    const domainMatch = organicResults.findIndex((result: any) =>
      result.link?.includes(domain)
    );

    return {
      brandPosition: domainMatch >= 0 ? domainMatch + 1 : 100,
      hasBrandResult: domainMatch >= 0,
    };
  } catch (error: any) {
    console.error('Brand visibility error:', error.message);
    return null;
  }
}
