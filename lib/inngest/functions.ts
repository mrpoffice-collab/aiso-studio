import { inngest } from './client';
import { scanAccessibilityFull, closeBrowser } from '../accessibility-scanner-playwright';
import { db } from '../db';

// Event types
export interface AccessibilityAuditRequestedEvent {
  name: 'audit/accessibility.requested';
  data: {
    userId: number;
    url: string;
    contentAuditId?: number;
  };
}

export interface AccessibilityAuditCompletedEvent {
  name: 'audit/accessibility.completed';
  data: {
    userId: number;
    url: string;
    auditId: number;
    accessibilityScore: number;
    totalViolations: number;
  };
}

// Accessibility audit background job
export const accessibilityAuditFunction = inngest.createFunction(
  {
    id: 'accessibility-audit',
    name: 'Run Accessibility Audit',
    retries: 2,
  },
  { event: 'audit/accessibility.requested' },
  async ({ event, step }) => {
    const { userId, url, contentAuditId } = event.data;

    // Step 1: Run the accessibility scan
    const scanResult = await step.run('scan-accessibility', async () => {
      try {
        const result = await scanAccessibilityFull(url);
        await closeBrowser();
        return result;
      } catch (error) {
        await closeBrowser();
        throw error;
      }
    });

    // Step 2: Save to database
    const audit = await step.run('save-audit', async () => {
      return await db.createAccessibilityAudit({
        user_id: userId,
        content_audit_id: contentAuditId,
        url: scanResult.url,
        accessibility_score: scanResult.accessibilityScore,
        critical_count: scanResult.criticalCount,
        serious_count: scanResult.seriousCount,
        moderate_count: scanResult.moderateCount,
        minor_count: scanResult.minorCount,
        total_violations: scanResult.totalViolations,
        total_passes: scanResult.totalPasses,
        violations: scanResult.violations,
        passes: scanResult.passes,
        wcag_breakdown: scanResult.wcagBreakdown,
        scan_version: scanResult.scanVersion,
        page_title: scanResult.pageTitle,
        page_language: scanResult.pageLanguage,
      });
    });

    // Step 3: Emit completion event
    await step.sendEvent('emit-completed', {
      name: 'audit/accessibility.completed',
      data: {
        userId,
        url,
        auditId: audit.id,
        accessibilityScore: scanResult.accessibilityScore,
        totalViolations: scanResult.totalViolations,
      },
    });

    return {
      success: true,
      auditId: audit.id,
      accessibilityScore: scanResult.accessibilityScore,
      totalViolations: scanResult.totalViolations,
    };
  }
);

// Batch accessibility audit
export const batchAccessibilityAuditFunction = inngest.createFunction(
  {
    id: 'batch-accessibility-audit',
    name: 'Run Batch Accessibility Audit',
    retries: 1,
  },
  { event: 'audit/accessibility.batch-requested' },
  async ({ event, step }) => {
    const { userId, urls } = event.data as { userId: number; urls: string[] };
    const results: { url: string; auditId: number; score: number }[] = [];

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];

      try {
        const scanResult = await step.run(`scan-${i}`, async () => {
          const result = await scanAccessibilityFull(url);
          return result;
        });

        const audit = await step.run(`save-${i}`, async () => {
          return await db.createAccessibilityAudit({
            user_id: userId,
            url: scanResult.url,
            accessibility_score: scanResult.accessibilityScore,
            critical_count: scanResult.criticalCount,
            serious_count: scanResult.seriousCount,
            moderate_count: scanResult.moderateCount,
            minor_count: scanResult.minorCount,
            total_violations: scanResult.totalViolations,
            total_passes: scanResult.totalPasses,
            violations: scanResult.violations,
            passes: scanResult.passes,
            wcag_breakdown: scanResult.wcagBreakdown,
            scan_version: scanResult.scanVersion,
            page_title: scanResult.pageTitle,
            page_language: scanResult.pageLanguage,
          });
        });

        results.push({
          url,
          auditId: audit.id,
          score: scanResult.accessibilityScore,
        });
      } catch (error) {
        console.error(`Failed to scan ${url}:`, error);
      }
    }

    // Clean up browser
    await step.run('cleanup', async () => {
      await closeBrowser();
    });

    return { success: true, results };
  }
);

// Export all functions for the Inngest serve handler
export const functions = [
  accessibilityAuditFunction,
  batchAccessibilityAuditFunction,
];
