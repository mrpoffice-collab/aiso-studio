-- Migration: Add detailed SEO/AEO metrics to site_pages
-- Purpose: Enable drill-down into exactly what was found on each page
-- Created: 2025-12-10

-- Add SEO detail columns
ALTER TABLE site_pages ADD COLUMN IF NOT EXISTS h1_count INTEGER DEFAULT 0;
ALTER TABLE site_pages ADD COLUMN IF NOT EXISTS h2_count INTEGER DEFAULT 0;
ALTER TABLE site_pages ADD COLUMN IF NOT EXISTS h3_count INTEGER DEFAULT 0;
ALTER TABLE site_pages ADD COLUMN IF NOT EXISTS h4_count INTEGER DEFAULT 0;
ALTER TABLE site_pages ADD COLUMN IF NOT EXISTS image_count INTEGER DEFAULT 0;
ALTER TABLE site_pages ADD COLUMN IF NOT EXISTS images_with_alt INTEGER DEFAULT 0;
ALTER TABLE site_pages ADD COLUMN IF NOT EXISTS internal_link_count INTEGER DEFAULT 0;
ALTER TABLE site_pages ADD COLUMN IF NOT EXISTS external_link_count INTEGER DEFAULT 0;
ALTER TABLE site_pages ADD COLUMN IF NOT EXISTS has_schema BOOLEAN DEFAULT false;
ALTER TABLE site_pages ADD COLUMN IF NOT EXISTS has_faq_schema BOOLEAN DEFAULT false;
ALTER TABLE site_pages ADD COLUMN IF NOT EXISTS has_canonical BOOLEAN DEFAULT false;
ALTER TABLE site_pages ADD COLUMN IF NOT EXISTS has_open_graph BOOLEAN DEFAULT false;

-- Add title/meta length for display
ALTER TABLE site_pages ADD COLUMN IF NOT EXISTS title_length INTEGER DEFAULT 0;
ALTER TABLE site_pages ADD COLUMN IF NOT EXISTS meta_length INTEGER DEFAULT 0;

COMMENT ON COLUMN site_pages.h1_count IS 'Number of H1 headers found on page';
COMMENT ON COLUMN site_pages.h2_count IS 'Number of H2 headers found on page';
COMMENT ON COLUMN site_pages.h3_count IS 'Number of H3 headers found on page';
COMMENT ON COLUMN site_pages.image_count IS 'Total images on page';
COMMENT ON COLUMN site_pages.images_with_alt IS 'Images with non-empty alt text';
COMMENT ON COLUMN site_pages.internal_link_count IS 'Links to same domain';
COMMENT ON COLUMN site_pages.external_link_count IS 'Links to other domains';
COMMENT ON COLUMN site_pages.has_schema IS 'Has JSON-LD structured data';
COMMENT ON COLUMN site_pages.has_faq_schema IS 'Has FAQ schema markup';
COMMENT ON COLUMN site_pages.has_canonical IS 'Has canonical URL tag';
COMMENT ON COLUMN site_pages.has_open_graph IS 'Has Open Graph meta tags';
