# AISO Studio - User Testing Guide

**Product:** AISO Studio (aiso.studio)
**Version:** MVP v1.0
**Testing Phase:** Beta
**Date:** 2025-11-20

---

## Testing Objectives

1. Validate core user flows work end-to-end
2. Identify usability issues and pain points
3. Gather feedback on AISO scoring accuracy
4. Measure time-to-value (signup → first post)
5. Assess willingness to pay at proposed pricing

---

## Test User Profiles

### Profile 1: Agency Owner (Sarah)
- **Background:** Runs 5-person marketing agency
- **Pain Point:** Content quality inconsistent, expensive writers
- **Goal:** Scale content production without hiring
- **Tech Savvy:** Moderate
- **Time Available:** 30-45 minutes

### Profile 2: Content Manager (Mike)
- **Background:** In-house content team lead at SaaS company
- **Pain Point:** Too much time editing mediocre drafts
- **Goal:** Improve first-draft quality, reduce revision cycles
- **Tech Savvy:** High
- **Time Available:** 45-60 minutes

### Profile 3: Freelance Writer (Jessica)
- **Background:** Writes blog posts for multiple clients
- **Pain Point:** Struggles with SEO optimization, fact-checking
- **Goal:** Deliver higher-quality work faster
- **Tech Savvy:** Moderate-High
- **Time Available:** 30 minutes

---

## Pre-Testing Setup

### For Testers:
- [ ] Sign up at https://aiso.studio
- [ ] Verify email (if required)
- [ ] Have 1-2 blog post URLs ready to audit
- [ ] Think of a client/industry for strategy creation

### For Admin:
- [ ] Ensure production environment is stable
- [ ] Monitor error logs during testing sessions
- [ ] Prepare to respond to support requests quickly
- [ ] Have analytics/monitoring dashboard open

---

## Test Scenarios

### Scenario 1: First-Time User - Strategy Creation (15-20 min)
**Goal:** Create a content strategy from scratch

#### Steps:
1. **Sign Up / Sign In**
   - Navigate to https://aiso.studio
   - Click "Get Started Free"
   - Complete sign-up form
   - Confirm you're redirected to dashboard

2. **Explore Dashboard**
   - Note first impressions of UI
   - Understand what the stats mean (Strategies, Posts, Approved)
   - Click "Create New Strategy"

3. **Create Strategy**
   - Fill in client details:
     - Client Name: "Green Energy Solutions"
     - Industry: "Renewable Energy"
     - Target Audience: "Homeowners interested in solar panels"
     - Content Goals: "Generate leads, educate on solar benefits"
     - Publishing Frequency: "Weekly"
     - Reading Level: "General audience"
   - Click "Generate Strategy"
   - Wait for generation (should take 30-60 seconds)

4. **Review Generated Topics**
   - Note the quality of the 12-15 topics
   - Check if topics align with client goals
   - Assess diversity (not too repetitive)

#### Success Criteria:
- [ ] Strategy generated successfully
- [ ] Topics are relevant to industry
- [ ] No duplicate or near-duplicate topics
- [ ] Topics have clear, actionable titles
- [ ] User understands next steps

#### Questions for Tester:
1. How long did it take from sign-up to seeing generated topics?
2. Were the topics relevant and useful? (1-5 scale)
3. Would you use these topics for a real client? Why/why not?
4. What would you change about this flow?
5. Were any steps confusing?

---

### Scenario 2: Content Generation (10-15 min)
**Goal:** Generate a blog post from a topic

#### Steps:
1. **Select a Topic**
   - From your strategy, click "Generate Post" on any topic
   - Wait for generation (2-3 minutes)

2. **Review Generated Content**
   - Read through the post
   - Check the AISO score breakdown:
     - AEO Score
     - GEO Score
     - SEO Score
     - Readability Score
     - Engagement Score
   - Scroll through fact-checks (if any)
   - Note the "Why this content..." section

3. **Evaluate Quality**
   - Is the content accurate?
   - Is it readable for the target audience?
   - Does it sound natural or robotic?
   - Are there any obvious errors?

4. **Edit (Optional)**
   - Make small edits to test the editor
   - Check if changes are saved

#### Success Criteria:
- [ ] Post generated within 3 minutes
- [ ] AISO score is 75+ (Good or Excellent)
- [ ] Content is factually accurate
- [ ] No major grammatical errors
- [ ] Fact-checks have sources/citations
- [ ] FAQ section appears (if score ≥65%)

#### Questions for Tester:
1. How would you rate the content quality? (1-10)
2. Would you publish this with minimal edits? Yes/No
3. How many minutes of editing would this need?
4. Did the AISO score seem accurate/fair?
5. What's missing from the generated content?

---

### Scenario 3: Content Audit (10-15 min)
**Goal:** Audit an existing blog post and rewrite it

