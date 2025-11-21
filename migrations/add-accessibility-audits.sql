-- Add accessibility_audits table for WCAG compliance scanning
-- Created: 2025-11-21

CREATE TABLE IF NOT EXISTS accessibility_audits (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_audit_id INTEGER REFERENCES content_audits(id) ON DELETE SET NULL,
  url TEXT NOT NULL,

  -- Overall score (0-100)
  accessibility_score INTEGER NOT NULL DEFAULT 0,

  -- Violation counts by impact
  critical_count INTEGER NOT NULL DEFAULT 0,
  serious_count INTEGER NOT NULL DEFAULT 0,
  moderate_count INTEGER NOT NULL DEFAULT 0,
  minor_count INTEGER NOT NULL DEFAULT 0,

  -- Total violations and passes
  total_violations INTEGER NOT NULL DEFAULT 0,
  total_passes INTEGER NOT NULL DEFAULT 0,

  -- Detailed violations as JSONB array
  -- Each violation: { id, impact, description, help, helpUrl, nodes: [{ html, target, failureSummary }] }
  violations JSONB NOT NULL DEFAULT '[]',

  -- Passes summary (rules that passed)
  passes JSONB NOT NULL DEFAULT '[]',

  -- WCAG categories breakdown
  -- { perceivable: { violations: N, score: N }, operable: {...}, understandable: {...}, robust: {...} }
  wcag_breakdown JSONB NOT NULL DEFAULT '{}',

  -- Scan metadata
  scan_engine VARCHAR(50) DEFAULT 'axe-core',
  scan_version VARCHAR(20),
  page_title TEXT,
  page_language VARCHAR(10),

  -- AI remediation
  ai_suggestions JSONB DEFAULT '[]',
  remediation_applied BOOLEAN DEFAULT FALSE,
  remediation_at TIMESTAMP,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_accessibility_audits_user_id ON accessibility_audits(user_id);
CREATE INDEX IF NOT EXISTS idx_accessibility_audits_content_audit_id ON accessibility_audits(content_audit_id);
CREATE INDEX IF NOT EXISTS idx_accessibility_audits_url ON accessibility_audits(url);
CREATE INDEX IF NOT EXISTS idx_accessibility_audits_score ON accessibility_audits(accessibility_score);

-- Add accessibility_score column to content_audits table if not exists
ALTER TABLE content_audits ADD COLUMN IF NOT EXISTS accessibility_score INTEGER;
ALTER TABLE content_audits ADD COLUMN IF NOT EXISTS accessibility_audit_id INTEGER REFERENCES accessibility_audits(id) ON DELETE SET NULL;
