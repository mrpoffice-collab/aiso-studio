-- HighLevel Integration Migration
-- Adds columns and tables for HighLevel CRM integration

-- Add HighLevel fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS highlevel_api_key TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS highlevel_location_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS highlevel_pipeline_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS highlevel_pipeline_stage_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS highlevel_aiso_score_field_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS highlevel_aiso_source_field_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS highlevel_auto_sync BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS highlevel_connected_at TIMESTAMP;

-- Add HighLevel tracking fields to pipeline_leads
ALTER TABLE pipeline_leads ADD COLUMN IF NOT EXISTS highlevel_contact_id VARCHAR(255);
ALTER TABLE pipeline_leads ADD COLUMN IF NOT EXISTS highlevel_opportunity_id VARCHAR(255);
ALTER TABLE pipeline_leads ADD COLUMN IF NOT EXISTS highlevel_stage_id VARCHAR(255);
ALTER TABLE pipeline_leads ADD COLUMN IF NOT EXISTS highlevel_exported_at TIMESTAMP;

-- Create indexes for HighLevel lookups
CREATE INDEX IF NOT EXISTS idx_users_highlevel_location
  ON users(highlevel_location_id)
  WHERE highlevel_location_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_pipeline_leads_highlevel_contact
  ON pipeline_leads(highlevel_contact_id)
  WHERE highlevel_contact_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_pipeline_leads_highlevel_opportunity
  ON pipeline_leads(highlevel_opportunity_id)
  WHERE highlevel_opportunity_id IS NOT NULL;

-- Webhook queue table for async processing
CREATE TABLE IF NOT EXISTS webhook_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  source VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMP,
  completed_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_queue_status
  ON webhook_queue(status, created_at)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_webhook_queue_user
  ON webhook_queue(user_id, created_at);

-- Webhook logs table for debugging and audit trail
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  source VARCHAR(50) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  payload TEXT,
  result JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_user_source
  ON webhook_logs(user_id, source, created_at DESC);

-- Cleanup old webhook logs (keep 30 days)
-- Run this periodically: DELETE FROM webhook_logs WHERE created_at < NOW() - INTERVAL '30 days';

COMMENT ON COLUMN users.highlevel_api_key IS 'HighLevel Private Integration Token or OAuth access token';
COMMENT ON COLUMN users.highlevel_location_id IS 'HighLevel sub-account/location ID';
COMMENT ON COLUMN users.highlevel_pipeline_id IS 'Default pipeline for new opportunities';
COMMENT ON COLUMN users.highlevel_pipeline_stage_id IS 'Default stage for new opportunities';
COMMENT ON COLUMN users.highlevel_aiso_score_field_id IS 'Custom field ID in HighLevel for AISO score';
COMMENT ON COLUMN users.highlevel_aiso_source_field_id IS 'Custom field ID in HighLevel for source URL';
COMMENT ON COLUMN users.highlevel_auto_sync IS 'Auto-run AISO audit when contact added in HighLevel';

COMMENT ON TABLE webhook_queue IS 'Queue for async webhook processing (auto-audits, syncs)';
COMMENT ON TABLE webhook_logs IS 'Audit trail for incoming webhooks';
