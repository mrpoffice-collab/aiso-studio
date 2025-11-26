-- Add email signature fields to users table
-- These are used for branded email communications

ALTER TABLE users
ADD COLUMN IF NOT EXISTS signature_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS signature_title VARCHAR(255),
ADD COLUMN IF NOT EXISTS signature_phone VARCHAR(50);

-- Create index for common lookups
CREATE INDEX IF NOT EXISTS idx_users_onboarding ON users (clerk_id) WHERE signature_name IS NOT NULL;
