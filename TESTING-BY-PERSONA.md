# AISO Studio - Testing by Persona

**Date:** _______________
**Environment:** https://aiso.studio

---

## TEST ACCOUNTS

| Persona | Email | Tier | Limits | Created? |
|---------|-------|------|--------|----------|
| New Visitor | (not logged in) | none | Landing page only | N/A |
| Trial User | [email]+trial@... | trial | 10 articles, 1 strategy, 7 days | [ ] |
| Starter | [email]+starter@... | starter | 50 articles, 3 strategies | [ ] |
| Professional | [email]+pro@... | professional | 200 articles, 10 strategies | [ ] |
| Agency | [email]+agency@... | agency | Unlimited | [ ] |

---

# PERSONA 1: NEW VISITOR (Not Logged In)

**Goal:** Understand what AISO does, see value, sign up

## Landing Page
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| Homepage loads | Page displays without errors | [ ] | |
| Value proposition clear | Understand what AISO does in 5 sec | [ ] | |
| "Start Free" CTA visible | Button above the fold | [ ] | |
| Pricing visible | Can see tiers and pricing | [ ] | |
| Features explained | Understand key features | [ ] | |

## Free Audit (if available)
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| Can run audit without login? | Either works or prompts signup | [ ] | |
| Teaser results shown? | Partial results to entice signup | [ ] | |

## Sign Up Flow
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| Click "Start Free" | Clerk modal opens | [ ] | |
| Sign up with email | Works, verification sent | [ ] | |
| Sign up with Google | Works (if enabled) | [ ] | |
| Redirected after signup | Goes to dashboard | [ ] | |

---

# PERSONA 2: TRIAL USER (7-Day Trial)

**Goal:** Explore features, see value, decide to upgrade
**Limits:** 10 articles, 1 strategy, 1 seat, 7 days

## Dashboard
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| Dashboard loads | Shows trial badge/banner | [ ] | |
| Trial countdown visible | Days remaining shown | [ ] | |
| Usage stats shown | X/10 articles, X/1 strategies | [ ] | |
| Upgrade prompts visible | CTA to upgrade | [ ] | |

## Run First Audit
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| Navigate to Audit | Page loads | [ ] | |
| Enter any URL | Accepted | [ ] | |
| Click "Run Audit" | Loading state shown | [ ] | |
| Results appear | AISO score + breakdown (30-90 sec) | [ ] | |
| All score components shown | AEO, SEO, Readability, etc. | [ ] | |
| Download PDF works | Report downloads | [ ] | |

## Create First Strategy
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| Navigate to Strategies | Page loads | [ ] | |
| Click "New Strategy" | Form opens | [ ] | |
| Fill in details | All fields work | [ ] | |
| Submit | Strategy created | [ ] | |
| 15 topics generated | AI creates topic calendar | [ ] | |

## Hit Strategy Limit
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| Try to create 2nd strategy | Blocked | [ ] | |
| Upgrade prompt shown | Clear path to upgrade | [ ] | |
| Message is helpful | Not just "error" | [ ] | |

## Generate Content
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| Select topic | Topic selected | [ ] | |
| Click "Generate" | Content generates | [ ] | |
| Article appears | Full article with scores | [ ] | |
| Article count increments | Now 1/10 used | [ ] | |

## Lead Discovery (if available on trial)
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| Navigate to Leads | Page loads or upgrade prompt | [ ] | |
| If available: Search works | Results appear | [ ] | |
| If blocked: Clear upgrade path | Explains why | [ ] | |

## Trial Expiration Behavior
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| After 7 days: Can still login | Access not completely cut | [ ] | |
| Features blocked | Prompts to upgrade | [ ] | |
| Data preserved | Old work still visible | [ ] | |

---

# PERSONA 3: STARTER USER ($39/mo)

**Goal:** Freelancer managing a few clients
**Limits:** 50 articles, 3 strategies, 1 seat

## Upgraded Experience
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| No trial banner | Shows "Starter" badge | [ ] | |
| Correct limits shown | 50 articles, 3 strategies | [ ] | |

