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
