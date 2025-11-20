# Money Pages + Clusters - Implementation Progress

**Date**: 2025-01-06
**Status**: Database migration complete, ready to build UI

## ✅ Completed

1. **Database Migration** - All tables and columns created:
   - `money_pages` table (stores high-value pages like /soundart, /products)
   - `topic_clusters` table (groups topics into campaigns)
   - `topics` table updated with linking fields

2. **Design Documents Created**:
   - `STRATEGIC-LINKING-SYSTEM.md` - Full system design
   - `AGENCY-EXCELLENCE-ROADMAP.md` - Agency-focused features
   - `IMAGE-WORKFLOW.md` - Image placeholder system

3. **Supporting Features**:
   - Image placeholders implemented (deferred to WordPress export)
   - Repurpose to Social updated to use Sonnet 4
   - AISO scoring system working

## 🚧 Next Steps (In Order)

### Step 2: Build Money Pages UI

**Location**: `app/dashboard/strategies/[id]/money-pages/` (new tab in strategy view)

**What to Build**:
```
Money Pages Tab in Strategy View:
├─ List view (table of all money pages)
├─ Add Money Page form
├─ Edit Money Page modal
├─ Delete confirmation
└─ Priority badge (HIGH/MEDIUM/LOW)
```

**Database Functions Needed** (`lib/db.ts`):
```typescript
async getMoneyPagesByStrategyId(strategyId: string)
async createMoneyPage(data: MoneyPageInput)
async updateMoneyPage(id: string, data: Partial<MoneyPageInput>)
async deleteMoneyPage(id: string)
```

**API Endpoints Needed**:
- `GET /api/strategies/[id]/money-pages` - List all
- `POST /api/strategies/[id]/money-pages` - Create
- `PATCH /api/money-pages/[id]` - Update
- `DELETE /api/money-pages/[id]` - Delete

### Step 3: Build Topic Clusters UI

**Location**: `app/dashboard/strategies/[id]/clusters/` (new tab in strategy view)

**What to Build**:
```
Topic Clusters Tab:
├─ List view (cards showing each cluster)
├─ Create Cluster form
│  ├─ Select primary money page
│  ├─ Select funnel stage
│  └─ Add description
├─ Edit Cluster modal
└─ Delete confirmation
```

**Database Functions Needed**:
```typescript
async getTopicClustersByStrategyId(strategyId: string)
async createTopicCluster(data: TopicClusterInput)
async updateTopicCluster(id: string, data: Partial<TopicClusterInput>)
async deleteTopicCluster(id: string)
```

**API Endpoints Needed**:
- `GET /api/strategies/[id]/clusters` - List all
- `POST /api/strategies/[id]/clusters` - Create
- `PATCH /api/clusters/[id]` - Update
- `DELETE /api/clusters/[id]` - Delete

### Step 4: Update Topic Generation

**File to Modify**: `app/api/strategies/[id]/generate-topics/route.ts`

**Changes Needed**:
1. Accept optional `cluster_id` parameter
2. When cluster provided:
   - Get cluster data (includes primary_money_page_id)
   - Get money page details (URL, title, keywords)
   - Pass to topic generation prompt
3. Set `primary_link_url`, `primary_link_anchor`, `cta_type` on generated topics

**Updated Prompt** (excerpt):
```
Generate topics for this campaign cluster:
- Cluster: "SoundArt Product Campaign"
- Target Page: https://fireflygrove.app/soundart
- Funnel Stage: Awareness
- Goal: Drive traffic to product page

MANDATORY: Every topic must naturally support linking to the target page.
Suggest appropriate anchor text and CTA for each topic.
```

### Step 5: Add Link Validation

**File to Modify**: `app/api/topics/[id]/generate/route.ts`

**Changes to Make**:
1. After content generation, check if `topic.primary_link_url` exists
2. If yes, validate the link appears in the content
3. If missing, auto-inject using smart paragraph matching
4. Log what happened for transparency

**Pseudo-code**:
```typescript
if (topic.primary_link_url) {
  const hasRequiredLink = generatedContent.content.includes(topic.primary_link_url);

  if (!hasRequiredLink) {
    console.log(`⚠️ Required link to ${topic.primary_link_url} was missing`);
    generatedContent.content = await injectMandatoryLink(
      generatedContent.content,
      topic.primary_link_url,
      topic.primary_link_anchor || 'learn more',
      topic.link_placement_hint
    );
    console.log(`✅ Link auto-injected into content`);
  }
}
```

### Step 6: UI Updates to Strategy View

**Add Two New Tabs**:

In `app/dashboard/strategies/[id]/page.tsx`:

```typescript
const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'topics', label: 'Topics' },
  { id: 'money-pages', label: 'Money Pages', count: moneyPages.length }, // NEW
  { id: 'clusters', label: 'Clusters', count: clusters.length }, // NEW
];
```

## Example Workflow (After Implementation)

```
User Story: Promote SoundArt Product

1. User goes to Strategy → Money Pages tab
2. Clicks "Add Money Page"
3. Fills in:
   - URL: https://fireflygrove.app/soundart
   - Title: SoundArt Audio Memorial Art
   - Type: Product
   - Priority: HIGH
   - Keywords: audio memorial, soundart, voice recording art
4. Clicks Save

5. User goes to Clusters tab
6. Clicks "Create Cluster"
7. Fills in:
   - Name: SoundArt Product Campaign
   - Primary Target: /soundart (dropdown)
   - Funnel Stage: Awareness
   - Description: Build awareness and drive traffic to SoundArt product
8. Clicks Create

9. User goes to Topics tab
10. Clicks "Generate Topics"
11. Selects "SoundArt Product Campaign" cluster
12. Enters: 20 topics
13. System generates 20 topics that will ALL link to /soundart

14. User clicks "Generate All Content"
15. System generates 20 blog posts in ~40 minutes
16. Every post:
    - Has AISO score 70-85+
    - Links to /soundart
    - Is fact-checked
    - Is ready to publish

Result: Complete 3-month content campaign targeting one product page
```

## Quick Start for Next Session

When ready to continue:

```bash
# 1. Add database functions to lib/db.ts
# 2. Create API routes for money pages
# 3. Build Money Pages UI component
# 4. Create API routes for clusters
# 5. Build Clusters UI component
# 6. Update topic generation
# 7. Add link validation
# 8. Test end-to-end
```

## Files to Create/Modify

**New Files**:
- `app/dashboard/strategies/[id]/money-pages/page.tsx`
- `app/dashboard/strategies/[id]/clusters/page.tsx`
- `app/api/strategies/[id]/money-pages/route.ts`
- `app/api/money-pages/[id]/route.ts`
- `app/api/strategies/[id]/clusters/route.ts`
- `app/api/clusters/[id]/route.ts`
- `components/MoneyPageCard.tsx`
- `components/ClusterCard.tsx`

**Files to Modify**:
- `lib/db.ts` - Add money pages & clusters functions
- `app/api/strategies/[id]/generate-topics/route.ts` - Accept cluster_id
- `app/api/topics/[id]/generate/route.ts` - Add link validation
- `app/dashboard/strategies/[id]/page.tsx` - Add tabs

## Testing Checklist

- [ ] Can create money page
- [ ] Can edit money page
- [ ] Can delete money page
- [ ] Can create cluster linked to money page
- [ ] Can generate topics for cluster
- [ ] Topics have correct primary_link_url
- [ ] Generated content includes mandatory link
- [ ] Auto-injection works if link missing
- [ ] Full workflow: money page → cluster → topics → content
- [ ] Links drive traffic (would need analytics)

---

**Ready to build when you are!**
