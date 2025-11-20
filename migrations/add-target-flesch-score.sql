-- Add target_flesch_score to strategies table for intent-based readability scoring
-- This allows content to be scored based on how well it matches the INTENDED audience reading level

ALTER TABLE strategies
  ADD COLUMN IF NOT EXISTS target_flesch_score INTEGER;

-- Add comment explaining the field
COMMENT ON COLUMN strategies.target_flesch_score IS
  'Target Flesch Reading Ease score based on audience and keywords.
   Content is scored on how close it comes to this target, not absolute simplicity.
   Examples: 70 = general public, 55 = professionals, 35 = technical experts';
