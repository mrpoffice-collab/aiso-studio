# Testing the 5-Pass System - Quick Start Guide

**Status:** Ready to test
**Date:** 2025-01-05

---

## Quick Test

### Option 1: Test via API (Recommended)

```bash
# Start the dev server
npm run dev

# In another terminal, test the rewrite endpoint
curl -X POST http://localhost:3000/api/posts/[POST_ID]/rewrite \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN"
```

### Option 2: Test via UI

1. Start dev server: `npm run dev`
2. Go to `http://localhost:3000/dashboard/posts`
3. Find a post with low readability score
4. Click "Rewrite" button
5. Watch the console logs for 5-pass progress

---

## What to Watch For

### ✅ Success Indicators

**Console Logs Should Show:**
```
🚀 STARTING 5-PASS IMPROVEMENT SYSTEM
📊 Initial AISO Score: 45/100

📖 PASS 1: READABILITY IMPROVEMENT
✅ Pass 1 Complete: 45 → 52 (+7)
   Readability: 25 → 68

📊 PASS 2: STRUCTURE & SEO
✅ Pass 2 Complete: 52 → 58 (+6)
   Readability maintained: 68

🤖 PASS 3: AEO / FAQ / STRUCTURED DATA
✅ Pass 3 Complete: 58 → 67 (+9)

🎯 PASS 4: ENGAGEMENT & TONE POLISH
✅ Pass 4 Complete: 67 → 72 (+5)

🏆 PASS 5: FINAL SCORING & VALIDATION
✅ SUCCESS: All quality thresholds met!
```

**API Response Should Include:**
```json
{
  "success": true,
  "originalScore": 45,
  "newScore": 72,
  "improvement": 27,
  "passResults": [
    { "pass": 1, "name": "Readability", ... },
    { "pass": 2, "name": "Structure/SEO", ... },
    { "pass": 3, "name": "AEO/FAQ", ... },
    { "pass": 4, "name": "Engagement", ... },
    { "pass": 5, "name": "Final Validation", ... }
  ]
}
```

---

## Test Scenarios

### Scenario 1: Good Topic (Should Pass)

**Test:** Rewrite a post about a popular topic with decent content.

**Expected:**
- Initial score: 50-70
- Final score: 70-85
- All 5 passes complete
- Readability improves significantly
- FAQ section added
- No topic rejection

### Scenario 2: Bad Topic (Should Reject)

**Test:** Create a post with nonsense keyword like "asdfasdf xyz123"

**Expected:**
- Initial score: < 40
- Final score: < 60
- All 5 passes attempt improvements
- Topic rejection triggered
- API returns 422 status code
- Error message: "This topic may not generate high-quality content..."

### Scenario 3: Already-Good Content

**Test:** Rewrite a post that already scores 75+

**Expected:**
- Initial score: 75-85
- Final score: 80-90
- Minor improvements across passes
- All passes complete without errors
- Readability maintained or improved slightly

---

## Debugging Tips

### If Pass 1 Doesn't Improve Readability:

1. Check the prompt in `lib/content.ts` line 358
2. Verify Claude API key is valid
3. Check that `calculateReadabilityScore` is working
4. Look for errors in console logs

### If Topic Rejection Doesn't Work:

1. Check quality gate logic in `lib/content.ts` line 684
2. Verify `finalScore < 60` condition
3. Check that API route handles `topicRejection: true`
4. Verify 422 status code is returned

### If Passes Don't Run Sequentially:

1. Check that each pass waits for previous pass to complete
2. Verify `await` is used on all Claude API calls
3. Check that `currentContent` is updated after each pass
4. Look for promise chain issues

---

## Performance Monitoring

**Expected Timing:**
- Pass 1: ~10-15 seconds
- Pass 2: ~10-15 seconds
- Pass 3: ~15-20 seconds (FAQ generation)
- Pass 4: ~10-15 seconds
- Pass 5: ~5-10 seconds (scoring only)

**Total: ~60-75 seconds per rewrite**

If significantly slower, check:
- Claude API response times
- Fact-check API performance
- Database query speed

---

## Success Criteria

Before marking as "complete", verify:

- [x] 5-pass function exists in `lib/content.ts`
- [x] Rewrite route uses 5-pass function
- [x] Quality gate rejects score < 60
- [ ] End-to-end test passes (manual verification needed)
- [ ] Readability actually improves (verify Flesch score)
- [ ] FAQ section appears in Pass 3 output
- [ ] Topic rejection returns correct error message
- [ ] API response includes all pass results
- [ ] Database updates with final scores
- [ ] Console logs show all 5 passes

---

## Known Limitations

1. **Cost:** 5 passes = ~$0.60 per rewrite (vs $0.36 for old 3-iteration system)
2. **Time:** Takes 60-75 seconds (vs 30-45 seconds for old system)
3. **No Early Exit:** Always runs all 5 passes even if score is good after Pass 2
4. **Fixed Order:** Cannot skip or reorder passes based on current scores

**Future Improvements:**
- Add early exit if score reaches 80+ before Pass 5
- Allow pass skipping for categories already above threshold
- Optimize pass order based on initial scores

---

## Rollback Plan

If 5-pass system causes issues:

### Immediate Rollback:
1. Revert `app/api/posts/[id]/rewrite/route.ts` to previous version
2. System will use old 3-iteration approach
3. User-facing features unaffected

### Files to Revert:
- `lib/content.ts` (keep `generateBlogPost`, remove `improveContentFivePass`)
- `app/api/posts/[id]/rewrite/route.ts` (restore old iteration logic)

---

## Next Steps After Testing

### If Tests Pass:
1. Integrate into topic generation (`POST /api/topics/[id]/generate`)
2. Add frontend progress UI
3. Show pass-by-pass improvements to user
4. Add "Retry with different topic" button for rejections

### If Tests Fail:
1. Review console logs for errors
2. Check specific pass that fails
3. Adjust prompts if needed
4. Consider reducing from 5 passes to 3 passes
5. Adjust quality thresholds

---

**Ready to test!** Start with Scenario 1 (Good Topic) to verify basic functionality.
