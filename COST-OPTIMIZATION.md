# Cost Optimization Summary

## Changes Made: Switched to OpenAI GPT-4o-mini for Fact-Checking

**Date**: 2025-11-03

---

## Cost Comparison

### Before (Claude Sonnet 4)
```
Input:  $3.00 per 1M tokens
Output: $15.00 per 1M tokens

Typical fact-check:
- 3,000 input tokens  = $0.009
- 2,000 output tokens = $0.030
- Total: $0.039 per post
```

### After (OpenAI GPT-4o-mini)
```
Input:  $0.15 per 1M tokens
Output: $0.60 per 1M tokens

Typical fact-check:
- 3,000 input tokens  = $0.00045
- 2,000 output tokens = $0.00120
- Total: $0.002 per post
```

**Savings: $0.037 per post (95% reduction!)** 💰

---

## Complete Cost Breakdown Per Blog Post

| Component | Provider | Cost |
|-----------|----------|------|
| Content Generation | OpenAI GPT-4 Turbo | $0.036 |
| Fact-Checking (Extract Claims) | OpenAI GPT-4o-mini | $0.001 |
| Fact-Checking (Verify Claims) | OpenAI GPT-4o-mini | $0.001 |
| Brave Search (5 queries avg) | Brave API | $0.000 (FREE) |
| **Total Per Post** | **Mixed** | **$0.038** |

---

## Brave Search Pricing

**Free Tier**: 2,000 queries per month

**Usage Calculation**:
- Average 5 claims per post
- 5 searches per post
- 400 posts per month = 2,000 searches
- **You can generate 400 posts/month on free tier!**

**Paid Tier** (if you exceed free tier):
- $5/month for 2,000 additional queries
- $0.0025 per query beyond that

---

## Monthly Cost Projections

### Scenario 1: 50 Posts/Month
```
Strategy Generation:    10 strategies × $0.009  = $0.09
Content Generation:     50 posts × $0.036      = $1.80
Fact-Checking:          50 posts × $0.002      = $0.10
Brave Search:           250 queries            = FREE
MOU Generation:         10 MOUs × $0.006       = $0.06

TOTAL: $2.05/month
```

### Scenario 2: 200 Posts/Month
```
Strategy Generation:    40 strategies × $0.009  = $0.36
Content Generation:     200 posts × $0.036      = $7.20
Fact-Checking:          200 posts × $0.002      = $0.40
Brave Search:           1,000 queries           = FREE
MOU Generation:         40 MOUs × $0.006        = $0.24

TOTAL: $8.20/month
```

### Scenario 3: 500 Posts/Month (High Volume)
```
Strategy Generation:    100 strategies × $0.009 = $0.90
Content Generation:     500 posts × $0.036      = $18.00
Fact-Checking:          500 posts × $0.002      = $1.00
Brave Search:           2,500 queries           = $1.25 (500 over limit)
MOU Generation:         100 MOUs × $0.006       = $0.60

TOTAL: $21.75/month
```

---

## Why GPT-4o-mini for Fact-Checking?

### Advantages ✅
1. **95% cost reduction** compared to Claude
2. **JSON mode** - structured output guaranteed
3. **Fast inference** - similar speed to Claude
4. **Sufficient capability** - fact extraction/verification is straightforward
5. **Same API** - already using OpenAI for content

### Quality Comparison
| Aspect | Claude Sonnet 4 | GPT-4o-mini | Winner |
|--------|----------------|-------------|--------|
| Cost | $0.039/post | $0.002/post | **GPT-4o-mini** 💰 |
| Speed | Fast | Fast | Tie ⚖️ |
| Accuracy | Excellent | Very Good | Claude (marginal) |
| JSON Parsing | Regex needed | Native JSON mode | **GPT-4o-mini** 🎯 |
| Context Window | 200K | 128K | Claude |

**Verdict**: GPT-4o-mini is the clear winner for fact-checking. The tiny accuracy difference doesn't justify 19.5x higher cost.

---

## Why Keep Claude for Strategy Generation?

Claude Sonnet 4 excels at:
- **Complex reasoning** - Understanding business goals
- **Structured planning** - Creating cohesive 15-topic strategies
- **SEO expertise** - Better keyword optimization
- **Narrative coherence** - Topics flow logically

Cost: $0.009 per strategy (negligible compared to 15 posts × $0.038 = $0.57)

---

## Alternative: Use GPT-4o-mini for Everything?

### If we switched ALL AI calls to GPT-4o-mini:

**Per Post Cost**:
```
Strategy (amortized): $0.0006  (1 strategy / 15 posts)
Content Generation:   $0.004   (much shorter/lower quality)
Fact-Checking:        $0.002
Total: $0.007 per post (82% total savings!)
```

**Trade-offs**:
- ❌ Lower content quality (GPT-4o-mini not as good at long-form)
- ❌ Less coherent strategies
- ✅ MUCH cheaper ($0.007 vs $0.044 per post)

**Recommendation**:
- Keep current mix (GPT-4 Turbo for content, Claude for strategy)
- Already using GPT-4o-mini for fact-checking
- This is the sweet spot: **Quality + Cost-effective**

---

## Recommendations

### For MVP/Testing
✅ **Current setup is optimal**:
- Claude Sonnet 4 for strategies ($0.009)
- OpenAI GPT-4 Turbo for content ($0.036)
- OpenAI GPT-4o-mini for fact-checking ($0.002)
- Brave Search free tier (2,000/month)

### For Production (High Volume)
If you exceed 400 posts/month:
- Consider OpenAI GPT-4o for content (cheaper than GPT-4 Turbo)
- Keep GPT-4o-mini for fact-checking
- Brave paid tier if needed ($5/month for 2K more queries)

### For Budget-Conscious MVP
If cost is critical:
- Switch content to GPT-4o-mini ($0.004/post)
- Accept lower quality content
- Total: $0.015/post (65% savings)

---

## Files Modified

**Code Changes**:
- ✅ `lib/fact-check.ts` - Switched from Claude to OpenAI
  - Now uses `gpt-4o-mini` model
  - Uses native `response_format: { type: 'json_object' }`
  - Better JSON parsing with fallbacks

**Documentation Updates**:
- ✅ `IMPLEMENTATION-SUMMARY.md` - Updated cost table
- ✅ `COST-OPTIMIZATION.md` - This document (new)

---

## Testing Required

Before deploying:
- [ ] Test claim extraction with GPT-4o-mini
- [ ] Verify JSON parsing works reliably
- [ ] Compare accuracy vs Claude (sample 10 posts)
- [ ] Measure actual token usage
- [ ] Confirm costs match estimates

---

## Monitoring

Track these metrics:
- Average tokens per fact-check
- Actual costs per 100 posts
- Fact-check accuracy (verified vs unverified ratio)
- User satisfaction with fact-check quality

---

Last Updated: 2025-11-03
