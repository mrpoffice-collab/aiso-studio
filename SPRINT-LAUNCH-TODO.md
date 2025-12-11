# SPRINT LAUNCH TO-DO LIST

**Goal:** Complete all items before final Agency tier testing
**Last Updated:** 2025-12-11

---

## BLOCKING ISSUES (Must Fix Before Launch)

### 1. Payment/Stripe Integration
- [ ] Verify Stripe checkout flow works
- [ ] Test upgrade from Trial → Starter
- [ ] Test upgrade from Starter → Pro
- [ ] Test upgrade from Pro → Agency
- [ ] Verify subscription cancellation works
- [ ] Confirm billing page shows correct info

### 2. Tier Feature Gating
- [ ] Pro tier: Verify Prospecting access
- [ ] Pro tier: Verify Lead Discovery access
- [ ] Pro tier: Verify New Business wizard access
- [ ] Agency tier: Verify unlimited features work
- [ ] Agency tier: Verify white-label PDF works
- [ ] Agency tier: Verify Adapt to Vertical works
- [ ] Agency tier: Verify Bulk Operations work

---

## HIGH PRIORITY (Should Complete)

### 3. WordPress Integration Testing
- [ ] Test Mock Mode connection in Strategy settings
- [ ] Test Mock Mode publish from approved post
- [ ] Verify settings save correctly to database
- [ ] Test with a real WordPress site (if available)

### 4. Content Generation Flow ✅ TESTED (Starter/Kim)
- [x] Create strategy → generates 15 topics
- [x] Generate article from topic
- [x] Run improvement passes (Readability, SEO, AEO, Engagement)
- [x] Approve post
- [x] Export as Markdown
- [x] Export as HTML
- [ ] Publish to WordPress (mock) - NEW FEATURE, needs testing

### 5. Lead Discovery → Pipeline Flow
- [ ] Search for leads by industry/location
- [ ] View lead details with AISO score
- [ ] Add lead to pipeline
- [ ] Move lead through Kanban stages
- [ ] Send email from pipeline (if configured)

### 6. AI Visibility Tracker (Admin Internal Tool)
- [ ] Admin can access /dashboard/admin/ai-visibility
- [ ] Non-admin gets "Page not found"
- [ ] AI Discovery Check: Enter URL + industry, get citation results
- [ ] Citation rate % displays correctly
- [ ] Green list shows questions you ARE cited for
- [ ] Red list shows questions you are NOT cited for
- [ ] "Who Does AI Trust?" tab shows ranked domain list
- [ ] AIVisibilityButton appears on leads/pipeline (admin only)
- [ ] Perplexity API integration working (requires API key)

### 7. Lead Capture & Email Sequences (NEW)
- [ ] Free audit shows score teaser (overall score visible)
- [ ] Email gate appears after score display
- [ ] Persona selector works ("My own site" vs "A client's site")
- [ ] Email capture saves to `captured_leads` table
- [ ] First email sends immediately after capture
- [ ] Email 2 sends 2 days after capture (run `/api/admin/process-email-sequences`)
- [ ] Email 3 sends 5 days after capture
- [ ] Solo sequence different from Agency sequence
- [ ] Unsubscribe link works
- [ ] Admin can view lead stats at `/api/admin/process-email-sequences` (GET)

---

## MEDIUM PRIORITY (Nice to Have)

### 8. UI/UX Polish
- [x] Check all gray fonts are fixed (text-slate-900)
- [ ] Verify mobile responsiveness on key pages
- [ ] Test loading states appear correctly
- [x] Verify error messages are user-friendly (historical data rule added)
- [x] Navigation renamed: "Win a Client" → "New Business", "Sales" → "Prospecting"
- [x] Colorful nav buttons (each section has unique color like pipeline stages)
- [x] Footer added to dashboard with integrations section

### 9. PDF Reports
- [ ] Audit PDF downloads correctly
- [x] PDF has proper branding/formatting (Agency tier)
- [ ] Comparison PDF works after rewrite

### 10. Asset Vault
- [ ] Upload test file
- [ ] Verify storage limits by tier
- [ ] Download uploaded file

---

## KNOWN ISSUES TO VERIFY FIXED

| Issue | Status | Notes |
|-------|--------|-------|
| Pricing features light gray text | ✅ Fixed | Changed to text-slate-900 |
| WordPress integration missing | ✅ Added | Needs testing |
| White-label PDF not using branding | ✅ Fixed | Uses logo, contact info, brand colors |
| Concurrent bulk jobs could conflict | ✅ Fixed | One job per user at a time |

---

## QUICK SMOKE TEST (5 Minutes)

Before any major testing session, run through this quick test:

1. [ ] Landing page loads, pricing readable
2. [ ] Sign in works
3. [ ] Dashboard loads with correct tier
4. [ ] Can navigate to Audit page
5. [ ] Can navigate to Strategies page
6. [ ] Can navigate to Lead Discovery (Pro/Agency)
7. [ ] Can navigate to Pipeline (Pro/Agency)

