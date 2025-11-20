-- Add content_audits table for saving audit/rewrite history
-- Run with: psql $DATABASE_URL -f migrations/add-content-audits.sql

CREATE TABLE IF NOT EXISTS content_audits (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  url TEXT NOT NULL,
  title TEXT,

  -- Original content and scores
  original_content TEXT NOT NULL,
  original_score INTEGER NOT NULL,
  original_breakdown JSONB, -- Full score breakdown

  -- Improved content and scores (if rewritten)
  improved_content TEXT,
  improved_score INTEGER,
  improved_breakdown JSONB,

  -- Rewrite metadata
  iterations INTEGER DEFAULT 0,
  cost_usd DECIMAL(10, 4) DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_content_audits_user_id ON content_audits(user_id);
CREATE INDEX IF NOT EXISTS idx_content_audits_created_at ON content_audits(created_at DESC);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_content_audits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER content_audits_updated_at
  BEFORE UPDATE ON content_audits
  FOR EACH ROW
  EXECUTE FUNCTION update_content_audits_updated_at();
