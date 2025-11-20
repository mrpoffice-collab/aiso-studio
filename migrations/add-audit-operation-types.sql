-- Migration: Add content_audit and content_rewrite operation types to usage_logs
-- Date: 2025-01-03

-- Drop the existing check constraint
ALTER TABLE usage_logs DROP CONSTRAINT IF EXISTS usage_logs_operation_type_check;

-- Add the new check constraint with additional operation types
ALTER TABLE usage_logs ADD CONSTRAINT usage_logs_operation_type_check
CHECK (operation_type IN (
  'strategy_generation',
  'content_generation',
  'fact_checking',
  'image_search',
  'mou_generation',
  'content_audit',
  'content_rewrite'
));
