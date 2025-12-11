-- Migration: Add captured_leads table for free audit email gate
-- Date: 2025-12-11

-- Table to store captured leads from free audit email gate
CREATE TABLE IF NOT EXISTS captured_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Contact info
  email VARCHAR(255) NOT NULL UNIQUE,

  -- Persona & Source
  persona VARCHAR(50) NOT NULL DEFAULT 'unknown', -- 'own_site', 'client_site', 'unknown'
  source VARCHAR(50) NOT NULL DEFAULT 'free_audit', -- 'free_audit', 'landing_page', etc.

  -- First audit info
  domain VARCHAR(255),
  url TEXT,
  aiso_score INTEGER,

  -- Latest audit info (for repeat visitors)
  last_domain VARCHAR(255),
  last_url TEXT,
  last_aiso_score INTEGER,
  audit_count INTEGER DEFAULT 1,

  -- Tracking
  ip_address VARCHAR(45),
  user_agent TEXT,
  referrer TEXT,

  -- Email sequence
  email_sequence_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'email_1_sent', 'email_2_sent', 'email_3_sent', 'completed', 'unsubscribed'
  last_email_sent_at TIMESTAMP WITH TIME ZONE,

  -- Conversion tracking
  converted_at TIMESTAMP WITH TIME ZONE,
  converted_user_id UUID REFERENCES users(id),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_captured_leads_email ON captured_leads(email);
CREATE INDEX IF NOT EXISTS idx_captured_leads_persona ON captured_leads(persona);
CREATE INDEX IF NOT EXISTS idx_captured_leads_sequence_status ON captured_leads(email_sequence_status);
CREATE INDEX IF NOT EXISTS idx_captured_leads_created_at ON captured_leads(created_at);
CREATE INDEX IF NOT EXISTS idx_captured_leads_domain ON captured_leads(domain);

-- Email sequence tracking table (for detailed tracking)
CREATE TABLE IF NOT EXISTS email_sequence_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  captured_lead_id UUID NOT NULL REFERENCES captured_leads(id) ON DELETE CASCADE,

  email_number INTEGER NOT NULL, -- 1, 2, 3
  email_type VARCHAR(50) NOT NULL, -- 'results', 'tips', 'trial_cta'

  -- Status
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  bounced_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  ses_message_id VARCHAR(255),
  subject VARCHAR(255),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_sequence_logs_lead ON email_sequence_logs(captured_lead_id);
CREATE INDEX IF NOT EXISTS idx_email_sequence_logs_sent ON email_sequence_logs(sent_at);
