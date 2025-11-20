# AISO Framework - AI Search Optimization

## Overview

**Content Command Studio** now implements the **AISO Stack** (AI Search Optimization) framework, combining three strategic layers to optimize content for modern AI-powered search engines and answer engines.

---

## 🚀 The AISO Stack

### Layer 1: 🔍 AEO (Answer Engine Optimization)
**Purpose**: Make content discoverable and quotable in AI-driven answer engines

**Target Platforms**:
- Google Search Generative Experience (SGE)
- ChatGPT Search
- Perplexity AI
- Bing Copilot
- Claude.ai
- Gemini

**Core Principles**:
1. **Answer-First Structure** - Lead with clear, concise answers
2. **Quotable Content** - Create citation-worthy statements
3. **High Factual Accuracy** - Maintain 75%+ fact-check scores
4. **Structured Data** - Use schema markup for machine readability
5. **FAQ Formatting** - Include question-answer pairs
6. **Topical Authority** - Build comprehensive coverage of subjects

---

### Layer 2: 📍 GEO (Local Intent Optimization)
**Purpose**: Connect local services with regional relevance signals

**Target Platforms**:
- Google Business Profile
- Google Maps
- Local search results
- "Near me" queries
- Location-based AI answers

**Core Principles**:
1. **Location Signals** - City, region, service area mentions
2. **Local Schema** - LocalBusiness, Service, Review markup
3. **GBP Optimization** - Profile completeness and consistency
4. **Local Citations** - NAP (Name, Address, Phone) consistency
5. **Service Pages** - Location-specific landing pages
6. **Local Keywords** - Geographic + service term combinations

---

### Layer 3: ✍️ Content Layer (SEO + Quality)
**Purpose**: Maintain traditional SEO while meeting AI search standards

**Core Principles**:
1. **Traditional SEO** - Keywords, meta tags, headers
2. **Content Quality** - Readability, engagement, depth
3. **Fact Verification** - Brave Search-powered validation
4. **Duplicate Prevention** - Original content checks
5. **User Intent Matching** - Informational, commercial, transactional
6. **Multi-format Optimization** - Text, lists, tables, images

---

## 📊 AISO Scoring System

### New Scoring Weights

**Full Audit (Single Post)**:
- **AEO Score**: 30% (NEW)
- **SEO Score**: 20% (reduced from 20%)
- **Readability**: 20% (same)
- **Engagement**: 15% (reduced from 20%)
- **Fact-Check**: 15% (reduced from 40%)

**Batch Audit (Multiple Posts)**:
- **AEO Score**: 35% (NEW)
- **SEO Score**: 30% (increased)
- **Readability**: 20% (same)
- **Engagement**: 15% (same)
- **Fact-Check**: N/A (skipped for cost)

### AEO Score Components (0-100)

#### 1. Answer Quality (30 points)
- Direct answer in first 200 characters (10 pts)
- Clear, concise answer format (10 pts)
- Answer addresses search intent (10 pts)

#### 2. Citation-Worthiness (25 points)
- Statistics with context (8 pts)
- Expert quotes or insights (8 pts)
- Data tables or structured lists (9 pts)

#### 3. Structured Data (20 points)
- FAQ schema opportunities (7 pts)
- HowTo schema opportunities (7 pts)
- Article schema compatibility (6 pts)

#### 4. AI-Friendly Formatting (15 points)
- Question-answer pairs (Q&A format) (8 pts)
- Bullet point summaries (4 pts)
- Definition boxes or key takeaways (3 pts)

#### 5. Topical Authority (10 points)
- Comprehensive coverage (5 pts)
- Related subtopics addressed (3 pts)
- Internal topic linking (2 pts)

### GEO Score Components (0-100)

**Note**: GEO only applies to local business content

#### 1. Location Signals (30 points)
- City/region mentions (10 pts)
- Service area keywords (10 pts)
- "Near me" optimization (10 pts)

#### 2. Local Schema Readiness (25 points)
- LocalBusiness schema fields present (10 pts)
- Service schema compatibility (8 pts)
- Review/rating mentions (7 pts)

#### 3. GBP Optimization (20 points)
- Business name/category mentions (7 pts)
- Hours/contact info context (7 pts)
- Service/product descriptions (6 pts)

