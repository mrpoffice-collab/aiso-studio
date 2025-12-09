-- Add audit usage tracking to users table

ALTER TABLE users
ADD COLUMN IF NOT EXISTS audit_limit INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS audits_used_this_month INTEGER DEFAULT 0;

-- Update existing trial users with audit limits
UPDATE users
SET audit_limit = 10, audits_used_this_month = 0
WHERE subscription_tier = 'trial' AND audit_limit IS NULL;

-- Update paid tiers with higher limits
UPDATE users
SET audit_limit = 50
WHERE subscription_tier = 'starter' AND audit_limit = 10;

UPDATE users
SET audit_limit = 200
WHERE subscription_tier = 'professional' AND audit_limit = 10;

UPDATE users
SET audit_limit = 1000
WHERE subscription_tier IN ('agency', 'enterprise') AND audit_limit = 10;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_audit_usage ON users(audits_used_this_month);

-- Tier audit limits (documented here, enforced in app):
-- trial: 10 audits
-- starter ($39): 50 audits
-- professional ($99): 200 audits
-- agency ($299): 1000 audits
-- enterprise ($799): unlimited
