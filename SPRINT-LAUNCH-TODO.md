# SPRINT LAUNCH TO-DO LIST

**Goal:** Complete all items before final Agency tier testing
**Last Updated:** 2025-12-10

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
- [ ] Pro tier: Verify Sales Pipeline access
- [ ] Pro tier: Verify Lead Discovery access
- [ ] Pro tier: Verify Win-Client wizard access
- [ ] Agency tier: Verify unlimited features work
- [ ] Agency tier: Verify white-label PDF works

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

---

## MEDIUM PRIORITY (Nice to Have)

### 6. UI/UX Polish
- [ ] Check all gray fonts are fixed (text-slate-900)
- [ ] Verify mobile responsiveness on key pages
- [ ] Test loading states appear correctly
- [ ] Verify error messages are user-friendly

### 7. PDF Reports
- [ ] Audit PDF downloads correctly
- [ ] PDF has proper branding/formatting
- [ ] Comparison PDF works after rewrite

### 8. Asset Vault
- [ ] Upload test file
- [ ] Verify storage limits by tier
- [ ] Download uploaded file

---

## KNOWN ISSUES TO VERIFY FIXED

| Issue | Status | Notes |
|-------|--------|-------|
| Pricing features light gray text | ✅ Fixed | Changed to text-slate-900 |
| WordPress integration missing | ✅ Added | Needs testing |
| | | |

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
- [ ] WordPress plugin (full, not just API)
- [ ] Webflow/Shopify/Squarespace
- [ ] Zapier integration
- [ ] Slack notifications

### Phase 3: Scale
- [ ] AI Search ranking tracker
- [ ] Bulk operations with queuing
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
