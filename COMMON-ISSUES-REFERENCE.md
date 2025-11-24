# AISO Studio - Common Issues Reference Guide

**Last Updated:** 2025-11-24
**Purpose:** Living document of recurring issues, root causes, and proven solutions
**Scope:** AISO Studio + general Next.js/PostgreSQL SaaS patterns

---

## Table of Contents

1. [Authentication & Sign-In Issues](#authentication--sign-in-issues)
2. [Database Connection & Schema Issues](#database-connection--schema-issues)
3. [API & Backend Issues](#api--backend-issues)
4. [Frontend Display & State Issues](#frontend-display--state-issues)
5. [Email Deliverability Issues](#email-deliverability-issues)
6. [Deployment & Environment Issues](#deployment--environment-issues)
7. [Third-Party Integration Issues](#third-party-integration-issues)
8. [Performance & Resource Issues](#performance--resource-issues)

---

## Authentication & Sign-In Issues

### Issue: Production Sign-In Not Working After Deployment

**Symptoms:**
- Users can't sign in on production
- Sign-in works locally but fails after deployment
- Redirect loops or "Unauthorized" errors

**Root Causes:**
1. **Environment Variables Missing/Incorrect**
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` not set
   - `CLERK_SECRET_KEY` not set or using development keys in production

2. **Redirect URLs Not Configured**
   - Production domain not whitelisted in Clerk dashboard
   - Redirect URLs don't match actual deployment URLs

3. **Middleware Configuration Issue**
   - `middleware.ts` not protecting routes correctly
   - Public routes not defined properly

**Fix Checklist:**
```bash
# 1. Verify environment variables in Vercel
- Go to Vercel Dashboard → Settings → Environment Variables
- Check NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY exists (starts with pk_)
- Check CLERK_SECRET_KEY exists (starts with sk_)
- Ensure both are set for Production environment

# 2. Verify Clerk Dashboard Configuration
- Go to https://dashboard.clerk.com
- Navigate to your application
- Go to Configure → Domains
- Add production domain: https://aiso.studio
- Go to Configure → Paths
- Set Sign-in URL: /sign-in
- Set Sign-up URL: /sign-up
- Set After sign-in: /dashboard
- Set After sign-up: /dashboard

# 3. Check middleware.ts
- Ensure publicRoutes includes: ["/", "/sign-in(.*)", "/sign-up(.*)"]
- Verify clerkMiddleware is exported as middleware
```

**Debug Tools Available:**
- `/api/debug/user` - Check Clerk user and database sync
- `app/debug-auth` - Client-side auth state inspector

**Prevention:**
- Always test sign-in on Vercel preview deployments before promoting to production
- Keep `.env.local.example` updated with all required variables
- Document all Clerk configuration changes

---

### Issue: Admin Routes Not Properly Protected

**Symptoms:**
- Any authenticated user can access admin routes
- No proper role-based access control (RBAC)

**Root Cause:**
- Admin check uses hardcoded email list instead of proper role system
- File: `app/api/admin/update-subscription/route.ts:21-25`

**Current Workaround:**
```typescript
// TODO: Add proper admin role check
const ADMIN_EMAILS = [
  'TODO_REPLACE_WITH_YOUR_EMAIL@gmail.com', // ⚠️ UPDATE THIS
];
```

**Proper Fix Needed:**
1. Add `role` field to `users` table (values: 'user', 'admin', 'agency')
2. Update Clerk metadata sync to store user role
3. Create middleware to check role from database
4. Replace hardcoded email checks with role checks

**Temporary Solution:**
- Update `ADMIN_EMAILS` array with actual admin email addresses
- Deploy with updated list

---

## Database Connection & Schema Issues

### Issue: Database Fields Not Updating (Silent Failure)

**Symptoms:**
- API returns success but database not updated
- Some fields update, others don't
- Frontend shows stale data after successful API call

**Root Cause:**
- `lib/db.ts` update functions don't handle all fields
- Fields are silently ignored if not explicitly added to SQL UPDATE query

**Example from Production:**
```typescript
// BUG: updatePost() only handled title, content, status, meta_description
// Missing: aiso_score, aeo_score, geo_score, word_count, fact_checks
// Result: Rewrite API passed scores, but they were never saved
```

**Fix Pattern:**
```typescript
// BEFORE (broken):
async function updatePost(id: string, data: Partial<Post>) {
  const updates = [];
  if (data.title) updates.push(`title = $${paramCount++}`);
  // Missing other fields!
}

// AFTER (fixed):
async function updatePost(id: string, data: Partial<Post>) {
  const updates = [];
  if (data.title !== undefined) updates.push(`title = $${paramCount++}`);
  if (data.aiso_score !== undefined) updates.push(`aiso_score = $${paramCount++}`);
  if (data.word_count !== undefined) updates.push(`word_count = $${paramCount++}`);
  // Handle ALL fields that might be passed
}
```

**Prevention:**
- When adding new database fields, ALWAYS update corresponding `lib/db.ts` functions
- Use `!== undefined` checks instead of truthy checks (allows 0, false, null values)
- Add TypeScript types to ensure all fields are handled
- Test database updates in browser dev tools → Network tab

**Debug Steps:**
1. Check API response (should show correct data)
2. Check database directly with SQL query
3. Add console.logs in `lib/db.ts` update functions
4. Verify SQL query includes the field in UPDATE clause

**Related Documentation:** `DATABASE-UPDATE-BUG-FIX.md`

---

### Issue: "Relation Does Not Exist" Error

**Symptoms:**
```
PostgresError: relation "table_name" does not exist
```

**Root Causes:**
1. **Wrong Database Connection**
   - `.env.local` pointing to old/different database
   - Vercel environment variable points to different database than local

2. **Migration Not Run**
   - Table created in one environment but not another
   - Schema changes not deployed

3. **Schema Out of Sync**
   - Local schema differs from production
   - Multiple databases in use (development, staging, production)

**Fix:**
```bash
# 1. Verify you're connected to the correct database
echo $DATABASE_URL  # or check .env.local

# 2. Check which tables exist
psql $DATABASE_URL -c "\dt"

# 3. Run migration if table missing
node run-migration.js  # or specific migration script

# 4. Verify table was created
psql $DATABASE_URL -c "SELECT * FROM table_name LIMIT 1;"
```

**Prevention:**
- Keep `neon-schema.sql` up to date with all schema changes
- Document all migrations in a `/migrations` folder with timestamps
- Use a migration tool (consider Prisma Migrate or node-pg-migrate)
- Never manually create tables - always use migration scripts

---

### Issue: Database Connection Pool Exhausted

**Symptoms:**
```
Error: Connection pool exhausted
TimeoutError: Timeout acquiring connection
```

**Root Cause:**
- Neon connection pool limited to 10 concurrent connections
- Prepared statements causing connection leaks
- Long-running queries holding connections

**Fix:**
```typescript
// In lib/db.ts, disable prepared statements
const sql = neon(process.env.DATABASE_URL!, {
  prepare: false, // Prevents connection leaks after schema changes
});
```

**Prevention:**
- Keep prepared statements disabled during active development
- Use connection pooling wisely
- Close connections in API routes (Next.js does this automatically for serverless)
- Monitor Neon dashboard for connection usage
- Consider upgrading Neon plan if consistently hitting limits

---

### Issue: UUID vs Integer Mismatches

**Symptoms:**
```
PostgresError: invalid input syntax for type uuid: "1"
```

**Root Cause:**
- All `user_id` fields are UUID, not integers
- Trying to use integer IDs where UUID expected

**Fix:**
```typescript
// WRONG:
const userId = 1;

// CORRECT:
const userId = user.id; // UUID string like "550e8400-e29b-41d4-a716-446655440000"
```

**Prevention:**
- Always use Clerk user IDs (which are strings)
- Never hardcode user IDs as integers
- TypeScript types should enforce UUID type

---

## API & Backend Issues

### Issue: Missing Required Parameters in Function Calls

**Symptoms:**
- TypeScript errors about missing parameters
- Functions called without all required arguments
- Recently fixed in commit: `55e4565 - fix: Add missing parameters to createAgency method`

**Root Cause:**
- Function signatures updated but not all call sites updated
- Copy-pasted code missing context-specific parameters

**Example:**
```typescript
// Function definition updated to require new params:
async function createAgency(userId: string, name: string, certificationStatus: string) {
  // ...
}

// But old call sites still used:
await createAgency(userId, name); // ❌ Missing certificationStatus
```

**Fix:**
- Use IDE "Find All References" to locate all call sites
- Update each call site with new required parameters
- Run TypeScript build to catch any missed updates

**Prevention:**
- Use optional parameters with defaults for new additions:
  ```typescript
  async function createAgency(
    userId: string,
    name: string,
    certificationStatus: string = 'pending'
  ) { }
  ```
- Run `npm run build` before committing
- Enable TypeScript strict mode

---

### Issue: Error Tracking Not Implemented

**Symptoms:**
- Errors disappear in production with no trace
- Hard to debug production issues
- Users report bugs but no error logs

**Current State:**
```typescript
// lib/error-logger.ts:51
// TODO: Send to error tracking service
// Sentry.captureException(error, { extra: errorDetails });
```

**Solution Needed:**
1. **Add Sentry Integration:**
   ```bash
   npm install @sentry/nextjs
   npx @sentry/wizard@latest -i nextjs
   ```

2. **Update error-logger.ts:**
   ```typescript
   import * as Sentry from '@sentry/nextjs';

   if (process.env.NODE_ENV === 'production') {
     Sentry.captureException(error, { extra: errorDetails });
   }
   ```

3. **Add Environment Variables:**
   ```env
   NEXT_PUBLIC_SENTRY_DSN=your_dsn_here
   SENTRY_AUTH_TOKEN=your_token_here
   ```

**Alternative Options:**
- LogRocket (session replay + error tracking)
- Rollbar (lightweight error tracking)
- Vercel Error Tracking (built-in, simpler but less featured)

---

### Issue: Background Jobs Not Processing

**Symptoms:**
- Accessibility audits hang forever
- Batch operations never complete
- Inngest events not triggering

**Root Causes:**
1. **Inngest Not Configured:**
   - Missing `INNGEST_SIGNING_KEY` environment variable
   - Inngest app not created at inngest.com

2. **Webhook Not Accessible:**
   - `/api/inngest` route not accessible from Inngest servers
   - Firewall or rate limiting blocking webhooks

3. **Event Not Sent:**
   - `inngest.send()` called but fails silently
   - Wrong event name used

**Fix:**
```bash
# 1. Check Inngest configuration
- Go to https://www.inngest.com
- Create app if not exists
- Get signing key from dashboard
- Add to Vercel: INNGEST_SIGNING_KEY=signkey-...
- Add to Vercel: INNGEST_EVENT_KEY=your_event_key

# 2. Verify webhook endpoint
curl https://aiso.studio/api/inngest

# 3. Check Inngest dashboard for events
- Go to Inngest dashboard → Events
- Verify events are being received
- Check function runs for errors
```

**Debug:**
```typescript
// Add logging in API routes that trigger Inngest:
const eventId = await inngest.send({
  name: 'audit.accessibility',
  data: { url, userId }
});
console.log('Inngest event sent:', eventId);
```

**Related:** `lib/inngest/functions.ts:291` - TODO: Send email notification

---

## Frontend Display & State Issues

### Issue: JSONB Fields Causing "map is not a function" Error

**Symptoms:**
```
TypeError: e.recommendations.map is not a function
TypeError: v.map is not a function
TypeError: Cannot read property 'violations' of undefined
```

**Root Cause:**
- PostgreSQL JSONB fields may return as:
  - String (needs parsing)
  - Null (needs default)
  - Wrong type (array expected but object received)
  - Undefined when API doesn't populate the field

**Real Production Example (2025-11-24):**
```
Uncaught TypeError: e.recommendations.map is not a function
    at TechnicalSEOResults (cb5154d997e4ec38.js:1:24402)
```

**Files Affected:**
- `components/TechnicalSEOResults.tsx:330` - recommendations.map()
- `components/TechnicalSEOResults.tsx:188` - agencyCanFix.issues.map()
- `components/TechnicalSEOResults.tsx:277` - ownerMustChange.issues.map()

**Fix Pattern:**
```typescript
// BEFORE (broken):
export default function TechnicalSEOResults({ result }) {
  return (
    <div>
      {result.recommendations.map((rec) => <div>{rec.action}</div>)}
    </div>
  );
}

// AFTER (safe):
export default function TechnicalSEOResults({ result }) {
  // Add defensive checks at component top
  const safeRecommendations = Array.isArray(result.recommendations)
    ? result.recommendations
    : [];

  return (
    <div>
      {safeRecommendations.map((rec) => <div>{rec.action}</div>)}
    </div>
  );
}

// For nested JSONB arrays:
const safeAgencyIssues = Array.isArray(result.agencyCanFix?.issues)
  ? result.agencyCanFix.issues
  : [];

// For objects:
const safeWcagBreakdown = wcagBreakdown && typeof wcagBreakdown === 'object'
  ? wcagBreakdown
  : { perceivable: { violations: 0, score: 100 }, /* defaults */ };
```

**Prevention:**
- Always add defensive checks when using JSONB data
- Add checks at component top, not inline in JSX
- Use optional chaining for nested objects: `result.agencyCanFix?.issues`
- Create utility functions for parsing JSONB:
  ```typescript
  function safeJsonArray<T>(data: any, defaultValue: T[] = []): T[] {
    if (Array.isArray(data)) return data;
    if (typeof data === 'string') {
      try { return JSON.parse(data); }
      catch { return defaultValue; }
    }
    return defaultValue;
  }
  ```

**How to Debug:**
1. Check browser console for exact error location
2. Find the component in minified stack trace
3. Search for `.map()` calls on JSONB fields
4. Add defensive Array.isArray() checks
5. Test with production data (not just mock data)

**Related Documentation:** `docs/WCAG-FIXES-2025-11-21.md`

---

### Issue: Scores Not Updating in UI After Rewrite

**Symptoms:**
- API returns new scores
- PDF shows new scores
- UI still shows old scores
- Refresh doesn't help

**Root Cause:**
- Database not updated (see "Database Fields Not Updating" above)
- Frontend caching old data
- React state not refreshing

**Fix:**
1. **Ensure database is updated** (primary issue - see above)
2. **Force refetch after mutation:**
   ```typescript
   // After successful rewrite:
   await fetch('/api/posts/rewrite', { method: 'POST', body: ... });

   // Refetch post data:
   const updatedPost = await fetch(`/api/posts/${postId}`);
   setPost(updatedPost);
   ```

3. **Use SWR or React Query for automatic refetching:**
   ```typescript
   const { data: post, mutate } = useSWR(`/api/posts/${postId}`);

   // After mutation:
   await mutate(); // Refetches from server
   ```

---

## Email Deliverability Issues

### Issue: Sign-Up Emails Going to Spam or Not Received

**Symptoms:**
- Users don't receive verification emails
- Emails land in spam folder
- Corporate email filters block emails

**Root Cause:**
- Emails sent from Clerk's shared domain (`@clerk.com`)
- No custom email domain configured
- Missing SPF/DKIM records

**Fix:**
1. **Set up custom email domain (Resend):**
   ```bash
   # Full guide in docs/EMAIL-DELIVERABILITY-FIX.md
   - Sign up at https://resend.com
   - Add domain: fireflygrove.app or aiso.studio
   - Add DNS records (TXT, MX, CNAME)
   - Get API key
   - Configure in Clerk dashboard → Email & SMS → Custom Email
   ```

2. **Configure Clerk SMTP:**
   ```
   Host: smtp.resend.com
   Port: 587
   Username: resend
   Password: [Resend API key]
   From Email: noreply@aiso.studio
   From Name: AISO Studio
   ```

3. **Add SPF/DKIM records:**
   ```
   TXT @ v=spf1 include:spf.resend.com ~all
   TXT resend._domainkey [value from Resend]
   TXT _dmarc v=DMARC1; p=none; rua=mailto:dmarc@aiso.studio
   ```

**Immediate Workaround:**
- Ask users to check spam folder
- Whitelist `@clerk.com` domain
- Use personal email (Gmail) instead of corporate email

**Cost:**
- Resend free tier: 100 emails/day (3000/month)
- Paid: $20/mo for 50k emails

**Related Documentation:** `docs/EMAIL-DELIVERABILITY-FIX.md`

---

### Issue: Email Notifications Not Implemented

**Current State:**
```typescript
// lib/inngest/functions.ts:291
// TODO: Send email notification
```

**Tasks Needed:**
1. Create email templates (HTML + text)
2. Set up Resend integration (separate from Clerk)
3. Add email sending to Inngest functions:
   - Accessibility audit complete
   - Batch audit complete
   - Lead discovery complete
   - Weekly usage report

**Implementation Plan:**
```typescript
// lib/email.ts (already exists, needs extension)
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendAuditCompleteEmail(
  userEmail: string,
  auditId: string,
  score: number
) {
  await resend.emails.send({
    from: 'AISO Studio <noreply@aiso.studio>',
    to: userEmail,
    subject: `Your WCAG Audit is Complete (Score: ${score}/100)`,
    html: `<p>View results: https://aiso.studio/dashboard/audit/history/${auditId}</p>`
  });
}
```

---

## Deployment & Environment Issues

### Issue: Environment Variables Missing After Deploy

**Symptoms:**
- Feature works locally but fails in production
- API errors like "API key not found"
- Database connection errors

**Root Cause:**
- Environment variable not added to Vercel
- Variable added to wrong environment (Preview vs Production)
- Typo in variable name

**Fix:**
```bash
# 1. Check Vercel environment variables
- Go to Vercel Dashboard → Settings → Environment Variables
- Verify ALL variables from .env.local are present
- Check correct environment selected (Production, Preview, Development)

# 2. Redeploy after adding variables
- Variables only take effect after redeployment
- Go to Deployments → ... → Redeploy

# 3. Verify in deployment logs
- Click deployment → View Function Logs
- Check for "undefined" errors indicating missing vars
```

**Prevention:**
- Keep `.env.local.example` file updated
- Document all required environment variables in README
- Use a checklist during deployments (see `DEPLOYMENT-CHECKLIST.md`)

---

### Issue: Build Succeeds Locally But Fails on Vercel

**Symptoms:**
```
Error: Build failed with exit code 1
TypeScript error in components/...
```

**Root Causes:**
1. **TypeScript Errors Ignored Locally:**
   - Local dev server doesn't fail on TS errors
   - Vercel build enforces strict checks

2. **Missing Dependencies:**
   - Package installed globally but not in `package.json`
   - Dev dependency needed for build

3. **Case-Sensitive File Imports:**
   - Works on Windows (case-insensitive)
   - Fails on Linux (Vercel uses Linux)

**Fix:**
```bash
# 1. Run production build locally
npm run build

# 2. Fix all TypeScript errors
# Don't use @ts-ignore - fix the actual issues

# 3. Check imports match actual filenames
# Wrong: import X from './Component'  (file: component.tsx)
# Right: import X from './component'

# 4. Verify all dependencies in package.json
npm install [package] --save  # not --save-dev if needed in production
```

**Prevention:**
- Always run `npm run build` before committing
- Enable TypeScript strict mode
- Use Linux for development if possible
- Add pre-commit hook to run build:
  ```json
  // package.json
  "husky": {
    "hooks": {
      "pre-commit": "npm run build"
    }
  }
  ```

---

## Third-Party Integration Issues

### Issue: JSDOM Breaks in Serverless (Vercel)

**Symptoms:**
```
Error [ERR_REQUIRE_ESM]: require() of ES Module not supported
Failed to load external module jsdom
```

**Root Cause:**
- JSDOM requires Node.js native modules (canvas, etc.)
- Vercel serverless functions have limited runtime
- JSDOM's dependency `parse5` is ESM-only

**Fix:**
- Replace JSDOM with `cheerio` (lightweight, serverless-friendly)
- Use Playwright only for features requiring real browser (accessibility audits)

**Code Change:**
```typescript
// BEFORE (broken in serverless):
import { JSDOM } from 'jsdom';
const dom = new JSDOM(html);
const document = dom.window.document;

// AFTER (works in serverless):
import * as cheerio from 'cheerio';
const $ = cheerio.load(html);
const title = $('title').text();
```

**Related Documentation:** `docs/WCAG-FIXES-2025-11-21.md`

---

### Issue: Playwright Exceeds Serverless Function Limits

**Symptoms:**
- Accessibility audits timeout
- Function execution time limit exceeded (10s free, 60s hobby, 900s pro)

**Root Cause:**
- Playwright browser automation is slow
- Multiple audits run in single function call

**Fix:**
- Move Playwright operations to Inngest background jobs
- Increase Vercel function timeout (requires Pro plan)
- Use `@sparticuz/chromium-min` for smaller browser bundle

**Implementation:**
```typescript
// Don't run Playwright in API route directly:
export async function POST(request: Request) {
  // ❌ This will timeout:
  const result = await runAccessibilityAudit(url);

  // ✅ Instead, trigger background job:
  await inngest.send({
    name: 'audit.accessibility',
    data: { url, userId }
  });

  return Response.json({ message: 'Audit started', status: 'processing' });
}
```

---

## Performance & Resource Issues

### Issue: API Costs Spiraling Out of Control

**Symptoms:**
- Unexpected high bills from OpenAI/Anthropic
- Users generating excessive content
- No rate limiting

**Prevention (Not Yet Implemented):**
1. **Add rate limiting:**
   ```typescript
   // TODO: Implement in middleware.ts
   const userLimits = {
     trial: { audits: 10, strategies: 1 },
     starter: { audits: 50, strategies: 3 },
     professional: { audits: 200, strategies: 10 }
   };
   ```

2. **Track usage in real-time:**
   ```typescript
   // usage_logs table already exists
   // Display remaining quota on dashboard (TODO)
   ```

3. **Set billing alerts:**
   - OpenAI Dashboard → Usage → Set alerts at $50, $100, $200
   - Anthropic Dashboard → Similar settings

**Related:** TODO in deployment checklist - "Rate limiting not implemented"

---

## Quick Reference: Debug Checklist

When encountering any production issue:

1. **Check Environment Variables**
   - [ ] All variables set in Vercel
   - [ ] Correct environment (Production vs Preview)
   - [ ] No typos or extra spaces

2. **Check Database**
   - [ ] Correct DATABASE_URL
   - [ ] Table exists (run migration if needed)
   - [ ] Data actually saved (check with SQL query)

3. **Check Logs**
   - [ ] Vercel Function Logs
   - [ ] Browser Console (Network tab)
   - [ ] Database query logs (if enabled)

4. **Check Authentication**
   - [ ] User logged in (check Clerk session)
   - [ ] User exists in database (run `/api/debug/user`)
   - [ ] Clerk domain whitelisted

5. **Check Integration Status**
   - [ ] API keys valid (not expired)
   - [ ] Sufficient API credits
   - [ ] Third-party service not down (check status pages)

---

## Contributing to This Document

When you encounter a NEW issue:

1. **Document the issue:**
   - Symptoms
   - Root cause
   - Fix
   - Prevention

2. **Add to relevant section** or create new section

3. **Link to related files** for deeper context

4. **Update "Last Updated" date** at top

---

## Related Documentation

- `DATABASE-UPDATE-BUG-FIX.md` - Detailed database update issue case study
- `docs/EMAIL-DELIVERABILITY-FIX.md` - Complete email setup guide
- `docs/WCAG-FIXES-2025-11-21.md` - Accessibility implementation issues
- `DEPLOYMENT-CHECKLIST.md` - Pre-deployment verification
- `.claude-reminders.md` - Critical project context
- `NEXT-SESSION-TODO.md` - Roadmap and known TODO items

---

**Remember:** ALWAYS ASSUME PRODUCTION unless explicitly stated otherwise.
