# AISO Studio - Testing Checklist

**Tester:** _______________
**Date:** _______________
**Environment:** https://aiso.studio (Production)
**Last Updated:** 2025-12-11

---

## TIER STRUCTURE (Updated 2025-12-09)

| Feature | Trial | Starter ($39) | Professional ($249) | Agency ($599) |
|---------|-------|---------------|---------------------|---------------|
| Active Clients | 1 | 1 | 5 | Unlimited |
| Strategies/mo | 1 | 1 | 10 | Unlimited |
| Posts/mo | 10 | 10 | 100 | Unlimited |
| Audits/mo | 5 | 5 | 50 | Unlimited |
| Rewrites/mo | 5 | 5 | 50 | Unlimited |
| Repurposes/mo | 1 | 1 | 25 | Unlimited |
| Vault Storage | 5 GB | 5 GB | 20 GB | 1 TB |
| Data Retention | 90 days | 90 days | 90 days | Unlimited |
| Sales/Pipeline | ❌ | ❌ | ✅ | ✅ |
| Win-Client | ❌ | ❌ | ✅ | ✅ |
| Clients Mgmt | ❌ | ❌ | ✅ | ✅ |
| Trial Duration | 7 days | N/A | N/A | N/A |

---

## TESTING PROGRESS

### Tier Testing Status
| Tier | Status | Date Tested | Notes |
|------|--------|-------------|-------|
| Free Audit (Public) | ✅ DONE | 2025-12-09 | Marketing message updated |
| Trial | ✅ DONE | 2025-12-09 | All limits enforced, 7-day expiration |
| Starter | ✅ DONE | 2025-12-09 | Same as Trial (functionally identical) |
| Professional | ⏳ PENDING | - | Need to test Sales/Pipeline/Win-Client |
| Agency | ⏳ PENDING | - | Need to test unlimited features |

---

## Test Accounts Needed

Create these accounts by signing up at https://aiso.studio:

| Persona | Email | Tier | Status |
|---------|-------|------|--------|
| Trial User | [your+trial@email] | trial | [x] Created |
| Starter User | [your+starter@email] | starter | [ ] Created [ ] Upgraded |
| Pro User | [your+pro@email] | professional | [ ] Created [ ] Upgraded |
| Agency User | [your+agency@email] | agency | [ ] Created [ ] Upgraded |

---

## 1. AUTHENTICATION & ONBOARDING

### 1.1 Sign Up Flow
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| Click "Sign Up" | Clerk modal appears | [ ] | |
| Sign up with email | Verification email sent | [ ] | |
| Verify email | Redirected to dashboard | [ ] | |
| User created in database | Check DB has correct tier (trial) | [ ] | |

### 1.2 Sign In Flow
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| Click "Sign In" | Clerk modal appears | [ ] | |
| Sign in with valid credentials | Redirected to dashboard | [ ] | |
| Sign in with invalid credentials | Error message shown | [ ] | |

### 1.3 Sign Out Flow
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| Click user menu → Sign Out | Logged out, redirected to home | [ ] | |

---

## 2. DASHBOARD

### 2.1 Dashboard Load
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| Navigate to /dashboard | Page loads without errors | [ ] | |
| Shows user name/email | Correct user info displayed | [ ] | |
| Shows subscription tier | Correct tier badge shown | [ ] | |
| Shows usage stats | Articles used, strategies, etc. | [ ] | |

### 2.2 Navigation
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| All sidebar links work | Each page loads | [ ] | |
| Active page highlighted | Current page shows active state | [ ] | |
| Mobile menu works | Hamburger menu opens/closes | [ ] | |

---

## 3. CONTENT AUDIT (Core Feature)

### 3.1 Single URL Audit
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| Navigate to Audit page | Page loads | [ ] | |
| Enter valid URL | URL accepted | [ ] | |
| Click "Run Audit" | Loading state shown | [ ] | |
| Audit completes | Results displayed (30-60 seconds) | [ ] | |
| AISO Score shown | Score 0-100 with breakdown | [ ] | |
| AEO Score displayed | Answer Engine Optimization score | [ ] | |
| SEO Score displayed | Search Engine Optimization score | [ ] | |
| Readability Score displayed | Flesch-based score | [ ] | |
| Engagement Score displayed | Hooks, CTAs analysis | [ ] | |
| Fact-Check Score displayed | Claims verified | [ ] | |
| WCAG/Accessibility Score displayed | Accessibility issues found | [ ] | |

