-- Migration: Add lead_emails table for tracking email outreach
-- Date: 2025-11-25
-- Description: Creates table to track emails sent to leads via AWS SES

-- Create lead_emails table
CREATE TABLE IF NOT EXISTS lead_emails (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  to_email TEXT NOT NULL,
  from_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  template_used TEXT DEFAULT 'custom',
  ses_message_id TEXT,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  bounce_type TEXT,
  bounce_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_lead_emails_lead_id ON lead_emails(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_emails_user_id ON lead_emails(user_id);
CREATE INDEX IF NOT EXISTS idx_lead_emails_status ON lead_emails(status);
CREATE INDEX IF NOT EXISTS idx_lead_emails_sent_at ON lead_emails(sent_at);
CREATE INDEX IF NOT EXISTS idx_lead_emails_ses_message_id ON lead_emails(ses_message_id);

-- Add contact tracking columns to leads table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'contact_count') THEN
    ALTER TABLE leads ADD COLUMN contact_count INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'last_contact_date') THEN
    ALTER TABLE leads ADD COLUMN last_contact_date TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Verify migration
SELECT 'lead_emails table created successfully' AS status;
