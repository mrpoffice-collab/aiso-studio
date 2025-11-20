# Strategic Linking System - Design Document

**Date**: 2025-01-06
**Status**: Design Phase

## The Problem

Current approach treats internal links as "optional suggestions" that Claude often ignores. This is backwards.

**Agency Reality**: Every piece of content should intentionally support specific business goals (product pages, signup pages, service pages).

## The Solution: Strategic Link Architecture

### Concept: Money Pages + Topic Clusters

```
┌─────────────────────────────────────────┐
│  STRATEGY CONFIGURATION                 │
├─────────────────────────────────────────┤
│  Money Pages (Conversion Goals):       │
│  • /products - Product catalog          │
│  • /pricing - Pricing page              │
│  • /signup - Account creation           │
│  • /services/cremation - High-value     │
│  • /contact - Lead generation           │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  TOPIC CLUSTERS                         │
├─────────────────────────────────────────┤
│  Cluster 1: "Product Awareness"         │
│  → Target Page: /products               │
│  → Topics:                              │
│     • "10 Memorial Gift Ideas"          │
│     • "Personalized Keepsakes Guide"    │
│     • "Best Photo Books 2025"           │
│                                         │
│  Cluster 2: "Service Conversions"       │
│  → Target Page: /services/cremation     │
│  → Topics:                              │
│     • "Cremation Planning Guide"        │
│     • "Cremation vs Burial Costs"       │
│     • "Eco-Friendly Cremation Options"  │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  CONTENT GENERATION                     │
├─────────────────────────────────────────┤
│  Each topic KNOWS:                      │
│  • Primary target page (MUST link)      │
│  • Secondary supporting pages (optional)│
│  • Specific CTA to include              │
│  • Customer journey stage               │
└─────────────────────────────────────────┘
```

## Database Schema Changes

### New Table: `money_pages`

```sql
CREATE TABLE money_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id UUID REFERENCES strategies(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  page_type TEXT NOT NULL, -- 'product', 'service', 'signup', 'contact', 'pricing'
  description TEXT,
  priority INTEGER DEFAULT 1, -- 1=high, 2=medium, 3=low
  target_keywords TEXT[], -- Keywords this page ranks for
  created_at TIMESTAMP DEFAULT NOW()
);
```

### New Table: `topic_clusters`

