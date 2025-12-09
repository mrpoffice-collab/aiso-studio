-- Add locked_domain field for Starter tier domain restriction
-- Starter users ($39) are limited to auditing one domain

ALTER TABLE users
ADD COLUMN IF NOT EXISTS locked_domain VARCHAR(255);

-- Add comment explaining the field
COMMENT ON COLUMN users.locked_domain IS 'For Starter tier: the single domain this user is allowed to audit. Set on first audit.';
