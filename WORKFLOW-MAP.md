# Content Command Studio - Complete Workflow Map

## 🗺️ System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONTENT COMMAND STUDIO                        │
│                  AI Search Optimization Platform                 │
└─────────────────────────────────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
            ┌───────▼────────┐       ┌───────▼────────┐
            │  CONTENT GEN   │       │  LEAD GEN      │
            │  (For Clients) │       │  (Prospecting) │
            └────────────────┘       └────────────────┘
```

---

## 📋 WORKFLOW 1: Content Generation (For Existing Clients)

**Goal:** Create high-quality, fact-checked blog content for your clients

```
START
  │
  ├─► 1. CREATE STRATEGY
  │   │
  │   ├─ Dashboard → Strategies → "New Strategy"
  │   │
  │   ├─ Fill in:
  │   │  ├─ Client Name: "Bob's Plumbing"
  │   │  ├─ Industry: "Home Services"
  │   │  ├─ Target Audience: "Homeowners in Phoenix"
  │   │  ├─ Brand Voice: "Professional, Helpful"
  │   │  ├─ Content Type: [Choose one]
  │   │  │   ├─ ✅ National (for SaaS, general topics)
  │   │  │   ├─ ✅ Local (for service businesses)
  │   │  │   └─ ✅ Hybrid (both local + national)
  │   │  │
  │   │  └─ IF Local/Hybrid selected:
  │   │      ├─ City: "Phoenix"
  │   │      ├─ State: "Arizona"
  │   │      └─ Service Area: "Greater Phoenix Metro"
  │   │
  │   └─ Click "Generate Strategy" → AI creates 10 topic ideas
  │
  ├─► 2. REVIEW TOPICS
  │   │
  │   ├─ Dashboard → Strategies → [Select Strategy]
  │   ├─ View AI-generated topics (10 suggestions)
  │   └─ Each topic has: Title, Keyword, Outline, SEO Intent
  │
  ├─► 3. GENERATE CONTENT
  │   │
  │   ├─ Click "Generate Post" on a topic
  │   │
  │   ├─ AI GENERATION PROCESS (backend):
  │   │   ├─ Step 1: Generate content with Claude Sonnet 4
  │   │   │   ├─ Uses content.ts prompt
  │   │   │   ├─ IF Local: Adds GEO optimization
  │   │   │   │   ├─ "serving [city]" mentions
  │   │   │   │   ├─ "book appointment" CTAs
  │   │   │   │   └─ "near me" optimization
  │   │   │   │
  │   │   │   └─ ALWAYS includes:
  │   │   │       ├─ Direct answer in first paragraph (SGE)
  │   │   │       ├─ FAQ section with 5-8 Q&A (mandatory)
  │   │   │       ├─ Clear H2/H3 structure
  │   │   │       └─ Quotable insights
  │   │   │
  │   │   ├─ Step 2: Fact-Check with Brave Search API
  │   │   │   ├─ Extract claims from content
  │   │   │   ├─ Search web for verification
  │   │   │   ├─ Score: Verified/Uncertain/Unverified
  │   │   │   └─ MUST score 75%+ or regenerate
  │   │   │
  │   │   ├─ Step 3: Calculate AISO Score
  │   │   │   │
  │   │   │   ├─ IF National Content:
  │   │   │   │   ├─ Fact-Check: 30% ⭐ (highest!)
  │   │   │   │   ├─ AEO (SGE): 25%
  │   │   │   │   ├─ SEO: 15%
  │   │   │   │   ├─ Readability: 15%
  │   │   │   │   └─ Engagement: 15%
  │   │   │   │
  │   │   │   └─ IF Local Content:
  │   │   │       ├─ Fact-Check: 25% ⭐ (highest!)
  │   │   │       ├─ AEO (SGE): 20%
  │   │   │       ├─ GEO (GBP): 10%
  │   │   │       ├─ SEO: 15%
  │   │   │       ├─ Readability: 15%
  │   │   │       └─ Engagement: 15%
  │   │   │
  │   │   └─ Step 4: Save to Database
  │   │       ├─ Stores in `posts` table
  │   │       ├─ Includes all scores
  │   │       └─ Links to strategy
  │   │
  │   └─ RESULT: Post created in ~60 seconds
  │
  ├─► 4. REVIEW & EDIT (Optional)
  │   │
  │   ├─ Dashboard → Posts → [Select Post]
  │   │
  │   ├─ View:
  │   │   ├─ Title & Meta Description
  │   │   ├─ Full Content (markdown)
  │   │   ├─ AISO Score Breakdown
  │   │   └─ Fact-Check Results
  │   │
  │   └─ Actions:
  │       ├─ Edit content directly
  │       ├─ Copy to clipboard
  │       ├─ Download as Markdown
  │       └─ Rewrite (if score is low)
  │
  ├─► 5. REWRITE (If Needed)
  │   │
  │   ├─ Click "Rewrite Content" button
  │   │
  │   ├─ REWRITE PROCESS (iterative):
  │   │   ├─ Iteration 1:
  │   │   │   ├─ AI rewrites focusing on:
  │   │   │   │   ├─ Fix fact-check issues (30% weight)
  │   │   │   │   ├─ Add FAQ section if missing
  │   │   │   │   ├─ Add direct answer if missing
  │   │   │   │   └─ Improve AEO signals
  │   │   │   │
  │   │   │   ├─ Fact-check rewritten content
  │   │   │   ├─ Calculate new AISO score
  │   │   │   └─ If score < 75, continue...
  │   │   │
  │   │   ├─ Iteration 2 (if needed):
  │   │   │   └─ Repeat process
  │   │   │
  │   │   └─ Return best result (highest score)
  │   │
  │   ├─ RESULT:
  │   │   ├─ Shows before/after scores
  │   │   ├─ Shows improvement breakdown
  │   │   └─ Auto-downloads comparison PDF
  │   │
  │   └─ PDF INCLUDES:
  │       ├─ Score comparison (visual boxes)
  │       ├─ Category breakdown table
  │       ├─ Side-by-side content comparison
  │       └─ Professional branding
  │
  └─► 6. DELIVER TO CLIENT
      │
      ├─ Copy content to CMS (WordPress, etc.)
      ├─ Or provide PDF report
      └─ Publish on client's website

