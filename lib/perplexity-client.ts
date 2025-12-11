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

// ============================================================================
// QUESTION-BASED AI VISIBILITY (New Approach)
// Instead of keyword-based, we ask: "What questions does AI cite you for?"
// ============================================================================

export interface IndustryQuestion {
  question: string;
  category: 'informational' | 'commercial' | 'navigational' | 'transactional';
  intent: string; // e.g., "research", "hiring", "comparison", "how-to"
}

/**
 * Generate natural questions people ask AI about an industry/service
 * These are the actual questions that lead to AI citations
 */
export function generateIndustryQuestions(
  industry: string,
  serviceType?: string,
  location?: string
): IndustryQuestion[] {
  const questions: IndustryQuestion[] = [];

  // Service should be industry + service type if provided
  const service = serviceType ? `${industry} ${serviceType}` : industry;

  // PRIORITY 1: Location-specific questions (most winnable - no Wikipedia competition)
  // These go FIRST so they don't get cut off by maxQuestions limit
  if (location) {
    questions.push(
      { question: `Best ${service} in ${location}`, category: 'transactional', intent: 'local' },
      { question: `${service} companies near ${location}`, category: 'transactional', intent: 'local' },
      { question: `Who is the best ${service} provider in ${location}?`, category: 'navigational', intent: 'local' },
      { question: `Top rated ${service} in ${location}`, category: 'commercial', intent: 'local' },
    );
  }

  // PRIORITY 2: Commercial/Transactional (winnable - Wikipedia doesn't answer these)
  questions.push(
    { question: `How much does ${service} cost?`, category: 'commercial', intent: 'comparison' },
    { question: `What should I look for in a ${service} provider?`, category: 'commercial', intent: 'comparison' },
    { question: `What are the best ${service} companies?`, category: 'commercial', intent: 'comparison' },
    { question: `How do I choose a ${service} provider?`, category: 'transactional', intent: 'hiring' },
    { question: `What questions should I ask a ${service} provider?`, category: 'transactional', intent: 'hiring' },
  );

  // PRIORITY 3: Informational (harder to win - Wikipedia territory, but still check)
  questions.push(
    { question: `What are the benefits of ${service}?`, category: 'informational', intent: 'research' },
    { question: `Is ${service} worth it?`, category: 'informational', intent: 'research' },
    { question: `How does ${service} work?`, category: 'informational', intent: 'research' },
  );

  return questions;
}

export interface AIDiscoveryResult {
  url: string;
  domain: string;
  businessName?: string;
  industry: string;
  questionsChecked: IndustryQuestion[];
  citedFor: {
    question: IndustryQuestion;
    citationType: CitationCheckResult['citationType'];
    position: number | null;
    competitors: string[]; // Other domains cited for same question
  }[];
  notCitedFor: IndustryQuestion[];
  summary: {
    totalQuestions: number;
    citedCount: number;
    citationRate: number;
    strongestCategory: string | null;
    weakestCategory: string | null;
    topCompetitors: { domain: string; count: number }[];
  };
  checkedAt: Date;
}

/**
 * AI Discovery Check - The new question-based approach
 * "Does AI know you exist for questions in your industry?"
 */
export async function runAIDiscoveryCheck(
  url: string,
  industry: string,
  serviceType?: string,
  businessName?: string,
  location?: string,
  maxQuestions: number = 12 // Increased to include location questions
): Promise<AIDiscoveryResult> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    throw new Error('PERPLEXITY_API_KEY not configured');
  }

  const domain = extractDomainFromUrl(url);
  const questions = generateIndustryQuestions(industry, serviceType, location);

  // Limit questions to control cost
  const questionsToCheck = questions.slice(0, maxQuestions);

  const citedFor: AIDiscoveryResult['citedFor'] = [];
  const notCitedFor: IndustryQuestion[] = [];

  // Track competitors across all questions
  const competitorCounts: Map<string, number> = new Map();

  // Track category performance
  const categoryResults: Map<string, { cited: number; total: number }> = new Map();

  for (const q of questionsToCheck) {
    try {
      const result = await checkPerplexityCitation(q.question, url, domain, businessName);

      // Track category
      if (!categoryResults.has(q.category)) {
        categoryResults.set(q.category, { cited: 0, total: 0 });
      }
      categoryResults.get(q.category)!.total++;

      if (result.wasCited) {
        categoryResults.get(q.category)!.cited++;

        // Get competitors (other domains cited)
        const competitors = result.allCitations
          .map(c => extractDomainFromUrl(c))
          .filter(d => d !== domain);

        citedFor.push({
          question: q,
          citationType: result.citationType,
          position: result.citationPosition,
          competitors,
        });

        // Count competitors
        competitors.forEach(comp => {
          competitorCounts.set(comp, (competitorCounts.get(comp) || 0) + 1);
        });
      } else {
        notCitedFor.push(q);

        // Still track competitors for questions we're NOT cited for
        result.allCitations.forEach(c => {
          const d = extractDomainFromUrl(c);
          competitorCounts.set(d, (competitorCounts.get(d) || 0) + 1);
        });
      }

      await sleep(1100);
    } catch (error) {
      console.error(`Failed to check question "${q.question}":`, error);
      notCitedFor.push(q);
    }
  }

  // Calculate category performance
  let strongestCategory: string | null = null;
  let weakestCategory: string | null = null;
  let highestRate = -1;
  let lowestRate = 101;

  categoryResults.forEach((stats, category) => {
    const rate = stats.total > 0 ? (stats.cited / stats.total) * 100 : 0;
    if (rate > highestRate) {
      highestRate = rate;
      strongestCategory = category;
    }
    if (rate < lowestRate) {
      lowestRate = rate;
      weakestCategory = category;
    }
  });

  // Top competitors
  const topCompetitors = Array.from(competitorCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([domain, count]) => ({ domain, count }));

  return {
    url,
    domain,
    businessName,
    industry,
    questionsChecked: questionsToCheck,
    citedFor,
    notCitedFor,
    summary: {
      totalQuestions: questionsToCheck.length,
      citedCount: citedFor.length,
      citationRate: Math.round((citedFor.length / questionsToCheck.length) * 100),
      strongestCategory,
      weakestCategory: weakestCategory !== strongestCategory ? weakestCategory : null,
      topCompetitors,
    },
    checkedAt: new Date(),
  };
}

