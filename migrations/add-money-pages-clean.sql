CREATE TABLE IF NOT EXISTS money_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id UUID NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  page_type TEXT NOT NULL CHECK (page_type IN ('product', 'service', 'signup', 'contact', 'pricing', 'other')),
  description TEXT,
  priority INTEGER DEFAULT 2 CHECK (priority BETWEEN 1 AND 3),
  target_keywords TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(strategy_id, url)
);

CREATE TABLE IF NOT EXISTS topic_clusters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id UUID NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  primary_money_page_id UUID REFERENCES money_pages(id) ON DELETE SET NULL,
  secondary_money_page_ids UUID[],
  funnel_stage TEXT CHECK (funnel_stage IN ('awareness', 'consideration', 'decision')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(strategy_id, name)
);

ALTER TABLE topics
ADD COLUMN IF NOT EXISTS cluster_id UUID REFERENCES topic_clusters(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS primary_link_url TEXT,
ADD COLUMN IF NOT EXISTS primary_link_anchor TEXT,
ADD COLUMN IF NOT EXISTS cta_type TEXT,
ADD COLUMN IF NOT EXISTS link_placement_hint TEXT;

CREATE INDEX IF NOT EXISTS idx_money_pages_strategy ON money_pages(strategy_id);
CREATE INDEX IF NOT EXISTS idx_money_pages_priority ON money_pages(strategy_id, priority);
CREATE INDEX IF NOT EXISTS idx_topic_clusters_strategy ON topic_clusters(strategy_id);
CREATE INDEX IF NOT EXISTS idx_topics_cluster ON topics(cluster_id);