#### 4. Local Keywords (15 points)
- Geographic + service terms (10 pts)
- Neighborhood/landmark mentions (5 pts)

#### 5. Local Intent Matching (10 points)
- Answers local questions (6 pts)
- Addresses regional concerns (4 pts)

---

## 🎯 Content Generation Strategy

### AEO-Optimized Prompts

#### Strategy Generation Updates
**New Fields Added**:
- `contentType`: "national" | "local" | "hybrid"
- `localContext`: { city, state, serviceArea, landmarks }
- `answerEngineTargets`: ["SGE", "ChatGPT", "Perplexity"]
- `aeoFocus`: "how-to" | "definition" | "comparison" | "guide"

#### Blog Post Generation Updates
**Enhanced Prompt Instructions**:
1. **Answer-First Structure**
   - "Lead each section with a clear, quotable answer"
   - "Place key insights in the first 2 sentences"
   - "Use 'The answer is...' or 'Simply put...' patterns"

2. **Citation-Worthy Content**
   - "Include statistics with clear context"
   - "Create quotable expert insights"
   - "Use data tables for AI extraction"

3. **FAQ Integration**
   - "Add FAQ section with 5-8 Q&A pairs"
   - "Format: ### Question? \n\n Answer paragraph"
   - "Cover related queries AI might serve"

4. **Local Optimization** (when applicable)
   - "Mention city/region in first paragraph"
   - "Use location-specific examples"
   - "Address regional considerations"

---

## 🛠️ Technical Implementation

### Phase 1: Core Scoring Updates ✅ (Week 1)

**Files to Update**:
1. `lib/content-scoring.ts` - Add AEO + GEO scoring functions
2. `lib/content.ts` - Enhance prompts for AEO
3. `lib/claude.ts` - Update strategy generation prompts
4. `types/index.ts` - Add new TypeScript interfaces

**New Functions**:
```typescript
calculateAEOScore(content: string): { score: number; details: AEODetails }
calculateGEOScore(content: string, localContext?: LocalContext): { score: number; details: GEODetails }
generateSchemaMarkup(content: ParsedContent): SchemaMarkup[]
```

### Phase 2: Schema Generation ✅ (Week 2)

**New Files**:
1. `lib/schema-generator.ts` - Auto-generate JSON-LD schema
2. `app/api/posts/[id]/schema/route.ts` - Schema generation endpoint

**Schema Types Supported**:
- Article
- FAQPage
- HowTo
- LocalBusiness (for local content)
- BreadcrumbList

### Phase 3: UI Updates ✅ (Week 2-3)

**Pages to Update**:
1. `/dashboard/audit` - Add AEO + GEO score displays
2. `/dashboard/posts/[id]` - Show AISO breakdown
3. `/dashboard/strategies/new` - Add local business fields
4. `/dashboard` - Update terminology to AISO

**New Components**:
1. `components/AEOScoreCard.tsx` - Display AEO metrics
2. `components/GEOScoreCard.tsx` - Display GEO metrics
3. `components/SchemaViewer.tsx` - Preview generated schema
4. `components/AISOFrameworkExplainer.tsx` - Educational tooltip

### Phase 4: Advanced Features ✅ (Week 4)

**New Features**:
1. **Schema Export** - Copy JSON-LD to clipboard
2. **AEO Suggestions** - AI-powered content improvements
3. **GEO Audit** - Local business content analyzer
4. **Answer Engine Preview** - Simulate AI answer generation
5. **AISO Optimization Score** - Combined 0-100 rating

---

## 📝 Updated Content Workflow

### Before (Traditional SEO Only):
1. Create strategy
2. Generate blog post
3. Check SEO score
4. Fact-check content
5. Export

### After (AISO Stack):
1. Create strategy (with local context if applicable)
2. Generate **AISO-optimized** blog post
3. Check **AEO + GEO + SEO scores**
4. Fact-check content (Brave Search)
5. Generate **schema markup** (FAQ, HowTo, Article)
6. Preview **AI answer simulation**
7. Export with schema

---

## 🎨 UI/UX Terminology Updates

