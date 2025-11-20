# AISO Studio - Deployment Checklist for aiso.studio

**Target Domain:** aiso.studio
**Platform:** Vercel
**Date:** 2025-11-20

---

## Pre-Deployment Setup

### 1. Domain Configuration ✅
- [ ] Domain purchased: aiso.studio
- [ ] DNS configured to point to Vercel
- [ ] SSL certificate ready (automatic via Vercel)

### 2. Environment Variables
Collect all required API keys and credentials:

#### Required:
- [ ] `DATABASE_URL` - Neon PostgreSQL connection string
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk auth (public)
- [ ] `CLERK_SECRET_KEY` - Clerk auth (secret)
- [ ] `ANTHROPIC_API_KEY` - Claude AI for strategy + content
- [ ] `OPENAI_API_KEY` - GPT-4 for content generation
- [ ] `BRAVE_SEARCH_API_KEY` - Fact-checking searches

#### Optional (for full features):
- [ ] `PEXELS_API_KEY` - Stock images
- [ ] `NEXT_PUBLIC_CLERK_SIGN_IN_URL` - /sign-in
- [ ] `NEXT_PUBLIC_CLERK_SIGN_UP_URL` - /sign-up
- [ ] `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` - /dashboard
- [ ] `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` - /dashboard

### 3. Database Setup
- [ ] Neon PostgreSQL database created (production)
- [ ] Run schema migrations:
  ```sql
  -- Check migrations folder for latest schema
  -- Or use existing supabase-schema.sql
  ```
- [ ] Verify all tables exist:
  - users
  - strategies
  - topics
  - posts
  - usage_logs
  - mou_generation (if using MOU feature)
- [ ] Test database connection from local with production credentials

### 4. Clerk Configuration
- [ ] Create production Clerk application
- [ ] Configure allowed domains:
  - aiso.studio
  - *.aiso.studio (for subdomains)
- [ ] Set redirect URLs:
  - https://aiso.studio
  - https://aiso.studio/dashboard
  - https://aiso.studio/sign-in
  - https://aiso.studio/sign-up
- [ ] Enable authentication methods:
  - [x] Email/Password
  - [ ] Google OAuth (optional)
  - [ ] GitHub OAuth (optional)
- [ ] Update user metadata sync webhook (if used)

### 5. API Keys & Credits
- [ ] Anthropic API - Verify sufficient credits ($50+ recommended)
- [ ] OpenAI API - Verify sufficient credits ($50+ recommended)
- [ ] Brave Search API - Verify active subscription
- [ ] Pexels API - Free tier is sufficient

---

## Vercel Deployment Steps

### 1. Connect GitHub Repository
```bash
# Ensure latest code is pushed
git add .
git commit -m "feat: Rebrand to AISO Studio for aiso.studio deployment"
git push origin main
```

### 2. Create Vercel Project
- [ ] Go to https://vercel.com/new
- [ ] Import GitHub repository: `content-command-studio`
- [ ] Configure project:
  - **Project Name:** aiso-studio
  - **Framework:** Next.js
  - **Root Directory:** ./
  - **Build Command:** `next build`
  - **Output Directory:** .next
  - **Install Command:** `npm install`

### 3. Add Environment Variables
In Vercel Dashboard → Settings → Environment Variables, add ALL variables from step 2 above.

**Important:**
- Variables starting with `NEXT_PUBLIC_` are exposed to the browser
- Secret keys should NEVER start with `NEXT_PUBLIC_`
- Add to all environments: Production, Preview, Development

### 4. Configure Custom Domain
- [ ] Go to Vercel Project → Settings → Domains
- [ ] Add custom domain: `aiso.studio`
- [ ] Add DNS records in your domain registrar:
  - **Type:** A Record
  - **Name:** @
  - **Value:** 76.76.21.21 (Vercel IP)

  OR

  - **Type:** CNAME
  - **Name:** @
  - **Value:** cname.vercel-dns.com

- [ ] Add www subdomain (optional):
  - **Type:** CNAME
  - **Name:** www
  - **Value:** cname.vercel-dns.com

- [ ] Wait for DNS propagation (can take 24-48 hours)
- [ ] Verify SSL certificate is issued (automatic)

### 5. Deploy
- [ ] Click "Deploy" in Vercel
- [ ] Monitor build logs for errors
- [ ] Wait for deployment to complete (~2-5 minutes)

---

## Post-Deployment Verification

### 1. Test Core Functionality
- [ ] Visit https://aiso.studio
- [ ] Landing page loads correctly
- [ ] Sign up creates new account
- [ ] Sign in works with existing account
- [ ] Redirect to /dashboard after authentication
- [ ] Dashboard shows correct branding ("AISO Studio")

### 2. Test Strategy Builder
- [ ] Create new strategy
- [ ] Verify Claude API connection works
- [ ] Confirm topics are generated
- [ ] Check database entry created

### 3. Test Content Generation
- [ ] Generate post from topic
- [ ] Verify OpenAI API connection works
- [ ] Confirm fact-checking runs (Brave Search)
- [ ] Check AISO scoring appears
- [ ] Verify post saves to database

