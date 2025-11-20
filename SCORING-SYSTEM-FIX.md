# Scoring System Fix - Unified AISO Scoring

## Problem Identified

The system had **inconsistent scoring** between rewrite and audit flows, causing:
1. Different scores for the same content
2. Rewrite prompts showing 5 categories while code calculated 6
3. Category minimums not checking GEO for local content
4. Confusion about scoring weights

## Root Cause

**Two different scoring systems** were being used:
- **National Content:** 5 categories (Fact-Check, AEO, SEO, Readability, Engagement)
- **Local Content:** 6 categories (Fact-Check, AEO, **GEO**, SEO, Readability, Engagement)

But the **rewrite prompts and category checks** only handled 5 categories, causing misalignment.

---

## Solution Implemented

### **Unified Scoring System**

#### **National Content (contentType: 'national')**
**5 Categories - Total 100%:**
1. **Fact-Check: 30%** ⭐ (KEY DIFFERENTIATOR - highest weight!)
2. **AEO: 25%** (Answer Engine Optimization)
3. **SEO: 15%** (Traditional SEO)
4. **Readability: 15%** (Flesch score, sentence complexity)
5. **Engagement: 15%** (Hooks, CTAs, variety)

**Category Minimums:**
- Fact-Check: 75+
- AEO: 70+
- SEO: 65+
- Readability: 65+
- Engagement: 65+

#### **Local Content (contentType: 'local' or 'hybrid')**
**6 Categories - Total 100%:**
1. **Fact-Check: 25%** ⭐ (still highest!)
2. **AEO: 20%** (Answer Engine Optimization)
3. **GEO: 10%** 🌎 (Local/Geographic Optimization)
4. **SEO: 15%** (Traditional SEO)
5. **Readability: 15%** (Flesch score, sentence complexity)
6. **Engagement: 15%** (Hooks, CTAs, variety)

**Category Minimums:**
- Fact-Check: 75+
- AEO: 70+
- **GEO: 65+** (new!)
- SEO: 65+
- Readability: 65+
- Engagement: 65+

---

## What GEO (Geographic Optimization) Measures

### **Purpose:**
Optimize content for local searches like:
- "plumber near me"
- "dentist in Austin"
- "best HVAC repair in Dallas"

### **GEO Scoring Factors (0-100 points):**

**1. Location Signals (30 points)**
- City/state mentions (3+ times)
- "Near me" language ("near you", "in your area", "local", "nearby")
- Service area mentions ("serving Austin", "available in Texas")

**2. Local Schema Readiness (25 points)**
- Business info (hours, phone, address, location)
- Reviews/testimonials mentions
- Contact information

**3. Local Keywords (25 points)**
- Local keyword phrases ("best plumber in Austin")
- Neighborhood/district mentions
- Local intent keywords

**4. Local Intent Matching (15 points)**
- Search intent phrases ("find", "looking for", "hire", "book")
- Local questions ("where to find", "how to choose")

**5. GBP Optimization (15 points)**
- Booking CTAs ("call now", "schedule appointment", "get directions")
- Service categories ("plumbing", "HVAC", "electrical")
- Google Business Profile signals

---

## Files Modified

### 1. **`lib/content-scoring.ts`** (lines 679-704)
**Change:** Clarified weight comments to show exact percentages for national vs local

**Before:**
```typescript
// With GEO: AEO 20%, GEO 10%, SEO 15%, Readability 15%, Engagement 15%, Fact-check 25%
// Without GEO: AEO 25%, SEO 15%, Readability 15%, Engagement 15%, Fact-check 30%
```

**After:**
```typescript
// LOCAL CONTENT (6 categories): Fact-check 25%, AEO 20%, GEO 10%, SEO 15%, Readability 15%, Engagement 15% = 100%
// NATIONAL CONTENT (5 categories): Fact-check 30%, AEO 25%, SEO 15%, Readability 15%, Engagement 15% = 100%
```

### 2. **`app/api/posts/[id]/rewrite/route.ts`** (multiple sections)

**A. Detect Content Type (lines 101-120)**
```typescript
const isLocalContent = strategy.content_type === 'local' || strategy.content_type === 'hybrid';

const CATEGORY_MINIMUMS = isLocalContent ? {
  // LOCAL CONTENT (6 categories)
  factCheck: 75, aeo: 70, geo: 65, seo: 65, readability: 65, engagement: 65
} : {
  // NATIONAL CONTENT (5 categories)
  factCheck: 75, aeo: 70, seo: 65, readability: 65, engagement: 65
};
```

**B. Category Minimum Check (lines 136-168)**
- Added GEO score checking for local content
- Shows "LOCAL - 6 categories" or "NATIONAL - 5 categories" in logs
- Validates GEO >= 65 for local content