### 3.2 Audit Results Actions
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| Download PDF report | PDF generates and downloads | [ ] | |
| View detailed breakdown | Expandable sections work | [ ] | |
| Rewrite from URL | Opens rewrite modal/page | [ ] | |

### 3.3 Batch Audit
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| Navigate to Batch Audit | Page loads | [ ] | |
| Enter multiple URLs | URLs accepted (one per line) | [ ] | |
| Run batch audit | Progress shown for each URL | [ ] | |
| All results displayed | Table shows all audits | [ ] | |

### 3.4 Audit History
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| View previous audits | List of past audits shown | [ ] | |
| Click to view details | Old audit results load | [ ] | |
| Compare audits | Before/after comparison works | [ ] | |

---

## 4. CONTENT STRATEGY

### 4.1 Create Strategy
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| Navigate to Strategies | Page loads | [ ] | |
| Click "New Strategy" | Form/wizard opens | [ ] | |
| Fill required fields | Form validates | [ ] | |
| - Client name | Required, accepts text | [ ] | |
| - Industry | Dropdown or text | [ ] | |
| - Target audience | Text field | [ ] | |
| - Brand voice | Options or text | [ ] | |
| - Content frequency | Weekly/Monthly options | [ ] | |
| Submit form | Strategy created | [ ] | |
| AI generates topics | 15 topics created | [ ] | |

### 4.2 View/Edit Strategy
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| Click existing strategy | Strategy details load | [ ] | |
| Edit strategy details | Changes save | [ ] | |
| View topics list | All 15 topics shown | [ ] | |
| Edit topic | Topic updates | [ ] | |
| Delete topic | Topic removed | [ ] | |
| Reorder topics | Drag/drop works | [ ] | |

### 4.3 Strategy Limits (by tier)
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| Trial: Create 1 strategy | Allowed | [x] | Tested 2025-12-09 |
| Trial: Create 2nd strategy | Blocked with upgrade prompt | [x] | Tested 2025-12-09 |
| Trial: Add 2nd domain/client | Blocked (1 active client limit) | [x] | Tested 2025-12-09 |
| Starter: Same as Trial | 1 strategy, 1 client | [ ] | |
| Pro: Create 10 strategies | Allowed | [ ] | |
| Pro: 5 active clients | Allowed | [ ] | |
| Pro: 6th client | Blocked | [ ] | |
| Agency: Unlimited | No limits | [ ] | |

---

## 5. CONTENT GENERATION

### 5.1 Generate Article
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| Select topic from strategy | Topic selected | [ ] | |
| Click "Generate Content" | Loading state | [ ] | |
| Article generates | Full article appears (1-3 min) | [ ] | |
| AISO score calculated | Score shown with breakdown | [ ] | |
| Word count shown | Matches expected length | [ ] | |

### 5.2 Improvement Passes
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| Run Readability Pass | Content rewritten, score updates | [ ] | |
| Run SEO Pass | SEO elements improved | [ ] | |
| Run AEO Pass | Answer optimization improved | [ ] | |
| Run Engagement Pass | Hooks/CTAs added | [ ] | |
| Run Full Rewrite | Complete regeneration | [ ] | |

### 5.3 Content Actions
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| Copy to clipboard | Content copied | [ ] | |
| Export as Markdown | .md file downloads | [ ] | |
| Export as HTML | .html file downloads | [ ] | |
| View version history | Previous versions shown | [ ] | |

---

## 6. FACT-CHECKING

### 6.1 Automatic Fact-Check
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| Generate content with claims | Claims auto-detected | [ ] | |
| Claims listed | Each claim shown | [ ] | |
| Verification status | Verified/Unverified/Unable | [ ] | |
| Sources shown | Links to verification sources | [ ] | |
| Confidence score | Percentage shown | [ ] | |

### 6.2 Manual Fact-Check
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| Click "Re-check" on claim | Claim re-verified | [ ] | |
| Mark as manually verified | Status updates | [ ] | |

