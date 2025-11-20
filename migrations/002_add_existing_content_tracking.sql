-- Migration: Add existing content tracking to prevent duplication

-- Add column to strategies table to store existing blog URLs
ALTER TABLE strategies
ADD COLUMN IF NOT EXISTS existing_blog_urls jsonb DEFAULT '[]';

-- Add comment for clarity
COMMENT ON COLUMN strategies.existing_blog_urls IS 'Array of existing blog post URLs from client website to prevent duplicate content';

-- Create a new table to store scraped existing content for comparison
CREATE TABLE IF NOT EXISTS existing_content (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  strategy_id uuid REFERENCES strategies(id) ON DELETE CASCADE NOT NULL,
  url text NOT NULL,
  title text,
  content_excerpt text, -- First 500 chars or meta description
  scraped_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_existing_content_strategy_id ON existing_content(strategy_id);
CREATE INDEX IF NOT EXISTS idx_existing_content_url ON existing_content(url);

-- Add column to posts table to track similarity checks
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS similarity_checked boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS similarity_score decimal(5, 2),
ADD COLUMN IF NOT EXISTS duplicate_warnings jsonb DEFAULT '[]';

COMMENT ON COLUMN posts.similarity_checked IS 'Whether this post was checked against existing content';
COMMENT ON COLUMN posts.similarity_score IS 'Highest similarity score found (0-100)';
COMMENT ON COLUMN posts.duplicate_warnings IS 'Array of warnings about potential duplicates';