END
```

---

## 🎯 WORKFLOW 2: Lead Generation (For Prospecting)

**Goal:** Audit competitor websites to identify content gaps and create sales opportunities

```
START
  │
  ├─► 1. IDENTIFY TARGET PROSPECT
  │   │
  │   ├─ Find competitor/prospect website
  │   ├─ Example: "johnsplumbing.com"
  │   └─ Note: Looking for local businesses (plumbers, lawyers, dentists, etc.)
  │
  ├─► 2. COLLECT BLOG POST URLS
  │   │
  │   ├─ METHOD A: Manual Collection
  │   │   ├─ Browse their blog
  │   │   └─ Copy 10-20 post URLs
  │   │
  │   ├─ METHOD B: Sitemap (Recommended)
  │   │   ├─ Visit: johnsplumbing.com/sitemap.xml
  │   │   ├─ Find blog post URLs
  │   │   └─ Copy list
  │   │
  │   └─ METHOD C: Crawler Tool
  │       └─ Use Screaming Frog, etc.
  │
  ├─► 3. RUN BATCH AUDIT
  │   │
  │   ├─ Dashboard → Audit → "Batch Audit" tab
  │   │
  │   ├─ Paste URLs (one per line):
  │   │   https://johnsplumbing.com/blog/post-1
  │   │   https://johnsplumbing.com/blog/post-2
  │   │   https://johnsplumbing.com/services/phoenix-plumber
  │   │   ... (up to 50)
  │   │
  │   ├─ Click "Audit All URLs"
  │   │
  │   ├─ BATCH AUDIT PROCESS (backend):
  │   │   │
  │   │   ├─ For each URL:
  │   │   │   ├─ Step 1: Scrape content
  │   │   │   │   ├─ Fetch HTML
  │   │   │   │   ├─ Extract article content
  │   │   │   │   ├─ Convert to markdown
  │   │   │   │   └─ Extract title, meta, publish date
  │   │   │   │
  │   │   │   ├─ Step 2: AUTO-DETECT Content Type
  │   │   │   │   ├─ Check URL: /phoenix-plumber/ → LOCAL ✓
  │   │   │   │   ├─ Check title: "Plumber in Phoenix, AZ" → LOCAL ✓
  │   │   │   │   ├─ Check content signals:
  │   │   │   │   │   ├─ "serving Phoenix" → +1
  │   │   │   │   │   ├─ "call now" → +1
  │   │   │   │   │   ├─ "Phoenix, AZ" → +1
  │   │   │   │   │   └─ 3+ signals → LOCAL ✓
  │   │   │   │   │
  │   │   │   │   └─ Result: isLocalContent = true/false
  │   │   │   │
  │   │   │   ├─ Step 3: Score Content (NO fact-check for speed)
  │   │   │   │   │
  │   │   │   │   ├─ Calculate:
  │   │   │   │   │   ├─ AEO Score (0-100)
  │   │   │   │   │   ├─ SEO Score (0-100)
  │   │   │   │   │   ├─ Readability Score (0-100)
  │   │   │   │   │   ├─ Engagement Score (0-100)
  │   │   │   │   │   └─ IF local: GEO Score (0-100)
  │   │   │   │   │
  │   │   │   │   ├─ IF National:
  │   │   │   │   │   └─ AISO = AEO 35% + SEO 30% + Read 20% + Engage 15%
  │   │   │   │   │
  │   │   │   │   └─ IF Local:
  │   │   │   │       └─ AISO = AEO 30% + GEO 10% + SEO 25% + Read 20% + Engage 15%
  │   │   │   │
  │   │   │   ├─ Step 4: Detect AEO/GEO Features
  │   │   │   │   ├─ Has FAQ section? (yes/no)
  │   │   │   │   ├─ Has direct answer? (yes/no)
  │   │   │   │   ├─ Has GBP optimization? (yes/no)
  │   │   │   │   └─ Has booking CTA? (yes/no)
  │   │   │   │
  │   │   │   └─ Step 5: Identify Issues
  │   │   │       ├─ Short content (<800 words)
  │   │   │       ├─ No images
  │   │   │       ├─ Poor structure
  │   │   │       ├─ No links
  │   │   │       └─ Hard to read
  │   │   │
  │   │   └─ Compile Results
  │   │
  │   └─ Cost: $0.01 per URL (cheap for prospecting!)
  │
  ├─► 4. ANALYZE RESULTS
  │   │
  │   ├─ VIEW SUMMARY DASHBOARD:
  │   │   │
  │   │   ├─ Overall Stats:
  │   │   │   ├─ Total posts: 20
  │   │   │   ├─ Successful: 18
  │   │   │   ├─ Failed: 2
  │   │   │   └─ Average AISO: 64/100
  │   │   │
  │   │   ├─ Content Type Breakdown:
  │   │   │   ├─ Local content: 8 posts (44%)
  │   │   │   └─ National content: 10 posts (56%)
  │   │   │
  │   │   ├─ AISO Distribution:
  │   │   │   ├─ Excellent (85+): 2 posts (11%)
  │   │   │   ├─ Good (75-84): 5 posts (28%)
  │   │   │   └─ Needs Work (<75): 11 posts (61%) ⚠️ OPPORTUNITY!
  │   │   │
  │   │   ├─ AEO Metrics (Answer Engine Optimization):
  │   │   │   ├─ Average AEO: 58/100 ⚠️ LOW!
  │   │   │   ├─ With FAQ section: 3/18 (17%) ⚠️ MISSING!
  │   │   │   └─ With direct answer: 6/18 (33%) ⚠️ NEEDS WORK!
  │   │   │
  │   │   └─ GEO Metrics (Local Business Optimization):
  │   │       ├─ Average GEO: 42/100 ⚠️ VERY LOW!
  │   │       ├─ With GBP optimization: 1/8 (13%) ⚠️ HUGE GAP!
  │   │       └─ With booking CTA: 2/8 (25%) ⚠️ MISSING CTAs!
  │   │
  │   └─ VIEW INDIVIDUAL POST DETAILS:
  │       ├─ Sort by: Lowest score first
  │       ├─ Filter: Local content only
  │       └─ See specific issues per post
  │
  ├─► 5. GENERATE LEAD GEN REPORT
  │   │
  │   ├─ OPPORTUNITY ANALYSIS:
  │   │   │
  │   │   ├─ ❌ Critical Issues Found:
  │   │   │   ├─ "11 posts scoring below 75"
  │   │   │   ├─ "Missing FAQ sections on 15/18 posts"
  │   │   │   ├─ "Local pages not optimized for GBP"
  │   │   │   └─ "No booking CTAs on 6/8 local pages"
  │   │   │
  │   │   ├─ 💰 Revenue Impact:
  │   │   │   ├─ "87% of prospects check GBP first"
  │   │   │   ├─ "Google SGE now appears in 94% of searches"
  │   │   │   └─ "Sites with FAQ sections get 3x more AI citations"
  │   │   │
  │   │   └─ ✅ Proposed Solutions:
  │   │       ├─ "Add FAQ sections (AEO boost)"
  │   │       ├─ "Optimize 8 local pages for GBP"
  │   │       ├─ "Add booking CTAs to service pages"
  │   │       └─ "Rewrite 11 low-scoring posts"
  │   │
  │   └─ EXPORT OPTIONS:
  │       ├─ Download CSV of all results
  │       ├─ Screenshot dashboard
  │       └─ Create pitch deck
  │
  ├─► 6. SALES PITCH
  │   │
  │   ├─ EMAIL TEMPLATE:
  │   │   │
  │   │   │ Subject: "Quick audit of JohnsPlumbing.com"
  │   │   │
  │   │   │ Hi [Name],
  │   │   │
  │   │   │ I ran a quick content audit on your website and found
  │   │   │ some opportunities to improve your Google visibility.
  │   │   │
  │   │   │ Current Status:
  │   │   │ • Average content score: 64/100
  │   │   │ • Missing FAQ sections (Google SGE optimization)
  │   │   │ • Local pages scoring 42/100 for GBP discovery
  │   │   │ • Only 25% of pages have booking CTAs
  │   │   │
  │   │   │ With Google's new AI search (SGE) and Business Profile
  │   │   │ changes, this could be costing you calls.
  │   │   │
  │   │   │ Quick 15-min call to review the full audit?
  │   │   │
  │   │   │ [Calendar Link]
  │   │   │
  │   │   └─ Attach: CSV export or screenshot
  │   │
  │   └─ FOLLOW-UP:
  │       └─ Schedule demo, show specific examples
  │
  └─► 7. CLOSE DEAL → Return to WORKFLOW 1
      │
      └─ Create strategy for new client
          └─ Start generating optimized content

