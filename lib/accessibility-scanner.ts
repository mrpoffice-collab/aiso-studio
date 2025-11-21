// Simple accessibility scanner that analyzes HTML content
// Uses pattern-based detection for common WCAG violations

import * as cheerio from 'cheerio';

export interface AccessibilityViolation {
  id: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  description: string;
  help: string;
  helpUrl: string;
  wcagTags: string[];
  nodes: {
    html: string;
    target: string[];
    failureSummary: string;
  }[];
}

export interface WcagBreakdown {
  perceivable: { violations: number; score: number };
  operable: { violations: number; score: number };
  understandable: { violations: number; score: number };
  robust: { violations: number; score: number };
}

export interface AccessibilityScanResult {
  url: string;
  accessibilityScore: number;
  criticalCount: number;
  seriousCount: number;
  moderateCount: number;
  minorCount: number;
  totalViolations: number;
  totalPasses: number;
  violations: AccessibilityViolation[];
  passes: { id: string; description: string }[];
  wcagBreakdown: WcagBreakdown;
  scanVersion: string;
  pageTitle: string;
  pageLanguage: string;
}

// Fetch HTML content from URL
async function fetchHTML(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'AISO-AccessibilityScanner/1.0',
    },
  });
  return await response.text();
}

type CheerioAPI = ReturnType<typeof cheerio.load>;

// Check for images without alt text
function checkImageAlt($: CheerioAPI): AccessibilityViolation | null {
  const violations: { html: string; target: string[]; failureSummary: string }[] = [];

  $('img').each((idx, el) => {
    const alt = $(el).attr('alt');
    if (alt === undefined) {
      violations.push({
        html: $.html(el).substring(0, 200),
        target: [`img:nth-of-type(${idx + 1})`],
        failureSummary: 'Image does not have an alt attribute',
      });
    }
  });

  if (violations.length === 0) return null;

  return {
    id: 'image-alt',
    impact: 'critical',
    description: 'Images must have alternate text',
    help: 'Images must have alternate text',
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/image-alt',
    wcagTags: ['wcag2a', 'wcag111'],
    nodes: violations,
  };
}

// Check for empty links
function checkLinkName($: CheerioAPI): AccessibilityViolation | null {
  const violations: { html: string; target: string[]; failureSummary: string }[] = [];

  $('a').each((idx, el) => {
    const text = $(el).text().trim();
    const ariaLabel = $(el).attr('aria-label');
    const title = $(el).attr('title');

    if (!text && !ariaLabel && !title) {
      violations.push({
        html: $.html(el).substring(0, 200),
        target: [`a:nth-of-type(${idx + 1})`],
        failureSummary: 'Link has no discernible text',
      });
    }
  });

  if (violations.length === 0) return null;

  return {
    id: 'link-name',
    impact: 'serious',
    description: 'Links must have discernible text',
    help: 'Links must have discernible text',
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/link-name',
    wcagTags: ['wcag2a', 'wcag244'],
    nodes: violations,
  };
}

// Check for buttons without accessible names
function checkButtonName($: CheerioAPI): AccessibilityViolation | null {
  const violations: { html: string; target: string[]; failureSummary: string }[] = [];

  $('button, [role="button"]').each((idx, el) => {
    const text = $(el).text().trim();
    const ariaLabel = $(el).attr('aria-label');
    const title = $(el).attr('title');

    if (!text && !ariaLabel && !title) {
      violations.push({
        html: $.html(el).substring(0, 200),
        target: [`button:nth-of-type(${idx + 1})`],
        failureSummary: 'Button has no accessible name',
      });
    }
  });

  if (violations.length === 0) return null;

  return {
    id: 'button-name',
    impact: 'critical',
    description: 'Buttons must have discernible text',
    help: 'Buttons must have discernible text',
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/button-name',
    wcagTags: ['wcag2a', 'wcag412'],
    nodes: violations,
  };
}

