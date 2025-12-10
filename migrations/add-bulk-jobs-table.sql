-- Migration: Add bulk_jobs table for tracking bulk operations
-- Created: 2025-12-10

CREATE TABLE IF NOT EXISTS bulk_jobs (
  id VARCHAR(100) PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  strategy_id UUID NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
  job_type VARCHAR(20) NOT NULL CHECK (job_type IN ('generate', 'approve', 'export')),
  status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'completed_with_errors', 'failed', 'cancelled')),
  total_items INTEGER NOT NULL DEFAULT 0,
  completed_items INTEGER NOT NULL DEFAULT 0,
  failed_items INTEGER NOT NULL DEFAULT 0,
  topic_ids JSONB DEFAULT '[]',
  results JSONB DEFAULT '[]',
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_bulk_jobs_user_id ON bulk_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_bulk_jobs_strategy_id ON bulk_jobs(strategy_id);
CREATE INDEX IF NOT EXISTS idx_bulk_jobs_status ON bulk_jobs(status);
CREATE INDEX IF NOT EXISTS idx_bulk_jobs_created_at ON bulk_jobs(created_at DESC);

-- Cleanup old completed jobs (keep last 30 days)
-- This can be run periodically via cron/scheduler
-- DELETE FROM bulk_jobs WHERE status IN ('completed', 'completed_with_errors', 'failed') AND completed_at < NOW() - INTERVAL '30 days';
