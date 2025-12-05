# AISO Studio User Personas & Playbooks

## Core Value Proposition
**Help marketing agencies make their clients' websites AI-ready** - optimized for ChatGPT, Perplexity, Claude, and AI-powered search engines.

---

## User Personas

### Persona 1: Agency Owner / Principal
**Role:** Runs the agency, focuses on growth and client acquisition
**Goals:**
- Find new clients who need AI optimization
- Close deals faster with compelling audits
- Track agency revenue and client health
- Scale operations without hiring more staff

**Pain Points:**
- Hard to explain "AI readiness" to prospects
- No easy way to identify who needs help
- Proposals take too long to create
- Can't prove ROI to clients

---

### Persona 2: Account Manager
**Role:** Manages client relationships, oversees deliverables
**Goals:**
- Keep clients happy with visible progress
- Identify upsell opportunities
- Generate reports without manual work
- Coordinate content production

**Pain Points:**
- Clients don't understand what we're doing
- Reporting is manual and time-consuming
- Hard to show before/after improvements
- No central place for client data

---

### Persona 3: Content Strategist / SEO Specialist
**Role:** Plans content calendars, optimizes for search
**Goals:**
- Create AI-optimized content strategies
- Ensure content ranks in both Google AND AI answers
- Track content performance
- Stay ahead of algorithm changes

**Pain Points:**
- Traditional SEO tools don't measure AI visibility
- No guidance on AEO (Answer Engine Optimization)
- Content audits are manual
- Hard to prioritize which content to fix

---

### Persona 4: Content Writer / Creator
**Role:** Actually writes the blog posts and content
**Goals:**
- Write content that scores well
- Get clear briefs and guidelines
- Iterate quickly based on feedback
- Understand what makes content "AI-ready"

**Pain Points:**
- Vague feedback like "make it better"
- No real-time scoring as I write
- Don't understand the AI optimization criteria
- Rewrites take multiple rounds

---

## Feature Map by Persona

| Feature | Owner | Account Mgr | Strategist | Writer |
|---------|-------|-------------|------------|--------|
| **Lead Discovery** | Primary | - | - | - |
| **Free Audit (Sales Tool)** | Primary | Secondary | - | - |
| **Pipeline Management** | Primary | Primary | - | - |
| **Email Outreach** | Primary | Primary | - | - |
| **Proposal Generation** | Primary | Primary | - | - |
| **Client Management** | Secondary | Primary | Secondary | - |
| **Content Strategy** | - | Secondary | Primary | - |
| **Topic Generation** | - | Secondary | Primary | Secondary |
| **Content Audit** | - | Secondary | Primary | Primary |
| **Content Rewrite** | - | - | Secondary | Primary |
| **AISO Scoring** | - | Secondary | Primary | Primary |
| **Accessibility Audit** | - | Secondary | Primary | - |
| **Technical SEO** | - | - | Primary | - |
| **PDF Reports** | Secondary | Primary | Secondary | - |
| **Branding/White-label** | Primary | - | - | - |

---

## Playbook 1: Agency Owner - "The Closer"

### Goal: Find leads, audit them, close deals

#### Step 1: Discover Leads
```
/dashboard/leads → Discover
- Enter: Industry (e.g., "Plumbing")
- Enter: City (e.g., "Dallas")
- Click: Find Leads
```
**What to look for:** Leads with score < 70 = opportunity

#### Step 2: Run Quick Audit
```
Click lead → Run Audit
- Audit reveals AI-readiness gaps
- See AISO score breakdown
```
**Sales angle:** "Your site scores 45/100 for AI visibility"

#### Step 3: Send Outreach
```
Pipeline → Select lead → Send Email
- Use template or customize
- Attach audit PDF
```
**Key message:** "AI search is changing - your competitors are getting ready"

#### Step 4: Generate Proposal
```
Lead → Generate Proposal
- Auto-pulls audit data
- Shows recommended services
- Includes pricing
```

#### Step 5: Close & Convert
```
Pipeline → Drag to "Won"
- Lead becomes Client
- Start strategy work
```

### Current Status:
- [x] Lead Discovery - BUILT
- [x] Pipeline - BUILT
- [x] Email Outreach - BUILT
- [ ] Proposal Generation - PARTIAL (needs polish)
- [ ] ROI Calculator - NOT BUILT
- [ ] Competitor Comparison - NOT BUILT

---

## Playbook 2: Account Manager - "The Keeper"

### Goal: Keep clients happy, identify upsells

#### Step 1: Check Client Health
```
/dashboard/clients → Select client
- View latest audit scores
- Check content published
- Review activity log
```

#### Step 2: Run Periodic Audit
```
Client Profile → Run New Audit
- Compare to baseline
- Show improvement over time
```
**Report angle:** "Since we started, your AI score went from 45 → 72"

#### Step 3: Generate Progress Report
```
Client → Generate Report (PDF)
- Before/after scores
- Content published
- Recommendations
```

#### Step 4: Identify Upsell
```
Client Profile → View Opportunities
- Accessibility issues = new service
- Technical SEO gaps = new project
- More content needs = larger retainer
```