```sql
CREATE TABLE topic_clusters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id UUID REFERENCES strategies(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- "Product Awareness", "Service Conversions"
  description TEXT,
  primary_money_page_id UUID REFERENCES money_pages(id),
  secondary_money_page_ids UUID[], -- Optional supporting pages
  funnel_stage TEXT, -- 'awareness', 'consideration', 'decision'
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Update Existing: `topics` table

```sql
ALTER TABLE topics
ADD COLUMN cluster_id UUID REFERENCES topic_clusters(id),
ADD COLUMN primary_link_url TEXT, -- Required link to money page
ADD COLUMN primary_link_anchor TEXT, -- Suggested anchor text
ADD COLUMN cta_type TEXT; -- 'product_browse', 'service_inquiry', 'signup', 'contact'
```

## User Workflow

### 1. Strategy Setup (One-Time)

**Step 1: Define Money Pages**
```
┌─────────────────────────────────────────┐
│  Add Money Pages                        │
├─────────────────────────────────────────┤
│  [+] Add New Money Page                 │
│                                         │
│  URL: [/products              ]         │
│  Title: [Memorial Products & Gifts]     │
│  Type: [Product Page ▼]                 │
│  Description: [Browse our collection... │
│  Priority: [● High  ○ Medium  ○ Low]    │
│  Keywords: [memorial gifts, keepsakes]  │
│                                         │
│  [Cancel]  [Save Money Page]            │
└─────────────────────────────────────────┘
```

**Step 2: Create Topic Clusters**
```
┌─────────────────────────────────────────┐
│  Create Topic Cluster                   │
├─────────────────────────────────────────┤
│  Cluster Name: [Product Awareness]      │
│  Description: [Build awareness of our   │
│                product offerings...]     │
│                                         │
│  Primary Target: [/products ▼]          │
│  Secondary Targets:                     │
│    [✓] /pricing                         │
│    [ ] /services/cremation              │
│                                         │
│  Funnel Stage: [● Awareness             │
│                 ○ Consideration          │
│                 ○ Decision]              │
│                                         │
│  [Cancel]  [Create Cluster]             │
└─────────────────────────────────────────┘
```

### 2. Topic Generation (With Cluster Awareness)

**Modified Topic Generation Flow:**
```
┌─────────────────────────────────────────┐
│  Generate Topics                        │
├─────────────────────────────────────────┤
│  Cluster: [Product Awareness ▼]         │
│  Number of topics: [10]                 │
│                                         │
│  System will generate topics that:     │
│  ✓ Link to: /products                  │
│  ✓ Include product-focused CTAs        │
│  ✓ Target awareness-stage keywords     │
│                                         │
│  [Generate Topics]                      │
└─────────────────────────────────────────┘
```

**Generated Topics Include Link Instructions:**
```json
{
  "title": "10 Memorial Gift Ideas to Honor Your Loved One",
  "keyword": "memorial gift ideas",
  "cluster_id": "uuid-product-awareness",
  "primary_link_url": "/products",
  "primary_link_anchor": "memorial products and gifts",
  "cta_type": "product_browse",
  "link_placement_hint": "After introducing gift categories, link to full product catalog"
}
```

### 3. Content Generation (With Mandatory Linking)

**Updated Content Generation Prompt:**
```
**MANDATORY INTERNAL LINK - REQUIRED FOR PUBLICATION:**

This post MUST include a link to: /products
Suggested anchor text: "memorial products and gifts"
Link purpose: Drive traffic to product catalog (primary conversion page)

CRITICAL INSTRUCTIONS:
- You MUST include this link naturally in the article body
- Place it in a contextually relevant paragraph (suggested: after discussing gift options)
- Use the suggested anchor text or similar natural variation
- Example: "Browse our collection of [memorial products and gifts](/products) to find the perfect tribute."

**If this link is not included, the content will be rejected and regenerated.**
```

## Content Validation

After generation, validate link presence:

```javascript
// In generate route, after content is created
const hasRequiredLink = generatedContent.content.includes(topic.primary_link_url);

if (!hasRequiredLink) {
  // Auto-inject link into most relevant paragraph
  const updatedContent = await injectRequiredLink(
    generatedContent.content,
    topic.primary_link_url,
    topic.primary_link_anchor,
    topic.link_placement_hint
  );

  console.log('⚠️ Required link was missing - auto-injected into content');
  generatedContent.content = updatedContent;
}
```

## Agency Benefits

### 1. **Strategic Link Equity Flow**
- Every post intentionally passes PageRank to money pages
- No wasted link juice on random internal pages

### 2. **Clear Conversion Paths**
- Readers are guided from educational content → conversion pages
- Agencies can track: "Product page got 500 visits from blog posts this month"

### 3. **Topic Cluster SEO**
- Google recognizes topical authority when multiple posts link to central hub
- Better rankings for competitive money page keywords

### 4. **Client Reporting**
```
┌─────────────────────────────────────────┐
│  Monthly Content Performance            │
├─────────────────────────────────────────┤
│  Money Page: /products                  │
│  • 12 blog posts linking to this page   │
│  • 1,234 referral visits from content   │
│  • 45 conversions attributed to blog    │
│  • +15% organic traffic vs last month   │
│                                         │
│  Top Performing Posts:                  │
│  1. "10 Memorial Gift Ideas" (340 visit)│
│  2. "Photo Memory Books Guide" (210 vis)│
│  3. "Personalized Keepsakes" (180 visit)│
└─────────────────────────────────────────┘
```

### 5. **Scalable Content Strategy**
- Add new cluster → Generate 10 topics → Publish → Links flow to money page
- Repeatable system that works for 10 clients or 100 clients

## Implementation Plan

### Phase 1: Database + UI (Week 1)
- [ ] Create `money_pages` table
- [ ] Create `topic_clusters` table
- [ ] Update `topics` table with cluster fields
- [ ] Build "Money Pages" management UI
- [ ] Build "Topic Clusters" management UI

### Phase 2: Topic Generation Integration (Week 1-2)
- [ ] Update topic generation to accept cluster_id
- [ ] Auto-assign primary_link_url based on cluster
- [ ] Generate link_placement_hint suggestions
- [ ] Update topic display to show target money page

### Phase 3: Content Generation Integration (Week 2)
- [ ] Update content prompt with mandatory link instructions
- [ ] Implement link validation after generation
- [ ] Build auto-injection fallback for missing links
- [ ] Log link placement for quality review

### Phase 4: Reporting (Week 3-4)
- [ ] Build "Money Page Performance" dashboard
- [ ] Show which posts link to each money page
- [ ] Track referral traffic (requires GA integration)
- [ ] Generate cluster performance reports

## Example: Firefly Grove Memorial App

### Money Pages Setup:
```javascript
[
  {
    url: '/products',
    title: 'Memorial Products & Gifts',
    type: 'product',
    priority: 1,
    keywords: ['memorial gifts', 'keepsakes', 'memorial products']
  },
  {
    url: '/signup',
    title: 'Create Your Free Memorial Page',
    type: 'signup',
    priority: 1,
    keywords: ['create memorial page', 'free memorial website']
  },
  {
    url: '/services/cremation',
    title: 'Cremation Services & Planning',
    type: 'service',
    priority: 2,
    keywords: ['cremation services', 'cremation planning']
  }
]
```

### Topic Clusters:
```javascript
[
  {
    name: 'Product Awareness',
    primary_money_page: '/products',
    funnel_stage: 'awareness',
    topics: [
      'Memorial Gift Ideas for Loss of Father',
      'Best Photo Memory Books 2025',
      'Personalized Keepsake Options',
      'Digital vs Physical Memorials'
    ]
  },
  {
    name: 'Signup Conversions',
    primary_money_page: '/signup',
    funnel_stage: 'decision',
    topics: [
      'How to Create a Memorial Page Online',
      'Free Memorial Website Builder Guide',
      'Sharing Memorial Pages with Family',
      'Memorial Page Ideas and Examples'
    ]
  }
]
```

## Success Metrics

After implementation, measure:

1. **Link Presence Rate**: What % of posts include required money page links?
   - Target: **100%** (validated or auto-injected)

2. **Referral Traffic**: How many visits do money pages get from blog content?
   - Track in GA: Source = internal blog posts

3. **Conversion Attribution**: How many signups/purchases came from blog referrals?
   - Track with UTM parameters on internal links

4. **Topic Cluster Rankings**: Do money pages rank higher after cluster content is published?
   - Compare keyword rankings before/after cluster deployment

## Next Steps

1. **Validate with user**: Does this match how you think about content strategy?
2. **Design UI mockups**: Show money pages + cluster management interfaces
3. **Build database migrations**: Start with schema changes
4. **Update topic generation**: Add cluster selection
5. **Fix link validation**: Ensure links always appear

---

**Bottom Line**: This transforms content from "random blog posts" into a **strategic SEO asset** that drives traffic to conversion pages. This is what agencies pay for.
