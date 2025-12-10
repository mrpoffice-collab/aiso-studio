-- Migration: Fix audit history - allow multiple audits per strategy
-- Problem: UNIQUE(strategy_id, url) prevents keeping historical audit data
-- Solution: Change to UNIQUE(audit_id, url) so each audit has its own page records

-- Drop the old constraint
ALTER TABLE site_pages DROP CONSTRAINT IF EXISTS site_pages_strategy_id_url_key;

-- Add new constraint - unique per audit, not per strategy
ALTER TABLE site_pages ADD CONSTRAINT site_pages_audit_id_url_key UNIQUE (audit_id, url);

-- Same for images
ALTER TABLE site_images DROP CONSTRAINT IF EXISTS site_images_strategy_id_url_key;
ALTER TABLE site_images ADD CONSTRAINT site_images_audit_id_url_key UNIQUE (audit_id, url);
