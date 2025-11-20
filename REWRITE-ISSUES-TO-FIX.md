# Rewrite Issues - Next Session TODO

## Problem Summary

The rewrite feature is not improving content quality. Key issues identified:

### 1. **Code Changes Not Loading**
- Made changes to `app/api/posts/[id]/rewrite/route.ts` to add:
  - Category minimum checking logic (lines 124-148)
  - Readability/Engagement scores in response (lines 428-446)
  - Detailed console logging for debugging
- **Changes are NOT being picked up by Next.js dev server**
- Need to restart dev server properly to load new code

### 2. **Readability Score is Critically Low**
- Posts generating with readability scores of **38-57** (need 65+)
- This is the primary category failing and blocking quality approval
- Content is too complex: long sentences, difficult words, poor paragraph structure

### 3. **Rewrites Making Scores WORSE**
- Original: 70 AISO, Fact-check 89
- After rewrite: 70 AISO, Fact-check 84 (dropped 5 points!)
- Content is IDENTICAL - no actual changes being made
- Rewrite is adding more claims (4→7→11) and failing to verify them

### 4. **Missing Scores in PDF Report**
- PDF only shows 4 categories: AISO, Fact-Check, AEO, SEO
- **Missing**: Readability, Engagement (the critical failing categories!)
- This hides the real problem from users

## Root Causes

1. **Dev server caching old code** - Changes to rewrite API not hot-reloading
2. **Category minimum logic not running** - Still using old "overall score" approach
3. **Prompts too aggressive** - Telling Claude to add FAQ, Key Takeaways, etc., which adds unverifiable claims
4. **UI shows different scores than API** - Frontend calculating readability one way, backend another way

## What We Fixed (Pending Server Restart)

### File: `app/api/posts/[id]/rewrite/route.ts`

**Added Category Minimums (lines 102-109):**
```typescript
const CATEGORY_MINIMUMS = {
  factCheck: 75,
  aeo: 70,
  seo: 65,
  readability: 65,  // CRITICAL - most posts failing here
  engagement: 65,
};
const MAX_ITERATIONS = 3;
```

**Added Detailed Logging (lines 124-148):**
```typescript
const meetsMinimums = () => {
  console.log(`\n=== CATEGORY MINIMUM CHECK ===`);
  console.log(`Readability: ${readability}/${CATEGORY_MINIMUMS.readability} ${readability >= 65 ? '✅' : '❌'}`);
  // ... logs for all categories
};
```

**Added Readability/Engagement to Response (lines 428-446):**
```typescript
scoreBreakdown: [
  // ... existing categories
  {
    category: 'Readability (15%)',
    before: originalAisoScores.readabilityScore,
    after: bestAisoScores.readabilityScore,
    improvement: bestAisoScores.readabilityScore - originalAisoScores.readabilityScore
  },
  {
    category: 'Engagement (15%)',
    before: originalAisoScores.engagementScore,
    after: bestAisoScores.engagementScore,
    improvement: bestAisoScores.engagementScore - originalAisoScores.engagementScore
  }
],
readabilityScore: bestAisoScores.readabilityScore,
engagementScore: bestAisoScores.engagementScore,
```

### File: `app/dashboard/posts/[id]/page.tsx`

**Added Category Quality Status UI (lines 595-673):**
- Shows each category with pass/fail indicator
- Red highlighting for categories below minimum
- Clear "❌ NEEDS WORK" label for failing categories
- Green "✅" for passing categories
- Overall status banner showing if ALL minimums met

## Next Session Action Items

### 1. **Restart Dev Server Clean** (FIRST PRIORITY)
```bash
# Stop all running instances
Ctrl+C in terminal

# Delete lock file
del "C:\Users\mrpof\APPS Homemade\content-command-studio\.next\dev\lock"

# Restart fresh
npm run dev
```

### 2. **Verify Code Changes Loaded**
- Click Rewrite on a post
- Check terminal for `=== CATEGORY MINIMUM CHECK ===` logs
- Should see detailed breakdown of all 5 categories
- PDF should show 6 categories (including Readability/Engagement)

### 3. **Test Readability Improvements**
- Generate a new post
- Note the readability score (likely 38-57)
- Click Rewrite
- Verify logs show `Readability: XX/65 ❌`
- Check if rewrite actually improves readability or if prompt needs adjustment

### 4. **Fix Readability Calculation Discrepancy**
- Frontend (page.tsx lines 288-356) calculates readability on-the-fly
- Backend uses `lib/content-scoring.ts` calculateAISOScore function
- These might be using different formulas - need to verify they match
- If different, standardize on ONE approach

### 5. **Improve Rewrite Prompts**
If rewrites still add claims instead of reformatting:
- Make "DO NOT ADD NEW CLAIMS" even more prominent
- Remove instructions to "add FAQ" and instead say "format existing content as FAQ"
- Focus purely on sentence simplification for readability
- Test with a manual Claude conversation to find right prompt tone

### 6. **Consider Alternative: Readability-Only Mode**
If category minimums still don't work, create a separate "Fix Readability" button that:
- Only focuses on readability improvements
- Doesn't touch claims at all (preserves fact-check)
- Just breaks up sentences, simplifies words, improves paragraphs
- Simpler prompt = less risk of degradation

## Key Metrics to Watch

When testing after restart:

- **Readability**: Should start at 38-57, target is 65+
- **Fact-Check**: Should NOT drop (preserve existing scores)
- **Iterations**: Should run 1-3 times until minimums met
- **Content changes**: Should see actual simplification, not identical content
- **PDF Report**: Should show all 6 categories with before/after scores

## Files Modified (Needs Server Restart to Apply)

1. `app/api/posts/[id]/rewrite/route.ts` - Category minimums, logging, response format
2. `app/dashboard/posts/[id]/page.tsx` - UI to show category status with pass/fail

## Current State

- ✅ Category minimum logic implemented
- ✅ UI shows failing categories prominently
- ✅ Detailed logging added for debugging
- ❌ Changes not loaded by dev server (RESTART NEEDED)
- ❌ Rewrites still degrading quality (TEST AFTER RESTART)
- ❌ Readability still critically low (38-57 vs 65 needed)

## Success Criteria for Next Session

1. ✅ Logs show category minimum checks
2. ✅ PDF shows all 6 categories
3. ✅ Readability score improves from 38-57 to 65+
4. ✅ Fact-check score stays same or improves (NOT drops)
5. ✅ Content actually changes (not identical)
6. ✅ UI shows red for failing categories, green when fixed

---

**Bottom Line**: We know WHAT'S wrong (readability too low, rewrites adding bad claims) and we've implemented the FIX (category minimums, better logging, better UI). We just need to restart the dev server to actually load the new code and test if the fix works.
