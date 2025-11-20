-- Add readability details to posts table
-- This stores the actual Flesch score, target, and gap for intent-based scoring

ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS actual_flesch_score INTEGER,
  ADD COLUMN IF NOT EXISTS target_flesch_score INTEGER,
  ADD COLUMN IF NOT EXISTS readability_gap INTEGER,
  ADD COLUMN IF NOT EXISTS readability_score INTEGER;

-- Comments for clarity
COMMENT ON COLUMN posts.actual_flesch_score IS 'Actual Flesch Reading Ease score of the content (0-100+)';
COMMENT ON COLUMN posts.target_flesch_score IS 'Target Flesch score from strategy (e.g., 58 for 10th grade)';
COMMENT ON COLUMN posts.readability_gap IS 'Absolute difference between actual and target Flesch scores';
COMMENT ON COLUMN posts.readability_score IS 'Intent-based readability score (0-100) based on gap from target';
