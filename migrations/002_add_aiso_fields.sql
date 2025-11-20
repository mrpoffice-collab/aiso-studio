-- Migration: Add AISO Stack fields to database
-- Date: 2025-01-04
-- Description: Adds AEO, GEO, and local context fields to support AISO framework

-- Add AISO scoring columns to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS aeo_score INTEGER;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS geo_score INTEGER;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS aiso_score INTEGER; -- Overall score with fact-checking

-- Add local context fields to strategies table
ALTER TABLE strategies ADD COLUMN IF NOT EXISTS content_type VARCHAR(20) DEFAULT 'national';
ALTER TABLE strategies ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE strategies ADD COLUMN IF NOT EXISTS state VARCHAR(50);
ALTER TABLE strategies ADD COLUMN IF NOT EXISTS service_area TEXT;

-- Add AEO focus to topics table
ALTER TABLE topics ADD COLUMN IF NOT EXISTS aeo_focus VARCHAR(20); -- 'definition', 'how-to', 'comparison', 'guide', 'faq'

-- Add check constraint for content_type
ALTER TABLE strategies DROP CONSTRAINT IF EXISTS strategies_content_type_check;
ALTER TABLE strategies ADD CONSTRAINT strategies_content_type_check
  CHECK (content_type IN ('national', 'local', 'hybrid'));

-- Add check constraint for aeo_focus
ALTER TABLE topics DROP CONSTRAINT IF EXISTS topics_aeo_focus_check;
ALTER TABLE topics ADD CONSTRAINT topics_aeo_focus_check
  CHECK (aeo_focus IN ('definition', 'how-to', 'comparison', 'guide', 'faq', 'list', 'tutorial'));

-- Create index for filtering by content type
CREATE INDEX IF NOT EXISTS idx_strategies_content_type ON strategies(content_type);

-- Create index for local searches
CREATE INDEX IF NOT EXISTS idx_strategies_city_state ON strategies(city, state) WHERE content_type IN ('local', 'hybrid');

-- Add comments for documentation
COMMENT ON COLUMN posts.aeo_score IS 'Answer Engine Optimization score (0-100)';
COMMENT ON COLUMN posts.geo_score IS 'Local Intent Optimization score (0-100), null if not local content';
COMMENT ON COLUMN posts.aiso_score IS 'Overall AISO score including fact-checking (0-100)';
COMMENT ON COLUMN strategies.content_type IS 'Type of content: national, local, or hybrid';
COMMENT ON COLUMN strategies.city IS 'Primary city for local content';
COMMENT ON COLUMN strategies.state IS 'Primary state for local content';
COMMENT ON COLUMN strategies.service_area IS 'Description of service area for GEO optimization';
COMMENT ON COLUMN topics.aeo_focus IS 'AEO content type: definition, how-to, comparison, guide, faq, list, tutorial';
