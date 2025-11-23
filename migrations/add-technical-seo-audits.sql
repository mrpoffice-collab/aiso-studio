-- Add technical SEO audits table for AI searchability diagnostics

CREATE TABLE IF NOT EXISTS technical_seo_audits (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  content_audit_id INTEGER REFERENCES content_audits(id) ON DELETE SET NULL,
  url TEXT NOT NULL,

  -- Scores (0-100)
  overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  ai_searchability_score INTEGER NOT NULL CHECK (ai_searchability_score >= 0 AND ai_searchability_score <= 100),
  technical_seo_score INTEGER NOT NULL CHECK (technical_seo_score >= 0 AND technical_seo_score <= 100),

  -- Issue counts
  agency_fixable_count INTEGER DEFAULT 0,
  owner_action_count INTEGER DEFAULT 0,

  -- Estimated costs (in cents)
  estimated_min_cost INTEGER DEFAULT 0,
  estimated_max_cost INTEGER DEFAULT 0,

  -- Detailed results (JSONB for flexibility)
  agency_can_fix JSONB DEFAULT '[]'::jsonb, -- Array of fixable issues
  owner_must_change JSONB DEFAULT '[]'::jsonb, -- Array of owner-only issues
  checks JSONB DEFAULT '{}'::jsonb, -- Detailed check results
  recommendations JSONB DEFAULT '[]'::jsonb, -- Prioritized recommendations

  -- Metadata
  scan_version TEXT DEFAULT '1.0.0',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_technical_seo_user ON technical_seo_audits(user_id);
CREATE INDEX IF NOT EXISTS idx_technical_seo_content_audit ON technical_seo_audits(content_audit_id);
CREATE INDEX IF NOT EXISTS idx_technical_seo_created ON technical_seo_audits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_technical_seo_url ON technical_seo_audits(url);
CREATE INDEX IF NOT EXISTS idx_technical_seo_scores ON technical_seo_audits(overall_score, ai_searchability_score);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_technical_seo_audits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_technical_seo_audits_updated_at
  BEFORE UPDATE ON technical_seo_audits
  FOR EACH ROW
  EXECUTE FUNCTION update_technical_seo_audits_updated_at();