**C. Dynamic Prompt (lines 190-296)**
- Shows content type (national vs local)
- Displays correct weight percentages based on content type
- Adds GEO scoring line for local content only
- Includes GEO improvement instructions for local content

**D. Score Tracking (lines 382-389)**
- Added `auditReport.geoScore` tracking
- Updates GEO score each iteration for local content

**E. Response Structure (lines 460-503)**
- Dynamic category labels with correct percentages
- Conditionally includes GEO category for local content
- Shows 5 or 6 categories based on content type

---

## Testing Checklist

### **Step 1: Restart Dev Server (CRITICAL)**
```bash
# Stop current dev server (Ctrl+C)

# Delete lock file if exists
del "C:\Users\mrpof\APPS Homemade\content-command-studio\.next\dev\lock"

# Clear Next.js cache
rd /s /q ".next"

# Restart
npm run dev
```

### **Step 2: Test National Content (5 categories)**
1. Create strategy with `contentType: 'national'`
2. Generate a post from that strategy
3. Click "Rewrite" on the post
4. **Verify in terminal logs:**
   - Shows "NATIONAL - 5 categories"
   - Lists: Fact-Check (30%), AEO (25%), SEO (15%), Readability (15%), Engagement (15%)
   - NO GEO mentioned
5. **Then run AISO Audit** on the same post
6. **Verify scores match exactly:**
   - AISO score should be identical
   - All 5 category scores should match

### **Step 3: Test Local Content (6 categories)**
1. Create strategy with `contentType: 'local'`
2. Set city: "Austin", state: "Texas"
3. Generate a post from that strategy
4. Click "Rewrite" on the post
5. **Verify in terminal logs:**
   - Shows "LOCAL - 6 categories"
   - Lists: Fact-Check (25%), AEO (20%), GEO (10%), SEO (15%), Readability (15%), Engagement (15%)
   - GEO score appears with city/state context
6. **Then run AISO Audit** on the same post
7. **Verify scores match exactly:**
   - AISO score should be identical
   - All 6 category scores should match

---

## Success Criteria

### ✅ **Scoring Consistency**
- [ ] Rewrite and Audit produce **identical AISO scores** for same content
- [ ] Category breakdowns match exactly
- [ ] Weights shown in prompts match actual calculation

### ✅ **Category Minimums Working**
- [ ] National content checks 5 categories
- [ ] Local content checks 6 categories (including GEO)
- [ ] Rewrite iterates until ALL minimums met
- [ ] Logs show clear pass/fail for each category

### ✅ **GEO Optimization Working**
- [ ] Local content gets GEO scoring
- [ ] GEO instructions appear in rewrite prompts for local content
- [ ] Content includes location mentions, "near me" language
- [ ] GEO score visible in response and UI

### ✅ **No Regressions**
- [ ] National content still works (5 categories)
- [ ] Fact-checking weight remains highest (30% national, 25% local)
- [ ] Readability improvements still enforced
- [ ] No new bugs introduced

---

## Key Benefits

### **1. Consistent Scoring**
- Same content = same score, regardless of where it's evaluated
- Predictable results for users
- No more confusion about discrepancies

### **2. Proper Local Optimization**
- GEO now properly enforced with 65+ minimum
- Local businesses get "near me" optimization
- Geographic keywords tracked and improved

### **3. Systematic Approach**
- Every category has clear minimum threshold
- Iterative improvement targets weak areas
- No category left behind

### **4. Clear Communication**
- Prompts show exactly what's being measured
- Logs show pass/fail for each category
- Users understand the scoring system

---

## What Changed (Summary)

**Before:**
- ❌ Rewrite used different weights than Audit
- ❌ GEO existed but wasn't enforced in rewrites
- ❌ Prompts showed 5 categories, code used 6
- ❌ Category minimums ignored GEO

**After:**
- ✅ Rewrite and Audit use identical scoring logic
- ✅ GEO properly enforced for local content (65+ minimum)
- ✅ Prompts dynamically show 5 or 6 categories
- ✅ Category minimums check all applicable categories
- ✅ Scoring weights clearly documented everywhere

---

## Next Session

After restarting dev server and testing:

1. **If scores still don't match:** Check `performFactCheck()` - it might be returning different results
2. **If GEO still low:** Adjust prompts to be more aggressive about location mentions
3. **If Readability still failing:** May need to adjust Flesch score thresholds
4. **If all working:** Move on to MVP features (Export, Rate Limiting)

---

**Date:** 2025-01-05
**Status:** ✅ Code Fixed, Awaiting Testing