END
```

---

## 🔄 WORKFLOW 3: Single Page Audit (Quick Check)

**Goal:** Audit a single blog post or landing page quickly

```
START
  │
  ├─► Dashboard → Audit → "Single Audit" tab
  │
  ├─► INPUT (Choose one):
  │   ├─ Option A: Paste URL
  │   │   └─ System scrapes content automatically
  │   │
  │   └─ Option B: Paste content directly
  │       └─ Paste markdown or HTML
  │
  ├─► AUDIT PROCESS:
  │   ├─ Step 1: Extract/parse content
  │   ├─ Step 2: Fact-check with Brave Search (FULL)
  │   ├─ Step 3: Calculate ALL scores:
  │   │   ├─ AISO Score (with 30% fact-check)
  │   │   ├─ AEO Score (SGE optimization)
  │   │   ├─ SEO Score
  │   │   ├─ Readability Score
  │   │   └─ Engagement Score
  │   │
  │   └─ Step 4: Generate recommendations
  │
  ├─► VIEW RESULTS:
  │   │
  │   ├─ AISO Score Badge (color-coded)
  │   │   ├─ 85-100: Green "A" (Excellent)
  │   │   ├─ 75-84: Blue "B" (Good)
  │   │   └─ <75: Red "C/D/F" (Needs Work)
  │   │
  │   ├─ Score Breakdown Grid:
  │   │   ├─ Fact-Check: 85/100 (30% weight ⭐)
  │   │   ├─ AEO: 72/100 (25% weight)
  │   │   ├─ SEO: 68/100 (15% weight)
  │   │   ├─ Readability: 78/100 (15% weight)
  │   │   └─ Engagement: 65/100 (15% weight)
  │   │
  │   ├─ AEO Score Card (expandable):
  │   │   ├─ Shows 5 components:
  │   │   │   ├─ Answer Quality: 20/30 pts
  │   │   │   ├─ Citation-Worthiness: 18/25 pts
  │   │   │   ├─ Structured Data: 12/20 pts
  │   │   │   ├─ AI-Friendly Formatting: 12/15 pts
  │   │   │   └─ Topical Authority: 8/10 pts
  │   │   │
  │   │   ├─ Key Indicators:
  │   │   │   ├─ ✅ Direct Answer
  │   │   │   ├─ ❌ FAQ Section (missing!)
  │   │   │   └─ ✅ Clear Definitions
  │   │   │
  │   │   └─ Recommendations:
  │   │       └─ "Add FAQ section to boost AI visibility"
  │   │
  │   ├─ Fact-Check Results:
  │   │   ├─ Total Claims: 12
  │   │   ├─ Verified: 9 (75%)
  │   │   ├─ Uncertain: 2 (17%)
  │   │   └─ Unverified: 1 (8%)
  │   │   └─ List of each claim with status
  │   │
  │   └─ SEO/Readability/Engagement Details
  │
  ├─► ACTIONS:
  │   ├─ "Rewrite Content" → Iterative improvement
  │   ├─ "Copy Content" → Copy to clipboard
  │   └─ "Download Report" → Save as PDF
  │
  └─► Optional: REWRITE → See Workflow 1, Step 5