### 4. Test Content Audit
- [ ] Go to /dashboard/audit
- [ ] Enter URL to audit
- [ ] Confirm content is fetched
- [ ] Verify AISO scoring works
- [ ] Test rewrite functionality

### 5. Test Export Features
- [ ] Open generated post
- [ ] Export as Markdown (if implemented)
- [ ] Export as HTML (if implemented)
- [ ] Copy to clipboard (if implemented)

### 6. Cross-Browser Testing
- [ ] Chrome - Desktop
- [ ] Firefox - Desktop
- [ ] Safari - Desktop
- [ ] Chrome - Mobile
- [ ] Safari - iOS

### 7. Performance Check
- [ ] Run Lighthouse audit (target 90+ performance)
- [ ] Check page load times (<3 seconds)
- [ ] Verify images are optimized
- [ ] Test on slow 3G connection

---

## Security Checklist

- [ ] All API routes require authentication
- [ ] User data is isolated (can't see other users' content)
- [ ] Environment variables are not exposed in client-side code
- [ ] SQL injection protection (using parameterized queries)
- [ ] Rate limiting enabled (if implemented)
- [ ] HTTPS enforced (automatic via Vercel)
- [ ] CORS configured correctly
- [ ] No sensitive data in error messages

---

## Monitoring & Maintenance

### 1. Set Up Monitoring
- [ ] Vercel Analytics enabled (automatic)
- [ ] Error tracking:
  - [ ] Sentry (recommended)
  - [ ] Vercel Error Tracking
- [ ] Uptime monitoring:
  - [ ] UptimeRobot (free)
  - [ ] Pingdom

### 2. Cost Monitoring
- [ ] Set up billing alerts in:
  - Anthropic Dashboard
  - OpenAI Dashboard
  - Brave Search Dashboard
  - Vercel Dashboard
- [ ] Monitor daily API costs
- [ ] Set budget caps if possible

### 3. Backup Strategy
- [ ] Database backups (Neon handles automatically)
- [ ] Export user data weekly (optional)
- [ ] Git commits pushed regularly

---

## Rollback Plan

If deployment fails or critical bugs appear:

1. **Revert deployment in Vercel:**
   - Go to Deployments tab
   - Find previous working deployment
   - Click "..." → "Promote to Production"

2. **Database issues:**
   - Neon has automatic backups (restore from dashboard)
   - Keep migration scripts for manual rollback

3. **Environment variable issues:**
   - Double-check all keys are correct
   - Verify no extra spaces or quotes
   - Redeploy after fixing

---

## MVP Feature Completion (Before User Testing)

These features should be completed before inviting beta users:

### Critical:
- [ ] **Export functionality** - Users need to get content out
  - Markdown export
  - HTML export
  - Copy to clipboard
- [ ] **Rate limiting** - Prevent API cost overruns
  - 10 strategies per day per user
  - 25 posts per day per user
  - Display remaining quota on dashboard

### Important:
- [ ] Auto-save in post editor
- [ ] Usage dashboard (show costs, API calls)
- [ ] Error boundaries for graceful failures

---

## User Testing Preparation

### 1. Create Test Accounts
- [ ] Create 3-5 test user accounts
- [ ] Different user roles/use cases:
  - Agency owner
  - Content manager
  - Freelance writer

### 2. Prepare Test Scenarios
- [ ] Document step-by-step test flows
- [ ] Create feedback survey
- [ ] Set up feedback collection method:
  - Google Form
  - Typeform
  - Email

### 3. Beta User Onboarding
- [ ] Create onboarding email template
- [ ] Prepare tutorial video or guide
- [ ] Set up support channel:
  - Email: support@aiso.studio
  - Discord (optional)
  - Intercom (optional)

---

## Success Metrics to Track

- [ ] Number of signups (first 7 days)
- [ ] Activation rate (% who create first strategy)
- [ ] Strategy → Post conversion rate
- [ ] Average AISO score of generated content
- [ ] Time from signup to first post
- [ ] User retention (7-day, 30-day)
- [ ] API costs per user
- [ ] Error rate (target <1%)
- [ ] Page load times

---

## Launch Checklist Summary

**Ready to deploy when:**
- ✅ All core features tested locally
- ✅ Environment variables collected
- ✅ Database schema deployed
- ✅ Clerk production app configured
- ✅ Domain DNS configured
- ✅ API credits loaded ($100+ recommended)

**Ready for user testing when:**
- ✅ Deployed successfully to aiso.studio
- ✅ All core flows tested in production
- ✅ Export functionality working
- ✅ Rate limiting implemented
- ✅ Test scenarios documented
- ✅ Feedback collection set up

---

## Quick Commands

```bash
# Local testing before deploy
npm run build
npm run start

# Deploy via Vercel CLI
npm i -g vercel
vercel --prod

# Check build logs
vercel logs [deployment-url]

# Roll back
vercel rollback [deployment-id]
```

---

## Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **Clerk Production:** https://clerk.com/docs/deployments/overview
- **Neon PostgreSQL:** https://neon.tech/docs/introduction

---

**Last Updated:** 2025-11-20
**Status:** Ready for deployment after MVP features complete
