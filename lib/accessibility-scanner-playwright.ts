// Full accessibility scanner using Puppeteer + axe-core
// Uses @sparticuz/chromium for Vercel serverless compatibility

import chromium from '@sparticuz/chromium';
import puppeteer, { Browser, Page } from 'puppeteer-core';
import { AxePuppeteer } from '@axe-core/puppeteer';

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

let browser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browser) {
    const isLocal = process.env.NODE_ENV === 'development' || !process.env.AWS_LAMBDA_FUNCTION_NAME;

    if (isLocal) {
      // Local development - use regular puppeteer
      const puppeteerFull = await import('puppeteer');
      browser = await puppeteerFull.default.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    } else {
      // Vercel/serverless - use @sparticuz/chromium
      browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: { width: 1920, height: 1080 },
        executablePath: await chromium.executablePath(),
        headless: true,
      });
    }
  }
  return browser;
}

export async function closeBrowser(): Promise<void> {
  if (browser) {
    await browser.close();
    browser = null;
  }
}

// Map axe-core tags to WCAG principles
function getWcagPrinciple(tags: string[]): 'perceivable' | 'operable' | 'understandable' | 'robust' {
  const tagStr = tags.join(',').toLowerCase();

  if (tagStr.includes('wcag1') || tags.some(t => t.match(/^wcag21[0-9]/))) {
    return 'perceivable';
  }
  if (tagStr.includes('wcag22') || tagStr.includes('wcag24')) {
    return 'operable';
  }
  if (tagStr.includes('wcag3')) {
    return 'understandable';
  }
  if (tagStr.includes('wcag4')) {
    return 'robust';
  }

  if (tags.some(t => ['cat.text-alternatives', 'cat.color', 'cat.sensory-and-visual-cues'].includes(t))) {
    return 'perceivable';
  }
  if (tags.some(t => ['cat.keyboard', 'cat.time-and-media', 'cat.navigation'].includes(t))) {
    return 'operable';
  }
  if (tags.some(t => ['cat.language', 'cat.forms', 'cat.parsing'].includes(t))) {
    return 'understandable';
  }

  return 'robust';
}

export async function scanAccessibilityFull(url: string): Promise<AccessibilityScanResult> {
  const browserInstance = await getBrowser();
  const page: Page = await browserInstance.newPage();

  try {
    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    const pageTitle = await page.title();
    const pageLanguage = await page.evaluate(() => document.documentElement.lang || 'unknown');

    // Run axe-core accessibility scan
    const axeResults = await new AxePuppeteer(page)
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
      .analyze();

    // Process violations
    const violations: AccessibilityViolation[] = axeResults.violations.map(v => ({
      id: v.id,
      impact: v.impact as 'critical' | 'serious' | 'moderate' | 'minor',
      description: v.description,
      help: v.help,
      helpUrl: v.helpUrl,
      wcagTags: v.tags,
      nodes: v.nodes.map(n => ({
        html: n.html,
        target: n.target.map(t => String(t)),
        failureSummary: n.failureSummary || '',
      })),
    }));

    const passes = axeResults.passes.map(p => ({
      id: p.id,
      description: p.description,
    }));

    const criticalCount = violations.filter(v => v.impact === 'critical').length;
    const seriousCount = violations.filter(v => v.impact === 'serious').length;
    const moderateCount = violations.filter(v => v.impact === 'moderate').length;
    const minorCount = violations.filter(v => v.impact === 'minor').length;
    const totalViolations = violations.length;
    const totalPasses = passes.length;

    const wcagBreakdown: WcagBreakdown = {
      perceivable: { violations: 0, score: 100 },
      operable: { violations: 0, score: 100 },
      understandable: { violations: 0, score: 100 },
      robust: { violations: 0, score: 100 },
    };

    violations.forEach(v => {
      const principle = getWcagPrinciple(v.wcagTags);
      wcagBreakdown[principle].violations++;
      const deduction = v.impact === 'critical' ? 25 : v.impact === 'serious' ? 15 : v.impact === 'moderate' ? 8 : 3;
      wcagBreakdown[principle].score = Math.max(0, wcagBreakdown[principle].score - deduction);
    });

    const totalRules = totalViolations + totalPasses;
    let accessibilityScore = 100;

    if (totalRules > 0) {
      const weightedDeduction = (criticalCount * 15) + (seriousCount * 10) + (moderateCount * 5) + (minorCount * 2);
      accessibilityScore = Math.max(0, Math.round(100 - weightedDeduction));
    }

    return {
      url,
      accessibilityScore,
      criticalCount,
      seriousCount,
      moderateCount,
      minorCount,
      totalViolations,
      totalPasses,
      violations,
      passes,
      wcagBreakdown,
      scanVersion: 'axe-core-4.10',
      pageTitle,
      pageLanguage,
    };
  } finally {
    await page.close();
  }
}