#### Steps:
1. **Navigate to Audit**
   - Click "AISO Audit" in the navigation
   - Enter a URL of an existing blog post (yours or competitor)
   - Example: https://example.com/blog/sample-post
   - Click "Audit Content"

2. **Review Audit Results**
   - Check the AISO score breakdown
   - Read the detailed feedback
   - Understand what needs improvement
   - Note the "What to Fix" suggestions

3. **Request Rewrite (if available)**
   - Click "Rewrite to Improve"
   - Wait for rewritten version
   - Compare original vs rewritten side-by-side

4. **Assess Improvement**
   - Did the score improve?
   - Is the rewritten version actually better?
   - Are the suggested fixes applied?

#### Success Criteria:
- [ ] Audit completes successfully
- [ ] Score breakdown is clear and understandable
- [ ] Feedback is actionable
- [ ] Rewrite improves score by 10+ points
- [ ] Rewrite addresses specific issues

#### Questions for Tester:
1. Was the audit feedback useful/actionable?
2. Did the rewrite actually improve the content?
3. Would you use this to audit client content? Yes/No
4. How much would you pay for this feature per month?
5. What other audit metrics would be helpful?

---

### Scenario 4: Batch Audit (Optional - 15-20 min)
**Goal:** Audit multiple posts at once

#### Steps:
1. **Navigate to Batch Audit**
   - Go to Dashboard → AISO Audit
   - Click "Batch Audit" tab
   - Enter 3-5 blog post URLs (one per line)

2. **Review Batch Results**
   - See all posts scored at once
   - Identify lowest-scoring posts
   - Sort by score (if available)

3. **Prioritize Improvements**
   - Which posts need rewriting most urgently?
   - Can you export results as PDF/CSV?

#### Success Criteria:
- [ ] Batch audit processes 3-5 URLs successfully
- [ ] Results display in sortable table
- [ ] Errors are handled gracefully (broken URLs, etc.)
- [ ] Can export results for client reporting

#### Questions for Tester:
1. How useful is batch auditing for your workflow?
2. How many URLs would you typically audit at once?
3. What export format do you need? (PDF, CSV, etc.)
4. Would you pay extra for batch audit? How much?

---

### Scenario 5: Export & Delivery (5-10 min)
**Goal:** Export content for use in WordPress/CMS

#### Steps:
1. **Open a Generated Post**
   - Go to Posts page
   - Click on any approved post

2. **Test Export Options**
   - Export as Markdown (if available)
   - Export as HTML (if available)
   - Copy to clipboard
   - Check formatting is preserved

3. **Paste into WordPress**
   - Open WordPress or other CMS (optional)
   - Paste the exported content
   - Note any formatting issues

#### Success Criteria:
- [ ] Export buttons are visible and working
- [ ] Markdown export is clean
- [ ] HTML export is valid (no broken tags)
- [ ] Copy-to-clipboard works
- [ ] Formatting is preserved when pasted

#### Questions for Tester:
1. Which export format do you prefer?
2. Did formatting survive the export/paste?
3. What's missing from the export options?
4. Would WordPress integration be valuable?

---

## General Usability Questions

### Navigation & UI:
1. Is the navigation intuitive? Can you find what you need?
2. Are buttons and links clearly labeled?
3. Is the color scheme pleasant and professional?
4. Does the branding ("AISO Studio") make sense?
5. Is text readable (size, contrast, font)?

### Performance:
1. Do pages load quickly (<3 seconds)?
2. Are there any laggy interactions?
3. Did you encounter any errors or bugs?
4. Did any operations take longer than expected?

### Value Proposition:
1. Do you understand what AISO Studio does?
2. What's the main benefit you'd get from this tool?
3. How does this compare to tools you currently use?
4. What's your biggest concern or hesitation?

---

## Feedback Collection

### Post-Test Survey

#### Section 1: Overall Experience
1. How would you rate your overall experience? (1-10)
2. How likely are you to recommend AISO Studio to a colleague? (1-10, NPS)
3. What did you like most?
4. What frustrated you the most?
5. What's one thing we should fix immediately?

#### Section 2: Feature Value
Rate each feature (Not Valuable → Extremely Valuable):
- Strategy Builder: 1 2 3 4 5
- Content Generation: 1 2 3 4 5
- AISO Scoring: 1 2 3 4 5
- Fact-Checking: 1 2 3 4 5
- Content Audit: 1 2 3 4 5
- Batch Audit: 1 2 3 4 5
- Export Options: 1 2 3 4 5

#### Section 3: Pricing & Willingness to Pay
1. What would you expect to pay per month for this tool?
   - $0 (only if free)
   - $10-25
   - $25-50
   - $50-100
   - $100-200
   - $200+

