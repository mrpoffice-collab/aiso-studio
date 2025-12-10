/**
 * Perplexity Sonar API Client
 * For AI visibility tracking - checks if URLs are cited in AI search results
 */

interface PerplexityMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface PerplexityRequest {
  model: 'sonar' | 'sonar-pro';
  messages: PerplexityMessage[];
  search_domain_filter?: string[];
  search_recency_filter?: 'month' | 'week' | 'day' | 'hour';
  return_related_questions?: boolean;
}

interface PerplexityResponse {
  id: string;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  citations?: string[]; // URLs that were cited
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface CitationCheckResult {
  query: string;
  targetUrl: string;
  targetDomain: string;
  wasCited: boolean;
  citationType: 'direct_link' | 'domain_match' | 'brand_mention' | 'not_found';
  citationPosition: number | null;
  allCitations: string[];
  responseSnippet: string;
  fullResponse: string;
  checkedAt: Date;
}

/**
 * Check if a URL/domain appears in Perplexity's citations for a given query
 */
export async function checkPerplexityCitation(
  query: string,
  targetUrl: string,
  targetDomain: string,
  businessName?: string
): Promise<CitationCheckResult> {
  const apiKey = process.env.PERPLEXITY_API_KEY;

  if (!apiKey) {
    throw new Error('PERPLEXITY_API_KEY not configured');
  }

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'sonar',
      messages: [
        {
          role: 'user',
          content: query,
        },
      ],
      return_related_questions: false,
    } as PerplexityRequest),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
  }

  const data: PerplexityResponse = await response.json();

  const citations = data.citations || [];
  const fullResponse = data.choices[0]?.message?.content || '';

  // Check for different types of citations
  let wasCited = false;
  let citationType: CitationCheckResult['citationType'] = 'not_found';
  let citationPosition: number | null = null;

  // Normalize target domain for comparison
  const normalizedTargetDomain = targetDomain.toLowerCase().replace(/^www\./, '');
  const normalizedTargetUrl = targetUrl.toLowerCase();

  // Check citations array
  for (let i = 0; i < citations.length; i++) {
    const citation = citations[i].toLowerCase();

    // Direct URL match
    if (citation === normalizedTargetUrl || citation.includes(normalizedTargetUrl)) {
      wasCited = true;
      citationType = 'direct_link';
      citationPosition = i + 1;
      break;
    }

    // Domain match
    const citationDomain = extractDomain(citation);
    if (citationDomain === normalizedTargetDomain) {
      wasCited = true;
      citationType = 'domain_match';
      citationPosition = i + 1;
      break;
    }
  }

  // If not found in citations, check for brand mention in response text
  if (!wasCited && businessName) {
    const normalizedBusinessName = businessName.toLowerCase();
    if (fullResponse.toLowerCase().includes(normalizedBusinessName)) {
      wasCited = true;
      citationType = 'brand_mention';
      citationPosition = null; // Can't determine position for brand mentions
    }
  }

  // Extract a relevant snippet (first 500 chars)
  const responseSnippet = fullResponse.substring(0, 500) + (fullResponse.length > 500 ? '...' : '');

  return {
    query,
    targetUrl,
    targetDomain,
    wasCited,
    citationType,
    citationPosition,
    allCitations: citations,
    responseSnippet,
    fullResponse,
    checkedAt: new Date(),
  };
}

/**
 * Run multiple queries to check visibility across different search intents
 */
export async function checkVisibilityForKeywords(
  keywords: string[],
  targetUrl: string,
  targetDomain: string,
  businessName?: string,
  industry?: string,
  location?: string
): Promise<CitationCheckResult[]> {
  const results: CitationCheckResult[] = [];

  for (const keyword of keywords) {
    // Build natural search queries
    const queries = buildSearchQueries(keyword, industry, location);

    for (const query of queries) {
      try {
        const result = await checkPerplexityCitation(
          query,
          targetUrl,
          targetDomain,
          businessName
        );
        results.push(result);

        // Rate limiting - Perplexity recommends ~1 req/sec
        await sleep(1100);
      } catch (error) {
        console.error(`Failed to check query "${query}":`, error);
      }
    }
  }

  return results;
}

/**
 * Build natural search queries from a keyword
 */
function buildSearchQueries(
  keyword: string,
  industry?: string,
  location?: string
): string[] {
  const queries: string[] = [];

  // Basic keyword query
  queries.push(keyword);

  // "Best X" query
  queries.push(`best ${keyword}`);

  // With location if provided
  if (location) {
    queries.push(`${keyword} in ${location}`);
    queries.push(`best ${keyword} ${location}`);
  }

  // Industry-specific
  if (industry) {
    queries.push(`${keyword} for ${industry}`);
  }

  return queries.slice(0, 3); // Limit to 3 queries per keyword to control costs
}

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string {
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    return parsed.hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return url.toLowerCase().replace(/^www\./, '');
  }
}

/**
 * Sleep helper for rate limiting
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate visibility score from check results
 */