---

## 7. LEAD DISCOVERY

### 7.1 Search for Leads
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| Navigate to Lead Discovery | Page loads | [ ] | |
| Enter industry | Field accepts text | [ ] | |
| Enter location | City/State accepted | [ ] | |
| Click "Search" | Results load | [ ] | |
| Businesses displayed | List of businesses shown | [ ] | |
| Each has AISO score | Pre-scored leads | [ ] | |
| Each has WCAG score | Accessibility issues noted | [ ] | |

### 7.2 Lead Details
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| Click on lead | Details modal/page opens | [ ] | |
| Website shown | URL displayed | [ ] | |
| Contact info shown | If available | [ ] | |
| Pain points identified | AISO/WCAG issues listed | [ ] | |
| Recommended pitch | Suggested approach shown | [ ] | |
| Estimated value | Dollar value estimate | [ ] | |

### 7.3 Add to Pipeline
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| Click "Add to Pipeline" | Lead added to Kanban | [ ] | |
| Duplicate prevention | Can't add same lead twice | [ ] | |

---

## 8. PIPELINE / KANBAN

### 8.1 View Pipeline
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| Navigate to Pipeline | Kanban board loads | [ ] | |
| All columns visible | 9 stages shown | [ ] | |
| Leads in correct columns | Based on status | [ ] | |
| Toggle to Table view | Table displays correctly | [ ] | |

### 8.2 Manage Leads
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| Drag lead to new column | Status updates | [ ] | |
| Click lead card | Details modal opens | [ ] | |
| Edit lead details | Changes save | [ ] | |
| Add notes | Notes saved | [ ] | |
| Set priority | HOT/WARM/COLD badge updates | [ ] | |

### 8.3 Pipeline Metrics
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| Total value shown | Sum of pipeline value | [ ] | |
| Per-stage counts | Number in each stage | [ ] | |

---

## 9. EMAIL OUTREACH

### 9.1 Send Email
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| Click "Send Email" on lead | Email modal opens | [ ] | |
| Select template | Template loads | [ ] | |
| - Accessibility Urgent | Legal risk angle template | [ ] | |
| - Hot Lead | High-value template | [ ] | |
| - Warm Lead | Moderate opportunity | [ ] | |
| - Cold Intro | General outreach | [ ] | |
| - Custom | Empty for custom writing | [ ] | |
| Preview email | Full email shown | [ ] | |
| Edit subject/body | Changes reflected | [ ] | |
| Click "Send" | Email sends | [ ] | |
| Confirmation shown | Success message | [ ] | |
| Lead status updates | Changed to "Contacted" | [ ] | |

### 9.2 Email History
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| View sent emails | List of sent emails | [ ] | |
| Email timestamp | Date/time shown | [ ] | |
| Open tracking | If opened, shown | [ ] | |

---

## 10. STRATEGIC LINKING

### 10.1 Money Pages
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| Navigate to Money Pages | Page loads | [ ] | |
| Add money page | URL and type accepted | [ ] | |
| Set as primary/secondary | Designation saves | [ ] | |
| View linking opportunities | Suggestions shown | [ ] | |

### 10.2 Topic Clusters
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| Create topic cluster | Cluster created | [ ] | |
| Add topics to cluster | Topics grouped | [ ] | |
| View cluster visualization | Cluster map shown | [ ] | |

---

## 11. REPORTS & EXPORTS

### 11.1 PDF Reports
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| Generate audit PDF | PDF downloads | [ ] | |
| PDF has branding | Logo, colors correct | [ ] | |
| All scores included | Complete breakdown | [ ] | |
| Recommendations included | Action items listed | [ ] | |

### 11.2 Proposal Generation
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| Generate proposal for lead | Proposal created | [ ] | |
| Includes audit findings | Issues listed | [ ] | |
| Pricing suggestions | Based on lead value | [ ] | |
| Download as PDF | PDF generates | [ ] | |

---

## 12. ADMIN FEATURES (Agency tier only)

### 12.1 Team Management
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| Invite team member | Invitation sent | [ ] | |
| Team member joins | Access granted | [ ] | |
| Set permissions | Role assigned | [ ] | |
| Remove team member | Access revoked | [ ] | |