// Check for missing form labels
function checkFormLabels($: CheerioAPI): AccessibilityViolation | null {
  const violations: { html: string; target: string[]; failureSummary: string }[] = [];

  $('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea, select').each((idx, el) => {
    const id = $(el).attr('id');
    const ariaLabel = $(el).attr('aria-label');
    const ariaLabelledBy = $(el).attr('aria-labelledby');
    const placeholder = $(el).attr('placeholder');

    let hasLabel = false;
    if (id) {
      const label = $(`label[for="${id}"]`);
      if (label.length > 0) hasLabel = true;
    }

    if (!hasLabel && !ariaLabel && !ariaLabelledBy) {
      violations.push({
        html: $.html(el).substring(0, 200),
        target: [`input:nth-of-type(${idx + 1})`],
        failureSummary: placeholder
          ? 'Form element uses placeholder instead of label'
          : 'Form element does not have a label',
      });
    }
  });

  if (violations.length === 0) return null;

  return {
    id: 'label',
    impact: 'critical',
    description: 'Form elements must have labels',
    help: 'Form <input> elements must have labels',
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/label',
    wcagTags: ['wcag2a', 'wcag131', 'wcag412'],
    nodes: violations,
  };
}

// Check for missing lang attribute
function checkHtmlLang($: CheerioAPI): AccessibilityViolation | null {
  const lang = $('html').attr('lang');

  if (!lang) {
    return {
      id: 'html-has-lang',
      impact: 'serious',
      description: '<html> element must have a lang attribute',
      help: '<html> element must have a lang attribute',
      helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/html-has-lang',
      wcagTags: ['wcag2a', 'wcag311'],
      nodes: [{
        html: '<html>',
        target: ['html'],
        failureSummary: 'The <html> element does not have a lang attribute',
      }],
    };
  }

  return null;
}

// Check heading structure
function checkHeadingOrder($: CheerioAPI): AccessibilityViolation | null {
  const violations: { html: string; target: string[]; failureSummary: string }[] = [];

  let lastLevel = 0;
  $('h1, h2, h3, h4, h5, h6').each((idx, el) => {
    const tagName = el.tagName.toLowerCase();
    const level = parseInt(tagName[1]);
    if (lastLevel > 0 && level > lastLevel + 1) {
      violations.push({
        html: $.html(el).substring(0, 200),
        target: [`${tagName}:nth-of-type(${idx + 1})`],
        failureSummary: `Heading level skipped from H${lastLevel} to H${level}`,
      });
    }
    lastLevel = level;
  });

  if (violations.length === 0) return null;

  return {
    id: 'heading-order',
    impact: 'moderate',
    description: 'Heading levels should only increase by one',
    help: 'Heading levels should only increase by one',
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/heading-order',
    wcagTags: ['wcag2a', 'wcag131'],
    nodes: violations,
  };
}

// Check for empty headings
function checkEmptyHeadings($: CheerioAPI): AccessibilityViolation | null {
  const violations: { html: string; target: string[]; failureSummary: string }[] = [];

  $('h1, h2, h3, h4, h5, h6').each((idx, el) => {
    const tagName = el.tagName.toLowerCase();
    if (!$(el).text().trim()) {
      violations.push({
        html: $.html(el).substring(0, 200),
        target: [`${tagName}:nth-of-type(${idx + 1})`],
        failureSummary: 'Heading is empty',
      });
    }
  });

  if (violations.length === 0) return null;

  return {
    id: 'empty-heading',
    impact: 'minor',
    description: 'Headings must not be empty',
    help: 'Headings must not be empty',
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/empty-heading',
    wcagTags: ['wcag2a', 'wcag131'],
    nodes: violations,
  };
}

// Check for missing document title
function checkDocumentTitle($: CheerioAPI): AccessibilityViolation | null {
  const title = $('title').text().trim();

  if (!title) {
    return {
      id: 'document-title',
      impact: 'serious',
      description: 'Documents must have <title> element to aid in navigation',
      help: 'Documents must have <title> element',
      helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/document-title',
      wcagTags: ['wcag2a', 'wcag242'],
      nodes: [{
        html: '<head>...</head>',
        target: ['head'],
        failureSummary: 'Document does not have a title element',
      }],
    };
  }

  return null;
}

