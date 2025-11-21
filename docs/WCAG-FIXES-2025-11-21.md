# WCAG Accessibility Feature - Fixes Summary (2025-11-21)

## Issues Encountered & Solutions

### 1. JSDOM ESM Compatibility Error
**Error:** `Failed to load external module jsdom: Error [ERR_REQUIRE_ESM]`

**Cause:** JSDOM uses parse5 which requires ESM imports, incompatible with Vercel's serverless runtime.

**Fix:** Replaced JSDOM with `cheerio` in `lib/accessibility-scanner.ts`. Cheerio is a lightweight HTML parser that works in serverless environments.

---

### 2. Database Table Not Found
**Error:** `relation "accessibility_audits" does not exist`

**Cause:** Local `.env.local` was pointing to old Neon database, while Vercel used a different production database.

**Fix:**
1. Updated `.env.local` to use correct production DATABASE_URL:
   ```
   postgresql://neondb_owner:npg_HTNoEMZhR3n4@ep-still-credit-a4y8w43n-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
2. Ran migration: `node run-accessibility-migration.js`

---

### 3. Client-Side Array Error
**Error:** `v.map is not a function`

**Cause:** JSONB fields from PostgreSQL (violations, wcagBreakdown, aiSuggestions) might return as strings or null instead of arrays/objects.

**Fix:** Added defensive checks in `components/AccessibilitySummary.tsx`:
```typescript
const safeViolations = Array.isArray(violations) ? violations : [];
const safeWcagBreakdown = wcagBreakdown && typeof wcagBreakdown === 'object' ? wcagBreakdown : {
  perceivable: { violations: 0, score: 100 },
  operable: { violations: 0, score: 100 },
  understandable: { violations: 0, score: 100 },
  robust: { violations: 0, score: 100 },
};
const safeAiSuggestions = Array.isArray(aiSuggestions) ? aiSuggestions : [];
```

---

### 4. Props Mismatch
**Error:** `Property 'result' does not exist on type 'AccessibilitySummaryProps'`

**Cause:** Component expects individual props, not a `result` object.

**Fix:** Pass props individually:
```tsx
<AccessibilitySummary
  score={accessibilityResult.accessibilityScore}
  criticalCount={accessibilityResult.criticalCount}
  // ... other individual props
/>
```

---

## Files Modified

- `lib/accessibility-scanner.ts` - Switched from JSDOM to cheerio
- `lib/db.ts` - Added `createAccessibilityAudit` and related functions
- `app/api/audit/accessibility/route.ts` - API endpoint for WCAG scans
- `app/dashboard/audit/page.tsx` - Added "WCAG Only" button, standalone results display
- `components/AccessibilitySummary.tsx` - Added safe array/object checks
- `.env.local` - Updated DATABASE_URL to production

---

## Migration Script
Location: `run-accessibility-migration.js`

Run with: `node run-accessibility-migration.js`

Creates table: `accessibility_audits`

---

## Inngest Setup
- Create app at inngest.com
- Add `INNGEST_SIGNING_KEY` to Vercel environment variables
- Functions auto-discovered at `/api/inngest`