### 12.2 Usage Dashboard
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| View team usage | All members' usage shown | [ ] | |
| Export usage report | CSV/PDF downloads | [ ] | |

---

## 13. ERROR HANDLING

### 13.1 Graceful Failures
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| Enter invalid URL for audit | Error message, not crash | [ ] | |
| API timeout | Retry option shown | [ ] | |
| Network disconnection | Offline message | [ ] | |
| Server error (500) | User-friendly error page | [ ] | |

### 13.2 Validation
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| Submit empty required field | Validation error shown | [ ] | |
| Invalid email format | Rejected with message | [ ] | |
| URL without protocol | Auto-adds https:// or error | [ ] | |

---

## 14. PERFORMANCE

### 14.1 Load Times
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| Dashboard loads | < 3 seconds | [ ] | |
| Strategy list loads | < 2 seconds | [ ] | |
| Audit results display | < 60 seconds total | [ ] | |
| Lead search results | < 10 seconds | [ ] | |

### 14.2 Responsiveness
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| Desktop (1920x1080) | Layout correct | [ ] | |
| Tablet (768x1024) | Responsive layout | [ ] | |
| Mobile (375x667) | Mobile-friendly | [ ] | |

---

## CRITICAL BUGS FOUND

| # | Feature | Bug Description | Severity | Fixed? |
|---|---------|-----------------|----------|--------|
| 1 | | | High/Med/Low | [ ] |
| 2 | | | | [ ] |
| 3 | | | | [ ] |
| 4 | | | | [ ] |
| 5 | | | | [ ] |

---

## IMPROVEMENT SUGGESTIONS

| # | Feature | Suggestion |
|---|---------|------------|
| 1 | | |
| 2 | | |
| 3 | | |

---

## 15. AI VISIBILITY TRACKER (Admin Only - Internal)

**Note:** This feature is only visible to admin emails (mrpoffice@gmail.com, kim@aliidesign.com). Other users see "Page not found" at /dashboard/admin/ai-visibility.

### 15.1 AI Discovery Check
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| Navigate to /dashboard/admin/ai-visibility | Page loads (admin only) | [ ] | |
| Non-admin visits page | "Page not found" shown | [ ] | |
| Enter URL + Industry | Fields accept input | [ ] | |
| Click "Run Discovery" | Loading "Asking AI questions..." | [ ] | |
| Results display | Citation rate %, questions cited | [ ] | |
| Shows "AI Knows You" percentage | 0-100% based on citations | [ ] | |
| Green list: Questions cited for | Shows which questions you're found for | [ ] | |
| Red list: Questions NOT cited for | Shows gaps in AI visibility | [ ] | |
| Strongest/Weakest category | Informational/Commercial/Transactional | [ ] | |
| Top competitors shown | Other domains AI recommends | [ ] | |
| Auto-generated sales pitch | Based on citation rate | [ ] | |

### 15.2 Who Does AI Trust?
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| Switch to "Who Does AI Trust?" tab | Tab loads | [ ] | |
| Enter Industry only | Field accepts input | [ ] | |
| Click "Find Trusted Sources" | Loading "Asking AI..." | [ ] | |
| Ranked list of domains | Shows top cited sources | [ ] | |
| Citation count per domain | Xn times cited | [ ] | |
| Avg position shown | Position in AI responses | [ ] | |
| Question categories per domain | Tags for info/commercial/etc | [ ] | |
| Dominant player callout | Yellow banner if one dominates | [ ] | |
| Sales pitch generated | "When people ask AI about X, here's who gets recommended..." | [ ] | |

### 15.3 Question Categories Displayed
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| Informational questions | "What is X?", "How does X work?" | [ ] | |
| Commercial questions | "Best X companies", "How much does X cost?" | [ ] | |
| Transactional questions | "How do I hire X?", "Best X for small business" | [ ] | |
| Location-specific (if provided) | "Best X in [location]" | [ ] | |

### 15.4 UI/UX
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| Light mode only | No dark mode regardless of system setting | [ ] | |
| "Internal Only" badge visible | Amber warning badge at top | [ ] | |
| Cost info in footer | Shows ~$0.005 per question | [ ] | |