END
```

---

## 🏗️ Technical Architecture

### **Data Flow: Content Generation**

```
User Input (Strategy)
      ↓
┌─────────────────────┐
│  Strategy Builder   │ → Saves to database (strategies table)
│  (Frontend)         │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  Topic Generator    │ → Claude API (generates 10 topics)
│  (API Route)        │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  Content Generator  │ → Claude API (writes blog post)
│  (API Route)        │ → lib/content.ts prompt
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  Fact Checker       │ → Brave Search API
│  (lib/fact-check)  │ → Verifies claims
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  Scoring Engine     │ → lib/content-scoring.ts
│  (calculateAISO)   │ → Calculates all scores
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  Database (Neon)    │ → Saves post + scores
│  (lib/db.ts)        │
└──────────┬──────────┘
           │
           ↓
     Display to User
```

### **Data Flow: Batch Audit (Lead Gen)**

```
User Input (URLs)
      ↓
┌─────────────────────┐
│  Batch Audit API    │
│  (batch/route.ts)   │
└──────────┬──────────┘
           │
           ↓ (for each URL)
┌─────────────────────┐
│  Web Scraper        │ → Fetch HTML
│  (cheerio)          │ → Extract content
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  Local Detector     │ → detectLocalIntent()
│  (Auto-detection)   │ → Checks URL, title, content
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  Scoring Engine     │ → AEO, SEO, Readability, Engagement
│  (scoreContent)     │ → IF local: + GEO
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  Results Compiler   │ → Aggregates all posts
│  (summary stats)    │ → AEO metrics, GEO metrics
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  Database Log       │ → Usage tracking
│  (lib/db.ts)        │
└──────────┬──────────┘
           │
           ↓
     Display Results