2. Which pricing model do you prefer?
   - Pay-per-use (per post/audit)
   - Monthly subscription (unlimited)
   - Hybrid (base subscription + overage)

3. What's your monthly budget for content tools?

#### Section 4: Missing Features
1. What features are missing that you need?
2. What integrations would you want?
   - WordPress
   - Webflow
   - Google Docs
   - Notion
   - Slack
   - Other: ___________

3. What would make you upgrade to a paid plan?

---

## Bug Tracking Template

For each bug encountered:

**Bug ID:** [Auto-generated or numbered]
**Severity:** Critical / High / Medium / Low
**User:** [Tester name/email]
**Date/Time:** [When it occurred]

**Steps to Reproduce:**
1. Go to...
2. Click on...
3. Enter...
4. Error appears

**Expected Behavior:**
[What should have happened]

**Actual Behavior:**
[What actually happened]

**Error Message (if any):**
```
[Paste error message]
```

**Screenshots:**
[Attach screenshots if available]

**Browser/Device:**
- Browser: Chrome 120 / Firefox 121 / Safari 17
- OS: Windows 11 / macOS 14 / iOS 17
- Device: Desktop / Mobile

**Priority:**
- [ ] Blocks testing (fix immediately)
- [ ] Annoying but can work around
- [ ] Minor cosmetic issue

---

## Success Metrics

### Quantitative:
- [ ] 80%+ of testers complete first strategy
- [ ] 70%+ of testers generate at least one post
- [ ] Average AISO score of generated posts: 75+
- [ ] Average time from signup to first post: <15 minutes
- [ ] Error rate during testing: <5%
- [ ] NPS score: 40+ (good for early product)

### Qualitative:
- [ ] Testers understand value proposition
- [ ] Testers can explain AISO scoring to others
- [ ] Testers would use this for real clients/work
- [ ] Testers are willing to pay (at least $25/month)
- [ ] No major usability blockers identified

---

## After Testing

### 1. Analyze Feedback
- [ ] Compile all survey responses
- [ ] Categorize bugs by severity
- [ ] Identify top 3 most-requested features
- [ ] Calculate NPS and satisfaction scores

### 2. Prioritize Fixes
**Must-Fix (Before Public Launch):**
- Critical bugs that block core flows
- Major usability issues (affects >50% of testers)
- Missing features users expect (export, save, etc.)

**Should-Fix (Next Sprint):**
- Medium priority bugs
- Nice-to-have features with high demand
- Performance improvements

**Nice-to-Have (Backlog):**
- Low priority bugs
- Feature requests from <30% of testers
- Advanced/edge case features

### 3. Follow Up with Testers
- [ ] Send thank-you email
- [ ] Offer early access discount (if launching paid)
- [ ] Share what you fixed based on their feedback
- [ ] Invite to be beta testers for new features

---

## Tester Recruitment

### Where to Find Beta Testers:
- [ ] LinkedIn (post in marketing groups)
- [ ] Reddit (r/marketing, r/SEO, r/content_marketing)
- [ ] Twitter/X (tweet + DM connections)
- [ ] Facebook groups (agency owners, content marketers)
- [ ] Product Hunt (Ship feature)
- [ ] Indie Hackers community
- [ ] Your personal network

### Outreach Template:
```
Subject: Help me test my new content optimization tool?

Hi [Name],

I'm launching AISO Studio – a tool that helps agencies and content teams create better content using AI + honest scoring (no grade inflation).

I'd love your feedback as an early tester. It takes ~30 minutes, and you'll get:
- 3 free content audits
- 1 free strategy generation
- Early access pricing (50% off when we launch)

Interested? Reply and I'll send you the link + test scenarios.

Thanks!
[Your Name]
```

---

## Testing Schedule

### Week 1: Internal Testing
- Days 1-3: You + team test core flows
- Days 4-5: Fix critical bugs
- Days 6-7: Deploy fixes, re-test

### Week 2: Beta Testing (5-10 users)
- Day 1: Send invites, onboard testers
- Days 2-5: Testers complete scenarios
- Days 6-7: Collect feedback, analyze results

### Week 3: Iteration
- Days 1-4: Fix top issues from beta
- Day 5: Deploy fixes
- Days 6-7: Final testing round (2-3 new testers)

### Week 4: Launch Prep
- Days 1-3: Polish UI/UX
- Day 4: Final smoke tests
- Day 5: Soft launch (invite-only)
- Days 6-7: Monitor, respond to feedback

---

## Contact for Testing Issues

**Email:** support@aiso.studio
**Discord:** [Link if available]
**Response Time:** <24 hours during beta

---

**Next Steps:**
1. Complete deployment to aiso.studio
2. Recruit 5-10 beta testers
3. Send test scenarios + access links
4. Monitor sessions for issues
5. Compile feedback within 48 hours of completion

**Good luck with testing! 🚀**