## Multiple Strategies
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| Create strategy 1 | Works | [ ] | |
| Create strategy 2 | Works | [ ] | |
| Create strategy 3 | Works | [ ] | |
| Create strategy 4 | Blocked + upgrade prompt | [ ] | |
| Switch between strategies | All data loads correctly | [ ] | |

## All Audit Features
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| Single URL audit | Works | [ ] | |
| Batch audit | Works (or upgrade prompt?) | [ ] | |
| Audit history | Shows all past audits | [ ] | |
| Compare audits | Before/after comparison | [ ] | |

## Content Generation
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| Generate multiple articles | Works up to limit | [ ] | |
| Improvement passes | All passes work | [ ] | |
| Export content | Markdown/HTML export | [ ] | |

---

# PERSONA 4: PROFESSIONAL USER ($249/mo)

**Goal:** Growing agency, multiple team members
**Limits:** 200 articles, 10 strategies, 2 seats

## Expanded Limits
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| Can create 10 strategies | All work | [ ] | |
| 200 article limit shown | Correct display | [ ] | |

## Lead Discovery Full Access
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| Search for leads | Full results | [ ] | |
| View lead details | All info shown | [ ] | |
| Add to pipeline | Works | [ ] | |
| Send email to lead | Works | [ ] | |

## Pipeline Management
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| Kanban board loads | All columns visible | [ ] | |
| Drag leads between stages | Status updates | [ ] | |
| Pipeline value tracking | Shows total value | [ ] | |

## Team Features (2 seats)
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| Invite team member | Invitation works | [ ] | |
| Team member can login | Access granted | [ ] | |
| Team member sees shared data | Strategies visible | [ ] | |
| Try to add 3rd member | Blocked | [ ] | |

---

# PERSONA 5: AGENCY USER ($599/mo)

**Goal:** Full agency operations, unlimited everything
**Limits:** Unlimited articles, unlimited strategies, 3 seats

## Unlimited Everything
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| No article limits | Can generate freely | [ ] | |
| No strategy limits | Can create unlimited | [ ] | |
| No upgrade prompts | Clean experience | [ ] | |

## Full Lead System
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| Lead discovery | Unlimited searches | [ ] | |
| Pipeline management | Full Kanban | [ ] | |
| Email outreach | All templates | [ ] | |
| Proposal generation | Full proposals | [ ] | |

## White-Label / Reports
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| PDF reports | Full branding options | [ ] | |
| Client-ready exports | Professional output | [ ] | |

## Team Management (3 seats)
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| Add 3 team members | All work | [ ] | |
| Role permissions | Can set different roles | [ ] | |
| Activity visibility | See team activity | [ ] | |

---

# CROSS-PERSONA TESTS

## Data Isolation
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| User A can't see User B's data | Properly isolated | [ ] | |
| Strategies are private | Only owner sees | [ ] | |
| Leads are private | Per-user pipeline | [ ] | |

## Upgrade Flow
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| Trial → Starter | Upgrade works | [ ] | |
| Starter → Pro | Upgrade works | [ ] | |
| Pro → Agency | Upgrade works | [ ] | |
| Downgrade flow | Data preserved? | [ ] | |

## Edge Cases
| Test | Expected | Pass/Fail | Notes |
|------|----------|-----------|-------|
| Exactly at limit | Can use last one | [ ] | |
| One over limit | Blocked gracefully | [ ] | |
| Reset monthly limits | Counter resets | [ ] | |

---

# BUGS FOUND

| # | Persona | Feature | Bug Description | Severity |
|---|---------|---------|-----------------|----------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |
| 5 | | | | |

---

# SUMMARY BY PERSONA

| Persona | Tests | Passed | Failed | Blocked |
|---------|-------|--------|--------|---------|
| New Visitor | | | | |
| Trial User | | | | |
| Starter | | | | |
| Professional | | | | |
| Agency | | | | |
| **TOTAL** | | | | |

---

**Ready for Launch?** [ ] Yes  [ ] No - needs work

**Blocking Issues:**
1.
2.
3.
