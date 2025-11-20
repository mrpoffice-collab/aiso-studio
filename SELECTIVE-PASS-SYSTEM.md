# Selective Pass System - User Chooses Improvements

**Date:** 2025-01-05
**Status:** ✅ Ready for UI Integration

---

## What This Solves

After testing the 5-pass system, we discovered:
1. **Readability Pass 1 didn't improve scores** (stayed at 25)
2. **Running all 5 passes is expensive** ($0.60 per rewrite)
3. **Not all categories need improvement** (e.g., if AEO is already 85, why rewrite it?)
4. **Users want control** over which improvements to apply

**New Solution:** Let users **choose which specific improvement to run** based on their scores.

---

## How It Works

### User Sees Current Scores:
```
✅ Fact-Check: 85/100
🤖 AEO: 85/100
📊 SEO: 70/100
📖 Readability: 47/100 ❌ NEEDS WORK
🎯 Engagement: 80/100
```

### User Gets 4 Improvement Options:

1. **🔧 Fix Readability** (Pass 1 only)
   - Simplifies sentences
   - Targets: Under 15 words, 5th-6th grade level
   - Cost: ~$0.12
   - Time: ~15 seconds

2. **🔧 Improve SEO** (Pass 2 only)
   - Adds headers, links, bold terms
   - Preserves existing readability
   - Cost: ~$0.12
   - Time: ~15 seconds

3. **🔧 Add FAQ/AEO** (Pass 3 only)
   - Adds FAQ section, Key Takeaways, definitions
   - Doesn't rewrite existing content
   - Cost: ~$0.15
   - Time: ~20 seconds

4. **🔧 Polish Engagement** (Pass 4 only)
   - Adds hooks, CTAs, questions
   - Includes GEO for local content
   - Cost: ~$0.12
   - Time: ~15 seconds

**Plus:**
5. **🔧 Run All Passes** (Original 5-pass system)
   - Runs all 4 improvements sequentially
   - Cost: ~$0.60
   - Time: ~60-75 seconds

---

## API Endpoint

### **POST /api/posts/[id]/improve**

**Body:**
```json
{
  "passType": "readability"  // or "seo", "aeo", "engagement"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Readability improvement complete! Score: 47 → 65",
  "passType": "readability",
  "passName": "Readability",
  "scoreBefore": 73,
  "scoreAfter": 78,
  "improvement": +5,
  "categoryScores": {
    "before": {
      "aiso": 73,
      "readability": 47,
      "aeo": 85,
      ...
    },
    "after": {
      "aiso": 78,
      "readability": 65,  ← Improved!
      "aeo": 85,
      ...
    }
  },
  "improvedContent": "..."
}
```

---

## Benefits

### 1. **Faster**
- Single pass: 15-20 seconds
- vs. All 5 passes: 60-75 seconds

### 2. **Cheaper**
- Single pass: $0.12-0.15
- vs. All 5 passes: $0.60

### 3. **More Control**
- User sees exactly what needs work
- Only improves categories below threshold
- Can test each improvement individually

### 4. **Better Debugging**
- Can isolate which pass works/doesn't work
- Example: If readability still doesn't improve after Pass 1, we know there's a prompt issue

### 5. **Iterative Improvement**
- User can fix readability first
- Then add FAQ second
- Then polish engagement last
- Each step builds on the previous

---

## Implementation Files

### Backend:
1. **`lib/content.ts`**
   - `improveReadability()` - Pass 1 only
   - `improveStructureSEO()` - Pass 2 only
   - `improveAEO()` - Pass 3 only
   - `improveEngagement()` - Pass 4 only

2. **`app/api/posts/[id]/improve/route.ts`**
   - Handles selective improvement requests
   - Routes to appropriate pass function
   - Updates database with results

### Frontend (TODO):
3. **Post detail page** needs:
   - 4 individual improvement buttons
   - Show which categories need work
   - Display before/after scores
   - Loading state for each button