```

---

## 📊 Scoring System Summary

### **National Content (no localContext)**

```
AISO Score = Weighted Average:
├─ Fact-Check:  30% ⭐ (HIGHEST - key differentiator)
├─ AEO:         25% (SGE, ChatGPT, Perplexity optimization)
├─ SEO:         15% (Traditional Google search)
├─ Readability: 15% (Easy to read)
└─ Engagement:  15% (Hooks, CTAs, formatting)
```

### **Local Business Content (with localContext)**

```
AISO Score = Weighted Average:
├─ Fact-Check:  25% ⭐ (HIGHEST - still #1 priority)
├─ AEO:         20% (SGE, ChatGPT, Perplexity optimization)
├─ GEO:         10% (GBP, local discovery, "near me")
├─ SEO:         15% (Traditional Google search)
├─ Readability: 15% (Easy to read)
└─ Engagement:  15% (Hooks, CTAs, formatting)
```

### **Batch Audit (No Fact-Check for Speed)**

```
National:
├─ AEO:         35%
├─ SEO:         30%
├─ Readability: 20%
└─ Engagement:  15%

Local (auto-detected):
├─ AEO:         30%
├─ GEO:         10%
├─ SEO:         25%
├─ Readability: 20%
└─ Engagement:  15%
```

---

## 🎯 Key Features Reference

### **AEO (Answer Engine Optimization) - SGE Focus**

Optimizes for:
- ✅ Google SGE (Search Generative Experience)
- ✅ ChatGPT search
- ✅ Perplexity AI
- ✅ Bing Copilot

**What it detects:**
- Direct answer in first paragraph
- FAQ section (5-8 Q&A pairs)
- Quotable statements with stats
- Clear definitions
- How-to steps
- Data tables

### **GEO (Local Intent Optimization) - GBP Focus**

Optimizes for:
- ✅ Google Business Profile (GBP) discovery
- ✅ Google Maps / Local Pack
- ✅ "Near me" searches
- ✅ Local SEO

**What it detects:**
- Location mentions (city, state)
- "Near me" language
- Booking/appointment CTAs
- Service category mentions
- Business info (hours, phone, address)
- Neighborhood mentions
- Local keywords ("best plumber in Austin")

### **Fact-Check System**

- Uses Brave Search API for verification
- Extracts claims using Claude
- Searches web for evidence
- Scores: Verified / Uncertain / Unverified
- 75%+ verification required for content generation
- Skipped in batch audits for speed/cost

---

## 💰 Cost Structure

| Operation | Cost | Speed | Fact-Check? |
|-----------|------|-------|-------------|
| Generate Strategy | $0.05 | 10s | No |
| Generate Content | $0.50 | 60s | Yes (required) |
| Single Audit | $0.25 | 30s | Yes (full) |
| Batch Audit (per URL) | $0.01 | 5s | No (skip for speed) |
| Rewrite Content | $0.10 | 45s | Yes (per iteration) |

**Typical Monthly Usage:**
- 100 blog posts generated: $50
- 500 batch audit URLs: $5
- 20 rewrites: $2
- **Total: ~$57/month** for heavy use

---

## 🔐 Key Files Reference

### **Frontend Pages**
- `/app/dashboard/page.tsx` - Main dashboard
- `/app/dashboard/strategies/new/page.tsx` - Strategy builder
- `/app/dashboard/audit/page.tsx` - Single + Batch audit
- `/app/dashboard/posts/[id]/page.tsx` - Post editor

### **API Routes**
- `/app/api/topics/[id]/generate/route.ts` - Content generation
- `/app/api/audit/route.ts` - Single audit
- `/app/api/audit/batch/route.ts` - Batch audit (with auto-detection)
- `/app/api/audit/rewrite/route.ts` - Content rewrite (iterative)

### **Core Libraries**
- `/lib/content-scoring.ts` - All scoring algorithms (AEO, GEO, AISO)
- `/lib/content.ts` - Content generation prompts
- `/lib/fact-check.ts` - Brave Search fact verification
- `/lib/db.ts` - Database operations (Neon PostgreSQL)
- `/lib/comparison-pdf-generator.ts` - PDF reports

### **Components**
- `/components/AEOScoreCard.tsx` - AEO breakdown display
- `/components/GEOScoreCard.tsx` - GEO breakdown display
- `/components/AISOBadge.tsx` - Score badge component
- `/components/SchemaViewer.tsx` - JSON-LD schema display

---

## 🚀 Quick Start Guide

### **For Content Creation (Your Clients):**
1. Dashboard → Strategies → New Strategy
2. Fill in client details + choose content type
3. Generate strategy (gets 10 topic ideas)
4. Click "Generate Post" on any topic
5. Review + edit + deliver to client

### **For Lead Generation (Prospecting):**
1. Find competitor's blog URLs
2. Dashboard → Audit → Batch Audit
3. Paste URLs (one per line)
4. Click "Audit All URLs"
5. Review results → Find gaps
6. Create pitch → Close deal → Become their content provider

---

## 📈 Success Metrics

### **Content Quality Thresholds:**
- AISO Score 85+: Excellent ✅
- AISO Score 75-84: Good ✅
- AISO Score <75: Needs improvement ⚠️

### **Lead Gen Opportunity Signals:**
- Average AISO <70: High opportunity
- Missing FAQ sections: Easy win
- Low GEO scores (<50): Local business gap
- No booking CTAs: Conversion loss

---

**Last Updated:** 2025-01-04
**Version:** 2.1 (includes GBP auto-detection)
