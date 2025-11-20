-- Add subscription and usage tracking to users table

-- Add subscription fields
ALTER TABLE users
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'trial',
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trialing',
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS billing_cycle_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS billing_cycle_end TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '1 month');

-- Add usage tracking fields
ALTER TABLE users
ADD COLUMN IF NOT EXISTS article_limit INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS articles_used_this_month INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS strategies_limit INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS strategies_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS seats_limit INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS seats_used INTEGER DEFAULT 1;

-- Add manual override for backdoor access
ALTER TABLE users
ADD COLUMN IF NOT EXISTS manual_override BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS override_reason TEXT,
ADD COLUMN IF NOT EXISTS override_by TEXT;

-- Set trial_ends_at for existing users (7 days from now)
UPDATE users
SET trial_ends_at = CURRENT_TIMESTAMP + INTERVAL '7 days'
WHERE trial_ends_at IS NULL AND subscription_status = 'trialing';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_users_trial_ends_at ON users(trial_ends_at);

-- Create subscription tiers reference (for validation)
COMMENT ON COLUMN users.subscription_tier IS 'Valid values: trial, starter, professional, agency, enterprise';
COMMENT ON COLUMN users.subscription_status IS 'Valid values: trialing, active, canceled, expired, suspended';

-- Tier limits (documented here, enforced in app):
-- trial: 10 articles, 1 strategy, 7 days
-- starter ($39): 25 articles, 3 strategies, 1 seat
-- professional ($99): 75 articles, 10 strategies, 1 seat
-- agency ($299): 250 articles, unlimited strategies, 3 seats (+$49 per extra seat)
-- enterprise ($799): 1000 articles, unlimited strategies, 10 seats
