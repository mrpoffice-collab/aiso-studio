/**
 * Technical SEO Scanner
 * Diagnoses AI searchability issues and categorizes as "Agency Can Fix" vs "Owner Must Change"
 */

import * as cheerio from 'cheerio';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface TechnicalSEOIssue {
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  issue: string;
  impact: string;
  fix: string;
  estimatedCost: string;
  timeToFix: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface OwnerIssue {
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  issue: string;
  impact: string;
  recommendation: string;
  ownerAction: string;
  difficulty: 'easy-if-access' | 'business-decision' | 'platform-limitation';
}

export interface DetailedChecks {
  robotsTxt: {
    exists: boolean;
    blocksAICrawlers: boolean;
    blockedBots: string[];
    issueSeverity: 'critical' | 'high' | 'medium' | 'low' | null;
    content?: string;
  };
  metaRobots: {
    hasNoIndex: boolean;
    hasNoFollow: boolean;
    xRobotsTag: string | null;
    issueSeverity: 'critical' | 'high' | 'medium' | 'low' | null;
  };
  rendering: {
    isSSR: boolean;
    contentInInitialHTML: boolean;
    jsFramework: string | null;
    issueSeverity: 'critical' | 'high' | 'medium' | 'low' | null;
  };
  schemaMarkup: {
    hasSchema: boolean;
    types: string[];
    format: string | null;
    issueSeverity: 'critical' | 'high' | 'medium' | 'low' | null;
  };
  pageSpeed: {
    ttfb: number | null;
    responseTime: number;
    issueSeverity: 'critical' | 'high' | 'medium' | 'low' | null;
  };
  contentStructure: {
    hasH1: boolean;
    h1Count: number;
    headingHierarchy: boolean;
    semanticHTML: boolean;
    issueSeverity: 'critical' | 'high' | 'medium' | 'low' | null;
  };
  sitemap: {
    exists: boolean;
    url: string | null;
    issueSeverity: 'critical' | 'high' | 'medium' | 'low' | null;
  };
  canonicalUrls: {
    hasCanonical: boolean;
    canonicalUrl: string | null;
    issueSeverity: 'critical' | 'high' | 'medium' | 'low' | null;
  };
  paywall: {
    detected: boolean;
    type: string | null;
    issueSeverity: 'critical' | 'high' | 'medium' | 'low' | null;
  };
  captcha: {
    detected: boolean;
    provider: string | null;
    issueSeverity: 'critical' | 'high' | 'medium' | 'low' | null;
  };
  platform: {
    detected: string | null;
    limitations: string[];
    issueSeverity: 'critical' | 'high' | 'medium' | 'low' | null;
  };
  geolocation: {
    restricted: boolean;
    issueSeverity: 'critical' | 'high' | 'medium' | 'low' | null;
  };
}

export interface Recommendation {
  priority: number;
  action: string;
  benefit: string;
  cost: string;
  timeframe: string;
  type: 'agency-fix' | 'owner-action';
}

export interface TechnicalSEOResult {
  url: string;
  overallScore: number;
  aiSearchabilityScore: number;
  technicalSeoScore: number;
  agencyCanFix: {
    count: number;
    estimatedCost: string;
    issues: TechnicalSEOIssue[];
  };
  ownerMustChange: {
    count: number;
    issues: OwnerIssue[];
  };
  checks: DetailedChecks;
  recommendations: Recommendation[];
  scanVersion: string;
  scannedAt: string;
}

// ============================================================================
// AI CRAWLER USER AGENTS
// ============================================================================

const AI_CRAWLER_BOTS = [
  'GPTBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-Web',
  'PerplexityBot',
  'Perplexity',
  'Bingbot',
  'facebookexternalhit',
  'anthropic-ai',
  'Applebot',
];

// ============================================================================
// SCANNER IMPLEMENTATION
// ============================================================================

export async function scanTechnicalSEO(targetUrl: string): Promise<TechnicalSEOResult> {
  const parsedUrl = new URL(targetUrl);
  const baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}`;

  const startTime = Date.now();

  // Initialize results
  const checks: DetailedChecks = {
    robotsTxt: { exists: false, blocksAICrawlers: false, blockedBots: [], issueSeverity: null },
    metaRobots: { hasNoIndex: false, hasNoFollow: false, xRobotsTag: null, issueSeverity: null },
    rendering: { isSSR: false, contentInInitialHTML: false, jsFramework: null, issueSeverity: null },
    schemaMarkup: { hasSchema: false, types: [], format: null, issueSeverity: null },
    pageSpeed: { ttfb: null, responseTime: 0, issueSeverity: null },
    contentStructure: { hasH1: false, h1Count: 0, headingHierarchy: false, semanticHTML: false, issueSeverity: null },
    sitemap: { exists: false, url: null, issueSeverity: null },
    canonicalUrls: { hasCanonical: false, canonicalUrl: null, issueSeverity: null },
    paywall: { detected: false, type: null, issueSeverity: null },
    captcha: { detected: false, provider: null, issueSeverity: null },
    platform: { detected: null, limitations: [], issueSeverity: null },
    geolocation: { restricted: false, issueSeverity: null },
  };

  try {
    // 1. Check robots.txt
    await checkRobotsTxt(baseUrl, checks);

    // 2. Fetch page and check headers + content
    const pageResponse = await fetchPage(targetUrl);
    checks.pageSpeed.responseTime = Date.now() - startTime;

    // 3. Check meta robots and headers
    checkMetaRobotsAndHeaders(pageResponse, checks);

    // 4. Parse HTML
    const $ = cheerio.load(pageResponse.html);

    // 5. Check rendering (SSR vs CSR)
    checkRendering($, pageResponse.html, checks);

    // 6. Check schema markup
    checkSchemaMarkup($, checks);

    // 7. Check content structure
    checkContentStructure($, checks);

    // 8. Check sitemap
    await checkSitemap(baseUrl, checks);

    // 9. Check canonical URLs
    checkCanonicalUrls($, targetUrl, checks);

    // 10. Detect paywall
    detectPaywall($, pageResponse.html, checks);

    // 11. Detect CAPTCHA
    detectCaptcha($, pageResponse.html, checks);

    // 12. Detect platform
    detectPlatform($, pageResponse.html, checks);

    // 13. Check geolocation restrictions
    checkGeolocation(pageResponse, checks);

    // 14. Calculate scores
    const scores = calculateScores(checks);

    // 15. Generate issues and recommendations
    const agencyIssues = generateAgencyIssues(checks);
    const ownerIssues = generateOwnerIssues(checks);
    const recommendations = generateRecommendations(agencyIssues, ownerIssues);

    // 16. Calculate cost estimates
    const costEstimate = calculateCostEstimate(agencyIssues);

    return {
      url: targetUrl,
      overallScore: scores.overall,
      aiSearchabilityScore: scores.aiSearchability,
      technicalSeoScore: scores.technicalSeo,
      agencyCanFix: {
        count: agencyIssues.length,
        estimatedCost: costEstimate,
        issues: agencyIssues,
      },
      ownerMustChange: {
        count: ownerIssues.length,
        issues: ownerIssues,
      },
      checks,
      recommendations,
      scanVersion: '1.0.0',
      scannedAt: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('Technical SEO scan error:', error);
    throw new Error(`Failed to scan ${targetUrl}: ${error.message}`);
  }
}

// ============================================================================
// CHECK FUNCTIONS
// ============================================================================

async function checkRobotsTxt(baseUrl: string, checks: DetailedChecks): Promise<void> {
  try {
    const response = await fetch(`${baseUrl}/robots.txt`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TechnicalSEOBot/1.0)' },
    });

    if (response.ok) {
      checks.robotsTxt.exists = true;
      const content = await response.text();
      checks.robotsTxt.content = content;

      // Check if AI crawlers are blocked
      const blockedBots: string[] = [];
      const lines = content.toLowerCase().split('\n');

      for (const bot of AI_CRAWLER_BOTS) {
        const botLower = bot.toLowerCase();
        let isBlocked = false;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();

          // Check if this is a User-agent line for this bot
          if (line.startsWith('user-agent:') && line.includes(botLower)) {
            // Look ahead for Disallow directives
            for (let j = i + 1; j < lines.length; j++) {
              const nextLine = lines[j].trim();
              if (nextLine.startsWith('user-agent:')) break;
              if (nextLine.startsWith('disallow:')) {
                const disallowPath = nextLine.split('disallow:')[1].trim();
                if (disallowPath === '/' || disallowPath === '*') {
                  isBlocked = true;
                  break;
                }
              }
            }
          }

          // Check for wildcard blocking
          if (line === 'user-agent: *') {
            for (let j = i + 1; j < lines.length; j++) {
              const nextLine = lines[j].trim();
              if (nextLine.startsWith('user-agent:')) break;
              if (nextLine.startsWith('disallow:')) {
                const disallowPath = nextLine.split('disallow:')[1].trim();
                if (disallowPath === '/' || disallowPath === '*') {
                  isBlocked = true;
                  break;
                }
              }
            }
          }
        }

        if (isBlocked) {
          blockedBots.push(bot);
        }
      }

      checks.robotsTxt.blockedBots = blockedBots;
      checks.robotsTxt.blocksAICrawlers = blockedBots.length > 0;
      checks.robotsTxt.issueSeverity = blockedBots.length > 0 ? 'critical' : null;
    }
  } catch (error) {
    // robots.txt doesn't exist or can't be fetched
    checks.robotsTxt.exists = false;
  }
}

async function fetchPage(url: string): Promise<{ html: string; headers: Headers; status: number }> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; TechnicalSEOBot/1.0)',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const html = await response.text();

  return {
    html,
    headers: response.headers,
    status: response.status,
  };
}

function checkMetaRobotsAndHeaders(
  pageResponse: { html: string; headers: Headers },
  checks: DetailedChecks
): void {
  // Check X-Robots-Tag header
  const xRobotsTag = pageResponse.headers.get('x-robots-tag');
  checks.metaRobots.xRobotsTag = xRobotsTag;

  if (xRobotsTag) {
    const xRobotsLower = xRobotsTag.toLowerCase();
    checks.metaRobots.hasNoIndex = xRobotsLower.includes('noindex');
    checks.metaRobots.hasNoFollow = xRobotsLower.includes('nofollow');
  }

  // Check meta robots tag in HTML
  const $ = cheerio.load(pageResponse.html);
  const metaRobots = $('meta[name="robots"]').attr('content')?.toLowerCase() || '';

  if (metaRobots) {
    checks.metaRobots.hasNoIndex = checks.metaRobots.hasNoIndex || metaRobots.includes('noindex');
    checks.metaRobots.hasNoFollow = checks.metaRobots.hasNoFollow || metaRobots.includes('nofollow');
  }

  checks.metaRobots.issueSeverity = checks.metaRobots.hasNoIndex ? 'critical' : null;
}

function checkRendering($: cheerio.CheerioAPI, html: string, checks: DetailedChecks): void {
  // Check if content is in initial HTML
  const bodyText = $('body').text().trim();
  const hasSubstantialContent = bodyText.length > 500;

  checks.rendering.contentInInitialHTML = hasSubstantialContent;

  // Detect JS frameworks
  if (html.includes('_next') || html.includes('__NEXT_DATA__')) {
    checks.rendering.jsFramework = 'Next.js';
    checks.rendering.isSSR = html.includes('__NEXT_DATA__'); // Next.js SSR
  } else if (html.includes('ng-version') || html.includes('ng-app')) {
    checks.rendering.jsFramework = 'Angular';
    checks.rendering.isSSR = false;
  } else if (html.includes('data-reactroot') || html.includes('data-react')) {
    checks.rendering.jsFramework = 'React';
    checks.rendering.isSSR = $('[data-reactroot]').length > 0;
  } else if (html.includes('v-cloak') || html.includes('data-v-')) {
    checks.rendering.jsFramework = 'Vue.js';
    checks.rendering.isSSR = false;
  }

  // If no substantial content in HTML, likely CSR
  if (!hasSubstantialContent) {
    checks.rendering.issueSeverity = 'high';
  }
}

function checkSchemaMarkup($: cheerio.CheerioAPI, checks: DetailedChecks): void {
  const schemas: string[] = [];

  // Check JSON-LD
  $('script[type="application/ld+json"]').each((_, elem) => {
    try {
      const content = $(elem).html();
      if (content) {
        const json = JSON.parse(content);
        const type = json['@type'] || (Array.isArray(json) ? json.map((item: any) => item['@type']).filter(Boolean) : []);

        if (Array.isArray(type)) {
          schemas.push(...type);
        } else if (type) {
          schemas.push(type);
        }
      }
    } catch (e) {
      // Invalid JSON-LD
    }
  });

  checks.schemaMarkup.hasSchema = schemas.length > 0;
  checks.schemaMarkup.types = [...new Set(schemas)];
  checks.schemaMarkup.format = schemas.length > 0 ? 'JSON-LD' : null;

  // If no Article/NewsArticle/BlogPosting schema on content page, it's an issue
  const hasArticleSchema = schemas.some(s => ['Article', 'NewsArticle', 'BlogPosting'].includes(s));
  checks.schemaMarkup.issueSeverity = !hasArticleSchema ? 'medium' : null;
}

function checkContentStructure($: cheerio.CheerioAPI, checks: DetailedChecks): void {
  const h1s = $('h1');
  checks.contentStructure.hasH1 = h1s.length > 0;
  checks.contentStructure.h1Count = h1s.length;

  // Check heading hierarchy
  const headings = $('h1, h2, h3, h4, h5, h6').toArray();
  let properHierarchy = true;
  let prevLevel = 0;

  for (const heading of headings) {
    const level = parseInt(heading.tagName.charAt(1));
    if (level > prevLevel + 1) {
      properHierarchy = false;
      break;
    }
    prevLevel = level;
  }

  checks.contentStructure.headingHierarchy = properHierarchy;

  // Check semantic HTML
  const semanticTags = $('article, section, nav, aside, header, footer, main');
  checks.contentStructure.semanticHTML = semanticTags.length > 0;

  // Issue if no H1 or bad hierarchy
  if (!checks.contentStructure.hasH1 || !checks.contentStructure.headingHierarchy) {
    checks.contentStructure.issueSeverity = 'medium';
  }
}

async function checkSitemap(baseUrl: string, checks: DetailedChecks): Promise<void> {
  const sitemapUrls = [
    `${baseUrl}/sitemap.xml`,
    `${baseUrl}/sitemap_index.xml`,
    `${baseUrl}/sitemap`,
  ];

  for (const url of sitemapUrls) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TechnicalSEOBot/1.0)' },
      });

      if (response.ok) {
        checks.sitemap.exists = true;
        checks.sitemap.url = url;
        return;
      }
    } catch (e) {
      // Continue to next URL
    }
  }

  checks.sitemap.issueSeverity = 'medium';
}

function checkCanonicalUrls($: cheerio.CheerioAPI, targetUrl: string, checks: DetailedChecks): void {
  const canonical = $('link[rel="canonical"]').attr('href');

  checks.canonicalUrls.hasCanonical = !!canonical;
  checks.canonicalUrls.canonicalUrl = canonical || null;

  if (!canonical) {
    checks.canonicalUrls.issueSeverity = 'low';
  }
}

function detectPaywall($: cheerio.CheerioAPI, html: string, checks: DetailedChecks): void {
  // Common paywall indicators
  const paywallKeywords = [
    'paywall',
    'subscribe to continue',
    'subscription required',
    'premium content',
    'members only',
    'sign in to read',
  ];

  const htmlLower = html.toLowerCase();
  const bodyText = $('body').text().toLowerCase();

  for (const keyword of paywallKeywords) {
    if (htmlLower.includes(keyword) || bodyText.includes(keyword)) {
      checks.paywall.detected = true;
      checks.paywall.type = 'freemium';
      checks.paywall.issueSeverity = 'medium';
      return;
    }
  }

  // Check for paywalled class names
  const paywallClasses = $('.paywall, .subscription-wall, .premium-content, [class*="paywall"]');
  if (paywallClasses.length > 0) {
    checks.paywall.detected = true;
    checks.paywall.type = 'hard-paywall';
    checks.paywall.issueSeverity = 'high';
  }
}

function detectCaptcha($: cheerio.CheerioAPI, html: string, checks: DetailedChecks): void {
  const htmlLower = html.toLowerCase();

  // Cloudflare
  if (htmlLower.includes('cloudflare') && (htmlLower.includes('captcha') || htmlLower.includes('challenge'))) {
    checks.captcha.detected = true;
    checks.captcha.provider = 'Cloudflare';
    checks.captcha.issueSeverity = 'high';
    return;
  }

  // reCAPTCHA
  if (htmlLower.includes('recaptcha') || htmlLower.includes('g-recaptcha')) {
    checks.captcha.detected = true;
    checks.captcha.provider = 'reCAPTCHA';
    checks.captcha.issueSeverity = 'medium';
    return;
  }

  // hCaptcha
  if (htmlLower.includes('hcaptcha')) {
    checks.captcha.detected = true;
    checks.captcha.provider = 'hCaptcha';
    checks.captcha.issueSeverity = 'medium';
  }
}

function detectPlatform($: cheerio.CheerioAPI, html: string, checks: DetailedChecks): void {
  const htmlLower = html.toLowerCase();
  const limitations: string[] = [];

  if (htmlLower.includes('wix.com') || htmlLower.includes('wixstatic')) {
    checks.platform.detected = 'Wix';
    limitations.push('Limited robots.txt control', 'No server-side rendering', 'Limited header modification');
    checks.platform.limitations = limitations;
    checks.platform.issueSeverity = 'medium';
  } else if (htmlLower.includes('squarespace')) {
    checks.platform.detected = 'Squarespace';
    limitations.push('Limited technical SEO control', 'No custom headers');
    checks.platform.limitations = limitations;
    checks.platform.issueSeverity = 'medium';
  } else if (htmlLower.includes('shopify')) {
    checks.platform.detected = 'Shopify';
    limitations.push('Limited server-side modifications');
    checks.platform.limitations = limitations;
    checks.platform.issueSeverity = 'low';
  } else if (htmlLower.includes('wordpress') || htmlLower.includes('wp-content')) {
    checks.platform.detected = 'WordPress';
    // WordPress is flexible, no inherent limitations
  }
}

function checkGeolocation(pageResponse: { headers: Headers }, checks: DetailedChecks): void {
  const cfIpCountry = pageResponse.headers.get('cf-ipcountry');

  if (cfIpCountry && cfIpCountry !== 'XX') {
    // Geolocation might be active (Cloudflare sets this)
    // Can't definitively say it's restricted without testing from different IPs
    checks.geolocation.restricted = false; // Conservative - don't flag unless we know for sure
  }
}

// ============================================================================
// SCORING
// ============================================================================

function calculateScores(checks: DetailedChecks): { overall: number; aiSearchability: number; technicalSeo: number } {
  let aiSearchabilityScore = 100;
  let technicalSeoScore = 100;

  // AI Searchability deductions
  if (checks.robotsTxt.blocksAICrawlers) aiSearchabilityScore -= 30;
  if (checks.metaRobots.hasNoIndex) aiSearchabilityScore -= 40;
  if (!checks.rendering.contentInInitialHTML) aiSearchabilityScore -= 20;
  if (checks.captcha.detected) aiSearchabilityScore -= 15;
  if (checks.paywall.detected) aiSearchabilityScore -= 10;

  // Technical SEO deductions
  if (!checks.schemaMarkup.hasSchema) technicalSeoScore -= 15;
  if (!checks.contentStructure.hasH1) technicalSeoScore -= 10;
  if (!checks.contentStructure.headingHierarchy) technicalSeoScore -= 10;
  if (!checks.sitemap.exists) technicalSeoScore -= 10;
  if (!checks.canonicalUrls.hasCanonical) technicalSeoScore -= 5;
  if (!checks.contentStructure.semanticHTML) technicalSeoScore -= 10;
  if (checks.pageSpeed.responseTime > 3000) technicalSeoScore -= 15;
  if (checks.platform.detected && checks.platform.limitations.length > 0) technicalSeoScore -= 10;

  // Ensure scores don't go below 0
  aiSearchabilityScore = Math.max(0, aiSearchabilityScore);
  technicalSeoScore = Math.max(0, technicalSeoScore);

  const overallScore = Math.round((aiSearchabilityScore + technicalSeoScore) / 2);

  return {
    overall: overallScore,
    aiSearchability: aiSearchabilityScore,
    technicalSeo: technicalSeoScore,
  };
}

// ============================================================================
// ISSUE GENERATION
// ============================================================================

function generateAgencyIssues(checks: DetailedChecks): TechnicalSEOIssue[] {
  const issues: TechnicalSEOIssue[] = [];

  // 1. robots.txt
  if (checks.robotsTxt.blocksAICrawlers) {
    issues.push({
      category: 'robots-txt',
      severity: 'critical',
      issue: `robots.txt blocks ${checks.robotsTxt.blockedBots.join(', ')}`,
      impact: 'AI search engines cannot crawl your content',
      fix: 'Update robots.txt to allow AI crawlers (GPTBot, ClaudeBot, PerplexityBot, etc.)',
      estimatedCost: '$500-$1,500',
      timeToFix: '1-2 hours',
      difficulty: 'easy',
    });
  }

  // 2. Meta robots
  if (checks.metaRobots.hasNoIndex) {
    issues.push({
      category: 'meta-robots',
      severity: 'critical',
      issue: 'Page has noindex directive',
      impact: 'Search engines and AI cannot index this page',
      fix: 'Remove noindex meta tag or X-Robots-Tag header',
      estimatedCost: '$300-$800',
      timeToFix: '1-2 hours',
      difficulty: 'easy',
    });
  }

  // 3. JavaScript rendering
  if (!checks.rendering.contentInInitialHTML) {
    issues.push({
      category: 'javascript-rendering',
      severity: 'high',
      issue: 'Content only loads client-side via JavaScript',
      impact: 'AI crawlers see empty page, missing all content',
      fix: checks.rendering.jsFramework
        ? `Implement server-side rendering (SSR) for ${checks.rendering.jsFramework}`
        : 'Implement server-side rendering or static site generation',
      estimatedCost: '$2,000-$5,000',
      timeToFix: '1-2 weeks',
      difficulty: 'hard',
    });
  }

  // 4. Schema markup
  if (!checks.schemaMarkup.hasSchema) {
    issues.push({
      category: 'schema-markup',
      severity: 'medium',
      issue: 'No schema.org markup detected',
      impact: 'AI engines have less structured data to understand content',
      fix: 'Add JSON-LD schema markup (Article, Organization, etc.)',
      estimatedCost: '$800-$1,500',
      timeToFix: '4-8 hours',
      difficulty: 'medium',
    });
  }

  // 5. Content structure
  if (!checks.contentStructure.hasH1 || !checks.contentStructure.headingHierarchy) {
    issues.push({
      category: 'content-structure',
      severity: 'medium',
      issue: checks.contentStructure.hasH1
        ? 'Improper heading hierarchy (skipping levels)'
        : 'Missing H1 heading',
      impact: 'AI engines have difficulty understanding content structure',
      fix: 'Restructure headings with proper H1 → H2 → H3 hierarchy',
      estimatedCost: '$500-$1,200',
      timeToFix: '3-6 hours',
      difficulty: 'easy',
    });
  }

  // 6. Page speed
  if (checks.pageSpeed.responseTime > 3000) {
    issues.push({
      category: 'page-speed',
      severity: 'medium',
      issue: `Slow response time (${Math.round(checks.pageSpeed.responseTime)}ms)`,
      impact: 'AI crawlers may timeout or skip slow pages',
      fix: 'Optimize images, enable compression, implement CDN, minimize JavaScript',
      estimatedCost: '$1,000-$2,500',
      timeToFix: '1-2 weeks',
      difficulty: 'medium',
    });
  }

  // 7. Sitemap
  if (!checks.sitemap.exists) {
    issues.push({
      category: 'sitemap',
      severity: 'medium',
      issue: 'No XML sitemap found',
      impact: 'AI crawlers may miss important pages',
      fix: 'Generate and submit XML sitemap',
      estimatedCost: '$400-$1,000',
      timeToFix: '2-4 hours',
      difficulty: 'easy',
    });
  }

  // 8. Canonical URLs
  if (!checks.canonicalUrls.hasCanonical) {
    issues.push({
      category: 'canonical-urls',
      severity: 'low',
      issue: 'No canonical URL specified',
      impact: 'Potential duplicate content issues',
      fix: 'Add canonical link tag to all pages',
      estimatedCost: '$400-$800',
      timeToFix: '2-4 hours',
      difficulty: 'easy',
    });
  }

  return issues;
}

function generateOwnerIssues(checks: DetailedChecks): OwnerIssue[] {
  const issues: OwnerIssue[] = [];

  // 1. Paywall
  if (checks.paywall.detected) {
    issues.push({
      category: 'paywall',
      severity: checks.paywall.type === 'hard-paywall' ? 'high' : 'medium',
      issue: `Content behind ${checks.paywall.type}`,
      impact: 'AI cannot access full content for summaries and answers',
      recommendation: 'Consider exposing article abstracts or using structured data to provide key information',
      ownerAction: 'Modify paywall strategy or add schema markup with article summary',
      difficulty: 'business-decision',
    });
  }

  // 2. CAPTCHA
  if (checks.captcha.detected) {
    issues.push({
      category: 'captcha',
      severity: 'high',
      issue: `${checks.captcha.provider} blocks automated access`,
      impact: 'Legitimate AI crawlers are blocked entirely',
      recommendation: `Whitelist AI crawler user-agents in ${checks.captcha.provider} settings`,
      ownerAction: `Update ${checks.captcha.provider} firewall rules to allow GPTBot, ClaudeBot, PerplexityBot`,
      difficulty: 'easy-if-access',
    });
  }

  // 3. Platform limitations
  if (checks.platform.detected && checks.platform.limitations.length > 0) {
    issues.push({
      category: 'platform-limitations',
      severity: 'medium',
      issue: `${checks.platform.detected} platform has technical limitations`,
      impact: checks.platform.limitations.join('; '),
      recommendation: 'Consider platform migration or work within constraints',
      ownerAction: `Evaluate ${checks.platform.detected} limitations vs business needs`,
      difficulty: 'platform-limitation',
    });
  }

  return issues;
}

// ============================================================================
// RECOMMENDATIONS
// ============================================================================

function generateRecommendations(
  agencyIssues: TechnicalSEOIssue[],
  ownerIssues: OwnerIssue[]
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Sort agency issues by severity
  const sortedAgencyIssues = [...agencyIssues].sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  // Add top 3 agency fixes
  sortedAgencyIssues.slice(0, 3).forEach((issue, index) => {
    recommendations.push({
      priority: index + 1,
      action: issue.fix,
      benefit: issue.impact,
      cost: issue.estimatedCost,
      timeframe: issue.timeToFix,
      type: 'agency-fix',
    });
  });

  // Add critical owner actions
  ownerIssues
    .filter(issue => issue.severity === 'high' || issue.severity === 'critical')
    .forEach((issue, index) => {
      recommendations.push({
        priority: sortedAgencyIssues.length + index + 1,
        action: issue.ownerAction,
        benefit: issue.impact,
        cost: '$0 (owner self-service)',
        timeframe: issue.difficulty === 'easy-if-access' ? '15-30 minutes' : 'Varies',
        type: 'owner-action',
      });
    });

  return recommendations;
}

function calculateCostEstimate(issues: TechnicalSEOIssue[]): string {
  let minCost = 0;
  let maxCost = 0;

  issues.forEach(issue => {
    const costRange = issue.estimatedCost.replace(/\$/g, '').split('-');
    if (costRange.length === 2) {
      minCost += parseInt(costRange[0].replace(/,/g, ''));
      maxCost += parseInt(costRange[1].replace(/,/g, ''));
    }
  });

  return `$${minCost.toLocaleString()}-$${maxCost.toLocaleString()}`;
}
