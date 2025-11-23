# Technical SEO Diagnostic Specification

**Purpose:** Identify AI searchability issues and categorize them as "Agency Can Fix" vs "Owner Must Change"

**Integration:** Similar to WCAG accessibility audits - runs as part of content audit flow

---

## Diagnostic Categories

### 1. AGENCY CAN FIX (High Priority - Billable Services)

#### 1.1 robots.txt Issues
**Check:**
- Does robots.txt exist?
- Does it block common AI crawlers (GPTBot, ChatGPT-User, ClaudeBot, PerplexityBot, Bingbot)?
- Does it disallow critical paths (/blog, /articles, /*)?
- Is it overly restrictive (*)?

**How to fix:**
- Update robots.txt to allow AI crawlers
- Remove overly broad disallow rules
- Add specific User-agent allowances

**Billable service:** $500-$1,500

---

#### 1.2 Meta Robots / X-Robots-Tag
**Check:**
- Does page have `<meta name="robots" content="noindex">`?
- Does response include `X-Robots-Tag: noindex` header?
- Are there nofollow directives blocking discovery?

**How to fix:**
- Remove noindex meta tags
- Update server configuration to remove X-Robots-Tag headers
- Implement selective indexing strategy

**Billable service:** $300-$800

---

#### 1.3 JavaScript Rendering (CSR vs SSR)
**Check:**
- Is content only available via client-side JavaScript?
- Does initial HTML response contain actual content?
- Are critical elements (headings, paragraphs) in initial payload?

**How to fix:**
- Implement server-side rendering (SSR)
- Use Static Site Generation (SSG)
- Add pre-rendering for critical pages
- Implement hydration strategy

**Billable service:** $2,000-$5,000 (technical complexity)

---

#### 1.4 Schema Markup for AI
**Check:**
- Is schema.org markup present?
- Does it include Article, Organization, WebPage types?
- Is JSON-LD format used (preferred by AI)?
- Are critical fields populated (headline, author, datePublished)?

**How to fix:**
- Add JSON-LD schema markup
- Include Article schema for blog posts
- Add Organization and WebPage schemas
- Ensure all required fields populated

**Billable service:** $800-$1,500

---

#### 1.5 Content Structure & Headings
**Check:**
- Are headings properly nested (H1 → H2 → H3)?
- Is there exactly one H1 per page?
- Do headings accurately describe content?
- Are semantic HTML tags used (article, section, nav)?

**How to fix:**
- Restructure HTML with proper heading hierarchy
- Use semantic HTML5 elements
- Ensure single H1 per page
- Add descriptive heading text

**Billable service:** $500-$1,200

---

#### 1.6 Page Speed & Performance
**Check:**
- Time to First Byte (TTFB) < 600ms?
- First Contentful Paint (FCP) < 1.8s?
- Largest Contentful Paint (LCP) < 2.5s?
- Is content available quickly for AI crawlers?

**How to fix:**
- Optimize images (WebP, lazy loading)
- Implement CDN
- Minimize JavaScript bundles
- Enable compression (Gzip/Brotli)
- Cache static assets

**Billable service:** $1,000-$2,500

---

#### 1.7 Internal Linking & Sitemap
**Check:**
- Does XML sitemap exist?
- Is it submitted to search engines?
- Are important pages included in sitemap?
- Is internal linking structure logical?

**How to fix:**
- Generate/update XML sitemap
- Submit to Google Search Console
- Improve internal linking
- Add breadcrumb navigation

**Billable service:** $400-$1,000

---

#### 1.8 Canonical URLs & Redirects
**Check:**
- Are canonical tags properly set?
- Are there redirect chains (multiple 301s)?
- Do redirects preserve content?
- Are there 404 errors for important pages?

**How to fix:**
- Implement canonical tags
- Fix redirect chains
- Update broken links
- Set up proper 301 redirects

**Billable service:** $600-$1,200

---

### 2. OWNER MUST CHANGE (Low Agency Control - Advisory Only)

#### 2.1 Paywall / Authentication
**Check:**
- Is content behind a paywall?
- Does it require login to access?
- Is there a "freemium wall" after X paragraphs?

**Why agency can't fix:**
- Business model decision
- Requires owner to change monetization strategy
- May involve platform/CMS limitations

**Agency role:** Advisory - recommend partial content exposure or structured data workarounds

---

#### 2.2 CAPTCHA on Every Page
**Check:**
- Does Cloudflare/other WAF show CAPTCHA to bots?
- Is bot detection set to "high" blocking legitimate crawlers?
- Are AI crawler user-agents blocked at CDN level?

**Why agency can't fix:**
- Requires CDN/hosting account access
- Owner controls Cloudflare/Akamai settings
- May be enterprise-level security policy

**Agency role:** Advisory - recommend whitelisting specific user-agents, provide list of AI crawler IPs

---

#### 2.3 Platform Limitations (Wix, Squarespace, Shopify)
**Check:**
- Is site on a platform with limited access?
- Can robots.txt be edited?
- Is SSR available on this platform?
- Can response headers be modified?

**Why agency can't fix:**
- Platform may not allow robots.txt editing
- SSR not available on some platforms
- Header modification restricted

**Agency role:** Advisory - recommend platform migration or workarounds within platform constraints

---

#### 2.4 Rate Limiting (CDN-Level)
**Check:**
- Does CDN aggressively rate-limit bots?
- Are legitimate AI crawlers being blocked?
- Is there a 429 (Too Many Requests) response?

**Why agency can't fix:**
- CDN configuration requires owner access
- Enterprise CDN settings locked down
- May be necessary for DDoS protection

**Agency role:** Advisory - recommend rate limit adjustments, whitelist specific user-agents

---

#### 2.5 Geographic Restrictions
**Check:**
- Is content geo-blocked?
- Does it only serve to specific countries?
- Are AI crawlers (often US-based) blocked by region?

**Why agency can't fix:**
- Legal/compliance requirement
- Business strategy decision
- Owner-level configuration

**Agency role:** Advisory - note impact on AI search visibility

---

#### 2.6 Dynamic/Personalized Content
**Check:**
- Does content change based on user session?
- Is there heavy personalization making crawling difficult?
- Does content require cookies/localStorage?

**Why agency can't fix:**
- Fundamental architecture issue
- Requires backend refactoring
- May be core to product experience

**Agency role:** Advisory - recommend static content alternative, FAQ pages, or schema markup

---

## Diagnostic Output Structure

```json
{
  "url": "https://example.com/blog/post",
  "overallScore": 65,
  "aiSearchabilityScore": 70,
  "technicalSeoScore": 60,

  "agencyCanFix": {
    "count": 5,
    "estimatedCost": "$5,500-$11,000",
    "issues": [
      {
        "category": "robots.txt",
        "severity": "critical",
        "issue": "robots.txt blocks GPTBot and ClaudeBot",
        "impact": "AI search engines cannot crawl your content",
        "fix": "Update robots.txt to allow AI crawlers",
        "estimatedCost": "$500-$1,500",
        "timeToFix": "1-2 hours",
        "difficulty": "easy"
      },
      {
        "category": "javascript-rendering",
        "severity": "high",
        "issue": "Content only loads client-side via JavaScript",
        "impact": "AI crawlers see empty page, missing all content",
        "fix": "Implement server-side rendering (SSR) or static site generation",
        "estimatedCost": "$2,000-$5,000",
        "timeToFix": "1-2 weeks",
        "difficulty": "hard"
      }
    ]
  },

  "ownerMustChange": {
    "count": 2,
    "issues": [
      {
        "category": "paywall",
        "severity": "medium",
        "issue": "Content behind paywall after 2 paragraphs",
        "impact": "AI cannot access full content for summaries",
        "recommendation": "Consider exposing article abstracts or structured data",
        "ownerAction": "Modify paywall strategy or add schema markup",
        "difficulty": "business-decision"
      },
      {
        "category": "captcha",
        "severity": "high",
        "issue": "Cloudflare shows CAPTCHA to all bots",
        "impact": "Legitimate AI crawlers blocked entirely",
        "recommendation": "Whitelist AI crawler user-agents in Cloudflare",
        "ownerAction": "Update Cloudflare settings to allow GPTBot, ClaudeBot, etc.",
        "difficulty": "easy-if-access"
      }
    ]
  },

  "checks": {
    "robotsTxt": {
      "exists": true,
      "blocksAICrawlers": true,
      "blockedBots": ["GPTBot", "ClaudeBot", "PerplexityBot"],
      "issueSeverity": "critical"
    },
    "metaRobots": {
      "hasNoIndex": false,
      "hasNoFollow": false,
      "issueSeverity": null
    },
    "rendering": {
      "isSSR": false,
      "contentInInitialHTML": false,
      "jsFramework": "React",
      "issueSeverity": "high"
    },
    "schemaMarkup": {
      "hasSchema": true,
      "types": ["Article", "Organization"],
      "format": "JSON-LD",
      "issueSeverity": null
    },
    "pageSpeed": {
      "ttfb": 450,
      "fcp": 1200,
      "lcp": 2100,
      "issueSeverity": null
    },
    "paywall": {
      "detected": true,
      "type": "freemium",
      "issueSeverity": "medium"
    },
    "captcha": {
      "detected": true,
      "provider": "Cloudflare",
      "issueSeverity": "high"
    }
  },

  "recommendations": [
    {
      "priority": 1,
      "action": "Update robots.txt to allow AI crawlers",
      "benefit": "Immediate access for ChatGPT, Claude, Perplexity",
      "cost": "$500-$1,500",
      "timeframe": "1-2 hours"
    },
    {
      "priority": 2,
      "action": "Implement server-side rendering",
      "benefit": "AI crawlers can see full content",
      "cost": "$2,000-$5,000",
      "timeframe": "1-2 weeks"
    },
    {
      "priority": 3,
      "action": "Whitelist AI crawlers in Cloudflare (owner action required)",
      "benefit": "Remove CAPTCHA blocks for legitimate AI bots",
      "cost": "$0 (owner self-service)",
      "timeframe": "15 minutes"
    }
  ]
}
```

---

## Implementation Details

### Scanner Function (lib/technical-seo-scanner.ts)

```typescript
export interface TechnicalSEOResult {
  url: string;
  overallScore: number;
  aiSearchabilityScore: number;
  technicalSeoScore: number;
  agencyCanFix: AgencyFixableIssues;
  ownerMustChange: OwnerIssues;
  checks: DetailedChecks;
  recommendations: Recommendation[];
}

export async function scanTechnicalSEO(url: string): Promise<TechnicalSEOResult> {
  // 1. Fetch robots.txt
  // 2. Make HEAD request to check headers
  // 3. Fetch page HTML
  // 4. Check for JavaScript rendering
  // 5. Analyze schema markup
  // 6. Check page speed
  // 7. Detect paywall/CAPTCHA
  // 8. Calculate scores
  // 9. Generate recommendations
}
```

### Database Schema (migration)

```sql
CREATE TABLE technical_seo_audits (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  content_audit_id INTEGER REFERENCES content_audits(id) ON DELETE SET NULL,
  url TEXT NOT NULL,

  -- Scores
  overall_score INTEGER NOT NULL,
  ai_searchability_score INTEGER NOT NULL,
  technical_seo_score INTEGER NOT NULL,

  -- Issue counts
  agency_fixable_count INTEGER DEFAULT 0,
  owner_action_count INTEGER DEFAULT 0,

  -- Estimated costs
  estimated_min_cost INTEGER, -- in cents
  estimated_max_cost INTEGER, -- in cents

  -- Detailed results (JSONB)
  agency_can_fix JSONB, -- Array of fixable issues
  owner_must_change JSONB, -- Array of owner-only issues
  checks JSONB, -- Detailed check results
  recommendations JSONB, -- Prioritized recommendations

  -- Metadata
  scan_version TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_technical_seo_user ON technical_seo_audits(user_id);
CREATE INDEX idx_technical_seo_content_audit ON technical_seo_audits(content_audit_id);
```

### API Route (/api/audit/technical-seo/route.ts)

Follows same pattern as accessibility audit:
- POST: Run diagnostic
- GET: Retrieve past diagnostics
- Supports async via Inngest if needed

---

## Integration with Existing Audit Flow

Similar to WCAG, this will be:
1. Optional add-on to content audits
2. Accessible from dashboard
3. Displays results in similar UI component
4. Shows "Agency Can Fix" vs "Owner Must Change" sections
5. Provides downloadable report (future: PDF)

---

## Pricing Implications

**For Agencies:**
- See exact billable opportunities ($5,500-$11,000 per client)
- Know what they can fix vs what needs owner action
- Get time/cost estimates for proposals

**For DIY Users:**
- See they need professional help
- Get referred to certified agencies via marketplace
- Understand what's fixable vs business decision

---

## Questions to Resolve

1. ✅ **Should we check all of these?** Yes - comprehensive diagnostic
2. ✅ **How often can users run this?** Unlimited for Pro/Agency (like audits)
3. **Should we store historical scans?** Yes - track improvements over time
4. **Alert when new issues detected?** Future feature
5. **Competitive comparison?** Future - show how competitors rank

---

## Next Steps

1. Build scanner library (lib/technical-seo-scanner.ts)
2. Create database migration
3. Add database methods to lib/db.ts
4. Create API route
5. Build UI component to display results
6. Integrate into audit flow
7. Add to Professional/Agency tier features

---

**This diagnostic transforms "AI invisibility" from abstract concept to concrete, billable fixes.**
