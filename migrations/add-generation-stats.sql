-- Add generation stats columns to posts table
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS generation_iterations integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS generation_cost_cents integer,
ADD COLUMN IF NOT EXISTS generation_time_seconds integer;

COMMENT ON COLUMN posts.generation_iterations IS 'Number of refinement iterations during content generation';
COMMENT ON COLUMN posts.generation_cost_cents IS 'Estimated cost in cents for generating this post';
COMMENT ON COLUMN posts.generation_time_seconds IS 'Time in seconds to generate this post';
