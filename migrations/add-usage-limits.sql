-- Add usage limit columns for trial/subscription enforcement

-- Add new usage tracking fields
ALTER TABLE users
ADD COLUMN IF NOT EXISTS audits_limit INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS audits_used_this_month INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS rewrites_limit INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS rewrites_used_this_month INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS repurposes_limit INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS repurposes_used_this_month INTEGER DEFAULT 0;

-- Update existing trial users with correct limits
UPDATE users
SET
  strategies_limit = 1,
  audits_limit = 5,
  rewrites_limit = 5,
  article_limit = 10,
  repurposes_limit = 1
WHERE subscription_tier = 'trial';

-- Tier limits reference:
-- trial: 1 strategy, 5 audits, 5 rewrites, 10 articles, 1 repurpose
-- starter ($39): 3 strategies, 25 audits, 25 rewrites, 25 articles, 10 repurposes
-- professional ($249): 10 strategies, unlimited audits/rewrites, 75 articles, unlimited repurposes
-- agency ($599): unlimited strategies, unlimited audits/rewrites, 250 articles, unlimited repurposes
-- enterprise: unlimited everything
