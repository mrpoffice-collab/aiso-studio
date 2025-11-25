# AISO Studio: Gap Analysis & Improvement Roadmap

## Executive Summary

After comprehensive code review, I've identified **47 improvements** across 8 categories that will transform AISO Studio from a powerful tool into an unstoppable agency growth engine.

**Priority Levels:**
- **P0 (Critical)**: Blocking user journey or causing confusion
- **P1 (High)**: Significant UX improvement or feature completion
- **P2 (Medium)**: Nice-to-have that adds polish
- **P3 (Low)**: Future enhancement

---

## Category 1: AISO Audit Unification (P0)

### The Problem
The AISO audit is the crown jewel, but it's fragmented:
- Pipeline "Run Audit" saves to `lead_audits` table
- Main Audit page saves to `accessibility_audits` table
- User expects ONE report regardless of entry point
- No clear "View Full Report" flow from pipeline

### Improvements Needed

| # | Improvement | Priority | Status |
|---|-------------|----------|--------|
| 1.1 | ~~Unify audit storage - pipeline saves to accessibility_audits~~ | P0 | DONE |
| 1.2 | Pipeline "View Report" button navigates to full audit viewer | P0 | TODO |
| 1.3 | Vault shows audits grouped by domain with history | P0 | PARTIAL |
| 1.4 | Single audit detail page at `/dashboard/audit/[id]` | P0 | TODO |
| 1.5 | "Re-run Audit" button on audit detail page | P1 | TODO |
| 1.6 | Audit comparison view (before/after remediation) | P1 | TODO |

---

## Category 2: Pipeline-to-Content Flow (P0)

### The Problem
The journey from "Lead Won" to "Content Strategy" is disconnected:
- No automatic strategy creation when lead is won
- No link from lead to their strategy
- No visibility into which leads have active strategies

### Improvements Needed

| # | Improvement | Priority | Status |
|---|-------------|----------|--------|
| 2.1 | "Create Strategy" button on lead detail when status = Won | P0 | TODO |
| 2.2 | Pre-populate strategy with lead's domain, industry, city | P0 | TODO |
| 2.3 | Link lead to strategy via `lead_id` on strategies table | P1 | TODO |
| 2.4 | Show "Active Strategy" badge on pipeline cards | P1 | TODO |
| 2.5 | Pipeline filter: "Has Strategy" / "Needs Strategy" | P2 | TODO |
| 2.6 | Auto-create initial strategy when lead marked Won | P2 | TODO |

---

## Category 3: Content-to-Lead Attribution (P1)

### The Problem
Posts exist in isolation - no connection to the lead/client they serve:
- Can't see all content for a specific client
- Can't track content delivery progress
- No client-facing content calendar

### Improvements Needed

| # | Improvement | Priority | Status |
|---|-------------|----------|--------|
| 3.1 | Add `lead_id` column to strategies table | P1 | TODO |
| 3.2 | Strategy list shows client/lead name | P1 | TODO |
| 3.3 | Filter strategies by client/lead | P1 | TODO |
| 3.4 | Lead detail page shows linked strategy + posts | P1 | TODO |
| 3.5 | Content delivery dashboard per client | P2 | TODO |
| 3.6 | Export client content calendar (PDF/CSV) | P2 | TODO |

---

## Category 4: Vault Domain-Centric Experience (P1)

### The Problem
Vault is file-focused, not client/domain-focused:
- Users think in terms of clients, not file types
- Audits appear separate from assets for same domain
- No "everything about domain X" view

### Improvements Needed

| # | Improvement | Priority | Status |
|---|-------------|----------|--------|
| 4.1 | Domain detail page showing all related data | P1 | TODO |
| 4.2 | Group assets by linked domain in sidebar | P1 | TODO |
| 4.3 | Show audit history on domain detail page | P1 | PARTIAL |
| 4.4 | Show linked leads on domain detail page | P1 | TODO |
| 4.5 | Show linked strategies on domain detail page | P1 | TODO |
| 4.6 | "Client Dashboard" view per domain | P2 | TODO |

---

## Category 5: Email & Outreach Polish (P1)

### The Problem
Email system is functional but not delightful:
- Templates are hardcoded, not editable
- No email sequence automation
- No preview before send
- Limited tracking visibility

### Improvements Needed

| # | Improvement | Priority | Status |
|---|-------------|----------|--------|
| 5.1 | Editable email templates in settings | P1 | TODO |
| 5.2 | Email preview modal before send | P1 | TODO |
| 5.3 | Email sent/opened/clicked stats on pipeline | P1 | TODO |
| 5.4 | Bulk email to filtered leads | P1 | TODO |
| 5.5 | Follow-up reminder system | P2 | TODO |
| 5.6 | Multi-step email sequences | P2 | TODO |
| 5.7 | Unsubscribe handling | P2 | TODO |

---

## Category 6: Dashboard & Analytics (P1)

### The Problem
Main dashboard is a stub - shows basic counts but no insights:
- No trend visualization
- No conversion funnel
- No performance metrics
- No actionable recommendations

### Improvements Needed

| # | Improvement | Priority | Status |
|---|-------------|----------|--------|
| 6.1 | Pipeline value by stage (visual funnel) | P1 | TODO |
| 6.2 | Lead conversion rate over time | P1 | TODO |
| 6.3 | Content production velocity chart | P1 | TODO |
| 6.4 | Average AISO score trend | P1 | TODO |
| 6.5 | Top performing content (by score) | P2 | TODO |
| 6.6 | Upcoming tasks / follow-ups widget | P2 | TODO |
| 6.7 | Revenue forecast based on pipeline | P2 | TODO |
| 6.8 | "Next Best Action" AI recommendations | P3 | TODO |