---

## 16. ADMIN TOOLS DROPDOWN (Updated 2025-12-11)

**Note:** Admin tools are only visible to admin emails defined in `lib/admin-config.ts` (mrpoffice@gmail.com, kim@aliidesign.com).

### 16.1 Admin Access
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| Admin user clicks profile dropdown | "Admin Tools" section visible | [ ] | |
| Non-admin user clicks dropdown | No "Admin Tools" section | [ ] | |
| Kim sees Admin Tools | kim@aliidesign.com has access | [ ] | |

### 16.2 Admin Tool Links
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| Click "Free Audit Analytics" | Loads /dashboard/admin/free-audit-analytics | [ ] | |
| Click "AI Visibility Tracker" | Loads /dashboard/admin/ai-visibility | [ ] | |
| Click "Manage Users" | Loads /admin/subscriptions | [ ] | |

### 16.3 Free Audit Analytics Dashboard
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| Overview tab loads | Shows total audits, unique IPs, conversions | [ ] | |
| Conversion rate displayed | Percentage calculated correctly | [ ] | |
| Domain owner vs Agency breakdown | Both counts shown | [ ] | |
| Daily stats table | Last 30 days data | [ ] | |
| All Audits tab | List of recent 100 audits | [ ] | |
| Top Domains tab | Most audited domains ranked | [ ] | |
| Scoring Issues tab | Pages with sub-30 scores flagged | [ ] | |

---

## 17. STRATEGY SITE AUDIT (Updated 2025-12-11)

### 17.1 Running Site Audit
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| Strategy has website URL | "Run Audit" button visible | [ ] | |
| Click "Run Audit" | Crawl starts, status shows | [ ] | |
| Audit completes | Pages and images found | [ ] | |
| Average AISO score shown | Calculated from all pages | [ ] | |

### 17.2 Audit Results Display
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| Pages listed by score | Highest AISO first | [ ] | |
| Each page shows breakdown | AEO, SEO, Read, Engage bars | [ ] | |
| "What We Found" section | H1/H2/H3 counts, images, links | [ ] | |
| Technical SEO badges | Canonical, Open Graph, Schema shown | [ ] | |
| Issues list | Specific problems cited (e.g., "5 images missing alt") | [ ] | |
| Quick Fixes list | Actionable recommendations | [ ] | |

### 17.3 Score Consistency
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| Re-run audit | Old data cleared, fresh scores | [ ] | |
| SEO score matches single URL audit | Same page = same SEO score | [ ] | |
| Detailed metrics populated | h2_count, image_count not null | [ ] | |

### 17.4 Audit History
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| Multiple audits preserved | Old audits not deleted | [ ] | |
| Each audit has own pages | Pages tied to audit_id | [ ] | |
| Latest audit shown by default | Most recent displayed | [ ] | |

### 17.5 Score Breakdown Modal (Kim's Request)
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| Click on AISO score | Modal opens | [ ] | |
| Formula explained | AEO 30%, SEO 20%, etc. | [ ] | |
| Category breakdown | Each score with progress bar | [ ] | |
| Top/bottom pages listed | Best and worst performers | [ ] | |
| Improvement tips shown | Based on lowest scores | [ ] | |

---

## TESTING SUMMARY

| Category | Tests | Passed | Failed | Blocked |
|----------|-------|--------|--------|---------|
| Authentication | | | | |
| Dashboard | | | | |
| Audit | | | | |
| Strategy | | | | |
| Content Gen | | | | |
| Fact-Check | | | | |
| Lead Discovery | | | | |
| Pipeline | | | | |
| Email | | | | |
| Strategic Linking | | | | |
| Reports | | | | |
| Admin | | | | |
| Error Handling | | | | |
| Performance | | | | |
| AI Visibility (Internal) | | | | |
| Admin Tools Dropdown | | | | |
| Strategy Site Audit | | | | |
| **TOTAL** | | | | |

---

**Overall Status:** [ ] Ready for Launch  [ ] Needs Work  [ ] Major Issues

**Blocking Issues for Launch:**
1.
2.
3.

**Sign-off:** _______________  Date: _______________
