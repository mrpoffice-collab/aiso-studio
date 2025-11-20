-- Migration: Add Client Website Audit & Integration Tables
-- Purpose: Store crawled site content for duplicate prevention, internal linking, and image reuse
-- Created: 2025-01-06

-- Table: site_audits
-- Tracks audit runs for each strategy
CREATE TABLE IF NOT EXISTS site_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id UUID NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
  site_url TEXT NOT NULL,
  pages_found INTEGER DEFAULT 0,
  images_found INTEGER DEFAULT 0,
  avg_aiso_score INTEGER,
  status TEXT NOT NULL CHECK (status IN ('pending', 'crawling', 'completed', 'failed')),
  error_message TEXT,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_site_audits_strategy ON site_audits(strategy_id);
CREATE INDEX idx_site_audits_status ON site_audits(status);

COMMENT ON TABLE site_audits IS 'Tracks client website audit runs for content discovery and analysis';
COMMENT ON COLUMN site_audits.avg_aiso_score IS 'Average AISO score across all audited pages';

-- Table: site_pages
-- Stores individual pages discovered during site crawl
CREATE TABLE IF NOT EXISTS site_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES site_audits(id) ON DELETE CASCADE,
  strategy_id UUID NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT,
  meta_description TEXT,
  excerpt TEXT,
  content_preview TEXT, -- First 500 chars for similarity matching
  word_count INTEGER,
  aiso_score INTEGER,
  aeo_score INTEGER,
  seo_score INTEGER,
  readability_score INTEGER,
  engagement_score INTEGER,
  flesch_score INTEGER,
  is_linkable BOOLEAN DEFAULT true, -- Can we link to this page?
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(strategy_id, url)
);

CREATE INDEX idx_site_pages_strategy ON site_pages(strategy_id);
CREATE INDEX idx_site_pages_audit ON site_pages(audit_id);
CREATE INDEX idx_site_pages_aiso ON site_pages(aiso_score);
CREATE INDEX idx_site_pages_linkable ON site_pages(is_linkable);

COMMENT ON TABLE site_pages IS 'Client website pages discovered during audit for linking and duplicate prevention';
COMMENT ON COLUMN site_pages.content_preview IS 'Text excerpt for semantic similarity matching';
COMMENT ON COLUMN site_pages.is_linkable IS 'Whether this page should be considered for internal links';

-- Table: site_images
-- Stores images found on client website
CREATE TABLE IF NOT EXISTS site_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES site_audits(id) ON DELETE CASCADE,
  strategy_id UUID NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT,
  source_page_url TEXT, -- Which page was this image found on?
  context TEXT CHECK (context IN ('product', 'service', 'staff', 'location', 'logo', 'other')),
  width INTEGER,
  height INTEGER,
  file_size INTEGER,
  is_available BOOLEAN DEFAULT true, -- Still accessible?
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(strategy_id, url)
);

CREATE INDEX idx_site_images_strategy ON site_images(strategy_id);
CREATE INDEX idx_site_images_audit ON site_images(audit_id);
CREATE INDEX idx_site_images_context ON site_images(context);
CREATE INDEX idx_site_images_available ON site_images(is_available);

COMMENT ON TABLE site_images IS 'Images from client website available for reuse in generated content';
COMMENT ON COLUMN site_images.context IS 'Type of image for better matching with content needs';

-- Add website_url field to strategies table
ALTER TABLE strategies
ADD COLUMN IF NOT EXISTS website_url TEXT;

COMMENT ON COLUMN strategies.website_url IS 'Client website URL for auditing and content integration';

-- Add last_audit_at to strategies for tracking
ALTER TABLE strategies
ADD COLUMN IF NOT EXISTS last_audit_at TIMESTAMP;

COMMENT ON COLUMN strategies.last_audit_at IS 'Timestamp of most recent successful site audit';
