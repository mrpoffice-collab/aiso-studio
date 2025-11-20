# AISO Quick Start Guide

## What is AISO?

**AISO** (AI Search Optimization) is the next evolution of SEO, optimizing content for AI-powered answer engines like:
- 🤖 ChatGPT Search
- 🔍 Google SGE (Search Generative Experience)
- 💬 Perplexity AI
- 🔷 Bing Copilot
- 🌐 Claude.ai & Gemini

---

## The AISO Stack (3 Layers)

### 🔍 AEO - Answer Engine Optimization
**Goal**: Make your content quotable and citable by AI

**Key Elements**:
- Answer-first structure (direct answers in first paragraph)
- FAQ sections (5-8 Q&A pairs)
- Quotable statistics and insights
- Structured data (tables, lists)
- Schema markup (JSON-LD)

### 📍 GEO - Local Intent Optimization
**Goal**: Rank in AI-powered local search

**Key Elements**:
- Location mentions (city, state, service area)
- "Near me" optimization
- Local keywords ("best plumber in Austin")
- Business information (hours, contact, reviews)
- LocalBusiness schema markup

### ✍️ Content Layer - Traditional SEO + Quality
**Goal**: Balance traditional SEO with modern AI standards

**Key Elements**:
- Keyword optimization
- Meta tags and headers
- Readability (Flesch 60+)
- Engagement (hooks, CTAs, variety)
- Fact-checking (75%+ accuracy)

---

## How Content Command Studio Uses AISO

### ✅ What We've Built

1. **AEO Scoring** (0-100)
   - Measures answer quality
   - Checks for FAQ sections
   - Validates citation-worthiness
   - Scores AI-friendly formatting
   - Assesses topical authority

2. **GEO Scoring** (0-100) - For Local Content
   - Detects location signals
   - Measures local keyword usage
   - Checks "near me" optimization
   - Validates business info presence
   - Scores local intent matching

3. **Enhanced Prompts**
   - Content generation includes mandatory FAQ sections
   - Answer-first structure enforced
   - Quotable insights emphasized
   - Schema-ready formatting

4. **Schema Generation** (Automatic)
   - Article schema
   - FAQ schema (auto-extracted)
   - HowTo schema (auto-extracted)
   - LocalBusiness schema (for GEO content)

---

## AISO Scoring Breakdown

### Overall AISO Score Formula

**For National Content** (no local context):
- AEO: 30%
- SEO: 20%
- Readability: 25%
- Engagement: 25%

**For Local Content** (with local context):
- AEO: 25%
- GEO: 15%
- SEO: 20%
- Readability: 20%
- Engagement: 20%

### Score Interpretation

- **85-100**: Excellent - Industry-leading AISO optimization
- **75-84**: Good - Solid optimization, ready to publish
- **65-74**: Fair - Needs improvement before publishing
- **<65**: Poor - Major optimization required

**Target**: 75+ overall AISO score

---

## Creating AISO-Optimized Content

### Step 1: Set Up Strategy

**For National Content**:
- Use existing strategy builder
- Focus on broad industry topics
- Target national keywords

**For Local Content**:
- Add local context fields:
  - Content Type: "Local"
  - City: "Austin"
  - State: "Texas"
  - Service Area: "Greater Austin metro area"
- Target local keywords: "best [service] in [city]"

### Step 2: Generate Topics

The AI will now generate topics that are:
- ✅ Question-based ("What is...", "How to...")
- ✅ Answer-focused (can be directly answered)
- ✅ AI-citation friendly
- ✅ Include FAQ outline sections
- ✅ Formatted for schema markup

### Step 3: Generate Content

Each blog post will automatically include:
- ✅ Direct answer in first paragraph
- ✅ FAQ section (5-8 Q&A pairs)
- ✅ Quotable statistics and insights
- ✅ Structured lists and tables
- ✅ Answer-first section structure
- ✅ Location mentions (if local)

### Step 4: Review AISO Score

Check your scores:
- **AEO Score**: 70+ (answer quality, FAQ, quotability)
- **GEO Score**: 70+ (if local - location signals, local keywords)
- **SEO Score**: 70+ (keywords, meta, headers)
- **Readability**: 70+ (clear, scannable)
- **Engagement**: 70+ (hooks, CTAs)
- **Overall AISO**: 75+

