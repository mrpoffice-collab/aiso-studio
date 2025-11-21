-- Batch Lead Discovery Tables

-- Batch jobs table to track background discovery tasks
CREATE TABLE IF NOT EXISTS batch_lead_discovery (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,

  -- Search criteria
  industry VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,
  state VARCHAR(255),
  target_count INTEGER NOT NULL DEFAULT 50, -- How many sweet spot leads to find

  -- Progress tracking
  status VARCHAR(50) DEFAULT 'queued', -- queued, processing, completed, failed, cancelled
  progress INTEGER DEFAULT 0, -- Number of leads found so far
  businesses_searched INTEGER DEFAULT 0, -- Total businesses analyzed
  sweet_spot_found INTEGER DEFAULT 0, -- Sweet spot leads found

  -- Results
  total_leads_saved INTEGER DEFAULT 0,
  error_message TEXT,

  -- Timestamps
  queued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_batch_discovery_user_id ON batch_lead_discovery(user_id);
CREATE INDEX idx_batch_discovery_status ON batch_lead_discovery(status);
CREATE INDEX idx_batch_discovery_created_at ON batch_lead_discovery(created_at DESC);

-- Add a reference to batch job in leads table (optional - for tracking which batch found this lead)
-- Note: Only add this if leads table exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'leads') THEN
    ALTER TABLE leads ADD COLUMN IF NOT EXISTS batch_discovery_id uuid REFERENCES batch_lead_discovery(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_leads_batch_discovery_id ON leads(batch_discovery_id);
  END IF;
END $$;
