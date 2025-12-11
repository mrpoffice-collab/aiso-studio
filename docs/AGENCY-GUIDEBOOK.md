# AISO Studio - Marketing Agency Guidebook

> How to use AISO Studio to win clients, serve clients, and grow your agency.

---

## Table of Contents

1. [Understanding Your Context](#understanding-your-context)
2. [Workflow: Winning a Cold Lead](#workflow-winning-a-cold-lead)
3. [Workflow: Serving an Existing Client](#workflow-serving-an-existing-client)
4. [Workflow: Retaining At-Risk Clients](#workflow-retaining-at-risk-clients)
5. [Workflow: Agency-Tier Power Features](#workflow-agency-tier-power-features) *(NEW)*
6. [Tool Reference by Use Case](#tool-reference-by-use-case)
7. [What's Next Recommendations by Context](#whats-next-recommendations-by-context)
8. [Subscription Tiers & Feature Access](#subscription-tiers--feature-access)

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
- 15 topic ideas with titles
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

## Workflow: Agency-Tier Power Features

### The Situation
You're an agency with multiple clients. You need to scale content production, deliver white-label reports, and automate repetitive tasks.

### Bulk Content Operations

#### Bulk Generate All Topics
**Where:** Strategy page → "Generate All" button
**What it does:** Generates articles for ALL pending topics in one click
**Best for:** Kickstarting a new client's content library

**How it works:**
1. Open a strategy with multiple topics
2. Click "Generate All" (Agency only)
3. Progress bar shows completion status
4. Navigate away safely - job continues in background
5. Return to see all generated posts

**Note:** Only one bulk job runs at a time per user

#### Bulk Approve All Drafts
**Where:** Strategy page → "Approve All" button
**What it does:** Moves all drafts to "Approved" status
**Best for:** Batch-approving client-reviewed content

#### Bulk Download All Posts
**Where:** Strategy page → "Download All" button
**What it does:** Exports all approved posts as a ZIP file
**Contains:** Markdown and/or HTML versions of each post

### White-Label PDF Reports

#### Setup Your Branding
**Where:** `/dashboard/settings/branding`
**Configure:**
- Upload your agency logo (PNG, JPG)
- Set primary brand color (hex code)
- Add contact info (email, phone, website)

#### Generate Branded PDFs
**Where:** Any audit result → "Download PDF"
**What's included:**
- Your logo in header
- Your brand colors
- Your contact info in footer
- Client-ready professional formatting

**No AISO branding appears** - present as your own work

### Adapt to Vertical

#### Repurpose Content for Different Industries
**Where:** Audit result → "Adapt to Vertical" button
**What it does:** Rewrites existing content for a new industry/audience

**Example use case:**
- You wrote "10 SEO Tips for Dentists"
- Client B is a law firm
- Click "Adapt to Vertical" → Select "Legal Services"
- Get "10 SEO Tips for Law Firms" instantly

**Why it matters:** One piece of research, multiple client deliverables

### WordPress Integration

#### Setup (per strategy)
**Where:** Strategy settings → WordPress tab
**Configure:**
- WordPress site URL
- Application password (from WP dashboard)
- Default post status (draft/publish)
- Default author

#### One-Click Publish
**Where:** Approved post → "Publish to WordPress"
**What happens:**
1. Post created in WordPress
2. Featured image uploaded (if set)
3. Categories/tags applied
4. Status updated in AISO

**Mock Mode:** Test without real WP site using mock mode toggle

---

## Tool Reference by Use Case

### I want to... → Use this tool

| Goal | Tool | Path | Tier |
|------|------|------|------|
| Audit a website | AISO Audit | `/dashboard/audit` | All |
| Audit multiple pages | Batch Audit | `/dashboard/audit/batch` | All |
| Check accessibility only | WCAG Scan | Audit page → "WCAG Only" | All |
| Compare against competitors | Competitor Compare | `/dashboard/audit/compare` | All |
| Find new prospects | Lead Discovery | `/dashboard/leads` | Pro+ |
| Manage sales pipeline | Pipeline | `/dashboard/pipeline` | Pro+ |
| Generate a proposal | Proposal Generator | Pipeline → Lead → Proposal | Pro+ |
| Win-Client wizard | Guided Sales | `/dashboard/win-client` | Pro+ |
| Create content strategy | Strategy Generator | `/dashboard/strategies/new` | All |
| Write a blog post | Post Writer | Strategy → Topic → Write | All |
| Improve existing content | Content Rewriter | Audit → "Rewrite" | All |
| Adapt content to new industry | Adapt to Vertical | Audit → "Adapt to Vertical" | Agency |
| Generate all topics at once | Bulk Generate | Strategy → "Generate All" | Agency |
| Approve all drafts at once | Bulk Approve | Strategy → "Approve All" | Agency |
| Export all posts as ZIP | Bulk Download | Strategy → "Download All" | Agency |
| Setup white-label branding | Branding Settings | `/dashboard/settings/branding` | Agency |
| Download branded PDF | PDF Export | Audit → "Download PDF" | Agency |
| Publish to WordPress | WP Integration | Post → "Publish to WordPress" | Agency |
| Track client health | Health Dashboard | `/dashboard/clients/health` | Pro+ |
| View client progress | Client Profile | `/dashboard/clients` → Select client | Pro+ |
| Manage tasks | Tasks | `/dashboard/tasks` | All |
| Store assets | Vault | `/dashboard/assets` | All |
| Check my usage | Settings | `/dashboard/settings` | All |

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

*Updated: December 2025*

### Trial Tier (Free, 7 days)
| Limit | Value |
|-------|-------|
| Active Clients | 1 |
| Strategies/month | 1 |
| Posts/month | 10 |
| Audits/month | 5 |
| Rewrites/month | 5 |
| Repurposes/month | 1 |
| Vault Storage | 5 GB |
| Data Retention | 90 days |

**Features:** Basic audits, content generation, single domain only

### Starter Tier ($39/month)
| Limit | Value |
|-------|-------|
| Active Clients | 1 |
| Strategies/month | 1 |
| Posts/month | 10 |
| Audits/month | 5 |
| Rewrites/month | 5 |
| Repurposes/month | 1 |
| Vault Storage | 5 GB |
| Data Retention | 90 days |

**Features:** Same as Trial, single domain locked

**What's Next should emphasize:** Upgrade prompts when hitting limits

### Professional Tier ($249/month)
| Limit | Value |
|-------|-------|
| Active Clients | 5 |
| Strategies/month | 10 |
| Posts/month | 100 |
| Audits/month | 50 |
| Rewrites/month | 50 |
| Repurposes/month | 25 |
| Vault Storage | 20 GB |
| Data Retention | 90 days |

**Pro-Exclusive Features:**
- Lead Discovery - Find prospects by industry/location
- Sales Pipeline (Kanban) - Track leads through stages
- Win-Client Wizard - Guided proposal creation
- Clients Management - Multiple client profiles
- Multi-domain support - Work with 5 different clients

**What's Next should emphasize:** Full sales toolset, pipeline management

### Agency Tier ($599/month)
| Limit | Value |
|-------|-------|
| Active Clients | Unlimited |
| Strategies/month | Unlimited |
| Posts/month | Unlimited |
| Audits/month | Unlimited |
| Rewrites/month | Unlimited |
| Repurposes/month | Unlimited |
| Vault Storage | 1 TB |
| Data Retention | Unlimited |

**Agency-Exclusive Features:**
- Everything in Professional, plus:
- **White-Label PDF Reports** - Your logo, contact info, brand colors
- **Bulk Generate All** - Generate all pending topics at once
- **Bulk Approve All** - Approve all drafts with one click
- **Bulk Download All** - Export all posts as ZIP
- **Adapt to Vertical** - Rewrite content for different industries
- **WordPress Integration** - One-click publish to client sites
- **Unlimited Data Retention** - Keep client history forever

**What's Next should emphasize:** Scale, automation, white-labeling, bulk operations

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
