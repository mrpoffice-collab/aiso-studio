-- Migration: Add Agency Branding Fields
-- Description: Adds comprehensive branding fields to users table for white-label MOU generation
-- Created: 2025-01-21

-- Add branding fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS agency_logo_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS agency_primary_color VARCHAR(7) DEFAULT '#6366f1';
ALTER TABLE users ADD COLUMN IF NOT EXISTS agency_secondary_color VARCHAR(7) DEFAULT '#3b82f6';
ALTER TABLE users ADD COLUMN IF NOT EXISTS agency_email TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS agency_phone VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS agency_website TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS agency_address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS agency_tagline TEXT;

-- Add index for faster lookups (if not already exists)
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);

-- Add comments for documentation
COMMENT ON COLUMN users.agency_logo_url IS 'URL to agency logo stored in cloud storage (Cloudinary, S3, etc.)';
COMMENT ON COLUMN users.agency_primary_color IS 'Hex color code for primary brand color (e.g., #6366f1)';
COMMENT ON COLUMN users.agency_secondary_color IS 'Hex color code for secondary brand color (e.g., #3b82f6)';
COMMENT ON COLUMN users.agency_email IS 'Agency contact email for client communications';
COMMENT ON COLUMN users.agency_phone IS 'Agency contact phone number';
COMMENT ON COLUMN users.agency_website IS 'Agency website URL';
COMMENT ON COLUMN users.agency_address IS 'Agency physical address (optional)';
COMMENT ON COLUMN users.agency_tagline IS 'Agency tagline or slogan (optional)';