---

## Example User Flow

### Scenario: Post has low readability (47)

**Step 1:** User sees score breakdown
```
📖 Readability: 47/100 ❌ NEEDS WORK
```

**Step 2:** User clicks **"Fix Readability"** button

**Step 3:** System runs Pass 1 only (15 seconds)

**Step 4:** User sees result:
```
✅ Readability improved: 47 → 65
   Overall AISO: 73 → 78
```

**Step 5:** If readability still below 65, user can:
- Try again (sometimes Claude needs multiple attempts)
- Manually edit the content
- Choose a different improvement

---

## Cost Comparison

| Approach | Passes | Time | Cost | Best For |
|----------|--------|------|------|----------|
| **Single Pass** | 1 | 15s | $0.12 | Targeted fixes |
| **Two Passes** | 2 | 30s | $0.24 | Fix 2 categories |
| **All 5 Passes** | 5 | 75s | $0.60 | Complete overhaul |

**Recommendation:** Start with single passes for specific issues. Only run all 5 if multiple categories need work.

---

## Testing Individual Passes

### Test Readability Pass:
```bash
curl -X POST http://localhost:3000/api/posts/POST_ID/improve \
  -H "Content-Type: application/json" \
  -d '{"passType": "readability"}'
```

### Test SEO Pass:
```bash
curl -X POST http://localhost:3000/api/posts/POST_ID/improve \
  -H "Content-Type: application/json" \
  -d '{"passType": "seo"}'
```

### Test AEO Pass:
```bash
curl -X POST http://localhost:3000/api/posts/POST_ID/improve \
  -H "Content-Type: application/json" \
  -d '{"passType": "aeo"}'
```

### Test Engagement Pass:
```bash
curl -X POST http://localhost:3000/api/posts/POST_ID/improve \
  -H "Content-Type: application/json" \
  -d '{"passType": "engagement"}'
```

---

## UI Mockup (To Implement)

```
┌─────────────────────────────────────────┐
│ Post Quality Scores                     │
├─────────────────────────────────────────┤
│                                         │
│ ✅ Fact-Check: 85/100                  │
│ 🤖 AEO: 85/100                         │
│ 📊 SEO: 70/100    [🔧 Improve SEO]    │
│ 📖 Readability: 47/100 ❌              │
│                   [🔧 Fix Readability] │
│ 🎯 Engagement: 80/100                  │
│                                         │
│ Overall AISO: 73/100                   │
│                                         │
│ [Run All Improvements] ($0.60, 75s)    │
└─────────────────────────────────────────┘
```

---

## Next Steps

### Immediate:
- [x] Create individual pass functions
- [x] Create API endpoint for selective improvements
- [ ] Update UI to show individual buttons
- [ ] Test each pass in isolation

### Short-term:
- [ ] Add "Undo" functionality (revert to previous version)
- [ ] Show pass history (which passes were run)
- [ ] Add cost estimate before running
- [ ] Add progress indicator during pass execution

### Future:
- [ ] Auto-suggest which passes to run based on scores
- [ ] Allow running multiple selected passes (e.g., readability + SEO)
- [ ] Add "Preview" before applying changes
- [ ] Track which passes work best for different content types

---

## Why This is Better Than 5-Pass

| Feature | 5-Pass System | Selective System |
|---------|---------------|------------------|
| **User Control** | ❌ All or nothing | ✅ Choose what to fix |
| **Cost** | $0.60 always | $0.12-0.60 based on needs |
| **Speed** | 75s always | 15-75s based on needs |
| **Debugging** | ❌ Hard to isolate issues | ✅ Test each pass separately |
| **Iterative** | ❌ Must redo all 5 | ✅ Build improvements step-by-step |
| **Flexibility** | ❌ Fixed order | ✅ Any order, any combination |

---

**Status:** ✅ Backend complete, ready for UI integration

**Next:** Update the post detail page to show individual improvement buttons for each category.
