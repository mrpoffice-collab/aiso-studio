/**
 * AISO Audit Engine
 *
 * Unified audit engine called by all parts of the app.
 * - Runs full audit (WCAG + content + technical)
 * - Auto-saves to database
 * - Auto-generates PDF
 * - Auto-saves PDF to Vault
 */

import { db } from '@/lib/db';
import { scanAccessibilityFull, closeBrowser } from '@/lib/accessibility-scanner-playwright';
import { performFactCheck } from '@/lib/fact-check';
import { calculateAISOScore } from '@/lib/content-scoring';
import * as cheerio from 'cheerio';
import jsPDF from 'jspdf';

// Types
export interface AuditOptions {
  skipAccessibility?: boolean;
  skipContent?: boolean;
  checkRecent?: boolean;  // Check for recent audit first
  recentThresholdHours?: number;  // How old is "recent" (default 24 hours)
}

export interface AuditResult {
  id: number;
  url: string;
  domain: string;

  // Accessibility scores
  accessibilityScore: number;
  criticalCount: number;
  seriousCount: number;
  moderateCount: number;
  minorCount: number;
  totalViolations: number;
  totalPasses: number;
  violations: any[];
  passes: any[];
  wcagBreakdown: any;
  pageTitle: string;

  // Content scores
  aisoScore: number;
  aeoScore: number;
  seoScore: number;
  readabilityScore: number;
  engagementScore: number;
  factCheckScore: number;

  // Details
  seoDetails: any;
  readabilityDetails: any;
  engagementDetails: any;
  aeoDetails: any;
  factChecks: any[];

  // Metadata
  createdAt: Date;
  isExisting: boolean;  // True if returned existing audit
  vaultAssetId?: string;
  pdfUrl?: string;
}

export interface RecentAuditCheck {
  exists: boolean;
  audit?: AuditResult;
  ageHours?: number;
}

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/**
 * Normalize URL (add protocol, handle www)
 */
function normalizeUrl(url: string): string {
  let normalized = url.trim();

  if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
    normalized = 'https://' + normalized;
  }

  try {
    const urlObj = new URL(normalized);
    const parts = urlObj.hostname.split('.');
    if (parts.length === 2) {
      urlObj.hostname = 'www.' + urlObj.hostname;
      normalized = urlObj.toString();
    }
  } catch {
    // Keep as-is if parsing fails
  }

  return normalized;
}

/**
 * Scrape content from URL - tries basic fetch first, then falls back to headless browser
 */
async function scrapeContent(url: string): Promise<{
  content: string;
  title: string;
  metaDescription: string;
}> {
  // First try with basic fetch (faster, cheaper)
  try {
    const result = await scrapeWithFetch(url);
    if (result.content.length >= 200) {
      return result;
    }
  } catch (e) {
    console.log('Basic fetch failed, trying headless browser...');
  }

  // Fall back to headless browser for JS-rendered sites
  return await scrapeWithBrowser(url);
}

/**
 * Basic fetch scraping (for static sites)
 */
