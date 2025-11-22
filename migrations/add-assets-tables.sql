-- Migration: Add Digital Asset Manager Tables
-- Description: Creates tables for storing and organizing digital assets
-- Created: 2025-11-22

-- Assets table - stores all uploaded files
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES asset_folders(id) ON DELETE SET NULL,
  
  -- File information
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  file_type VARCHAR(100) NOT NULL, -- 'image', 'pdf', 'video', 'document'
  mime_type VARCHAR(100) NOT NULL,
  file_size BIGINT NOT NULL, -- bytes
  
  -- Storage
  blob_url TEXT NOT NULL, -- Vercel Blob URL
  public_url TEXT, -- Public CDN URL if shared
  
  -- Image-specific metadata (NULL for non-images)
  width INTEGER,
  height INTEGER,
  dominant_color VARCHAR(7), -- hex color for thumbnails
  
  -- Organization
  tags TEXT[], -- searchable tags
  description TEXT,
  alt_text TEXT, -- for accessibility
  
  -- Usage tracking
  download_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE -- soft delete
);

-- Asset folders - organize assets by client/campaign
CREATE TABLE IF NOT EXISTS asset_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_folder_id UUID REFERENCES asset_folders(id) ON DELETE CASCADE,
  
  -- Folder info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7), -- hex color for folder icon
  
  -- Auto-link to strategies/clients
  strategy_id UUID REFERENCES strategies(id) ON DELETE SET NULL,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Asset usage tracking - which posts/MOUs use which assets
CREATE TABLE IF NOT EXISTS asset_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  
  -- Where is this asset used?
  entity_type VARCHAR(50) NOT NULL, -- 'post', 'mou', 'strategy'
  entity_id UUID NOT NULL,
  
  -- Usage context
  usage_type VARCHAR(50), -- 'featured_image', 'attachment', 'inline'
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_assets_user_id ON assets(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_folder_id ON assets(folder_id);
CREATE INDEX IF NOT EXISTS idx_assets_file_type ON assets(file_type);
CREATE INDEX IF NOT EXISTS idx_assets_created_at ON assets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assets_tags ON assets USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_assets_deleted_at ON assets(deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_asset_folders_user_id ON asset_folders(user_id);
CREATE INDEX IF NOT EXISTS idx_asset_folders_parent_id ON asset_folders(parent_folder_id);
CREATE INDEX IF NOT EXISTS idx_asset_folders_strategy_id ON asset_folders(strategy_id);

CREATE INDEX IF NOT EXISTS idx_asset_usage_asset_id ON asset_usage(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_usage_entity ON asset_usage(entity_type, entity_id);

-- Comments for documentation
COMMENT ON TABLE assets IS 'Digital Asset Manager - All uploaded files (images, PDFs, videos, documents)';
COMMENT ON TABLE asset_folders IS 'Folder structure for organizing assets by client/campaign';
COMMENT ON TABLE asset_usage IS 'Tracks which posts/MOUs/strategies use which assets';

COMMENT ON COLUMN assets.blob_url IS 'Vercel Blob storage URL (private)';
COMMENT ON COLUMN assets.public_url IS 'Public CDN URL for shared assets';
COMMENT ON COLUMN assets.dominant_color IS 'Extracted dominant color for image previews';
COMMENT ON COLUMN assets.tags IS 'Array of searchable tags (e.g., ["logo", "client-acme", "brand"])';
COMMENT ON COLUMN assets.deleted_at IS 'Soft delete timestamp - NULL = active, set = deleted';
