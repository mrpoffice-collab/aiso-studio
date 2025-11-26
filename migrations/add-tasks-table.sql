-- Migration: Add tasks table for client and internal task management
-- Created: 2025-11-26

CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,  -- NULL for internal tasks

  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'todo',  -- todo, in_progress, done
  priority VARCHAR(20) DEFAULT 'medium',  -- low, medium, high, urgent
  due_date TIMESTAMP,

  tags TEXT[] DEFAULT '{}',

  -- Auto-generated task tracking
  is_auto_generated BOOLEAN DEFAULT false,
  source_type VARCHAR(50),  -- 'audit', 'strategy', 'system', 'manual'
  source_id INTEGER,  -- ID of audit/strategy that created it

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_lead_id ON tasks(lead_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- Comments
COMMENT ON TABLE tasks IS 'Client and internal tasks for agency workflow';
COMMENT ON COLUMN tasks.lead_id IS 'NULL for internal tasks, references lead for client tasks';
COMMENT ON COLUMN tasks.is_auto_generated IS 'True if created by system (audit overdue, content due, etc.)';
