-- Fix usage_logs check constraint to allow 'content_improvement'

ALTER TABLE usage_logs DROP CONSTRAINT IF EXISTS usage_logs_operation_type_check;

ALTER TABLE usage_logs ADD CONSTRAINT usage_logs_operation_type_check
CHECK (operation_type IN (
  'strategy_generation',
  'content_generation',
  'fact_checking',
  'image_search',
  'mou_generation',
  'content_audit',
  'content_rewrite',
  'content_improvement'
));