export interface IndustryTrustResult {
  industry: string;
  location?: string;
  questionsAsked: IndustryQuestion[];
  trustedSources: {
    domain: string;
    url: string;
    citationCount: number;
    avgPosition: number;
    questionsAnswered: string[];
    categories: string[];
  }[];
  summary: {
    totalQuestions: number;
    uniqueSourcesCited: number;
    dominantPlayer: string | null;
    dominantPlayerShare: number; // % of citations
  };
  checkedAt: Date;
}

/**
 * Who Does AI Trust? - Find who AI cites for an industry's questions
 * This replaces the keyword-leaders approach with question-based discovery
 */
export async function findIndustryTrustedSources(
  industry: string,
  serviceType?: string,
  location?: string,
  maxQuestions: number = 6
): Promise<IndustryTrustResult> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    throw new Error('PERPLEXITY_API_KEY not configured');
  }

  const questions = generateIndustryQuestions(industry, serviceType, location);
  const questionsToRun = questions.slice(0, maxQuestions);

  // Track all sources across questions
  const sourceData: Map<string, {
    urls: Set<string>;
    positions: number[];
    questions: string[];
    categories: Set<string>;
  }> = new Map();

  let totalCitations = 0;

  for (const q of questionsToRun) {
    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'sonar',
          messages: [{ role: 'user', content: q.question }],
          return_related_questions: false,
        }),
      });

      if (!response.ok) {
        console.error(`Perplexity API error for "${q.question}": ${response.status}`);
        continue;
      }

      const data = await response.json();
      const citations = data.citations || [];

      citations.forEach((url: string, index: number) => {
        const domain = extractDomainFromUrl(url);
        totalCitations++;

        if (!sourceData.has(domain)) {
          sourceData.set(domain, {
            urls: new Set(),
            positions: [],
            questions: [],
            categories: new Set(),
          });
        }

        const entry = sourceData.get(domain)!;
        entry.urls.add(url);
        entry.positions.push(index + 1);
        entry.questions.push(q.question);
        entry.categories.add(q.category);
      });

      await sleep(1100);
    } catch (error) {
      console.error(`Failed to check question "${q.question}":`, error);
    }
  }

  // Convert to sorted array
  const trustedSources = Array.from(sourceData.entries())
    .map(([domain, data]) => ({
      domain,
      url: Array.from(data.urls)[0],
      citationCount: data.questions.length,
      avgPosition: data.positions.reduce((a, b) => a + b, 0) / data.positions.length,
      questionsAnswered: [...new Set(data.questions)],
      categories: Array.from(data.categories),
    }))
    .sort((a, b) => {
      if (b.citationCount !== a.citationCount) return b.citationCount - a.citationCount;
      return a.avgPosition - b.avgPosition;
    })
    .slice(0, 15);

  // Find dominant player
  const dominantPlayer = trustedSources[0]?.domain || null;
  const dominantPlayerShare = dominantPlayer && totalCitations > 0
    ? Math.round((trustedSources[0].citationCount / totalCitations) * 100)
    : 0;

  return {
    industry,
    location,
    questionsAsked: questionsToRun,
    trustedSources,
    summary: {
      totalQuestions: questionsToRun.length,
      uniqueSourcesCited: trustedSources.length,
      dominantPlayer,
      dominantPlayerShare,
    },
    checkedAt: new Date(),
  };
}
