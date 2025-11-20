-- Migration: Add 'mou_generation' to usage_logs operation_type constraint
-- Run this on your existing Neon database to update the schema

-- Drop the existing constraint
ALTER TABLE usage_logs DROP CONSTRAINT IF EXISTS usage_logs_operation_type_check;

-- Add the new constraint with 'mou_generation' included
ALTER TABLE usage_logs ADD CONSTRAINT usage_logs_operation_type_check
  CHECK (operation_type IN ('strategy_generation', 'content_generation', 'fact_checking', 'image_search', 'mou_generation'));

-- Verify the constraint was added
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'usage_logs'::regclass AND conname = 'usage_logs_operation_type_check';