### Dashboard Headers
- **OLD**: "SEO Content Studio"
- **NEW**: "AI Search Optimization Studio"

### Audit Page
- **OLD**: "Content Audit - SEO Analysis"
- **NEW**: "AISO Audit - Answer Engine + SEO Analysis"

### Score Cards
- **OLD**: "Overall Score" (SEO, Readability, Engagement)
- **NEW**: "AISO Score" (AEO, GEO, SEO, Readability, Engagement)

### Strategy Builder
- **Add Section**: "Local Business Optimization (GEO)"
  - Business Type
  - Service Area (city, region)
  - Target Location Keywords
  - GBP Category

### Post Editor
- **Add Tab**: "Schema Markup"
  - Auto-generated JSON-LD
  - Copy to clipboard
  - Preview in Google Structured Data Testing Tool

---

## 💡 Competitive Advantages

### What Makes This Unique?

1. **First AISO Platform** - No competitors have full AEO + GEO + SEO integration
2. **Automated Schema** - Generate JSON-LD without manual coding
3. **AI Answer Simulation** - Preview how AI engines will cite content
4. **Local AI Optimization** - GEO scoring for service businesses
5. **Fact-Verified AEO** - Brave Search ensures answer accuracy

### Marketing Angles

**For Agencies**:
> "Future-proof your clients' content with AISO Stack optimization - the only platform built for ChatGPT, Perplexity, and Google SGE."

**For Local Businesses**:
> "Get found by AI when customers search 'near me' - GEO optimization ensures your business shows up in AI-powered local results."

**For Content Teams**:
> "Stop writing for yesterday's search engines. AISO Stack ensures your content gets cited by tomorrow's AI answer engines."

---

## 📈 Success Metrics

### KPIs to Track

**AEO Performance**:
- AI citation rate (how often content is quoted in AI answers)
- Zero-click answer captures
- Featured snippet wins
- FAQ schema impressions

**GEO Performance**:
- Local pack rankings
- "Near me" query visibility
- GBP profile views
- Map listing clicks

**Combined AISO**:
- Overall AISO score trend
- Time to first citation
- AI platform coverage (SGE, ChatGPT, Perplexity)
- Organic + AI traffic combined

---

## 🚦 Implementation Roadmap

### Week 1: Foundation
- [x] Document AISO framework
- [ ] Add AEO scoring function
- [ ] Add GEO scoring function
- [ ] Update TypeScript types
- [ ] Enhance content generation prompts

### Week 2: Schema & Advanced Scoring
- [ ] Build schema generator
- [ ] Add FAQ detection
- [ ] Add HowTo detection
- [ ] Create schema export API
- [ ] Test with Google Structured Data Tool

### Week 3: UI Updates
- [ ] Update dashboard terminology
- [ ] Add AEO score cards
- [ ] Add GEO score cards (local content only)
- [ ] Add schema viewer component
- [ ] Add local business fields to strategy builder

### Week 4: Advanced Features
- [ ] AI answer simulation
- [ ] AEO improvement suggestions
- [ ] GEO audit for local businesses
- [ ] AISO report generation (PDF)
- [ ] Integration testing

---

## 🎓 Education & Resources

### Internal Documentation
- **AISO-QUICKSTART.md** - 5-minute guide for new users
- **AEO-BEST-PRACTICES.md** - How to write for AI answers
- **GEO-CHECKLIST.md** - Local optimization checklist
- **SCHEMA-GUIDE.md** - Understanding JSON-LD markup

### External Resources
- Google SGE Documentation
- Schema.org reference
- Local SEO best practices
- AI search optimization studies

---

## 🔮 Future Enhancements (Phase 5+)

### AI Platform Integrations
- Direct testing against ChatGPT Search API
- Perplexity citation tracking
- SGE preview simulation
- Bing Copilot optimization scoring

### Advanced GEO
- Multi-location management
- Franchise SEO automation
- Local competitor analysis
- Service area mapping

### AISO Analytics
- AI traffic attribution
- Citation source tracking
- Answer engine performance dashboard
- ROI calculator (AI vs traditional SEO)

---

**Last Updated**: 2025-01-04
**Version**: 1.0 (AISO Framework Launch)
**Next Review**: After Phase 1 completion
