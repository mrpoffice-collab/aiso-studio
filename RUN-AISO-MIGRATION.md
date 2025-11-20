# Run AISO Migration

## Quick Start - Run This Migration Now

### Option 1: Neon SQL Editor (Recommended)

1. Go to https://console.neon.tech/
2. Select your project
3. Click **"SQL Editor"** in left sidebar
4. Copy and paste the contents of `migrations/002_add_aiso_fields.sql`
5. Click **"Run"**
6. You should see: `ALTER TABLE` messages for each change

### Option 2: Command Line (if you have psql)

```bash
psql $DATABASE_URL -f migrations/002_add_aiso_fields.sql
```

### Option 3: Node.js Script

```bash
node run-aiso-migration.js
```

---

## What This Migration Does

### Posts Table Updates
Adds AISO scoring columns:
- `aeo_score` (INTEGER) - Answer Engine Optimization score (0-100)
- `geo_score` (INTEGER) - Local Intent Optimization score (0-100)
- `aiso_score` (INTEGER) - Complete AISO score including fact-checking (0-100)

### Strategies Table Updates
Adds local business context:
- `content_type` (VARCHAR) - 'national', 'local', or 'hybrid'
- `city` (VARCHAR) - Primary city for local content
- `state` (VARCHAR) - Primary state for local content
- `service_area` (TEXT) - Service area description for GEO

### Topics Table Updates
Adds AEO focus type:
- `aeo_focus` (VARCHAR) - 'definition', 'how-to', 'comparison', 'guide', 'faq', 'list', 'tutorial'

### Indexes Created
- `idx_strategies_content_type` - Fast filtering by content type
- `idx_strategies_city_state` - Fast local content queries

---

## Verify Migration Success

After running the migration, verify with these queries:

```sql
-- Check posts table columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'posts'
AND column_name IN ('aeo_score', 'geo_score', 'aiso_score');

-- Check strategies table columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'strategies'
AND column_name IN ('content_type', 'city', 'state', 'service_area');

-- Check topics table columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'topics'
AND column_name = 'aeo_focus';

-- Check constraints
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid IN ('strategies'::regclass, 'topics'::regclass);
```

Expected results:
- 3 new columns in posts
- 4 new columns in strategies
- 1 new column in topics
- 2 new check constraints
- 2 new indexes

---

## Rollback (If Needed)

If you need to undo this migration:

```sql
-- Remove columns from posts
ALTER TABLE posts DROP COLUMN IF EXISTS aeo_score;
ALTER TABLE posts DROP COLUMN IF EXISTS geo_score;
ALTER TABLE posts DROP COLUMN IF EXISTS aiso_score;

-- Remove columns from strategies
ALTER TABLE strategies DROP COLUMN IF EXISTS content_type;
ALTER TABLE strategies DROP COLUMN IF EXISTS city;
ALTER TABLE strategies DROP COLUMN IF EXISTS state;
ALTER TABLE strategies DROP COLUMN IF EXISTS service_area;

-- Remove column from topics
ALTER TABLE topics DROP COLUMN IF EXISTS aeo_focus;

-- Drop indexes
DROP INDEX IF EXISTS idx_strategies_content_type;
DROP INDEX IF EXISTS idx_strategies_city_state;

-- Drop constraints
ALTER TABLE strategies DROP CONSTRAINT IF EXISTS strategies_content_type_check;
ALTER TABLE topics DROP CONSTRAINT IF EXISTS topics_aeo_focus_check;
```

---

## Status Checklist

- [ ] Migration file reviewed
- [ ] Backed up database (optional but recommended)
- [ ] Ran migration in Neon SQL Editor
- [ ] Verified new columns exist
- [ ] Verified constraints exist
- [ ] Verified indexes created
- [ ] Tested creating a strategy with local fields
- [ ] Tested generating content with AISO scoring

---

## Next Steps After Migration

1. ✅ Migration complete
2. Update API routes to use new fields
3. Update TypeScript types
4. Create UI components for AISO scores
5. Add local fields to strategy builder form
6. Test end-to-end AISO workflow

---

**Important**: This migration is safe to run multiple times (uses `IF NOT EXISTS` and `IF EXISTS` clauses).

**Estimated time**: 30 seconds to run, 2 minutes to verify
