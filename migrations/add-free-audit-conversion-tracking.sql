-- Migration: Add conversion tracking to free_audit_usage
-- Purpose: Track which free audit users convert to paid customers and analyze domain ownership

-- Add conversion tracking columns
ALTER TABLE free_audit_usage
ADD COLUMN IF NOT EXISTS converted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS converted_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS converted_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS is_domain_owner BOOLEAN,
ADD COLUMN IF NOT EXISTS user_agent TEXT,
ADD COLUMN IF NOT EXISTS referrer TEXT;

-- Add index for faster conversion analysis queries
CREATE INDEX IF NOT EXISTS idx_free_audit_converted ON free_audit_usage(converted);
CREATE INDEX IF NOT EXISTS idx_free_audit_converted_user_id ON free_audit_usage(converted_user_id);
CREATE INDEX IF NOT EXISTS idx_free_audit_ip_created ON free_audit_usage(ip_address, created_at);
CREATE INDEX IF NOT EXISTS idx_free_audit_domain ON free_audit_usage(domain);

-- Add comment explaining the schema
COMMENT ON COLUMN free_audit_usage.converted IS 'Whether the IP that ran this audit eventually signed up';
COMMENT ON COLUMN free_audit_usage.converted_user_id IS 'User ID if they signed up (links to users table)';
COMMENT ON COLUMN free_audit_usage.converted_at IS 'When they converted (signed up)';
COMMENT ON COLUMN free_audit_usage.is_domain_owner IS 'TRUE if user email domain matches audited domain (owns it), FALSE if agency/consultant';
COMMENT ON COLUMN free_audit_usage.user_agent IS 'Browser user agent for device tracking';
COMMENT ON COLUMN free_audit_usage.referrer IS 'HTTP referrer to track traffic source';
