-- AI Visibility Tracking Tables
-- Internal-only feature for tracking content citations in AI search platforms

-- Track URLs/domains we're monitoring
CREATE TABLE IF NOT EXISTS ai_visibility_monitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- What we're monitoring
  url TEXT NOT NULL,
  domain TEXT NOT NULL,
  business_name TEXT,
  industry TEXT,

  -- Keywords to check for this URL
  target_keywords TEXT[] DEFAULT '{}',

  -- Monitoring settings
  is_active BOOLEAN DEFAULT true,
  check_frequency TEXT DEFAULT 'weekly', -- 'daily', 'weekly', 'manual'
  last_checked_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Store individual visibility check results
CREATE TABLE IF NOT EXISTS ai_visibility_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  monitor_id UUID NOT NULL REFERENCES ai_visibility_monitors(id) ON DELETE CASCADE,

  -- Check details
  check_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  platform TEXT NOT NULL, -- 'perplexity', 'chatgpt', 'claude', 'google-ai'
  query_used TEXT NOT NULL, -- The question/search we asked
  keyword TEXT, -- Which target keyword this was for

  -- Results
  was_cited BOOLEAN DEFAULT false,
  citation_type TEXT, -- 'direct_link', 'brand_mention', 'content_reference', 'not_found'
  citation_position INT, -- 1st source, 2nd source, etc (null if not cited)
  response_snippet TEXT, -- Relevant part of AI response
  sources_returned TEXT[], -- All sources the AI returned

  -- Raw data for debugging
  full_response TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Aggregate stats for quick dashboard display
CREATE TABLE IF NOT EXISTS ai_visibility_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  monitor_id UUID NOT NULL REFERENCES ai_visibility_monitors(id) ON DELETE CASCADE,

  -- Time period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Aggregated metrics
  total_checks INT DEFAULT 0,
  total_citations INT DEFAULT 0,
  citation_rate DECIMAL(5,2), -- percentage

  -- By platform
  perplexity_checks INT DEFAULT 0,
  perplexity_citations INT DEFAULT 0,
  chatgpt_checks INT DEFAULT 0,
  chatgpt_citations INT DEFAULT 0,

  -- Average position when cited
  avg_citation_position DECIMAL(3,1),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(monitor_id, period_start, period_end)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_visibility_monitors_user ON ai_visibility_monitors(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_visibility_monitors_active ON ai_visibility_monitors(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_ai_visibility_checks_monitor ON ai_visibility_checks(monitor_id);
CREATE INDEX IF NOT EXISTS idx_ai_visibility_checks_date ON ai_visibility_checks(check_date DESC);
CREATE INDEX IF NOT EXISTS idx_ai_visibility_checks_platform ON ai_visibility_checks(platform);
CREATE INDEX IF NOT EXISTS idx_ai_visibility_stats_monitor ON ai_visibility_stats(monitor_id);
