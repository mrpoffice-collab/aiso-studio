-- Migration: Add Tier-Based Limits
-- Description: Add active clients, vault storage, and data retention limits per tier
-- Date: 2025-12-09

-- Add new tier limit columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS active_clients_limit INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN IF NOT EXISTS active_clients_used INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS vault_storage_limit_mb INTEGER DEFAULT 5120;  -- 5GB in MB
ALTER TABLE users ADD COLUMN IF NOT EXISTS vault_storage_used_mb INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS data_retention_days INTEGER DEFAULT 90;  -- 90 days for starter/pro, NULL for unlimited

-- Set defaults based on current tier
UPDATE users SET
  active_clients_limit = CASE
    WHEN subscription_tier = 'starter' THEN 1
    WHEN subscription_tier = 'professional' THEN 5
    WHEN subscription_tier = 'agency' THEN 9999  -- Effectively unlimited
    ELSE 1
  END,
  vault_storage_limit_mb = CASE
    WHEN subscription_tier = 'starter' THEN 5120      -- 5GB
    WHEN subscription_tier = 'professional' THEN 20480  -- 20GB
    WHEN subscription_tier = 'agency' THEN 1048576    -- 1TB
    ELSE 5120
  END,
  data_retention_days = CASE
    WHEN subscription_tier = 'agency' THEN NULL       -- Unlimited
    ELSE 90
  END;

-- Tier Limits Summary:
-- =====================
-- Starter ($39):
--   - 1 active client
--   - 5GB vault storage
--   - 90-day data retention
--   - No lead gen/pipeline
--
-- Professional ($249):
--   - 5 active clients
--   - 20GB vault storage
--   - 90-day data retention
--   - Lead gen/pipeline enabled
--
-- Agency ($599):
--   - Unlimited active clients
--   - 1TB vault storage
--   - Unlimited data retention
--   - Lead gen/pipeline enabled
