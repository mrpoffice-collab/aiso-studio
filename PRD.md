# AISO Studio - Product Requirements Document

**Version**: 1.0
**Last Updated**: November 21, 2025
**Status**: In Development

---

## 1. Executive Summary

**AISO Studio** is an AI-powered content optimization platform designed for marketing agencies to create content optimized for AI answer engines (ChatGPT, Perplexity, Google SGE) and traditional SEO.

**Core Framework**: AISO
- **A**EO - Answer Engine Optimization
- **I**ntent-based Readability
- **S**EO - Search Engine Optimization
- **O**verall Optimization

**Key Differentiator**: Integrated fact-checking (30% weight in scoring) ensures content accuracy for AI citations.

---

## 2. Problem Statement

Marketing agencies face challenges:
1. Traditional SEO is no longer sufficient - AI answer engines are changing discovery
2. Content must be structured for AI citation and direct answers
3. Fact-checking is critical as AI models prioritize accurate sources
4. Managing multiple clients' content strategies is time-consuming
5. Lead discovery and pipeline management are separate from content tools
6. **98% of websites fail ADA/WCAG accessibility compliance** - massive legal liability and untapped market opportunity

---

## 3. Target Users

| User Type | Description |
|-----------|-------------|
| **Primary** | Marketing agencies managing multiple client content strategies |
| **Secondary** | Freelance content strategists |
| **Tertiary** | In-house marketing teams at SMBs |

---

## 4. Current Features (Implemented)

### 4.1 Content Strategy Management
- **Strategy Generator**: AI creates 15-topic content calendars
- **Topic Management**: Edit, prioritize, cluster topics
- **MOU Generation**: Client-ready memorandums of understanding
- **Strategy Reset**: Clear topics while preserving strategy settings

### 4.2 Content Generation & Optimization
- **AI Content Generation**: Claude/GPT-4 powered writing
- **AISO Scoring System** (6-factor evaluation):
  - AEO Score (30%) - Answer engine optimization
  - SEO Score (20%) - Traditional search optimization
  - Readability Score (20%) - Intent-based Flesch targeting
  - Engagement Score (15%) - Hooks, CTAs, variety
  - GEO Score (10%) - Local intent optimization
  - Fact-Check Score (30%) - Claim verification

- **Selective Improvement Passes**:
  - Readability Pass
  - SEO Pass
  - AEO Pass
  - Engagement Pass

- **Full Content Rewrite**: Complete regeneration with optimization

**Accessibility Score (Separate Pillar — Not Weighted in AISO Score)**
A standalone 0–100 accessibility score based on WCAG 2.1/2.2 compliance.
Includes checks for alt text, contrast, structure, semantic HTML, keyboard operability,
ARIA labeling, and other high-impact accessibility requirements.
Displayed alongside AISO Score in the audit and included in downloadable reports.

### 4.3 Fact-Checking System
- Automatic claim extraction
- Brave Search verification
- Confidence scoring
- Source citations
- Visual verification display

### 4.4 Content Audit Tools
- **Single URL Audit**: Comprehensive scoring of any content
- **Batch Audit**: Process 50+ URLs simultaneously
- **Audit History**: Track improvements over time
- **Content Discovery**: Automatic blog URL detection
- **Accessibility Compliance Audit (WCAG)**: Automated detection of accessibility issues
  including alt text, heading structure, contrast, ARIA, and screen-reader compatibility.
  Generates a standalone Accessibility Score (0–100) and provides remediation suggestions.

### 4.5 Lead Discovery & Pipeline
- **Business Search**: Industry + location discovery
- **Website Scoring**: Technical SEO, on-page, content, local SEO
- **Opportunity Rating**: High/Medium/Low classification
- **PDF Reports**: Generate client-facing opportunity reports
- **Pipeline Management**: Track leads through sales process
- **Activity Logging**: Calls, emails, meetings

### 4.6 Strategic Linking
- **Money Pages**: Primary/secondary conversion page management
- **Topic Clusters**: Group related content for authority
- **Funnel Stage Classification**: Awareness/Consideration/Decision
- **Anchor Text Optimization**: Strategic internal linking

### 4.7 Team Feedback System
- Bug reports & feature requests
- Comment threads
- Priority tagging
- Screenshot attachments

### 4.8 Admin & Subscriptions
- User management dashboard
- Manual subscription overrides
- Usage tracking & limits

---

## 5. Subscription Tiers

| Tier | Articles/mo | Strategies | Seats | Price |
|------|-------------|------------|-------|-------|
| Trial | 10 | 1 | 1 | Free (7 days) |
| Starter | 50 | 3 | 1 | TBD |
| Professional | 200 | 10 | 2 | TBD |
| Agency | Unlimited | Unlimited | 3 | TBD |
| Enterprise | Unlimited | Unlimited | 10 | TBD |

---

## 6. Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16, React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Database | PostgreSQL (Drizzle ORM) |
| Auth | Clerk |
| AI Models | Claude (Anthropic), GPT-4 (OpenAI) |
| Search | Brave Search API |
| Payments | Stripe |
| PDF | jsPDF |

---

## 7. Planned Features (Roadmap)

### Phase 1: Content Enhancement
- [ ] Accessibility Compliance Audit (WCAG)
- [ ] Content repurposing (blog to social, email, video scripts)
- [ ] Schema markup generator (FAQ, HowTo, Article)
- [ ] WordPress direct publishing integration
- [ ] Content calendar view with drag-drop scheduling
- [ ] Competitor content analysis

### Phase 2: Analytics & Reporting
- [ ] Performance tracking dashboard
- [ ] Google Search Console integration
- [ ] Google Analytics integration
- [ ] Monthly client reports (automated)
- [ ] ROI tracking per content piece

