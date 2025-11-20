# Strategic Linking System - Implementation Progress

**Date**: 2025-01-06
**Session**: Building Money Pages + Clusters

## ✅ Completed (Backend Complete!)

### 1. Database Layer
- ✅ Migration run successfully
- ✅ `money_pages` table created
- ✅ `topic_clusters` table created
- ✅ `topics` table updated with 5 linking columns

### 2. Database Functions (`lib/db.ts`)
**Money Pages:**
- ✅ `getMoneyPagesByStrategyId()` - List all
- ✅ `getMoneyPageById()` - Get single
- ✅ `createMoneyPage()` - Create new
- ✅ `updateMoneyPage()` - Update existing
- ✅ `deleteMoneyPage()` - Delete

**Topic Clusters:**
- ✅ `getTopicClustersByStrategyId()` - List with money page details + topic count
- ✅ `getTopicClusterById()` - Get single with money page info
- ✅ `createTopicCluster()` - Create new
- ✅ `updateTopicCluster()` - Update existing
- ✅ `deleteTopicCluster()` - Delete

### 3. API Routes
**Money Pages:**
- ✅ `GET /api/strategies/[id]/money-pages` - List all
- ✅ `POST /api/strategies/[id]/money-pages` - Create
- ✅ `PATCH /api/money-pages/[id]` - Update
- ✅ `DELETE /api/money-pages/[id]` - Delete

**Topic Clusters:**
- ✅ `GET /api/strategies/[id]/clusters` - List all
- ✅ `POST /api/strategies/[id]/clusters` - Create
- ✅ `PATCH /api/clusters/[id]` - Update
- ✅ `DELETE /api/clusters/[id]` - Delete

## 🚧 In Progress (Frontend)

### 4. Money Pages UI
Need to create strategy view tabs and management interface

**Files to Create:**
- Tab integration in `/app/dashboard/strategies/[id]/page.tsx`
- Money Pages section (can be in same file or separate component)

**UI Components Needed:**
```
Money Pages Section:
├─ Empty state (when no pages)
├─ Add Money Page button
├─ Money Pages list/table
│  ├─ URL column
│  ├─ Title column
│  ├─ Type badge
│  ├─ Priority badge (HIGH/MEDIUM/LOW)
│  └─ Actions (Edit/Delete)
├─ Add/Edit Modal
│  ├─ URL input
│  ├─ Title input
│  ├─ Type dropdown
│  ├─ Priority selector
│  ├─ Description textarea
│  └─ Keywords input (comma-separated)
└─ Delete confirmation dialog
```

### 5. Topic Clusters UI
Similar structure to Money Pages

**UI Components Needed:**
```
Clusters Section:
├─ Empty state
├─ Create Cluster button
├─ Clusters grid/list
│  ├─ Cluster name
│  ├─ Target money page
│  ├─ Funnel stage badge
│  ├─ Topic count
│  └─ Actions (Edit/Delete)
├─ Create/Edit Modal
│  ├─ Name input
│  ├─ Description textarea
│  ├─ Primary Money Page dropdown
│  ├─ Funnel Stage selector
│  └─ Secondary pages (multi-select)
└─ Delete confirmation
```

## 📋 Next Steps

### Immediate (Continue Building)
1. **Add Money Pages tab to strategy view**
   - Modify `/app/dashboard/strategies/[id]/page.tsx`
   - Add new tab for "Money Pages"
   - Fetch money pages on load
   - Display list with add/edit/delete

2. **Add Clusters tab to strategy view**
   - Add new tab for "Clusters"
   - Fetch clusters on load
   - Display grid/list with create/edit/delete

### After UI Complete
3. **Update topic generation**
   - Modify `/app/api/strategies/[id]/generate-topics/route.ts`
   - Accept optional `cluster_id` parameter
   - When cluster provided, set linking fields on topics

4. **Add link validation**
   - Modify `/app/api/topics/[id]/generate/route.ts`
   - After generation, check if required link exists
   - Auto-inject if missing

5. **Test end-to-end workflow**
   - Create money page for /soundart
   - Create cluster targeting /soundart
   - Generate topics for that cluster
   - Generate content and verify links appear

## Quick Reference

### Example Money Page Data:
```json
{
  "url": "https://fireflygrove.app/soundart",
  "title": "SoundArt Audio Memorial Art",
  "page_type": "product",
  "priority": 1,
  "description": "Turn voice recordings into beautiful visual art",
  "target_keywords": ["soundart", "audio memorial", "voice recording art"]
}
```

### Example Cluster Data:
```json
{
  "name": "SoundArt Product Campaign",
  "description": "Build awareness and drive traffic to SoundArt product",
  "primary_money_page_id": "uuid-of-soundart-page",
  "funnel_stage": "awareness"
}
```

### Testing API Endpoints

You can test the API now with curl or Postman:

```bash
# List money pages
GET http://localhost:3000/api/strategies/{strategyId}/money-pages

# Create money page
POST http://localhost:3000/api/strategies/{strategyId}/money-pages
Body: { url, title, page_type, priority, description, target_keywords }

# Update money page
PATCH http://localhost:3000/api/money-pages/{pageId}
Body: { url, title, etc }

# Delete money page
DELETE http://localhost:3000/api/money-pages/{pageId}
```

---

**Ready to build the UI when you continue!**
