# Free Audit Analytics System - Setup Guide

## Overview

This system tracks free audit usage and automatically links them to user sign-ups for marketing and conversion analysis.

## What It Tracks

1. **All free audits** - URL, domain, IP address, scores, user agent, referrer
2. **Conversions** - When someone who ran a free audit signs up
3. **User type** - Domain owner (owns the site they audited) vs Agency (auditing client sites)
4. **Scoring issues** - Pages with low scores for quality analysis

## Setup Steps

### Step 1: Run Database Migration

```bash
node run-conversion-tracking-migration.js
```

This adds tracking columns to the `free_audit_usage` table:
- `converted` - Did they sign up?
- `converted_user_id` - Links to users table
- `converted_at` - When they signed up
- `is_domain_owner` - TRUE if email domain matches audited domain (owner), FALSE if agency
- `user_agent` - Browser/device info
- `referrer` - Traffic source

### Step 2: Configure Clerk Webhook

1. Go to Clerk Dashboard → Webhooks
2. Create new webhook endpoint
3. **URL**: `https://your-domain.com/api/webhooks/clerk-user-created`
4. **Events**: Select `user.created` only
5. **Secret**: Copy the signing secret
6. Add to `.env.local`:
   ```
   CLERK_WEBHOOK_SECRET=whsec_xxxxx
   ```

### Step 3: Make Yourself Admin

```sql
UPDATE users SET is_admin = true WHERE email = 'your-email@example.com';
```

### Step 4: Access Analytics Dashboard

Navigate to: `/dashboard/admin/free-audit-analytics`

## Analytics Features

### Overview Tab
- **Total audits** - All free audits run
- **Unique users** - Distinct IP addresses
- **Conversions** - How many signed up
- **Conversion rate** - % of users who converted
- **Domain owners vs Agencies** - User type breakdown
- **Last 30 days** - Daily audit & conversion trends

### All Audits Tab
- Complete audit history
- Shows which IPs converted
- User email if they signed up
- Domain owner vs agency classification

### Top Domains Tab
- Most frequently audited domains
- Conversion rates per domain
- Average scores (SEO, Readability)
- Identify popular competitors people audit

### Scoring Issues Tab
- Pages with any score < 30
- Helps identify scoring algorithm problems
- Review if certain page types score poorly

## How Conversion Tracking Works

1. **User runs free audit** → Saves to `free_audit_usage` with their IP
2. **User signs up** → Clerk webhook fires
3. **Webhook handler** → Looks up all audits from that IP in last 30 days
4. **Links audits to user** → Sets `converted = true`, `converted_user_id`, `is_domain_owner`
5. **Domain ownership detection**:
   - If email is `john@example.com` and they audited `example.com` → Domain Owner
   - If email is `agency@marketing.com` and they audited `clientsite.com` → Agency

## Use Cases

### 1. Conversion Analysis
**Question**: What's our free-to-paid conversion rate?

**Answer**: Overview tab shows conversion rate and breakdown by user type

### 2. Marketing Attribution
**Question**: Which domains are people auditing most? (Competitors?)

**Answer**: Top Domains tab shows most audited sites

### 3. User Intent
**Question**: Are sign-ups mostly domain owners or agencies?

**Answer**: Overview tab shows owner vs agency split

**Insight**: If mostly agencies → market to agencies. If mostly owners → market to SMBs.

### 4. Product Quality
**Question**: Is our scoring algorithm accurate?

**Answer**: Scoring Issues tab shows pages with very low scores. Review if they're actually bad or if scoring is off.

### 5. Traffic Source
**Question**: Where are free audit users coming from?

**Answer**: Audits tab shows `referrer` - Google, social media, direct, etc.

## Database Schema

```sql
free_audit_usage (
  id SERIAL PRIMARY KEY,
  ip_address TEXT NOT NULL,
  domain TEXT NOT NULL,
  url TEXT NOT NULL,
  audit_data JSONB,
  user_agent TEXT,
  referrer TEXT,
  converted BOOLEAN DEFAULT FALSE,
  converted_user_id INTEGER REFERENCES users(id),
  converted_at TIMESTAMP,
  is_domain_owner BOOLEAN,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

## API Endpoints

### Get Analytics (Admin Only)
```
GET /api/admin/free-audit-analytics?view=overview
GET /api/admin/free-audit-analytics?view=audits&limit=100&offset=0
GET /api/admin/free-audit-analytics?view=domains&limit=20
GET /api/admin/free-audit-analytics?view=issues
GET /api/admin/free-audit-analytics?view=daterange&startDate=2025-01-01&endDate=2025-01-31
```

### Clerk Webhook (Internal)
```
POST /api/webhooks/clerk-user-created
```

## Helper Functions (lib/db.ts)

- `getAllFreeAudits(limit, offset)` - Get all audits with user info
- `getFreeAuditAnalytics()` - Summary stats
- `getFreeAuditsByDateRange(start, end)` - Daily breakdown
- `getTopAuditedDomains(limit)` - Most popular domains
- `getScoringIssues()` - Low-scoring pages
- `markFreeAuditConverted(ip, userId, email)` - Link audits to sign-ups (auto-called by webhook)

## Example Queries

### Manual Conversion Analysis
```sql
-- Conversion rate by date
SELECT
  DATE(created_at) as date,
  COUNT(DISTINCT ip_address) as users,
  COUNT(DISTINCT CASE WHEN converted THEN ip_address END) as conversions,
  ROUND(
    COUNT(DISTINCT CASE WHEN converted THEN ip_address END)::DECIMAL /
    COUNT(DISTINCT ip_address)::DECIMAL * 100,
    2
  ) as conv_rate
FROM free_audit_usage
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### Agency vs Owner Split
```sql
SELECT
  CASE
    WHEN is_domain_owner = true THEN 'Domain Owner'
    WHEN is_domain_owner = false THEN 'Agency'
    ELSE 'Unknown'
  END as user_type,
  COUNT(*) as count
FROM free_audit_usage
WHERE converted = true
GROUP BY is_domain_owner;
```

## Troubleshooting

### Webhook Not Firing
1. Check Clerk dashboard → Webhooks → Attempts
2. Verify `CLERK_WEBHOOK_SECRET` in `.env.local`
3. Check webhook URL is correct (include `/api/webhooks/clerk-user-created`)
4. Ensure webhook is enabled and `user.created` event is selected

### Conversions Not Linking
1. Verify webhook is configured correctly
2. Check server logs for webhook errors
3. Ensure user signed up within 30 days of running audit
4. IP address must match (VPN users may have different IPs)

### Admin Page Shows 403
1. Make sure your user has `is_admin = true` in database
2. Check you're logged in with the correct account

## Privacy & GDPR

This system stores IP addresses for analytics. Consider:
- Add privacy notice on free audit page
- Implement data retention policy (delete audits after 90 days)
- Allow users to request data deletion

## Next Steps

1. Run migration
2. Set up Clerk webhook
3. Make yourself admin
4. Visit `/dashboard/admin/free-audit-analytics`
5. Analyze conversion data
6. Use insights to improve marketing

## Questions?

Check the code files:
- Migration: `migrations/add-free-audit-conversion-tracking.sql`
- DB Functions: `lib/db.ts` (lines 1733-1861)
- Webhook: `app/api/webhooks/clerk-user-created/route.ts`
- Admin API: `app/api/admin/free-audit-analytics/route.ts`
- Dashboard: `app/dashboard/admin/free-audit-analytics/page.tsx`
