-- Migration: Add unified content scores to accessibility_audits table
-- This allows the AISO Audit Engine to store both accessibility AND content scores
-- in a single audit record
-- Created: 2025-11-26

-- Add AISO content score columns
ALTER TABLE accessibility_audits ADD COLUMN IF NOT EXISTS aiso_score INTEGER DEFAULT 0;
ALTER TABLE accessibility_audits ADD COLUMN IF NOT EXISTS aeo_score INTEGER DEFAULT 0;
ALTER TABLE accessibility_audits ADD COLUMN IF NOT EXISTS seo_score INTEGER DEFAULT 0;
ALTER TABLE accessibility_audits ADD COLUMN IF NOT EXISTS readability_score INTEGER DEFAULT 0;
ALTER TABLE accessibility_audits ADD COLUMN IF NOT EXISTS engagement_score INTEGER DEFAULT 0;
ALTER TABLE accessibility_audits ADD COLUMN IF NOT EXISTS fact_check_score INTEGER DEFAULT 0;

-- Add detailed breakdown columns as JSONB
ALTER TABLE accessibility_audits ADD COLUMN IF NOT EXISTS seo_details JSONB DEFAULT '{}';
ALTER TABLE accessibility_audits ADD COLUMN IF NOT EXISTS readability_details JSONB DEFAULT '{}';
ALTER TABLE accessibility_audits ADD COLUMN IF NOT EXISTS engagement_details JSONB DEFAULT '{}';
ALTER TABLE accessibility_audits ADD COLUMN IF NOT EXISTS aeo_details JSONB DEFAULT '{}';
ALTER TABLE accessibility_audits ADD COLUMN IF NOT EXISTS fact_checks JSONB DEFAULT '[]';

-- Add vault asset reference
ALTER TABLE accessibility_audits ADD COLUMN IF NOT EXISTS vault_asset_id UUID REFERENCES assets(id);
ALTER TABLE accessibility_audits ADD COLUMN IF NOT EXISTS pdf_url TEXT;

-- Add domain index for faster lookups
CREATE INDEX IF NOT EXISTS idx_accessibility_audits_domain ON accessibility_audits(
  (regexp_replace(url, '^https?://(www\.)?', ''))
);

-- Comments
COMMENT ON COLUMN accessibility_audits.aiso_score IS 'Overall AISO score (AEO + SEO + Readability + Engagement + Fact-check)';
COMMENT ON COLUMN accessibility_audits.aeo_score IS 'Answer Engine Optimization score';
COMMENT ON COLUMN accessibility_audits.vault_asset_id IS 'Reference to PDF asset in vault';
