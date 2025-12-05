-- Competitor Comparisons table for tracking sales comparison audits
CREATE TABLE IF NOT EXISTS competitor_comparisons (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_url TEXT NOT NULL,
  competitor_urls JSONB NOT NULL DEFAULT '[]',
  results JSONB,
  insights JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_competitor_comparisons_user_id ON competitor_comparisons(user_id);
CREATE INDEX IF NOT EXISTS idx_competitor_comparisons_created_at ON competitor_comparisons(created_at DESC);
