-- Migration: Add WCAG/Accessibility and AISO-specific columns to leads table
-- Purpose: Enable AISO opportunity scoring based on accessibility compliance and searchability

-- AISO-specific scoring columns
ALTER TABLE leads ADD COLUMN IF NOT EXISTS aiso_opportunity_score INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS estimated_monthly_value INTEGER DEFAULT 299;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS primary_pain_point TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS secondary_pain_points TEXT[];
ALTER TABLE leads ADD COLUMN IF NOT EXISTS recommended_pitch TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS time_to_close TEXT DEFAULT 'medium';

-- Contact tracking
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_contact_date TIMESTAMP;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS contact_count INTEGER DEFAULT 0;

-- AISO trial tracking
ALTER TABLE leads ADD COLUMN IF NOT EXISTS aiso_trial_started BOOLEAN DEFAULT FALSE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS aiso_trial_start_date TIMESTAMP;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS converted_to_aiso BOOLEAN DEFAULT FALSE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS aiso_client_id TEXT;

-- Accessibility/WCAG metrics
ALTER TABLE leads ADD COLUMN IF NOT EXISTS accessibility_score INTEGER;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS wcag_critical_violations INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS wcag_serious_violations INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS wcag_moderate_violations INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS wcag_minor_violations INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS wcag_total_violations INTEGER DEFAULT 0;

-- Searchability metrics
ALTER TABLE leads ADD COLUMN IF NOT EXISTS ranking_keywords INTEGER;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS avg_search_position DECIMAL;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS estimated_organic_traffic INTEGER;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_aiso_score ON leads(aiso_opportunity_score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_accessibility_score ON leads(accessibility_score);
CREATE INDEX IF NOT EXISTS idx_leads_wcag_critical ON leads(wcag_critical_violations DESC);
CREATE INDEX IF NOT EXISTS idx_leads_time_to_close ON leads(time_to_close);
CREATE INDEX IF NOT EXISTS idx_leads_converted ON leads(converted_to_aiso);

-- Create lead_outreach table for tracking contact history
CREATE TABLE IF NOT EXISTS lead_outreach (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- Changed to UUID to match users table
  outreach_type TEXT NOT NULL, -- 'email' | 'call' | 'meeting' | 'demo'
  subject TEXT,
  message TEXT,
  response TEXT,
  sentiment TEXT, -- 'positive' | 'neutral' | 'negative' | 'no_response'
  next_follow_up_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_outreach_lead_id ON lead_outreach(lead_id);
CREATE INDEX IF NOT EXISTS idx_outreach_created_at ON lead_outreach(created_at DESC);

-- Create lead_scoring_history for tracking score changes over time
CREATE TABLE IF NOT EXISTS lead_scoring_history (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
  aiso_score INTEGER,
  overall_score INTEGER,
  accessibility_score INTEGER,
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_scoring_history_lead_id ON lead_scoring_history(lead_id);
CREATE INDEX IF NOT EXISTS idx_scoring_history_created_at ON lead_scoring_history(created_at DESC);

-- Add comments for documentation
COMMENT ON COLUMN leads.aiso_opportunity_score IS 'AISO fit score 0-100 based on content, accessibility, SEO, and industry';
COMMENT ON COLUMN leads.accessibility_score IS 'WCAG compliance score 0-100 from axe-core audit';
COMMENT ON COLUMN leads.wcag_critical_violations IS 'Number of critical WCAG violations (legal risk)';
COMMENT ON COLUMN leads.primary_pain_point IS 'Top marketing pain point for outreach';
COMMENT ON COLUMN leads.recommended_pitch IS 'AI-generated pitch based on pain points';
COMMENT ON COLUMN leads.time_to_close IS 'Estimated sales cycle: immediate, short, medium, long';