### Phase 3: Collaboration
- [ ] Team workspaces
- [ ] Client portal (view-only access)
- [ ] Approval workflows
- [ ] Content review assignments
- [ ] Comment/annotation on content

### Phase 4: Advanced AI
- [ ] AI model selection per task
- [ ] Custom brand voice training
- [ ] Automatic image generation
- [ ] Video script generation
- [ ] Podcast show notes generation

### Phase 5: Scale & Enterprise
- [ ] White-label option
- [ ] API access for integrations
- [ ] Bulk import/export
- [ ] Advanced user roles & permissions
- [ ] SSO authentication
- [ ] Audit logs

---

## 8. Success Metrics

| Metric | Target |
|--------|--------|
| Average AISO Score | > 80% |
| Content Generation Time | < 3 minutes |
| Fact-Check Accuracy | > 95% |
| User Retention (30-day) | > 70% |
| NPS Score | > 50 |

---

## 9. Competitive Advantages

1. **AISO Framework**: Only platform optimizing for AI answer engines
2. **Integrated Fact-Checking**: Ensures content accuracy for AI citations
3. **Intent-Based Readability**: Matches content complexity to audience
4. **All-in-One Platform**: Strategy + Content + Leads + Pipeline
5. **Selective Optimization**: Users control what gets improved
6. **Agency-Focused**: Built for multi-client management

---

## 10. Technical Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (Next.js)                 │
├─────────────────────────────────────────────────────┤
│  Dashboard │ Strategies │ Posts │ Audit │ Leads    │
└─────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────┐
│                   API Routes (35+)                   │
├─────────────────────────────────────────────────────┤
│ /api/strategies  │ /api/posts  │ /api/audit        │
│ /api/leads       │ /api/topics │ /api/feedback     │
└─────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────┐
│                   Core Services                      │
├─────────────────────────────────────────────────────┤
│ Claude AI │ OpenAI │ Brave Search │ Stripe │ Clerk │
└─────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────┐
│              PostgreSQL Database                     │
├─────────────────────────────────────────────────────┤
│ users │ strategies │ topics │ posts │ leads │ etc  │
└─────────────────────────────────────────────────────┘
```

---

## 11. Database Schema (Core Tables)

- **users** - Authentication, subscriptions, limits
- **strategies** - Content calendars, client info
- **topics** - 15 topics per strategy
- **posts** - Generated content with scores
- **fact_checks** - Claim verification
- **money_pages** - Strategic conversion pages
- **topic_clusters** - Content groupings
- **content_audits** - Audit history
- **lead_projects** - Lead groupings
- **leads** - Discovered businesses
- **lead_activities** - Activity timeline
- **feedback_items** - Bug reports/features
- **subscriptions** - Stripe integration

---

## 12. API Overview

| Category | Endpoints | Purpose |
|----------|-----------|---------|
| Strategies | 12 | Strategy CRUD, topics, audit |
| Posts | 5 | Content generation, improvement |
| Audit | 7 | Single/batch audits, history |
| Leads | 6 | Discovery, pipeline, projects |
| Topics | 3 | Topic management |
| Feedback | 4 | Bug reports, comments |
| Admin | 2 | User/subscription management |

---

## 13. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| AI API costs | High | Usage limits, caching, model selection |
| AI model changes | Medium | Abstract AI layer, multi-provider support |
| Data accuracy | High | Fact-checking integration, source citations |
| Scaling | Medium | Serverless architecture, connection pooling |

---

## 14. Open Questions

1. Pricing strategy for each tier?
2. Free tier vs trial-only approach?
3. White-label priority vs core features?
4. Mobile app requirements?
5. International expansion (multi-language)?

---

## 15. WCAG Accessibility Audit - Technical Implementation

All changes must be compatible with Next.js 16, TypeScript, Drizzle, and Vercel runtime constraints.

### 15.1 Playwright + axe-core for Accessibility Scanning

```bash
npm install playwright axe-core @axe-core/playwright
```

**Requirements:**
- Use Playwright in Node.js runtime, NOT Edge
- Load target URL in headless Chromium instance
- Inject and run axe-core inside page context
- Return structured WCAG violations with selectors, rule IDs, descriptions, and severity
- Persist results into Postgres using Drizzle

### 15.2 Background Job Processing (Vercel-Compatible)

```bash
npm install inngest
```

**Workflow:**
- Function `audit.url.requested` triggered when user starts an audit
- Background workflow:
  1. Receives the URL
  2. Runs Playwright + axe-core
  3. Writes results to database
  4. Emits `audit.url.completed`

Must run outside request/response cycle to avoid timeouts.
(Alternative: Upstash QStash. Prefer Inngest.)

### 15.3 ESLint Accessibility Linting

```bash
npm install eslint-plugin-jsx-a11y --save-dev
```

**ESLint Config:**
```json
{
  "extends": ["next", "next/core-web-vitals", "plugin:jsx-a11y/recommended"],
  "plugins": ["jsx-a11y"]
}
```

Enforces alt text, ARIA labels, focusable elements, heading semantics, and proper click handlers.

### 15.4 Accessible Component Library

Integrate **shadcn/ui** or **Radix UI** primitives for:
- Modals, dialogs, popovers, menus, toasts
- Built-in keyboard navigation + ARIA compliance
- Reduces WCAG violations in AISO Studio UI

### 15.5 Optional Utilities

```bash
npm install culori          # Color contrast helper (WCAG AA/AAA ratios)
npm install text-readability # Readability tiers
```

---

*Document maintained by AISO Studio team*
