# Database Migration Instructions

## Run this migration on your Neon database

### Option 1: Neon SQL Editor (Recommended)

1. Go to https://console.neon.tech/
2. Select your project
3. Click on "SQL Editor" in the left sidebar
4. Copy and paste this SQL:

```sql
-- Migration: Add 'mou_generation' to usage_logs operation_type constraint

-- Drop the existing constraint
ALTER TABLE usage_logs DROP CONSTRAINT IF EXISTS usage_logs_operation_type_check;

-- Add the new constraint with 'mou_generation' included
ALTER TABLE usage_logs ADD CONSTRAINT usage_logs_operation_type_check
  CHECK (operation_type IN ('strategy_generation', 'content_generation', 'fact_checking', 'image_search', 'mou_generation'));
```

5. Click "Run" to execute
6. You should see: `ALTER TABLE` (success message)

### Option 2: Using Neon API

If you have the Neon CLI installed:

```bash
neonctl sql --project-id your-project-id < migrations/001_add_mou_generation.sql
```

### Verify Migration

After running the migration, verify it worked:

```sql
-- Check the constraint
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'usage_logs'::regclass
  AND conname = 'usage_logs_operation_type_check';
```

You should see the constraint includes all five operation types:
- strategy_generation
- content_generation
- fact_checking
- image_search
- **mou_generation** ← NEW

---

## What This Does

This migration allows your app to log usage when generating MOUs (Memorandum of Understanding) for clients.

Before this migration, the database constraint only allowed 4 operation types. Now it allows 5, including `mou_generation`.

This enables the usage logging code in:
`app/api/strategies/[id]/mou/route.ts` (line 93-105)

---

## Status

- [ ] Migration completed
- [ ] Verified constraint includes 'mou_generation'
- [ ] Tested MOU generation with usage logging

Mark items as you complete them!
