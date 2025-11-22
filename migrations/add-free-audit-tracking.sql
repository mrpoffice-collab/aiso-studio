-- Migration: Add Free Audit Usage Tracking
-- Description: Track free audit usage by IP address and domain to prevent abuse
-- Date: 2025-01-22

-- Create free_audit_usage table
CREATE TABLE IF NOT EXISTS free_audit_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address VARCHAR(45) NOT NULL,
  domain VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  audit_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_free_audit_ip ON free_audit_usage(ip_address);
CREATE INDEX IF NOT EXISTS idx_free_audit_domain ON free_audit_usage(domain);
CREATE INDEX IF NOT EXISTS idx_free_audit_created ON free_audit_usage(created_at);

-- Add comments for documentation
COMMENT ON TABLE free_audit_usage IS 'Tracks free audit usage to prevent abuse via IP and domain limits';
COMMENT ON COLUMN free_audit_usage.ip_address IS 'IP address of user requesting audit';
COMMENT ON COLUMN free_audit_usage.domain IS 'Domain being audited (e.g., example.com)';
COMMENT ON COLUMN free_audit_usage.url IS 'Full URL that was audited';
COMMENT ON COLUMN free_audit_usage.audit_data IS 'Cached audit results (optional)';
