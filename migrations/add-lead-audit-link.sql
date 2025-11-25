-- Migration: Add accessibility_audit_id to leads table
-- Description: Links leads to their canonical accessibility audit in accessibility_audits table
-- Created: 2025-11-25

-- Add column to link lead to its canonical accessibility audit
ALTER TABLE leads ADD COLUMN IF NOT EXISTS accessibility_audit_id INTEGER;

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_leads_accessibility_audit_id ON leads(accessibility_audit_id);

-- Comment
COMMENT ON COLUMN leads.accessibility_audit_id IS 'Foreign key to accessibility_audits table - canonical source of audit data';
