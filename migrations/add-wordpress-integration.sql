-- WordPress Integration Migration
-- Adds WordPress publishing capability to strategies and posts

-- Add WordPress configuration to strategies table
ALTER TABLE strategies
  ADD COLUMN IF NOT EXISTS wordpress_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS wordpress_url text,
  ADD COLUMN IF NOT EXISTS wordpress_username text,
  ADD COLUMN IF NOT EXISTS wordpress_app_password text,
  ADD COLUMN IF NOT EXISTS wordpress_category_id integer,
  ADD COLUMN IF NOT EXISTS wordpress_category_name text,
  ADD COLUMN IF NOT EXISTS wordpress_author_id integer,
  ADD COLUMN IF NOT EXISTS wordpress_author_name text,
  ADD COLUMN IF NOT EXISTS wordpress_default_status text DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS wordpress_connection_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS wordpress_last_test_at timestamp with time zone;

-- Add WordPress tracking to posts table
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS wordpress_post_id integer,
  ADD COLUMN IF NOT EXISTS wordpress_post_url text,
  ADD COLUMN IF NOT EXISTS wordpress_published_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS wordpress_last_sync_at timestamp with time zone;

-- Update posts status constraint to include 'published'
-- First drop existing constraint if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'posts_status_check'
    AND table_name = 'posts'
  ) THEN
    ALTER TABLE posts DROP CONSTRAINT posts_status_check;
  END IF;
END $$;

-- Add updated constraint
ALTER TABLE posts
  ADD CONSTRAINT posts_status_check
  CHECK (status IN ('draft', 'approved', 'published', 'archived'));

-- Create index for WordPress-related queries
CREATE INDEX IF NOT EXISTS idx_strategies_wordpress_enabled ON strategies(wordpress_enabled) WHERE wordpress_enabled = true;
CREATE INDEX IF NOT EXISTS idx_posts_wordpress_post_id ON posts(wordpress_post_id) WHERE wordpress_post_id IS NOT NULL;

COMMENT ON COLUMN strategies.wordpress_app_password IS 'WordPress Application Password - stored encrypted';
COMMENT ON COLUMN strategies.wordpress_default_status IS 'Default status when publishing: draft or publish';