export function calculateVisibilityScore(results: CitationCheckResult[]): {
  score: number;
  totalChecks: number;
  totalCitations: number;
  citationRate: number;
  avgPosition: number | null;
  breakdown: {
    directLinks: number;
    domainMatches: number;
    brandMentions: number;
  };
} {
  const totalChecks = results.length;
  const citations = results.filter((r) => r.wasCited);
  const totalCitations = citations.length;
  const citationRate = totalChecks > 0 ? (totalCitations / totalChecks) * 100 : 0;

  // Calculate average position (only for results with a position)
  const positions = citations
    .filter((r) => r.citationPosition !== null)
    .map((r) => r.citationPosition as number);
  const avgPosition = positions.length > 0
    ? positions.reduce((a, b) => a + b, 0) / positions.length
    : null;

  // Breakdown by type
  const breakdown = {
    directLinks: citations.filter((r) => r.citationType === 'direct_link').length,
    domainMatches: citations.filter((r) => r.citationType === 'domain_match').length,
    brandMentions: citations.filter((r) => r.citationType === 'brand_mention').length,
  };

  // Score: weighted by citation type and position
  // Direct links = 10pts, Domain matches = 7pts, Brand mentions = 3pts
  // Bonus for top-3 position
  let score = 0;
  for (const result of citations) {
    let points = 0;
    switch (result.citationType) {
      case 'direct_link':
        points = 10;
        break;
      case 'domain_match':
        points = 7;
        break;
      case 'brand_mention':
        points = 3;
        break;
    }

    // Position bonus
    if (result.citationPosition !== null) {
      if (result.citationPosition === 1) points *= 1.5;
      else if (result.citationPosition <= 3) points *= 1.25;
    }

    score += points;
  }

  // Normalize to 0-100
  const maxPossibleScore = totalChecks * 15; // Max 15 points per check (10 * 1.5)
  const normalizedScore = maxPossibleScore > 0
    ? Math.min(100, Math.round((score / maxPossibleScore) * 100))
    : 0;

  return {
    score: normalizedScore,
    totalChecks,
    totalCitations,
    citationRate: Math.round(citationRate * 10) / 10,
    avgPosition: avgPosition ? Math.round(avgPosition * 10) / 10 : null,
    breakdown,
  };
}

export interface KeywordLeader {
  domain: string;
  url: string;
  citationCount: number;
  queries: string[];
  positions: number[];
  avgPosition: number;
}

export interface KeywordLeadersResult {
  keyword: string;
  queries: string[];
  leaders: KeywordLeader[];
  totalQueriesRun: number;
  checkedAt: Date;
}

/**
 * Find who is being cited for a given keyword
 * Returns the top domains/URLs that appear in AI search results
 */
export async function findKeywordLeaders(
  keyword: string,
  location?: string
): Promise<KeywordLeadersResult> {
  const apiKey = process.env.PERPLEXITY_API_KEY;

  if (!apiKey) {
    throw new Error('PERPLEXITY_API_KEY not configured');
  }

  // Build search queries for this keyword
  const queries: string[] = [
    keyword,
    `best ${keyword}`,
    `top ${keyword}`,
  ];

  if (location) {
    queries.push(`${keyword} in ${location}`);
    queries.push(`best ${keyword} ${location}`);
  }

  // Limit to 5 queries max
  const queriesToRun = queries.slice(0, 5);

  // Track citations per domain
  const domainCitations: Map<string, {
    urls: Set<string>;
    queries: string[];
    positions: number[];
  }> = new Map();

  for (const query of queriesToRun) {
    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'sonar',
          messages: [{ role: 'user', content: query }],
          return_related_questions: false,
        }),
      });

      if (!response.ok) {
        console.error(`Perplexity API error for "${query}": ${response.status}`);
        continue;
      }

      const data = await response.json();
      const citations = data.citations || [];

      // Process each citation
      citations.forEach((url: string, index: number) => {
        const domain = extractDomainFromUrl(url);
        const position = index + 1;

        if (!domainCitations.has(domain)) {
          domainCitations.set(domain, {
            urls: new Set(),
            queries: [],
            positions: [],
          });
        }

        const entry = domainCitations.get(domain)!;
        entry.urls.add(url);
        entry.queries.push(query);
        entry.positions.push(position);
      });

      // Rate limiting
      await sleep(1100);
    } catch (error) {
      console.error(`Failed to check query "${query}":`, error);
    }
  }

  // Convert to sorted array of leaders
  const leaders: KeywordLeader[] = Array.from(domainCitations.entries())
    .map(([domain, data]) => ({
      domain,
      url: Array.from(data.urls)[0], // Primary URL
      citationCount: data.queries.length,
      queries: [...new Set(data.queries)], // Unique queries
      positions: data.positions,
      avgPosition: data.positions.reduce((a, b) => a + b, 0) / data.positions.length,
    }))
    .sort((a, b) => {
      // Sort by citation count desc, then by avg position asc
      if (b.citationCount !== a.citationCount) {
        return b.citationCount - a.citationCount;
      }
      return a.avgPosition - b.avgPosition;
    })
    .slice(0, 15); // Top 15 leaders

  return {
    keyword,
    queries: queriesToRun,
    leaders,
    totalQueriesRun: queriesToRun.length,
    checkedAt: new Date(),
  };
}

function extractDomainFromUrl(url: string): string {
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    return parsed.hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return url.toLowerCase().replace(/^www\./, '');
  }
}