### Step 5: Generate & Export Schema

Generate JSON-LD schema markup:
```json
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Your Title",
  ...
}
</script>
```

Copy and add to your website's `<head>` section.

---

## Real-World Examples

### Example 1: National SaaS Blog

**Topic**: "What Is Customer Retention Rate and How to Calculate It"

**AISO Optimizations**:
- Direct answer in first paragraph: "Customer retention rate is defined as the percentage of customers who continue using your product over a given period."
- FAQ section with questions like:
  - "What is a good customer retention rate?"
  - "How is retention rate different from churn rate?"
  - "What tools calculate retention automatically?"
- Data table comparing retention rates by industry
- Step-by-step calculation guide (HowTo schema)

**Expected Scores**:
- AEO: 85 (direct answer, FAQ, HowTo)
- SEO: 78 (headers, keywords, meta)
- Readability: 82 (clear, simple language)
- Engagement: 80 (examples, CTAs)
- **Overall AISO: 82** ✅ Excellent

### Example 2: Local Plumbing Service

**Topic**: "Emergency Plumber in Austin, TX - 24/7 Service"

**AISO Optimizations (including GEO)**:
- Direct answer: "If you need an emergency plumber in Austin, TX, call [Business] for 24/7 service covering all of Travis County."
- Location mentions: "Austin", "Travis County", "Round Rock", "Cedar Park"
- Local keywords: "best plumber in Austin", "Austin emergency plumbing"
- FAQ section with local questions:
  - "What areas in Austin do you serve?"
  - "Do you charge extra for after-hours service in Austin?"
  - "Are you licensed in Travis County?"
- LocalBusiness schema with address, phone, hours

**Expected Scores**:
- AEO: 78 (direct answer, FAQ)
- GEO: 85 (location mentions, local keywords, business info)
- SEO: 75 (local keywords, meta)
- Readability: 80 (clear language)
- Engagement: 76 (local CTAs)
- **Overall AISO: 79** ✅ Good

---

## Common Questions

### Q: Will AISO replace traditional SEO?
**A**: No, AISO includes traditional SEO as one layer. It's additive, not replacement.

### Q: Do I need to understand schema markup?
**A**: No, Content Command Studio auto-generates all schema markup for you.

### Q: Should all content include local optimization (GEO)?
**A**: Only if you're targeting local customers. National brands skip GEO.

### Q: How long until AI engines cite my content?
**A**: It varies, but AISO-optimized content has been cited within 2-4 weeks in testing.

### Q: Can I see where my content is cited?
**A**: This is coming in Phase 3 (AI citation tracking feature).

### Q: What's the biggest mistake people make with AEO?
**A**: Not including FAQ sections. AI engines love Q&A format for answers.

---

## AISO Checklist (Before Publishing)

Content must include:
- [ ] Direct answer in first 100-200 characters
- [ ] FAQ section with 5+ Q&A pairs
- [ ] Clear H2/H3 structure
- [ ] Statistics with context
- [ ] Bullet points and numbered lists
- [ ] Location mentions (if local)
- [ ] Schema markup generated
- [ ] AISO score 75+ overall
- [ ] Individual scores 70+ each

---

## Next Steps

### For Users:
1. Read the full **AISO-FRAMEWORK.md** for detailed strategy
2. Start generating content with new AEO prompts
3. Review your AISO scores
4. Export schema markup
5. Monitor AI citations

### For Developers:
1. Review **AISO-IMPLEMENTATION-SUMMARY.md** for code details
2. Complete Phase 2 (UI updates)
3. Run database migrations
4. Add local fields to strategy builder
5. Test end-to-end workflow

---

## Resources

**Internal Documentation**:
- `AISO-FRAMEWORK.md` - Complete framework guide
- `AISO-IMPLEMENTATION-SUMMARY.md` - Technical implementation details
- `lib/schema-generator.ts` - Schema generation code
- `lib/content-scoring.ts` - AEO/GEO scoring algorithms

**External Resources**:
- [Google Search Central - Structured Data](https://developers.google.com/search/docs/appearance/structured-data)
- [Schema.org Documentation](https://schema.org/)
- [Google Rich Results Test](https://search.google.com/test/rich-results)

---

**Last Updated**: 2025-01-04
**Version**: 1.0
**Status**: Phase 1 Complete - Core Functionality Ready
