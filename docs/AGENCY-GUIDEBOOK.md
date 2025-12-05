# AISO Studio - Marketing Agency Guidebook

> How to use AISO Studio to win clients, serve clients, and grow your agency.

---

## Table of Contents

1. [Understanding Your Context](#understanding-your-context)
2. [Workflow: Winning a Cold Lead](#workflow-winning-a-cold-lead)
3. [Workflow: Serving an Existing Client](#workflow-serving-an-existing-client)
4. [Workflow: Retaining At-Risk Clients](#workflow-retaining-at-risk-clients)
5. [Tool Reference by Use Case](#tool-reference-by-use-case)
6. [What's Next Recommendations by Context](#whats-next-recommendations-by-context)

---

## Understanding Your Context

Before using any tool, know your context:

| Context | You Are... | Your Goal |
|---------|-----------|-----------|
| **Cold Prospecting** | Auditing a prospect's site for the first time | Create urgency, show value, get the meeting |
| **Warm Lead** | Following up with someone who showed interest | Build proposal, compare competitors, close the deal |
| **New Client Onboarding** | Just won the account | Set baseline, create strategy, show quick wins |
| **Active Client Service** | Delivering ongoing work | Track progress, create content, show ROI |
| **At-Risk Retention** | Client hasn't engaged in 30+ days | Re-engage, show value delivered, prevent churn |

---

## Workflow: Winning a Cold Lead

### The Situation
You found a prospect (maybe through lead discovery, referral, or manual research). You want to turn them into a client.

### Step-by-Step Playbook

#### Step 1: Run the Audit
**Where:** `/dashboard/audit`
**Action:** Enter their URL and click "Full AISO Audit"

You'll get:
- AISO Score (AI readiness)
- WCAG Accessibility Score
- AEO, SEO, Readability, Engagement breakdown
- Fact-check analysis

**What to look for:**
- Scores below 70 = strong sales opportunity
- Critical WCAG issues = compliance risk angle
- Low AEO = "invisible to AI" pitch

#### Step 2: Compare Against Competitors
**Where:** `/dashboard/audit/compare` (or click "Compare vs Competitors" in What's Next)
**Action:** Add 2-3 of their competitors

This creates:
- Side-by-side score comparison
- Ranking visualization
- AI-generated sales pitch highlighting gaps

**Sales angle:** "You're ranked #3 out of 4 in your space for AI visibility"

#### Step 3: Add to Pipeline
**Where:** Click "Add to Pipeline" or go to `/dashboard/pipeline`
**Action:** Create the lead record

This lets you:
- Track the opportunity
- Set follow-up reminders
- Generate proposals later

#### Step 4: Generate Proposal
**Where:** `/dashboard/pipeline` → Click lead → "Generate Proposal"
**Action:** Review and customize the AI-generated proposal

The proposal includes:
- Current state analysis
- Recommended services
- ROI projections (score improvement → traffic → leads → revenue)
- Pricing options

#### Step 5: Send & Follow Up
**Where:** Lead profile → Emails tab
**Action:** Use email templates or compose custom outreach

**Email sequence suggestion:**
1. Day 0: Send audit summary + "I found some issues"
2. Day 3: Send competitor comparison
3. Day 7: Send proposal with ROI projections

---

## Workflow: Serving an Existing Client

### The Situation
You won the account. Now you need to deliver value and prove ROI.

### Step-by-Step Playbook

#### Step 1: Set Baseline
**Where:** `/dashboard/audit`
**Action:** Run comprehensive audit on their site

Save this as the "before" snapshot. You'll compare against this later.

#### Step 2: Create Content Strategy
**Where:** `/dashboard/strategies/new`
**Action:** Generate AI-powered content strategy

Inputs needed:
- Website URL
- Business type
- Target audience
- Content goals
- Location (for local SEO/GEO)

Output:
- 12+ topic ideas with titles
- Keyword targets
- Content calendar suggestions

#### Step 3: Produce Content
**Where:** `/dashboard/strategies/[id]` → Topics → "Write"
**Action:** Generate blog posts with AISO optimization

Each post is:
- Fact-checked
- AEO optimized (FAQ sections, direct answers)
- SEO optimized (headers, keywords, meta)
- Readable (Flesch-Kincaid optimized)

#### Step 4: Track Progress
**Where:** `/dashboard/clients` → Client Profile → "Progress" tab
**Action:** View before/after comparison

Shows:
- First audit vs latest audit
- Score improvements by category
- Trend visualization

#### Step 5: Report to Client
**Where:** Various export options
**Actions:**
- Download audit PDFs
- Export comparison reports
- Share strategy documents

---

## Workflow: Retaining At-Risk Clients

### The Situation
A client hasn't engaged in 30+ days. They might be losing interest or considering competitors.

### Step-by-Step Playbook

#### Step 1: Check Client Health Dashboard
**Where:** `/dashboard/clients/health`
**Action:** Review at-risk clients list

Health statuses:
- 🟢 Healthy: Audited within 30 days
- 🟡 Attention: 30-60 days since last audit
- 🔴 At-Risk: 60+ days since last audit
- 🔵 New: No audits yet

#### Step 2: Run Fresh Audit
**Where:** `/dashboard/audit?domain=[client-domain]`
**Action:** Get current state of their site

Look for:
- What's improved since you started?
- What new issues have appeared?
- How do they compare to competitors now?

#### Step 3: Create Re-Engagement Report
**Action:** Compile progress report showing:
- Where they started (baseline)
- Where they are now
- What you've delivered
- Recommended next steps

#### Step 4: Schedule Check-In
**Where:** Tasks or calendar
**Action:** Set up client meeting to review progress

**Talk track:**
1. "Here's what we've accomplished together"
2. "Here's the ROI you've seen"
3. "Here's what's next to keep momentum"

---

## Tool Reference by Use Case

### I want to... → Use this tool

| Goal | Tool | Path |
|------|------|------|
| Audit a website | AISO Audit | `/dashboard/audit` |
| Audit multiple pages | Batch Audit | `/dashboard/audit/batch` |
| Check accessibility only | WCAG Scan | Audit page → "WCAG Only" |
| Compare against competitors | Competitor Compare | `/dashboard/audit/compare` |
| Find new prospects | Lead Discovery | `/dashboard/leads` |
| Manage sales pipeline | Pipeline | `/dashboard/pipeline` |
| Generate a proposal | Proposal Generator | Pipeline → Lead → Proposal |
| Create content strategy | Strategy Generator | `/dashboard/strategies/new` |
| Write a blog post | Post Writer | Strategy → Topic → Write |
| Improve existing content | Content Rewriter | Audit → "Rewrite" |
| Track client health | Health Dashboard | `/dashboard/clients/health` |
| View client progress | Client Profile | `/dashboard/clients` → Select client |
| Manage tasks | Tasks | `/dashboard/tasks` |
| Store assets | Vault | `/dashboard/assets` |
| Check my usage | Settings | `/dashboard/settings` |

---

## What's Next Recommendations by Context

This section defines what actions should appear in "What's Next" panels based on context.

### After Audit: Cold Lead Context
**Indicators:** URL not associated with existing lead/client

| Priority | Action | Why |
|----------|--------|-----|
| 1 | Add to Pipeline | Track the opportunity |
| 2 | Compare vs Competitors | Create urgency with ranking |
| 3 | Generate Quick Proposal | Strike while iron is hot |

### After Audit: Existing Client Context
**Indicators:** URL matches existing client domain

| Priority | Action | Why |
|----------|--------|-----|
| 1 | View Progress | See before/after improvement |
| 2 | Create/Update Strategy | Plan next content |
| 3 | Generate Report | Show value delivered |

### After Audit: Low Score (<60)
**Indicators:** AISO score below 60

| Priority | Action | Why |
|----------|--------|-----|
| 1 | Compare vs Competitors | "You're falling behind" angle |
| 2 | Generate Proposal | Clear opportunity to help |
| 3 | Add to Pipeline | Don't lose this lead |

### After Audit: High Score (>80)
**Indicators:** AISO score above 80

| Priority | Action | Why |
|----------|--------|-----|
| 1 | Batch Audit Site | Find any weak pages |
| 2 | Create Strategy | Maintain/extend lead |
| 3 | Competitor Watch | Monitor competition |

### After Strategy Creation
| Priority | Action | Why |
|----------|--------|-----|
| 1 | Write First Post | Start delivering value |
| 2 | Share with Client | Get alignment |
| 3 | Set Calendar | Plan publishing schedule |

### After Post Creation
| Priority | Action | Why |
|----------|--------|-----|
| 1 | Audit the Post | Verify quality |
| 2 | Export to CMS | Publish it |
| 3 | Write Next Post | Keep momentum |

### On Pipeline Page
| Priority | Action | Why |
|----------|--------|-----|
| 1 | Follow up on stale leads | Prevent drop-off |
| 2 | Generate proposals for warm leads | Close deals |
| 3 | Discover new leads | Fill the funnel |

### On Client Health Dashboard
| Priority | Action | Why |
|----------|--------|-----|
| 1 | Audit at-risk clients | Prevent churn |
| 2 | Schedule check-ins | Proactive engagement |
| 3 | Batch reports | Scale client updates |

---

## Subscription Tiers & Feature Access

*Note: Define what features are available at each tier*

### Starter Tier
- Single user
- 10 audits/month
- 5 strategies/month
- Basic reports

**What's Next should emphasize:** Upgrade prompts when hitting limits

### Professional Tier
- Team access (3 users)
- Unlimited audits
- Unlimited strategies
- White-label reports
- Client portal

**What's Next should emphasize:** Full feature set, team collaboration

### Agency Tier
- Unlimited users
- API access
- Custom branding
- Priority support
- Advanced analytics

**What's Next should emphasize:** Scale, automation, white-labeling

---

## Quick Reference: The AISO Sales Pitch

When talking to prospects, here's the core message:

> "AI search engines like ChatGPT, Perplexity, and Google SGE are changing how people find businesses. If your content isn't optimized for AI, you're invisible to a growing segment of searchers. We help you get found by both traditional search AND AI assistants."

### Key Stats to Share
- X% of searches now use AI assistants
- AI-optimized content gets Y% more citations
- WCAG compliance affects Z% of users

### The AISO Difference
1. **Fact-Checking (30% weight)** - AI prioritizes accurate content
2. **AEO Optimization** - Structured for AI to quote
3. **Traditional SEO** - Still matters for Google
4. **Accessibility** - Required for many industries, good for everyone

---

## Next Steps for Implementation

Based on this guidebook, the following UI improvements are recommended:

### 1. Context-Aware What's Next Panels
- Detect if URL matches existing lead/client
- Adjust recommendations based on score
- Show different actions for different subscription tiers

### 2. Guided Workflows
- "Win a Client" wizard
- "Onboard New Client" checklist
- "Monthly Client Report" generator

### 3. Dashboard Improvements
- Show "Suggested Actions" based on pipeline state
- Highlight at-risk clients prominently
- Surface leads that need follow-up

### 4. Onboarding Flow
- Ask user's primary goal (win clients vs serve clients)
- Customize dashboard based on answer
- Show relevant tutorials
