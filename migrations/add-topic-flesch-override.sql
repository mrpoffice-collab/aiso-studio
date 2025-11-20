-- Add target_flesch_score override to topics table
-- This allows individual topics to override the strategy's reading level

ALTER TABLE topics
ADD COLUMN target_flesch_score integer;

COMMENT ON COLUMN topics.target_flesch_score IS 'Optional override for this topic. If NULL, uses strategy target_flesch_score';