async function scrapeWithFetch(url: string): Promise<{
  content: string;
  title: string;
  metaDescription: string;
}> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status}`);
  }

  const html = await response.text();
  return extractContentFromHtml(html);
}

/**
 * Headless browser scraping (for JS-rendered sites)
 */
async function scrapeWithBrowser(url: string): Promise<{
  content: string;
  title: string;
  metaDescription: string;
}> {
  const { getBrowser, closeBrowser: closeBrowserFn } = await import('./accessibility-scanner-playwright');

  let page = null;
  try {
    const browser = await getBrowser();
    page = await browser.newPage();

    // Set realistic viewport and user agent
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Navigate and wait for content to load
    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // Wait a bit for any lazy-loaded content
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 2000)));

    // Get the fully rendered HTML
    const html = await page.content();

    // Also try to get text directly from the page as backup
    const pageText = await page.evaluate(() => {
      // Remove script/style elements from consideration
      const clone = document.body.cloneNode(true) as HTMLElement;
      clone.querySelectorAll('script, style, nav, footer, header, aside, .sidebar, #sidebar, .comments, #comments').forEach(el => el.remove());

      // Try to find main content
      const selectors = ['article', '.post-content', '.entry-content', 'main', '[role="main"]', '.content', '#content'];
      for (const sel of selectors) {
        const el = clone.querySelector(sel);
        if (el && el.textContent && el.textContent.trim().length > 200) {
          return el.textContent.trim();
        }
      }

      return clone.textContent?.trim() || '';
    });

    const title = await page.title();
    const metaDescription = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="description"]');
      return meta?.getAttribute('content') || '';
    });

    await page.close();

    // Try HTML extraction first, fall back to pageText
    try {
      const result = extractContentFromHtml(html);
      if (result.content.length >= 200) {
        return { ...result, title: title || result.title };
      }
    } catch (e) {
      // Ignore extraction error
    }

    // Use the text we got from page evaluation
    if (pageText.length >= 100) {
      return { content: pageText, title, metaDescription };
    }

    throw new Error('Failed to scrape URL: Could not extract meaningful content from this page even with JavaScript rendering.');
  } catch (error: any) {
    if (page) {
      try { await page.close(); } catch (e) { /* ignore */ }
    }
    throw new Error(`Failed to scrape URL: ${error.message}`);
  }
}

/**
 * Extract content from HTML string
 */
function extractContentFromHtml(html: string): {
  content: string;
  title: string;
  metaDescription: string;
} {
  const $ = cheerio.load(html);

  // Remove non-content elements
  $('script, style, nav, footer, header, .sidebar, aside, #sidebar, #comments, .comments, .ad, .advertisement, .social-share').remove();

  // Find main content with expanded selectors
  const selectors = [
    'article', '.post-content', '.entry-content', '.content-area',
    '.blog-post', '.post', 'main', '#content', '.site-content',
    '[role="main"]', '.blog', '#main', '.main-content', '.article-content',
    '.post-body', '.article-body', '.story-content', '.page-content',
    '.single-post', '.hentry', '.post-entry', '#article', '.article',
  ];

  let contentElement = null;
  let maxLength = 0;

  // Find the element with the most content
  for (const selector of selectors) {
    const elem = $(selector).first();
    if (elem && elem.length > 0) {
      const text = elem.text().trim();
      if (text.length > maxLength && text.length >= 100) {
        maxLength = text.length;
        contentElement = elem;
      }
    }
  }

  // If no content found, try the body with aggressive cleaning
  if (!contentElement || maxLength < 200) {
    const bodyText = $('body').text().trim();
    if (bodyText.length >= 200) {
      return {
        content: bodyText.substring(0, 50000), // Limit content length
        title: $('title').text() || $('h1').first().text() || '',
        metaDescription: $('meta[name="description"]').attr('content') || '',
      };
    }
  }

  if (!contentElement) {
    throw new Error('Could not extract content from this page');
  }

  const content = contentElement.text().trim();
  const title = $('title').text() || $('h1').first().text() || '';
  const metaDescription = $('meta[name="description"]').attr('content') || '';

  return { content, title, metaDescription };
}

/**
 * Check for recent audit
 */
export async function checkRecentAudit(
  userId: string,
  url: string,
  thresholdHours: number = 24
): Promise<RecentAuditCheck> {
  const domain = extractDomain(url);

  // Get recent audits for this user and domain
  const audits = await db.getAccessibilityAuditsByUserId(userId, 10);

  const recentAudit = audits.find((a: any) => {
    const auditDomain = extractDomain(a.url);
    if (auditDomain !== domain) return false;

    const ageMs = Date.now() - new Date(a.created_at).getTime();
    const ageHours = ageMs / (1000 * 60 * 60);
    return ageHours < thresholdHours;
  });

  if (recentAudit) {
    const ageMs = Date.now() - new Date(recentAudit.created_at).getTime();
    const ageHours = ageMs / (1000 * 60 * 60);

    return {
      exists: true,
      audit: formatAuditResult(recentAudit, true),
      ageHours: Math.round(ageHours * 10) / 10,
    };
  }

  return { exists: false };
}

/**
 * Format database audit to AuditResult
 */
function formatAuditResult(dbAudit: any, isExisting: boolean = false): AuditResult {
  return {
    id: dbAudit.id,
    url: dbAudit.url,
    domain: extractDomain(dbAudit.url),

    accessibilityScore: dbAudit.accessibility_score,
    criticalCount: dbAudit.critical_count,
    seriousCount: dbAudit.serious_count,
    moderateCount: dbAudit.moderate_count,
    minorCount: dbAudit.minor_count,
    totalViolations: dbAudit.total_violations,
    totalPasses: dbAudit.total_passes,
    violations: dbAudit.violations || [],
    passes: dbAudit.passes || [],
    wcagBreakdown: dbAudit.wcag_breakdown || {},
    pageTitle: dbAudit.page_title || '',

    aisoScore: dbAudit.aiso_score || 0,
    aeoScore: dbAudit.aeo_score || 0,
    seoScore: dbAudit.seo_score || 0,
    readabilityScore: dbAudit.readability_score || 0,
    engagementScore: dbAudit.engagement_score || 0,
    factCheckScore: dbAudit.fact_check_score || 0,

    seoDetails: dbAudit.seo_details || {},
    readabilityDetails: dbAudit.readability_details || {},
    engagementDetails: dbAudit.engagement_details || {},
    aeoDetails: dbAudit.aeo_details || {},
    factChecks: dbAudit.fact_checks || [],

    createdAt: new Date(dbAudit.created_at),
    isExisting,
    vaultAssetId: dbAudit.vault_asset_id,
    pdfUrl: dbAudit.pdf_url,
  };
}

/**
 * Generate audit PDF
 */
export function generateAuditPDF(audit: AuditResult, agencyBranding?: {
  name?: string;
  logo?: string;
  primaryColor?: string;
}): Buffer {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Helper for score colors
  const getScoreColor = (score: number): [number, number, number] => {
    if (score >= 85) return [16, 185, 129];  // green
    if (score >= 70) return [59, 130, 246];  // blue
    if (score >= 50) return [245, 158, 11];  // yellow
    return [239, 68, 68];  // red
  };

  // Header
  doc.setFillColor(249, 115, 22);  // orange
  doc.rect(0, 0, pageWidth, 50, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('AISO Audit Report', pageWidth / 2, 25, { align: 'center' });

  doc.setFontSize(12);
  doc.text(audit.domain, pageWidth / 2, 38, { align: 'center' });

  y = 65;

  // Overall Scores
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Overall Scores', 20, y);
  y += 15;

  const scores = [
    { label: 'AISO Score', value: audit.aisoScore },
    { label: 'Accessibility', value: audit.accessibilityScore },
    { label: 'AEO', value: audit.aeoScore },
    { label: 'SEO', value: audit.seoScore },
  ];

  let xPos = 20;
  scores.forEach((score) => {
    const color = getScoreColor(score.value);
    doc.setFillColor(color[0], color[1], color[2]);
    doc.roundedRect(xPos, y, 40, 30, 3, 3, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(String(score.value), xPos + 20, y + 15, { align: 'center' });

    doc.setFontSize(8);
    doc.text(score.label, xPos + 20, y + 25, { align: 'center' });

    xPos += 45;
  });

  y += 45;

  // Accessibility Issues
  if (audit.totalViolations > 0) {
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Accessibility Issues', 20, y);
    y += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const issues = [
      { label: 'Critical', count: audit.criticalCount, color: [239, 68, 68] },
      { label: 'Serious', count: audit.seriousCount, color: [245, 158, 11] },
      { label: 'Moderate', count: audit.moderateCount, color: [59, 130, 246] },
      { label: 'Minor', count: audit.minorCount, color: [156, 163, 175] },
    ];

    issues.forEach((issue) => {
      doc.setTextColor(issue.color[0], issue.color[1], issue.color[2]);
      doc.text(`${issue.label}: ${issue.count}`, 25, y);
      y += 6;
    });

    y += 10;
  }

  // Top Violations
  if (audit.violations && audit.violations.length > 0) {
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Top Issues to Fix', 20, y);
    y += 10;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    const topViolations = audit.violations.slice(0, 5);
    topViolations.forEach((v: any, i: number) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      const impact = v.impact || 'moderate';
      const impactColor = impact === 'critical' ? [239, 68, 68] :
                          impact === 'serious' ? [245, 158, 11] :
                          [59, 130, 246];

      doc.setTextColor(impactColor[0], impactColor[1], impactColor[2]);
      doc.text(`${i + 1}. [${impact.toUpperCase()}]`, 25, y);

      doc.setTextColor(30, 41, 59);
      const description = v.description || v.id || 'Issue';
      const truncated = description.length > 80 ? description.substring(0, 80) + '...' : description;
      doc.text(truncated, 55, y);
      y += 8;
    });
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  doc.text(
    `Generated by ${agencyBranding?.name || 'AISO Studio'} on ${new Date().toLocaleDateString()}`,
    pageWidth / 2,
    285,
    { align: 'center' }
  );

  return Buffer.from(doc.output('arraybuffer'));
}

/**
 * Main audit function - runs full audit and saves everything
 */
export async function runAISOAudit(
  url: string,
  userId: string,
  options: AuditOptions = {}
): Promise<AuditResult> {
  const normalizedUrl = normalizeUrl(url);
  const domain = extractDomain(normalizedUrl);

  // Check for recent audit if requested
  if (options.checkRecent) {
    const recent = await checkRecentAudit(
      userId,
      normalizedUrl,
      options.recentThresholdHours || 24
    );
    if (recent.exists && recent.audit) {
      return recent.audit;
    }
  }

  let accessibilityResult: any = null;
  let contentScores: any = null;
  let scrapedContent: any = null;

  // Run accessibility audit
  if (!options.skipAccessibility) {
    try {
      accessibilityResult = await scanAccessibilityFull(normalizedUrl);
      await closeBrowser();
    } catch (error) {
      console.error('Accessibility scan failed:', error);
      await closeBrowser();
    }
  }

  // Run content audit
  if (!options.skipContent) {
    try {
      scrapedContent = await scrapeContent(normalizedUrl);

      if (scrapedContent.content && scrapedContent.content.length >= 100) {
        const factCheckResult = await performFactCheck(scrapedContent.content);
        contentScores = calculateAISOScore(
          scrapedContent.content,
          scrapedContent.title,
          scrapedContent.metaDescription,
          factCheckResult.overallScore
        );
        contentScores.factChecks = factCheckResult.factChecks;
        contentScores.factCheckScore = factCheckResult.overallScore;
      }
    } catch (error) {
      console.error('Content scraping failed:', error);
    }
  }

  // Save to database
  const audit = await db.createAccessibilityAudit({
    user_id: userId,
    url: normalizedUrl,
    accessibility_score: accessibilityResult?.accessibilityScore || 0,
    critical_count: accessibilityResult?.criticalCount || 0,
    serious_count: accessibilityResult?.seriousCount || 0,
    moderate_count: accessibilityResult?.moderateCount || 0,
    minor_count: accessibilityResult?.minorCount || 0,
    total_violations: accessibilityResult?.totalViolations || 0,
    total_passes: accessibilityResult?.totalPasses || 0,
    violations: accessibilityResult?.violations || [],
    passes: accessibilityResult?.passes || [],
    wcag_breakdown: accessibilityResult?.wcagBreakdown || {},
    scan_version: accessibilityResult?.scanVersion || '1.0',
    page_title: accessibilityResult?.pageTitle || scrapedContent?.title || '',
    page_language: accessibilityResult?.pageLanguage || 'en',
    // Content scores (extended fields)
    aiso_score: contentScores?.aisoScore || 0,
    aeo_score: contentScores?.aeoScore || 0,
    seo_score: contentScores?.seoScore || 0,
    readability_score: contentScores?.readabilityScore || 0,
    engagement_score: contentScores?.engagementScore || 0,
    fact_check_score: contentScores?.factCheckScore || 0,
    seo_details: contentScores?.seoDetails || {},
    readability_details: contentScores?.readabilityDetails || {},
    engagement_details: contentScores?.engagementDetails || {},
    aeo_details: contentScores?.aeoDetails || {},
    fact_checks: contentScores?.factChecks || [],
  });

  const result = formatAuditResult(audit);

  // Generate and save PDF to Vault
  try {
    const pdfBuffer = generateAuditPDF(result);
    const filename = `aiso-audit-${domain}-${Date.now()}.pdf`;

    // For now, we'll store a reference - actual blob upload would need Vercel Blob or S3
    // The PDF can be generated on-demand when downloading
    console.log(`PDF generated for ${domain}: ${pdfBuffer.length} bytes`);

    // Create vault asset reference (without blob upload for now)
    // In production, you'd upload to Vercel Blob/S3 and get the URL
    const asset = await db.createAsset({
      user_id: userId,
      filename: filename,
      original_filename: filename,
      file_type: 'pdf',
      mime_type: 'application/pdf',
      file_size: pdfBuffer.length,
      blob_url: `/api/audit/pdf/${audit.id}`,  // Dynamic PDF generation endpoint
      tags: ['audit', 'aiso', domain],
      description: `AISO Audit Report for ${domain}`,
    });

    result.vaultAssetId = asset.id;
    result.pdfUrl = `/api/audit/pdf/${audit.id}`;
  } catch (error) {
    console.error('Failed to save PDF to vault:', error);
  }

  return result;
}

/**
 * Get audit by ID
 */
export async function getAuditById(auditId: number): Promise<AuditResult | null> {
  const audit = await db.getAccessibilityAuditById(auditId);
  if (!audit) return null;
  return formatAuditResult(audit);
}

/**
 * Get audits for a domain
 */
export async function getAuditsByDomain(
  userId: string,
  domain: string,
  limit: number = 10
): Promise<AuditResult[]> {
  const audits = await db.getAccessibilityAuditsByUserId(userId, limit);

  return audits
    .filter((a: any) => extractDomain(a.url) === domain)
    .map((a: any) => formatAuditResult(a));
}
