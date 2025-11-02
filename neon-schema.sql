-- Content Command Studio Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (supplemental to Clerk)
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id text UNIQUE NOT NULL,
  email text NOT NULL,
  name text,
  agency_name text,
  timezone text DEFAULT 'UTC',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Strategies table
CREATE TABLE strategies (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  client_name text NOT NULL,
  industry text NOT NULL,
  goals jsonb NOT NULL DEFAULT '[]',
  target_audience text NOT NULL,
  brand_voice text NOT NULL,
  frequency text NOT NULL,
  content_length text NOT NULL,
  keywords text[] DEFAULT '{}',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Topics table
CREATE TABLE topics (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  strategy_id uuid REFERENCES strategies(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  keyword text,
  outline jsonb DEFAULT '[]',
  seo_intent text,
  word_count integer,
  position integer NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'completed', 'failed')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Posts table
CREATE TABLE posts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id uuid REFERENCES topics(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  meta_description text,
  content text NOT NULL,
  word_count integer NOT NULL,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'published')),
  fact_checks jsonb DEFAULT '[]',
  featured_image_url text,
  image_attribution jsonb,
  published_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Fact checks table
CREATE TABLE fact_checks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  claim text NOT NULL,
  status text NOT NULL CHECK (status IN ('verified', 'uncertain', 'unverified')),
  confidence integer CHECK (confidence >= 0 AND confidence <= 100),
  sources jsonb DEFAULT '[]',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Usage logs table (for tracking API costs)
CREATE TABLE usage_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  operation_type text NOT NULL CHECK (operation_type IN ('strategy_generation', 'content_generation', 'fact_checking', 'image_search')),
  cost_usd decimal(10, 4),
  tokens_used integer,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for better query performance
CREATE INDEX idx_strategies_user_id ON strategies(user_id);
CREATE INDEX idx_topics_strategy_id ON topics(strategy_id);
CREATE INDEX idx_topics_status ON topics(status);
CREATE INDEX idx_posts_topic_id ON posts(topic_id);
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_fact_checks_post_id ON fact_checks(post_id);
CREATE INDEX idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX idx_usage_logs_created_at ON usage_logs(created_at);
CREATE INDEX idx_users_clerk_id ON users(clerk_id);

-- Functions for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for auto-updating updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_strategies_updated_at BEFORE UPDATE ON strategies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_topics_updated_at BEFORE UPDATE ON topics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Note: Authorization is handled at the application layer via Clerk
-- Users can only access their own data through API route checks
