-- Money Pages and Topic Clusters Migration
-- Enables strategic internal linking architecture

-- Step 1: Create money_pages table
CREATE TABLE IF NOT EXISTS money_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id UUID NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  page_type TEXT NOT NULL CHECK (page_type IN ('product', 'service', 'signup', 'contact', 'pricing', 'other')),
  description TEXT,
  priority INTEGER DEFAULT 2 CHECK (priority BETWEEN 1 AND 3), -- 1=high, 2=medium, 3=low
  target_keywords TEXT[], -- Keywords this page should rank for
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(strategy_id, url) -- Prevent duplicate URLs per strategy
);

-- Step 2: Create topic_clusters table
CREATE TABLE IF NOT EXISTS topic_clusters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id UUID NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  primary_money_page_id UUID REFERENCES money_pages(id) ON DELETE SET NULL,
  secondary_money_page_ids UUID[], -- Optional supporting pages
  funnel_stage TEXT CHECK (funnel_stage IN ('awareness', 'consideration', 'decision')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(strategy_id, name) -- Prevent duplicate cluster names per strategy
);

-- Step 3: Update topics table with cluster fields
ALTER TABLE topics
ADD COLUMN IF NOT EXISTS cluster_id UUID REFERENCES topic_clusters(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS primary_link_url TEXT, -- Required link to money page
ADD COLUMN IF NOT EXISTS primary_link_anchor TEXT, -- Suggested anchor text
ADD COLUMN IF NOT EXISTS cta_type TEXT, -- 'product_browse', 'service_inquiry', 'signup', 'contact'
ADD COLUMN IF NOT EXISTS link_placement_hint TEXT; -- Where to place the link

-- Step 4: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_money_pages_strategy ON money_pages(strategy_id);
CREATE INDEX IF NOT EXISTS idx_money_pages_priority ON money_pages(strategy_id, priority);
CREATE INDEX IF NOT EXISTS idx_topic_clusters_strategy ON topic_clusters(strategy_id);
CREATE INDEX IF NOT EXISTS idx_topics_cluster ON topics(cluster_id);

-- Step 5: Add updated_at trigger for money_pages
CREATE OR REPLACE FUNCTION update_money_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER money_pages_updated_at
  BEFORE UPDATE ON money_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_money_pages_updated_at();

-- Step 6: Add updated_at trigger for topic_clusters
CREATE OR REPLACE FUNCTION update_topic_clusters_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER topic_clusters_updated_at
  BEFORE UPDATE ON topic_clusters
  FOR EACH ROW
  EXECUTE FUNCTION update_topic_clusters_updated_at();

-- Example data for testing (commented out - uncomment to use)
/*
-- Example: Add money pages for a memorial service strategy
INSERT INTO money_pages (strategy_id, url, title, page_type, description, priority, target_keywords)
VALUES
  ('YOUR_STRATEGY_ID', '/products', 'Memorial Products & Gifts', 'product', 'Browse our collection of personalized memorial gifts and keepsakes', 1, ARRAY['memorial gifts', 'keepsakes', 'memorial products']),
  ('YOUR_STRATEGY_ID', '/signup', 'Create Your Free Memorial Page', 'signup', 'Create a beautiful online memorial page to honor your loved one', 1, ARRAY['create memorial page', 'free memorial website', 'online memorial']),
  ('YOUR_STRATEGY_ID', '/services/cremation', 'Cremation Services & Planning', 'service', 'Comprehensive cremation planning and services', 2, ARRAY['cremation services', 'cremation planning', 'cremation options']);

-- Example: Create topic clusters
INSERT INTO topic_clusters (strategy_id, name, description, primary_money_page_id, funnel_stage)
VALUES
  ('YOUR_STRATEGY_ID', 'Product Awareness', 'Build awareness of memorial product offerings', (SELECT id FROM money_pages WHERE url = '/products' LIMIT 1), 'awareness'),
  ('YOUR_STRATEGY_ID', 'Signup Conversions', 'Drive signups for memorial pages', (SELECT id FROM money_pages WHERE url = '/signup' LIMIT 1), 'decision');
*/