#### Step 5: Schedule Next Touchpoint
```
Tasks → Add follow-up task
- Set reminder for monthly check-in
```

### Current Status:
- [x] Client Management - BUILT
- [x] Audit History - BUILT
- [x] PDF Reports - BASIC
- [ ] Before/After Comparison - NOT BUILT
- [ ] Automated Monthly Reports - NOT BUILT
- [ ] Upsell Opportunity Detection - NOT BUILT
- [ ] Client Health Score Dashboard - NOT BUILT

---

## Playbook 3: Content Strategist - "The Planner"

### Goal: Create AI-optimized content strategies

#### Step 1: Analyze Existing Content
```
/dashboard/strategies/new
- Enter client URL
- Discover existing pages
- Audit current content
```
**Insight:** Find content gaps and underperforming pages

#### Step 2: Generate Strategy
```
Strategy → Generate Topics
- AI creates 15 topic ideas
- Each optimized for AI answers
- Includes target keywords
```

#### Step 3: Prioritize Topics
```
Strategy → Edit Topics
- Reorder by priority
- Cluster related topics
- Set publication schedule
```

#### Step 4: Create Money Pages
```
Strategy → Money Pages
- Identify high-value pages
- Plan pillar content
- Build topic clusters
```

#### Step 5: Audit & Iterate
```
Batch Audit → Audit all client URLs
- Find lowest-scoring pages
- Prioritize rewrites
- Track improvements
```

### Current Status:
- [x] Strategy Creation - BUILT
- [x] Topic Generation - BUILT
- [x] Batch Audit - BUILT
- [x] Topic Clusters - BUILT
- [x] Money Pages - BUILT
- [ ] Content Gap Analysis - PARTIAL
- [ ] Competitor Content Analysis - NOT BUILT
- [ ] Content Calendar View - NOT BUILT
- [ ] Performance Tracking - NOT BUILT

---

## Playbook 4: Content Writer - "The Creator"

### Goal: Write content that scores high

#### Step 1: Get Assignment
```
/dashboard/posts or Strategy → Topic
- See topic brief
- Understand target audience
- Know target keywords
```

#### Step 2: Write & Score
```
Topic → Generate Content
- AI creates first draft
- See real-time AISO score
- Get improvement suggestions
```

#### Step 3: Optimize Content
```
Post → Improve / Rewrite
- Choose optimization pass:
  - Readability
  - SEO
  - AEO (AI answers)
  - Engagement
```

#### Step 4: Check Before Publish
```
Post → Final Audit
- Verify score > 80
- Check accessibility
- Validate facts
```

#### Step 5: Export
```
Post → Export
- Copy HTML/Markdown
- Download for WordPress
```

### Current Status:
- [x] Content Generation - BUILT
- [x] AISO Scoring - BUILT
- [x] Multi-pass Optimization - BUILT
- [x] Fact Checking - BUILT
- [ ] Real-time Score Preview - NOT BUILT
- [ ] WordPress Direct Publish - NOT BUILT
- [ ] Version History - NOT BUILT
- [ ] Collaborative Editing - NOT BUILT

---

## Gap Analysis Summary

### Critical Gaps (Blocks Core Value)
| Gap | Persona Affected | Priority |
|-----|------------------|----------|
| No before/after comparison | Account Mgr | HIGH |
| No competitor analysis | Owner, Strategist | HIGH |
| No WordPress integration | Writer | HIGH |
| No automated reports | Account Mgr | HIGH |

### Important Gaps (Reduces Value)
| Gap | Persona Affected | Priority |
|-----|------------------|----------|
| No ROI calculator | Owner | MEDIUM |
| No content calendar | Strategist | MEDIUM |
| No real-time scoring | Writer | MEDIUM |
| No client health dashboard | Account Mgr | MEDIUM |

### Nice-to-Have Gaps
| Gap | Persona Affected | Priority |
|-----|------------------|----------|
| Version history | Writer | LOW |
| Collaborative editing | Writer | LOW |
| CRM integrations | Owner | LOW |
| Custom scoring weights | Strategist | LOW |

---

## Recommended Priorities for Alpha

### Phase 1: Close the Sales Loop
1. Polish proposal generation
2. Add before/after comparison view
3. Add competitor quick-compare

### Phase 2: Deliver Client Value
1. Automated monthly report emails
2. Client health dashboard
3. Content calendar view

### Phase 3: Scale Content Production
1. WordPress direct publish
2. Real-time score preview
3. Batch content generation

---

## Success Metrics by Persona

### Agency Owner
- Leads discovered per week
- Audit-to-proposal conversion rate
- Deal close rate
- Average deal size

### Account Manager
- Client retention rate
- Upsell revenue
- Reports generated
- Client satisfaction (NPS)

### Content Strategist
- Strategies created
- Average content score improvement
- Content velocity (posts/month)
- Rankings achieved

### Content Writer
- Posts created per week
- Average first-draft score
- Revision cycles needed
- Time to publish