// Check for tables without headers
function checkTableHeaders($: CheerioAPI): AccessibilityViolation | null {
  const violations: { html: string; target: string[]; failureSummary: string }[] = [];

  $('table').each((idx, el) => {
    const hasHeaders = $(el).find('th').length > 0;
    if (!hasHeaders) {
      violations.push({
        html: $.html(el).substring(0, 300),
        target: [`table:nth-of-type(${idx + 1})`],
        failureSummary: 'Table does not have header cells',
      });
    }
  });

  if (violations.length === 0) return null;

  return {
    id: 'table-header',
    impact: 'serious',
    description: 'Data tables must have headers',
    help: 'Tables should have headers',
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/td-headers-attr',
    wcagTags: ['wcag2a', 'wcag131'],
    nodes: violations,
  };
}

// Calculate accessibility score
function calculateScore(violations: AccessibilityViolation[], totalChecks: number): number {
  const weights = {
    critical: 25,
    serious: 15,
    moderate: 8,
    minor: 3,
  };

  let deductions = 0;
  for (const v of violations) {
    deductions += weights[v.impact] * Math.min(v.nodes.length, 5);
  }

  const passBonus = Math.min((totalChecks - violations.length) * 2, 15);
  return Math.max(0, Math.min(100, 100 - deductions + passBonus));
}

// Map violations to WCAG principles
function getWcagBreakdown(violations: AccessibilityViolation[]): WcagBreakdown {
  const breakdown: WcagBreakdown = {
    perceivable: { violations: 0, score: 100 },
    operable: { violations: 0, score: 100 },
    understandable: { violations: 0, score: 100 },
    robust: { violations: 0, score: 100 },
  };

  const principleMap: Record<string, keyof WcagBreakdown> = {
    'image-alt': 'perceivable',
    'link-name': 'operable',
    'button-name': 'operable',
    'label': 'understandable',
    'html-has-lang': 'understandable',
    'heading-order': 'perceivable',
    'empty-heading': 'perceivable',
    'document-title': 'operable',
    'table-header': 'perceivable',
  };

  for (const v of violations) {
    const principle = principleMap[v.id] || 'robust';
    breakdown[principle].violations++;

    const deduction = v.impact === 'critical' ? 20 :
                      v.impact === 'serious' ? 12 :
                      v.impact === 'moderate' ? 6 : 3;
    breakdown[principle].score = Math.max(0, breakdown[principle].score - deduction);
  }

  return breakdown;
}

export async function scanAccessibility(url: string): Promise<AccessibilityScanResult> {
  // Fetch HTML
  const html = await fetchHTML(url);
  const $ = cheerio.load(html);

  // Get page metadata
  const pageTitle = $('title').text() || 'Unknown';
  const pageLanguage = $('html').attr('lang') || 'unknown';

  // Run all checks
  const checks = [
    { fn: checkImageAlt, name: 'imagealt' },
    { fn: checkLinkName, name: 'linkname' },
    { fn: checkButtonName, name: 'buttonname' },
    { fn: checkFormLabels, name: 'formlabels' },
    { fn: checkHtmlLang, name: 'htmllang' },
    { fn: checkHeadingOrder, name: 'headingorder' },
    { fn: checkEmptyHeadings, name: 'emptyheadings' },
    { fn: checkDocumentTitle, name: 'documenttitle' },
    { fn: checkTableHeaders, name: 'tableheaders' },
  ];

  const violations: AccessibilityViolation[] = [];
  const passes: { id: string; description: string }[] = [];

  for (const check of checks) {
    const result = check.fn($);
    if (result) {
      violations.push(result);
    } else {
      passes.push({
        id: check.name,
        description: `${check.name} check passed`,
      });
    }
  }

  // Count by severity
  const criticalCount = violations.filter(v => v.impact === 'critical').length;
  const seriousCount = violations.filter(v => v.impact === 'serious').length;
  const moderateCount = violations.filter(v => v.impact === 'moderate').length;
  const minorCount = violations.filter(v => v.impact === 'minor').length;

  // Calculate scores
  const accessibilityScore = calculateScore(violations, checks.length);
  const wcagBreakdown = getWcagBreakdown(violations);

  return {
    url,
    accessibilityScore,
    criticalCount,
    seriousCount,
    moderateCount,
    minorCount,
    totalViolations: violations.length,
    totalPasses: passes.length,
    violations,
    passes,
    wcagBreakdown,
    scanVersion: '1.0-cheerio',
    pageTitle,
    pageLanguage,
  };
}

// No browser to close in static analysis
export async function closeBrowser(): Promise<void> {
  // No-op for static analysis
}
