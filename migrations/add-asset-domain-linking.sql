-- Migration: Add Domain-Asset Linking
-- Description: Enable assets to be linked to domains (many-to-many)
-- This allows searching vault by domain and sharing assets across clients
-- Created: 2024-11-25

-- ============================================================================
-- Asset-Domain linking table (many-to-many)
-- ============================================================================
CREATE TABLE IF NOT EXISTS asset_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  domain VARCHAR(255) NOT NULL,

  -- Context for the link
  link_type VARCHAR(50) DEFAULT 'primary', -- 'primary', 'reused', 'reference'

  -- Metadata
  linked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  linked_by UUID, -- user who made the link

  -- Prevent duplicate links
  UNIQUE(asset_id, domain)
);

CREATE INDEX idx_asset_domains_asset_id ON asset_domains(asset_id);
CREATE INDEX idx_asset_domains_domain ON asset_domains(domain);
CREATE INDEX idx_asset_domains_link_type ON asset_domains(link_type);

-- ============================================================================
-- Lead Audits table (specialized asset type for audit data)
-- NOTE: Table created as 'lead_audits' instead of 'site_audits' (which already exists)
-- ============================================================================
CREATE TABLE IF NOT EXISTS lead_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Domain link (required for audits)
  domain VARCHAR(255) NOT NULL,

  -- Optional lead/client link
  lead_id INTEGER, -- links to leads table when in pipeline
  client_id UUID, -- links to clients table when converted (future)

  -- Audit type
  audit_type VARCHAR(50) NOT NULL DEFAULT 'full', -- 'full', 'accessibility', 'seo', 'content'

  -- Core scores (snapshot at audit time)
  overall_score INTEGER,
  content_score INTEGER,
  seo_score INTEGER,
  design_score INTEGER,
  speed_score INTEGER,

  -- Accessibility data
  accessibility_score INTEGER,
  wcag_critical_violations INTEGER DEFAULT 0,
  wcag_serious_violations INTEGER DEFAULT 0,
  wcag_moderate_violations INTEGER DEFAULT 0,
  wcag_minor_violations INTEGER DEFAULT 0,
  wcag_total_violations INTEGER DEFAULT 0,
  accessibility_details JSONB, -- full axe-core results

  -- Search visibility data (Serper)
  ranking_keywords INTEGER,
  avg_search_position DECIMAL(5,2),
  estimated_organic_traffic INTEGER,
  top_keywords JSONB, -- array of {keyword, position, volume}
  search_details JSONB, -- full Serper response

  -- Content analysis
  has_blog BOOLEAN,
  blog_post_count INTEGER,
  content_gaps JSONB, -- identified missing content opportunities

  -- AISO scoring (computed)
  aiso_opportunity_score INTEGER,
  primary_pain_point TEXT,
  secondary_pain_points TEXT[],
  recommended_services JSONB,
  estimated_monthly_value INTEGER,
  time_to_close VARCHAR(50),

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_lead_audits_user_id ON lead_audits(user_id);
CREATE INDEX idx_lead_audits_domain ON lead_audits(domain);
CREATE INDEX idx_lead_audits_lead_id ON lead_audits(lead_id);
CREATE INDEX idx_lead_audits_created_at ON lead_audits(created_at DESC);
CREATE INDEX idx_lead_audits_audit_type ON lead_audits(audit_type);

-- ============================================================================
-- Comments
-- ============================================================================
COMMENT ON TABLE asset_domains IS 'Links assets to domains for client-centric searching';
COMMENT ON TABLE lead_audits IS 'Website audit snapshots - accessibility, SEO, content analysis';

COMMENT ON COLUMN asset_domains.link_type IS 'primary = created for this domain, reused = shared from another, reference = just tagged';
COMMENT ON COLUMN lead_audits.audit_type IS 'full = all checks, or specific: accessibility, seo, content';
COMMENT ON COLUMN lead_audits.accessibility_details IS 'Full axe-core scan results as JSON';
COMMENT ON COLUMN lead_audits.search_details IS 'Full Serper API response as JSON';
