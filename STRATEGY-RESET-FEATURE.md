# Strategy Reset Feature

## Overview

Added a strategy reset feature that allows agencies to clear all topics and posts for a client strategy while preserving the strategy settings. This is useful when an agency wants to tweak a strategy and start fresh with new content.

## What Gets Deleted

When you reset a strategy, the following are **permanently deleted**:
- ✅ All blog topics (from `topics` table)
- ✅ All generated blog posts (from `posts` table)
- ✅ All fact-check data (from `fact_checks` table)

## What Gets Preserved

The following strategy information is **kept intact**:
- ✅ Client name and industry
- ✅ Target audience
- ✅ Brand voice
- ✅ Content goals
- ✅ Publishing frequency
- ✅ Target keywords

## Cost Tracking

The reset operation:
- **Does NOT cost money** (no API calls made)
- **Tracks usage** in the `usage_logs` table with metadata:
  - Number of topics deleted
  - Number of posts deleted
  - Number of fact checks deleted
  - Estimated previous cost (calculated as ~$0.05 per post)

This helps agencies understand the value of content that was cleared.

## How to Use

### For Agencies:

1. Navigate to a strategy detail page
2. Click the **"Reset Strategy"** button (red button in the top right)
3. Review the confirmation modal showing:
   - What will be deleted (topics, posts, fact checks)
   - What will be kept (strategy settings)
4. Click **"Yes, Reset Strategy"** to confirm
5. View the success message with deletion statistics
6. The page automatically refreshes to show the clean slate

### Example Flow:

```
Agency has a strategy for "Acme Corp" with:
- 15 generated topics
- 8 written blog posts
- 45 fact checks

Agency wants to change approach and start over.

Click "Reset Strategy" → Confirm → Result:
- Topics: 0
- Posts: 0
- Strategy settings: Preserved
- Can now generate fresh topics with new approach
```

## UI Location

The **Reset Strategy** button appears on:
- **Page**: `/dashboard/strategies/[id]`
- **Location**: Top right, next to "Edit Strategy" and "Generate MOU" buttons
- **Style**: Red border, warning color scheme to indicate destructive action

## API Endpoint

**POST** `/api/strategies/[id]/reset`

### Authentication:
- Requires authenticated user via Clerk
- Verifies strategy ownership before allowing reset

### Response:
```json
{
  "success": true,
  "message": "Strategy reset successfully. Deleted 15 topics and 8 posts.",
  "stats": {
    "deletedTopics": 15,
    "deletedPosts": 8,
    "deletedFactChecks": 45,
    "estimatedPreviousCost": "0.40"
  }
}
```

## Database Implementation

### New Method in `lib/db.ts`:

```typescript
async resetStrategy(strategyId: string): Promise<{
  deletedTopics: number;
  deletedPosts: number;
  deletedFactChecks: number;
}>
```

### How It Works:

1. **Count records** before deletion (for reporting)
2. **Delete topics** with: `DELETE FROM topics WHERE strategy_id = $1`
3. **CASCADE deletes** automatically remove:
   - Posts (via `ON DELETE CASCADE` on `topic_id`)
   - Fact checks (via `ON DELETE CASCADE` on `post_id`)
4. **Return statistics** for UI display and logging

## Security

- ✅ Authentication required (Clerk)
- ✅ Ownership verification (user must own the strategy)
- ✅ Confirmation modal prevents accidental deletion
- ✅ Audit trail in `usage_logs` table
- ✅ No SQL injection (parameterized queries)

## Files Modified/Created

### Created:
- `app/api/strategies/[id]/reset/route.ts` - API endpoint
- `app/dashboard/strategies/[id]/ResetStrategyButton.tsx` - UI component

### Modified:
- `lib/db.ts` - Added `resetStrategy()` and `getUsageByUserId()` methods
- `app/dashboard/strategies/[id]/page.tsx` - Added reset button to UI

## Testing Recommendations

1. **Create a test strategy** with topics and posts
2. **Click Reset Strategy** and confirm
3. **Verify**:
   - All topics deleted
   - All posts deleted
   - Strategy settings remain intact
   - Success message displays correct counts
   - Usage log created with proper metadata
4. **Check database** to confirm cascade deletion worked
5. **Verify authorization** by trying to reset another user's strategy (should fail)

## Cost Considerations

While the reset operation itself is free, agencies should be aware:
- **Estimated cost per post**: ~$0.05 (conservative)
- **Resetting loses this generated value**
- **The app tracks** this in the usage log for reporting
- **Example**: Resetting 20 posts = ~$1.00 of content value lost

This helps agencies make informed decisions about when to reset vs. edit existing content.

## Future Enhancements

Potential improvements:
- [ ] Add a "soft delete" option to archive instead of delete
- [ ] Export content before reset
- [ ] Partial reset (e.g., delete only posts, keep topics)
- [ ] Undo functionality with a grace period
- [ ] Email notification when reset completes