---

## Category 7: UX Polish & Consistency (P2)

### The Problem
Various UX inconsistencies across the app:
- Loading states vary
- Error handling inconsistent
- Navigation could be clearer
- Mobile experience is secondary

### Improvements Needed

| # | Improvement | Priority | Status |
|---|-------------|----------|--------|
| 7.1 | Consistent loading skeletons across all pages | P2 | TODO |
| 7.2 | Toast notifications for all actions | P2 | TODO |
| 7.3 | Keyboard shortcuts for common actions | P2 | TODO |
| 7.4 | Breadcrumb navigation | P2 | TODO |
| 7.5 | Global search (leads, strategies, posts, assets) | P2 | TODO |
| 7.6 | Mobile-responsive pipeline board | P2 | TODO |
| 7.7 | Dark mode toggle | P3 | TODO |
| 7.8 | Onboarding tour for new users | P2 | TODO |

---

## Category 8: Integrations & Export (P2)

### The Problem
Content lives in AISO Studio - needs to flow to delivery platforms:
- No WordPress integration
- No direct publishing
- Limited export options

### Improvements Needed

| # | Improvement | Priority | Status |
|---|-------------|----------|--------|
| 8.1 | Export post to Markdown with frontmatter | P2 | TODO |
| 8.2 | Export post to HTML | P2 | TODO |
| 8.3 | WordPress REST API integration | P2 | TODO |
| 8.4 | Copy post to clipboard (formatted) | P2 | TODO |
| 8.5 | Zapier webhook triggers | P3 | TODO |
| 8.6 | Google Docs export | P3 | TODO |

---

## Priority Execution Order

### Sprint 1: Critical Path (1-2 weeks)
Focus: Make the core journey seamless

1. **1.2** - Pipeline "View Report" → full audit viewer
2. **1.4** - Single audit detail page
3. **2.1** - "Create Strategy" from won lead
4. **2.2** - Pre-populate strategy from lead data
5. **5.2** - Email preview before send

### Sprint 2: Attribution & Clarity (1-2 weeks)
Focus: Connect the dots between leads and content

6. **3.1** - Add lead_id to strategies
7. **3.2** - Show client name on strategies
8. **4.1** - Domain detail page
9. **6.1** - Pipeline value funnel
10. **6.2** - Conversion rate chart

### Sprint 3: Polish & Delight (1-2 weeks)
Focus: Make it feel premium

11. **5.1** - Editable email templates
12. **5.3** - Email stats on pipeline
13. **6.3** - Content velocity chart
14. **7.1** - Consistent loading states
15. **7.8** - Onboarding tour

### Sprint 4: Scale & Export (1-2 weeks)
Focus: Enable workflows beyond AISO Studio

16. **8.1** - Markdown export
17. **8.3** - WordPress integration
18. **5.4** - Bulk email
19. **3.5** - Content delivery dashboard
20. **6.7** - Revenue forecast

---

## Database Schema Additions Needed

```sql
-- Link strategies to leads (won clients)
ALTER TABLE strategies
ADD COLUMN lead_id INTEGER REFERENCES leads(id);

-- Link assets to strategies directly
ALTER TABLE assets
ADD COLUMN strategy_id INTEGER REFERENCES strategies(id);

-- Email templates table
CREATE TABLE email_templates (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  name VARCHAR(100) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Scheduled follow-ups
CREATE TABLE follow_ups (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  lead_id INTEGER REFERENCES leads(id),
  due_date TIMESTAMP NOT NULL,
  title VARCHAR(255) NOT NULL,
  notes TEXT,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Dashboard metrics cache (for performance)
CREATE TABLE dashboard_metrics (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) UNIQUE,
  pipeline_value_by_stage JSONB,
  conversion_rates JSONB,
  content_velocity JSONB,
  avg_aiso_score NUMERIC(5,2),
  calculated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Quick Wins (Can Do Today)

These improvements are small but impactful:

1. **Add "View Full Report" link to pipeline lead cards** - Button that goes to `/dashboard/audit?auditId=X`

2. **Show AISO score on strategy cards** - Average of generated posts

3. **Add domain to strategy card subtitle** - Currently just shows client name

4. **Email sent count on lead card** - Small badge showing outreach activity

5. **"Copy to Clipboard" on post content** - One-click export

6. **Loading spinner during audit** - Currently just says "Running..."

7. **Success toast after email sent** - Confirmation feedback

8. **Pre-fill email subject with lead's pain point** - Personalization

---

## The North Star

When all improvements are complete, the user journey becomes:

```
DISCOVER → AUDIT → PITCH → WIN → DELIVER → RETAIN
    ↓         ↓       ↓       ↓        ↓        ↓
  Leads    Reports  Email   Strategy  Posts   Results
    ↓         ↓       ↓       ↓        ↓        ↓
  Score    Vault   Track    Topics   Publish  Renew
    ↓         ↓       ↓       ↓        ↓        ↓
Pipeline → Pipeline → Pipeline → Content → Vault → Pipeline
```

**Every feature connects. Every action has purpose. Every client has a complete record.**

---

## Success Metrics

After implementing this roadmap:

| Metric | Before | After |
|--------|--------|-------|
| Time to first lead audit | 5 min | 30 sec |
| Time from lead to strategy | 30 min | 5 min |
| Clicks to find client's content | 8+ | 2 |
| Email personalization time | 10 min | 1 min |
| Dashboard insight value | Low | High |
| User confusion points | Many | Zero |

---

*This roadmap transforms AISO Studio from a collection of powerful features into a unified agency operating system.*