---

## AGENCY TIER FINAL TEST CHECKLIST

Use Kim Kelley's account (kim@aliidesign.com) for Agency testing:

### Core Features
- [ ] Unlimited strategies - can create multiple
- [ ] Unlimited posts - no monthly limit
- [ ] Unlimited audits - no cap
- [ ] Unlimited rewrites - no restrictions

### Agency-Only Features
- [ ] Lead Discovery works
- [ ] Pipeline/Kanban works
- [ ] Win-Client wizard accessible
- [ ] White-label PDF reports (check branding)
- [ ] WordPress publish works (mock or real)
- [ ] Bulk Generate All - generates all pending topics
- [ ] Bulk Approve All - approves all drafts
- [ ] Bulk Download All - exports ZIP of all posts
- [ ] Adapt to Vertical - rewrites content for different industry

### Bulk Operations
- [ ] Progress bar shows during generation
- [ ] Can navigate away and return (job continues)
- [ ] Cannot start second bulk job while one is running
- [ ] Job completion shows success/failure count

### Limits NOT Applied
- [ ] No "upgrade" prompts when using features
- [ ] No storage warnings (1TB limit)
- [ ] No data retention warnings (unlimited)

---

## NICE-TO-HAVE (Post-Launch Sprint 1)

### Agency-Focused Quick Wins

| Feature | Impact | Effort | Status |
|---------|--------|--------|--------|
| Internal linking that works | Critical for SEO agencies | Medium | [ ] |
| WordPress one-click publish | Save 15 min/post | High | [x] Added |
| Content calendar view | Client visibility | Medium | [ ] |
| Bulk content generation | Time savings | Medium | [x] Complete - Generate All, Approve All, Download All |
| White-label PDF reports | Agency branding | Low | [x] Complete - logo, contact, Agency-only |
| Adapt to Vertical | Repurpose content across industries | Medium | [x] Complete - Agency only |

### UX Improvements

- [ ] Loading animations/skeletons
- [ ] Better empty states
- [ ] Mobile responsiveness audit
- [ ] Keyboard shortcuts

---

## FUTURE DEVELOPMENT (Post-Launch)

### Phase 1: Agency Excellence
- [ ] Multi-client management UI
- [ ] Client presentation mode
- [ ] Competitor comparison reports
- [ ] Performance tracking (GA/GSC integration)

### Phase 2: Integrations

#### GoHighLevel Integration
| Task | Status | Notes |
|------|--------|-------|
| API client library | ✅ Done | `lib/highlevel.ts` |
| Settings UI | ✅ Done | `app/dashboard/settings/integrations/page.tsx` |
| Export lead API | ✅ Done | `app/api/integrations/highlevel/export-lead/route.ts` |
| Webhook receiver | ✅ Done | `app/api/webhooks/highlevel/route.ts` |
| Pipelines API | ✅ Done | Fetch user's pipelines from GHL |
| Custom fields API | ✅ Done | Create AISO fields in GHL |
| Database migration | ❌ TODO | Run `migrations/add-highlevel-integration.sql` |
| "Export to GHL" button | ❌ TODO | Add to pipeline lead cards |
| Test with real API key | ❌ TODO | Need Kim's GHL credentials |
| Documentation | ✅ Done | `docs/HIGHLEVEL-INTEGRATION.md` |
| Footer affiliate link | ✅ Done | Links to GHL with `?fp_ref=aiso` |

**User Setup Required:**
1. Get API Key + Location ID from GHL Settings
2. Enter credentials in AISO Settings → Integrations
3. (Optional) Add webhook URL in GHL: `https://aiso.studio/api/webhooks/highlevel`

#### Other Integrations
- [ ] WordPress plugin (full, not just API)
- [ ] Webflow/Shopify/Squarespace
- [ ] Zapier integration
- [ ] Slack notifications

### Phase 3: Scale
- [ ] AI Search ranking tracker
- [x] Bulk operations with queuing (basic version complete)
- [ ] API for custom integrations
- [ ] Team collaboration features

### Phase 4: Advanced
- [ ] Content refresh suggestions
- [ ] Competitor gap analysis
- [ ] Multi-language support

---

## RECOMMENDED LAUNCH PATH

| Timeline | Milestone |
|----------|-----------|
| This Week | Complete Pro/Agency tier testing |
| Next Week | Soft launch to beta users |
| January 2025 | Public launch |

---

## SIGN-OFF

| Item | Completed | Date | Tester |
|------|-----------|------|--------|
| Blocking Issues | [ ] | | |
| High Priority | [ ] | | |
| Smoke Test | [ ] | | |
| Agency Final Test | [ ] | | |

**Ready for Launch:** [ ] Yes  [ ] No - Needs: _____________

---

## NOTES

_Add any notes or issues found during testing here:_

1.
2.
3.
