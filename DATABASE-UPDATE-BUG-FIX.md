# Database Update Bug - CRITICAL FIX

## Problem Discovered

**Frontend score not updating after rewrite** - Score stayed at 63 even though rewrite calculated 70.

## Root Cause Analysis

### Investigation Steps:
1. Checked database: `aiso_score = 63`, `aeo_score = 50` (not updated)
2. Checked rewrite logs: Showed "Updating post with best result (score: 70/100)"
3. Checked rewrite route: Called `db.updatePost()` with all scores
4. **Checked `lib/db.ts` updatePost function: FOUND THE BUG!**

### The Bug

**File:** `lib/db.ts` (lines 151-180)

The `updatePost()` function only handled:
- `title`
- `content`
- `status`
- `meta_description`

It **DID NOT** handle:
- `aiso_score` ❌
- `aeo_score` ❌
- `geo_score` ❌
- `word_count` ❌
- `fact_checks` ❌

**Result:** Rewrite route passed these fields to `updatePost()`, but they were **silently ignored**. The database was never updated, so scores remained stale.

---

## The Fix

### `lib/db.ts` - Added Score Fields (lines 172-191)

```typescript
if (data.word_count !== undefined) {
  updates.push(`word_count = $${paramCount++}`);
  values.push(data.word_count);
}
if (data.aiso_score !== undefined) {
  updates.push(`aiso_score = $${paramCount++}`);
  values.push(data.aiso_score);
}
if (data.aeo_score !== undefined) {
  updates.push(`aeo_score = $${paramCount++}`);
  values.push(data.aeo_score);
}
if (data.geo_score !== undefined) {
  updates.push(`geo_score = $${paramCount++}`);
  values.push(data.geo_score);
}
if (data.fact_checks !== undefined) {
  updates.push(`fact_checks = $${paramCount++}`);
  values.push(JSON.stringify(data.fact_checks));
}
```

---

## Impact

### Before Fix:
1. Rewrite calculated new scores (70 AISO, 75 AEO)
2. API returned these scores in response
3. PDF showed these scores
4. **Database was NOT updated** (still had 63 AISO, 50 AEO)
5. Frontend `fetchPost()` pulled from database → showed old score (63)
6. User saw score as 63 even though it should be 70

### After Fix:
1. Rewrite calculates new scores (70 AISO, 75 AEO)
2. API returns these scores in response
3. PDF shows these scores
4. **Database IS updated** with new scores
5. Frontend `fetchPost()` pulls from database → shows new score (70)
6. User sees correct updated score

---

## Why This Was Hard to Find

1. **No error thrown** - Fields were silently ignored
2. **Partial success** - Content and title updated fine, just scores didn't
3. **API response correct** - Response showed right scores, making it seem like it worked
4. **PDF showed right scores** - Because PDF used API response data
5. **Frontend issue symptoms** - Appeared to be a frontend bug, but was actually backend

---

## Testing Instructions

### Step 1: Server Already Running
The dev server on port 3006 should pick up the `lib/db.ts` changes automatically via hot reload.

### Step 2: Test Rewrite
1. Go to http://localhost:3006
2. Navigate to the Digital Memorial Etiquette post
3. Click "Rewrite Post"
4. **Watch terminal logs** for category checks
5. **Check sidebar score** - should update immediately after rewrite

### Step 3: Verify Database Updated
After rewrite completes, run:
```javascript
// Create a file: verify-db-update.js
require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function verify() {
  const result = await sql`
    SELECT aiso_score, aeo_score, geo_score, updated_at
    FROM posts
    WHERE id = '64b6074d-ec50-4438-8d72-008e91e534fe'
  `;
  console.log('Database scores:', result[0]);
}

verify().then(() => process.exit(0));
```

**Expected:** Database `aiso_score` should match the score shown in UI and logs.

---

## Success Criteria

✅ Rewrite completes successfully
✅ Terminal logs show category checks with new EMERGENCY READABILITY mode
✅ PDF shows correct before/after scores
✅ **Database gets updated with new scores**
✅ **Frontend sidebar shows updated score immediately**
✅ Refreshing page preserves new score (not reverting to old value)

---

## Files Changed

1. **`lib/db.ts`** (lines 172-191) - Added support for `word_count`, `aiso_score`, `aeo_score`, `geo_score`, `fact_checks`

---

## Next Steps

Now that database updates are fixed, we can test if:
1. **Readability improvements work** with emergency mode prompts
2. **Frontend score display** updates correctly
3. **All fixes work together** for complete rewrite flow

---

**Date:** 2025-11-05
**Status:** ✅ Fix Applied - Ready for Testing
**Server:** Port 3006 (hot reload should pick up changes)
