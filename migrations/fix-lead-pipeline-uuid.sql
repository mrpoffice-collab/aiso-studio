-- Fix user_id columns to use UUID instead of INTEGER

-- First, drop the tables and recreate with correct types
DROP TABLE IF EXISTS lead_activities;
DROP TABLE IF EXISTS leads;
DROP TABLE IF EXISTS lead_projects;

-- Projects/Campaigns table
CREATE TABLE IF NOT EXISTS lead_projects (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  industry VARCHAR(255),
  location VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_lead_projects_user_id ON lead_projects(user_id);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  project_id INTEGER,

  -- Business info
  domain VARCHAR(255) NOT NULL,
  business_name VARCHAR(255) NOT NULL,
  city VARCHAR(255),
  state VARCHAR(255),
  industry VARCHAR(255),

  -- Scores
  overall_score INTEGER NOT NULL,
  content_score INTEGER NOT NULL,
  seo_score INTEGER NOT NULL,
  design_score INTEGER NOT NULL,
  speed_score INTEGER NOT NULL,

  -- Content info
  has_blog BOOLEAN DEFAULT FALSE,
  blog_post_count INTEGER DEFAULT 0,
  last_blog_update VARCHAR(255),

  -- Status tracking
  status VARCHAR(50) DEFAULT 'new', -- new, report_generated, contacted, qualified, won, lost
  opportunity_rating VARCHAR(50), -- high, medium, low

  -- Activity tracking
  report_generated_at TIMESTAMP WITH TIME ZONE,
  contacted_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,

  -- Timestamps
  discovered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Prevent duplicates per user
  UNIQUE(user_id, domain)
);

CREATE INDEX idx_leads_user_id ON leads(user_id);
CREATE INDEX idx_leads_project_id ON leads(project_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_discovered_at ON leads(discovered_at DESC);

-- Lead activities/notes table
CREATE TABLE IF NOT EXISTS lead_activities (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER NOT NULL,
  user_id UUID NOT NULL,

  activity_type VARCHAR(50) NOT NULL, -- note, email, call, meeting, report_generated
  description TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_lead_activities_lead_id ON lead_activities(lead_id);
CREATE INDEX idx_lead_activities_created_at ON lead_activities(created_at DESC);
