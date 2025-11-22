# Product Requirements Document: Digital Asset Manager (DAM)

**Product:** AISO Studio - Digital Asset Manager
**Version:** 1.0
**Last Updated:** 2025-11-22
**Status:** Planning
**Author:** Product Team
**Stakeholders:** Engineering, Design, Customer Success

---

## 1. Executive Summary

### 1.1 Product Name
**AISO Studio Digital Asset Manager** - A client-centric asset management system designed specifically for content marketing agencies to organize, store, and leverage digital assets across campaigns and client portfolios.

### 1.2 Business Case

Following investor conversations and user feedback, agencies using AISO Studio have identified a critical gap: **scalable asset management**. The current logo URL field is insufficient for agencies managing multiple clients with diverse asset libraries.

Agencies need to:
- Store client logos, brand guidelines, stock photos, and campaign materials in one place
- Reuse assets across multiple blog posts, strategies, and MOUs without re-uploading
- Organize assets by client, campaign, or asset type for quick retrieval
- Share select assets with clients via a portal (future)
- Track asset usage and maintain version history

### 1.3 Target Audience

**Primary Users:**
1. **Agency Owners** - Need centralized asset control across all client accounts
2. **Content Managers** - Require quick access to branded assets for content creation
3. **Account Managers** - Want to share assets with clients during onboarding/strategy reviews

**Secondary Users:**
4. **Clients** (Phase 4) - Will access shared assets via client portal
5. **Freelance Writers** (Future) - May need limited access to client brand assets

### 1.4 Core Value Proposition

"Transform your agency's asset chaos into an organized, searchable library that integrates seamlessly with your content workflow—saving hours per client and preventing costly brand inconsistencies."

**Key Differentiators:**
- Built FOR agencies, not adapted from general DAM tools
- Deep integration with content generation (blog posts, MOUs, strategies)
- Client-based organization by default
- Subscription-based storage tiers aligned with agency growth
- No per-user fees for asset uploads (unlike Brandfolder, Bynder)

---

## 2. Problem Statement

### 2.1 Current Pain Points

**Pain Point 1: Logo Upload Limitation**
- **Current State:** Single URL field for agency logo in branding settings
- **Problem:** Agencies can't store client logos for multi-client workflows
- **Impact:** Users manually re-upload logos for every MOU or blog post

**Pain Point 2: Asset Redundancy**
- **Problem:** Same stock photo uploaded 10 times across different blog posts
- **Impact:** Wasted storage, bandwidth, and time

**Pain Point 3: No Asset Organization**
- **Problem:** No folders, tags, or search—agencies with 50+ clients can't find assets
- **Impact:** 10-15 minutes wasted per asset search, multiplied by 20+ searches/week

**Pain Point 4: No Client Asset Sharing**
- **Problem:** Agencies email assets back and forth with clients for approval
- **Impact:** Version control chaos, lost files, unprofessional workflow

**Pain Point 5: Storage Cost Uncertainty**
- **Problem:** Existing DAMs (Brandfolder, Bynder) cost $500-$2,000/month
- **Impact:** Agencies avoid tools, rely on Google Drive/Dropbox workarounds

### 2.2 Competitive Alternatives & Limitations

| Tool | Monthly Cost | Agency Fit | Limitations |
|------|-------------|------------|-------------|
| **Brandfolder** | $500-$1,500 | Medium | No content integration, expensive |
| **Bynder** | $1,000-$2,500 | Low | Enterprise-focused, over-engineered |
| **Google Drive** | $10-$30 | Low | No metadata, poor search, no versioning |
| **Dropbox Business** | $20-$30/user | Medium | Not asset-focused, manual organization |
| **Cloudinary** | $89-$500 | Low | Developer tool, no UI for clients |
| **Air (formerly Boords)** | $40-$100 | Medium | Creative-focused, not content marketing |

**Gap in Market:** No affordable DAM ($39-$299/month) built specifically for content marketing agencies with blog/MOU integration.

---

## 3. User Personas

### Persona 1: Sarah - Agency Owner (Midwest Content Agency)

**Profile:**
- Runs 5-person agency with 25 active clients
- Manages brand assets for law firms, medical practices, and B2B companies
- Spends 3-4 hours/week searching for client logos and brand colors

**Goals:**
- Centralize all client assets in one secure location
- Reduce time spent on asset retrieval by 80%
- Prevent brand inconsistencies in deliverables

**Pain Points:**
- "I have 25 client logos scattered across email, Slack, and Google Drive"
- "We've used the wrong logo version twice—embarrassing and costly"
- "I can't remember which client uses which shade of blue"

**Use of DAM:**
- Uploads all client assets during onboarding
- Creates client-specific folders with brand guidelines
- Searches by client name to find assets instantly

---

### Persona 2: Marcus - Content Manager (SaaS Marketing Agency)

**Profile:**
- Creates 40-60 blog posts per month across 10 SaaS clients
- Needs stock photos, client logos, and infographics for featured images
- Currently spends 2 hours/week re-downloading assets from Slack

**Goals:**
- Attach featured images to blog posts in 30 seconds, not 5 minutes
- Reuse approved stock photos across multiple posts
- Tag assets by topic (e.g., "cybersecurity," "healthcare") for quick retrieval

**Pain Points:**
- "I re-download the same stock photo every time I write a security-related post"
- "Finding the client's approved brand colors takes 10 clicks in Figma"

**Use of DAM:**
- Searches by tag ("cybersecurity") to find pre-approved stock photos
- Attaches assets directly to blog posts from DAM library
- Uploads new assets once, reuses 10+ times

---

### Persona 3: Jessica - Account Manager (Local Services Agency)

**Profile:**
- Manages 8 home service clients (plumbers, electricians, HVAC)
- Coordinates with clients on asset approvals and brand updates
- Needs to share assets with clients for review

**Goals:**
- Share client-specific assets via secure link (no Dropbox back-and-forth)
- Get client approval on logos/photos before using in content
- Track which assets are approved vs. pending

**Pain Points:**
- "Clients send logos via email, then I upload to Google Drive, then download again for blog posts"
- "I've used an outdated logo because the client didn't tell me they rebranded"

**Use of DAM:**
- Shares client folder via secure portal link
- Flags assets as "Pending Approval" vs. "Approved"
- Gets notifications when client uploads new brand assets

---

## 4. Features & Requirements

### 4.1 MVP Features (Phase 1-2)

#### Feature 1: Asset Upload & Storage

**Description:** Users can upload images, PDFs, videos, and documents to their agency account.

**Acceptance Criteria:**
- Support file types: PNG, JPG, SVG, PDF, MP4, MOV, DOCX, PPTX
- Max file size: 25MB per file (50MB for Enterprise tier)
- Drag-and-drop upload interface
- Bulk upload support (up to 20 files at once)
- Upload progress indicator with cancel option
- Auto-generate thumbnails for images and videos
- Store original file + optimized web version (for images)

**User Stories:**
- As an agency owner, I want to upload 10 client logos at once so I can onboard faster.
- As a content manager, I want to drag a stock photo from my desktop into AISO Studio so I can add it to a blog post.
- As an account manager, I want to see upload progress so I know when large videos are ready.

**Technical Requirements:**
- Store files in Vercel Blob (primary) or Cloudinary (fallback)
- Generate signed URLs for secure access
- Implement file validation on client and server side
- Track storage usage per user in database
- Soft delete files (mark as deleted, hard delete after 30 days)

---

#### Feature 2: Client-Based Organization

**Description:** Assets are organized into client folders by default, with support for custom folders and tags.

**Acceptance Criteria:**
- Auto-create client folder when strategy is created
- Allow manual folder creation (e.g., "Stock Photos," "Templates")
- Nested folder support (2 levels deep max for MVP)
- Drag-and-drop assets between folders
- "All Assets" view showing everything across all clients
- "Recent Uploads" quick-access section (last 20 assets)
- Empty state with helpful prompts for new users

**User Stories:**
- As an agency owner, I want assets grouped by client name so I can find them instantly.
- As a content manager, I want a "Stock Photos" folder for reusable assets not tied to a specific client.
- As an account manager, I want to move assets between folders if a client changes.

**Technical Requirements:**
- Create `asset_folders` table with parent-child relationships
- Link folders to strategies (optional) for auto-organization
- Display folder tree in sidebar navigation
- Cache folder structure for performance

---

#### Feature 3: Asset Metadata & Details

**Description:** Each asset has metadata for search, filtering, and organization.

**Metadata Fields:**
- **System-generated:** File name, file size, file type, dimensions (images), duration (videos), upload date, uploader ID
- **User-editable:** Display name, description, tags (comma-separated), client association, usage rights/license info (text field)
- **Auto-detected:** Color palette (images), dominant color (for filtering)

**Acceptance Criteria:**
- Display metadata panel when asset is selected
- Allow inline editing of display name and description
- Tag autocomplete based on previously used tags
- Show file size in human-readable format (MB, KB)
- Display image dimensions (e.g., 1920x1080)
- Show video duration (e.g., 2:34)
- Track download count and last used date

**User Stories:**
- As a content manager, I want to tag assets with keywords so I can search "logo" and find all logos.
- As an agency owner, I want to see which assets haven't been used in 6 months so I can archive them.
- As an account manager, I want to add license info to stock photos so we don't violate usage rights.

**Technical Requirements:**
- Create `assets` table with JSONB metadata column
- Use PostgreSQL full-text search for name/description/tags
- Generate color palette using image processing library
- Index tags for fast filtering

---

#### Feature 4: Search & Filtering

**Description:** Powerful search and filtering to find assets in seconds.

**Search Capabilities:**
- Full-text search across asset names, descriptions, tags
- Filter by client (dropdown)
- Filter by file type (image, video, document, all)
- Filter by date range (uploaded in last 7 days, 30 days, etc.)
- Filter by tag (multi-select)
- Sort by: name, upload date, file size, last used

**Acceptance Criteria:**
- Search results update in real-time (debounced)
- Show result count (e.g., "24 assets found")
- Highlight search terms in results
- Clear all filters button
- Save search as smart folder (Phase 3)
- Empty state when no results found

**User Stories:**
- As a content manager, I want to search "acme corp logo" and instantly find all Acme Corp logos.
- As an agency owner, I want to filter by "PDF" to see all brand guideline documents.
- As an account manager, I want to filter by client + "approved" tag to see ready-to-use assets.

**Technical Requirements:**
- Use PostgreSQL `tsvector` for full-text search
- Implement debounced search (300ms delay)
- Add indexes on frequently filtered columns (client_id, file_type, upload_date)
- Cache search results for 5 minutes

---

### 4.2 Integration Features (Phase 2-3)

#### Feature 5: Blog Post Featured Images

**Description:** Attach assets from DAM library to blog posts as featured images.

**Acceptance Criteria:**
- "Choose from Library" button in blog post editor
- Modal showing DAM assets with search/filter
- Click to select, auto-fills featured image URL
- Preview selected image before saving
- Track which assets are used in which posts

**User Stories:**
- As a content manager, I want to select a featured image from my library instead of uploading the same stock photo 10 times.
- As an agency owner, I want to see which blog posts use a specific asset so I can replace it if needed.

**Technical Requirements:**
- Add `featured_image_asset_id` column to `posts` table
- Create many-to-many relationship for multi-asset support (future)
- Update post creation API to accept asset ID instead of URL
- Track asset usage in `asset_usage` table

---

#### Feature 6: MOU Asset Attachment

**Description:** Attach logos and documents to MOUs for professional branded proposals.

**Acceptance Criteria:**
- "Attach Assets" section in MOU generation page
- Select client logo from DAM (instead of manual URL entry)
- Attach additional PDFs (e.g., case studies, pricing sheets)
- Display attached assets in MOU preview
- Include asset links in downloaded MOU

**User Stories:**
- As an account manager, I want to attach the client's logo to an MOU so it looks professionally branded.
- As an agency owner, I want to include a PDF case study in the MOU so clients see our expertise.

**Technical Requirements:**
- Add `attached_assets` JSONB column to `mou_generations` table (future)
- Store array of asset IDs
- Fetch assets on MOU render
- Generate download links with expiration

---

#### Feature 7: Agency Branding Integration

**Description:** Replace manual logo URL in branding settings with DAM asset picker.

**Acceptance Criteria:**
- "Upload Logo" button opens DAM library or direct upload
- Select existing logo from library or upload new one
- Auto-tag uploaded logo as "Agency Logo"
- Update `agency_logo_url` in users table with DAM asset URL

**User Stories:**
- As an agency owner, I want to choose my logo from my asset library so I don't upload it twice.

**Technical Requirements:**
- Modify `/dashboard/settings/branding` to use DAM picker
- Add "agency_logo_asset_id" column to users table
- Maintain backward compatibility with existing URL field

---

### 4.3 Advanced Features (Phase 3-4)

#### Feature 8: Client Sharing & Permissions

**Description:** Share specific folders or assets with clients via secure links.

**Acceptance Criteria:**
- "Share with Client" button on folders and assets
- Generate unique, time-limited shareable link
- Public view (no login required) showing assets in gallery view
- Client can download assets (optional setting)
- Client can upload assets to shared folder (optional)
- Track client views and downloads
- Revoke access anytime

**User Stories:**
- As an account manager, I want to share our brand asset library with a client so they can download approved logos.
- As an agency owner, I want to let clients upload their own brand assets directly to their folder.

**Technical Requirements:**
- Create `asset_shares` table with unique tokens
- Implement token-based authentication for public access
- Add expiration dates (7 days, 30 days, never)
- Log view/download events in `asset_share_logs`

---

#### Feature 9: Version History

**Description:** Track asset versions when files are replaced.

**Acceptance Criteria:**
- "Replace Asset" button on asset details page
- Upload new version, original is archived
- "Version History" section showing all versions with dates
- Restore previous version with one click
- Download any historical version

**User Stories:**
- As an agency owner, I want to see all versions of a client's logo so I can revert if they change their mind.
- As a content manager, I want to replace an outdated stock photo but keep the old one just in case.

**Technical Requirements:**
- Add `version` and `parent_asset_id` columns to `assets` table
- Soft delete old versions (mark as archived)
- Create version timeline UI component
- Implement one-click restore functionality

---

#### Feature 10: Asset Approval Workflows (Optional - Phase 4)

**Description:** Flag assets as "Pending Approval" and notify clients for review.

**Acceptance Criteria:**
- Approval status: Draft, Pending, Approved, Rejected
- Set status manually or auto-send approval request
- Email notification to client with review link
- Client can approve/reject with comments
- Filter assets by approval status

**User Stories:**
- As an account manager, I want to send a logo to a client for approval before using it in content.
- As a client, I want to approve assets via email without logging in.

**Technical Requirements:**
- Add `approval_status` and `approval_notes` columns to `assets`
- Create `asset_approvals` table for tracking requests
- Implement email notification system
- Build client-facing approval page (no login required)

---

## 5. Database Schema

### 5.1 Core Tables

#### `assets` Table
```sql
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES asset_folders(id) ON DELETE SET NULL,

  -- File Info
  file_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  file_type VARCHAR(50) NOT NULL, -- 'image', 'video', 'document', 'pdf'
  file_extension VARCHAR(10) NOT NULL, -- 'png', 'jpg', 'mp4', 'pdf'
  file_size_bytes BIGINT NOT NULL,

  -- Storage
  storage_provider VARCHAR(50) NOT NULL DEFAULT 'vercel_blob', -- 'vercel_blob', 'cloudinary', 's3'
  storage_url TEXT NOT NULL, -- Full URL to file
  storage_key TEXT NOT NULL, -- Unique key for deletion
  thumbnail_url TEXT, -- For images/videos

  -- Metadata
  description TEXT,
  tags TEXT[], -- Array of tags for search

  -- Image-specific
  width INTEGER, -- Image/video width in pixels
  height INTEGER, -- Image/video height in pixels
  color_palette JSONB, -- Extracted colors: {"primary": "#FF5733", "secondary": "#3498DB"}

  -- Video-specific
  duration_seconds INTEGER, -- Video duration

  -- Organization
  client_name TEXT, -- Auto-populated from strategy or manual
  strategy_id UUID REFERENCES strategies(id) ON DELETE SET NULL, -- Optional link to strategy

  -- Usage Rights
  license_info TEXT, -- "Stock photo from Unsplash" or "Client-owned"
  usage_notes TEXT,

  -- Sharing & Permissions
  is_public BOOLEAN DEFAULT FALSE, -- Public shareable asset
  share_token TEXT UNIQUE, -- For public sharing links
  share_expires_at TIMESTAMP,

  -- Versioning
  version INTEGER DEFAULT 1,
  parent_asset_id UUID REFERENCES assets(id) ON DELETE SET NULL, -- For version history

  -- Approval Workflow (Optional)
  approval_status VARCHAR(20) DEFAULT 'approved', -- 'draft', 'pending', 'approved', 'rejected'
  approval_notes TEXT,
  approved_by TEXT, -- Email or user ID
  approved_at TIMESTAMP,

  -- Tracking
  download_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP,

  -- Status
  is_deleted BOOLEAN DEFAULT FALSE, -- Soft delete
  deleted_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_assets_user_id ON assets(user_id);
CREATE INDEX idx_assets_folder_id ON assets(folder_id);
CREATE INDEX idx_assets_file_type ON assets(file_type);
CREATE INDEX idx_assets_tags ON assets USING GIN(tags);
CREATE INDEX idx_assets_client_name ON assets(client_name);
CREATE INDEX idx_assets_strategy_id ON assets(strategy_id);
CREATE INDEX idx_assets_is_deleted ON assets(is_deleted);
CREATE INDEX idx_assets_share_token ON assets(share_token);

-- Full-text search
CREATE INDEX idx_assets_search ON assets USING GIN(
  to_tsvector('english', COALESCE(display_name, '') || ' ' || COALESCE(description, '') || ' ' || COALESCE(array_to_string(tags, ' '), ''))
);
```

---

#### `asset_folders` Table
```sql
CREATE TABLE asset_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_folder_id UUID REFERENCES asset_folders(id) ON DELETE CASCADE,

  folder_name TEXT NOT NULL,
  description TEXT,

  -- Organization
  client_name TEXT, -- Auto-link to client
  strategy_id UUID REFERENCES strategies(id) ON DELETE SET NULL, -- Auto-created with strategy

  -- Metadata
  color_tag VARCHAR(7), -- Folder color for UI: "#6366f1"
  icon VARCHAR(50), -- Icon name for UI: "folder", "image", "client"

  -- Order
  position INTEGER DEFAULT 0, -- For custom sorting

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_asset_folders_user_id ON asset_folders(user_id);
CREATE INDEX idx_asset_folders_parent ON asset_folders(parent_folder_id);
CREATE INDEX idx_asset_folders_strategy ON asset_folders(strategy_id);
```

---

#### `asset_usage` Table (Tracking)
```sql
CREATE TABLE asset_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),

  -- Usage Context
  usage_type VARCHAR(50) NOT NULL, -- 'blog_post', 'mou', 'strategy', 'download', 'share'
  entity_type VARCHAR(50), -- 'post', 'mou', 'strategy'
  entity_id UUID, -- ID of the post, MOU, or strategy

  -- Metadata
  ip_address INET, -- For public shares
  user_agent TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_asset_usage_asset_id ON asset_usage(asset_id);
CREATE INDEX idx_asset_usage_user_id ON asset_usage(user_id);
CREATE INDEX idx_asset_usage_entity ON asset_usage(entity_type, entity_id);
```

---

#### `asset_shares` Table (Client Sharing)
```sql
CREATE TABLE asset_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- What's being shared
  share_type VARCHAR(20) NOT NULL, -- 'folder', 'asset'
  folder_id UUID REFERENCES asset_folders(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,

  -- Sharing details
  share_token TEXT UNIQUE NOT NULL, -- Unique URL token
  share_name TEXT, -- "Acme Corp Brand Assets"

  -- Permissions
  can_download BOOLEAN DEFAULT TRUE,
  can_upload BOOLEAN DEFAULT FALSE, -- Allow clients to upload to folder
  password_hash TEXT, -- Optional password protection

  -- Expiration
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,

  -- Tracking
  view_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_asset_shares_user_id ON asset_shares(user_id);
CREATE INDEX idx_asset_shares_token ON asset_shares(share_token);
CREATE INDEX idx_asset_shares_folder ON asset_shares(folder_id);
CREATE INDEX idx_asset_shares_asset ON asset_shares(asset_id);
```

---

### 5.2 Schema Modifications to Existing Tables

#### Modify `users` Table
```sql
-- Add storage tracking
ALTER TABLE users ADD COLUMN IF NOT EXISTS storage_used_bytes BIGINT DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS storage_limit_bytes BIGINT DEFAULT 1073741824; -- 1GB default

-- Add asset usage tracking
ALTER TABLE users ADD COLUMN IF NOT EXISTS assets_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_asset_uploaded_at TIMESTAMP;

-- Index
CREATE INDEX IF NOT EXISTS idx_users_storage ON users(storage_used_bytes);
```

#### Modify `posts` Table
```sql
-- Add DAM integration
ALTER TABLE posts ADD COLUMN IF NOT EXISTS featured_image_asset_id UUID REFERENCES assets(id) ON DELETE SET NULL;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS attached_assets UUID[]; -- Array of asset IDs

-- Index
CREATE INDEX IF NOT EXISTS idx_posts_featured_asset ON posts(featured_image_asset_id);
```

#### Modify `strategies` Table
```sql
-- Add client logo from DAM
ALTER TABLE strategies ADD COLUMN IF NOT EXISTS client_logo_asset_id UUID REFERENCES assets(id) ON DELETE SET NULL;

-- Index
CREATE INDEX IF NOT EXISTS idx_strategies_logo_asset ON strategies(client_logo_asset_id);
```

#### Add to `users` for Agency Branding
```sql
-- Replace manual logo URL with DAM asset
ALTER TABLE users ADD COLUMN IF NOT EXISTS agency_logo_asset_id UUID REFERENCES assets(id) ON DELETE SET NULL;

-- Keep legacy field for backward compatibility
-- ALTER TABLE users ... agency_logo_url remains

-- Index
CREATE INDEX IF NOT EXISTS idx_users_agency_logo_asset ON users(agency_logo_asset_id);
```

---

## 6. Storage Strategy

### 6.1 Storage Provider Comparison

| Provider | Use Case | Pricing | Pros | Cons | Recommendation |
|----------|----------|---------|------|------|----------------|
| **Vercel Blob** | Primary for agencies | $0.15/GB storage + $0.15/GB transfer | Native integration, fast CDN, simple API | Vercel-specific, newer product | **PRIMARY** |
| **Cloudinary** | Image optimization | Free tier (25GB), $99+/mo | Image transformations, auto-optimization, CDN | Focused on images/video only | Fallback/Images |
| **AWS S3** | Enterprise clients | $0.023/GB storage + $0.09/GB transfer | Industry standard, ultra-reliable | Complex setup, IAM management | Enterprise tier |

### 6.2 Recommended Architecture

**Hybrid Approach:**
1. **Vercel Blob (Primary):** All assets stored here by default
2. **Cloudinary (Image Processing):** Process images uploaded to Blob for thumbnails/optimization
3. **AWS S3 (Enterprise Tier):** Optional for agencies needing white-label CDN or compliance requirements

**File Storage Flow:**
```
User Upload → Frontend Validation → Next.js API Route
    ↓
Size Check & Virus Scan (Phase 2)
    ↓
Upload to Vercel Blob (primary)
    ↓
Generate Thumbnail (Cloudinary API)
    ↓
Save metadata to PostgreSQL
    ↓
Return signed URL to frontend
```

### 6.3 Storage Limits by Subscription Tier

| Tier | Monthly Price | Storage Limit | Transfer Limit | Assets Limit | Estimated Cost at Limit |
|------|--------------|---------------|----------------|--------------|------------------------|
| **Trial** | $0 | 1GB | 5GB | 100 | $0.90 |
| **Starter** | $39 | 5GB | 25GB | 500 | $4.50 |
| **Professional** | $99 | 25GB | 100GB | 2,500 | $18.75 |
| **Agency** | $299 | 100GB | 500GB | 10,000 | $90 |
| **Enterprise** | $799 | Unlimited | Unlimited | Unlimited | Pass-through |

**Overage Pricing:**
- $0.20/GB storage over limit
- $0.20/GB transfer over limit
- Auto-upgrade prompt when hitting 80% of limit

**Storage Cost Analysis:**
- **Starter tier (5GB):** COGS = $0.75/month, Gross Margin = 98%
- **Agency tier (100GB):** COGS = $15/month, Gross Margin = 95%
- **Enterprise tier:** Pass-through S3 costs + 40% markup

---

### 6.4 File Type Support & Limits

| Category | Formats | Max Size (Starter/Pro) | Max Size (Agency/Enterprise) |
|----------|---------|------------------------|------------------------------|
| **Images** | PNG, JPG, JPEG, GIF, SVG, WebP | 10MB | 25MB |
| **Videos** | MP4, MOV, AVI, WebM | 50MB | 100MB |
| **Documents** | PDF, DOCX, PPTX, XLSX | 10MB | 25MB |
| **Archives** | ZIP (Phase 2) | 25MB | 50MB |

**Phase 2 Additions:**
- AI/PSD files (Photoshop, Illustrator)
- Audio files (MP3, WAV)
- 3D files (GLB, OBJ - for AR/VR marketing)

---

## 7. Integration Points

### 7.1 Blog Post Workflow Integration

**Current Flow:**
1. Create topic
2. Generate content
3. Manually paste featured image URL
4. Publish

**Enhanced Flow with DAM:**
1. Create topic
2. Generate content
3. **Click "Choose Featured Image" → DAM modal opens**
4. **Search by client name or tag → Select asset**
5. **Asset URL auto-fills, thumbnail preview shows**
6. Publish

**Technical Implementation:**
```typescript
// In blog post editor component
const [showAssetPicker, setShowAssetPicker] = useState(false);
const [selectedAsset, setSelectedAsset] = useState(null);

const handleAssetSelect = (asset) => {
  setFeaturedImageAssetId(asset.id);
  setFeaturedImageUrl(asset.storage_url);
  setShowAssetPicker(false);

  // Track usage
  await fetch('/api/assets/track-usage', {
    method: 'POST',
    body: JSON.stringify({
      asset_id: asset.id,
      usage_type: 'blog_post',
      entity_id: postId
    })
  });
};
```

---

### 7.2 MOU Generation Integration

**Current Flow:**
1. Generate MOU text
2. Display in viewer
3. Download as .txt

**Enhanced Flow with DAM:**
1. **Attach client logo from DAM**
2. **Attach case study PDFs or pricing sheets**
3. Generate MOU text
4. **Display with logo header**
5. **Download MOU + attached assets as ZIP (Phase 2)**

**Technical Implementation:**
```typescript
// MOU generation API
async function generateMOU(strategyId, clientName) {
  // Fetch client logo from DAM
  const clientLogo = await db.query(`
    SELECT a.storage_url, a.thumbnail_url
    FROM assets a
    WHERE a.client_name = $1
      AND a.file_type = 'image'
      AND 'logo' = ANY(a.tags)
    ORDER BY a.created_at DESC
    LIMIT 1
  `, [clientName]);

  // Include logo URL in MOU template
  const mouContent = await generateMOUContent({
    clientName,
    logoUrl: clientLogo?.storage_url,
    ...
  });

  return mouContent;
}
```

---

### 7.3 Agency Branding Integration

**Current:** Manual logo URL input in `/dashboard/settings/branding`

**Enhanced:**
- "Upload Logo" button opens DAM picker
- Select from existing assets or upload new
- Auto-tag uploaded logo as "Agency Branding"
- Store `agency_logo_asset_id` in users table
- Display logo thumbnail in settings preview

**Migration Strategy:**
1. Add `agency_logo_asset_id` column to users
2. Keep `agency_logo_url` for backward compatibility
3. On first branding page load, migrate URL to DAM asset (background job)
4. Deprecate URL field in Phase 3

---

### 7.4 Strategy/Client Onboarding Integration

**Auto-Folder Creation:**
When a new strategy is created, automatically:
1. Create folder: `{client_name} Assets`
2. Link folder to strategy via `strategy_id`
3. Show folder in sidebar under "Clients"

**Client Logo Prompt:**
After strategy creation, show modal:
> "Upload {client_name}'s logo and brand assets to keep everything organized."
> [Upload Now] [Skip - Add Later]

---

## 8. Subscription & Pricing Model

### 8.1 Storage Tiers

| Tier | Price | Storage | Features |
|------|-------|---------|----------|
| **Trial** | Free (7 days) | 1GB | Basic upload, folders, search |
| **Starter** | $39/mo | 5GB | Everything in Trial + client folders, integrations |
| **Professional** | $99/mo | 25GB | + Advanced search, tags, version history |
| **Agency** | $299/mo | 100GB | + Client sharing, approval workflows, priority support |
| **Enterprise** | $799/mo | Unlimited | + Custom storage backend (S3), white-label, SSO |

### 8.2 Premium Features by Tier

| Feature | Trial | Starter | Professional | Agency | Enterprise |
|---------|-------|---------|--------------|--------|------------|
| Asset Upload | Yes | Yes | Yes | Yes | Yes |
| Storage | 1GB | 5GB | 25GB | 100GB | Unlimited |
| Client Folders | Yes | Yes | Yes | Yes | Yes |
| Search & Filters | Basic | Basic | Advanced | Advanced | Advanced |
| Version History | No | No | 5 versions | 20 versions | Unlimited |
| Client Sharing | No | No | No | Yes | Yes |
| Approval Workflows | No | No | No | Yes | Yes |
| Bulk Download | No | No | Yes | Yes | Yes |
| API Access | No | No | No | Yes | Yes |

### 8.3 Overage Handling

**When User Exceeds Storage Limit:**
1. Show banner: "You're using 4.8GB of 5GB. Upgrade to Professional for 25GB."
2. Block new uploads (with error message)
3. Offer one-time overage purchase: $10 for +5GB (one month)
4. Prompt upgrade to next tier

**Upgrade Conversion Strategy:**
- Trial → Starter: Triggered at 0.8GB usage
- Starter → Professional: Triggered at 4GB usage or when user tries to create version history
- Professional → Agency: Triggered when user tries to share assets with clients
- Agency → Enterprise: Custom sales conversation

### 8.4 Revenue Projections

**Assumptions:**
- 1,000 paid users by Year 1
- 60% Starter, 30% Professional, 8% Agency, 2% Enterprise

**Monthly Recurring Revenue (MRR):**
```
Starter:    600 users × $39  = $23,400
Professional: 300 users × $99  = $29,700
Agency:      80 users × $299 = $23,920
Enterprise:  20 users × $799 = $15,980
────────────────────────────────
Total MRR:                      $93,000
Annual Recurring Revenue (ARR): $1,116,000
```

**Storage Costs (COGS):**
```
Starter:    600 users × 5GB  = 3,000GB × $0.15 = $450/mo
Professional: 300 users × 25GB = 7,500GB × $0.15 = $1,125/mo
Agency:      80 users × 100GB = 8,000GB × $0.15 = $1,200/mo
Enterprise:  20 users × 500GB = 10,000GB × $0.15 = $1,500/mo
────────────────────────────────
Total COGS:                                      $4,275/mo
Gross Margin:                                    95.4%
```

**Upgrade Revenue (Overage Purchases):**
- Estimate 15% of Starter users exceed limit monthly
- 90 users × $10 overage = $900/mo additional revenue

**Total MRR with Overages:** $93,900/mo
**Total ARR:** $1,126,800

---

## 9. Implementation Phases

### Phase 1: Core Upload & Storage (Weeks 1-2)

**Goal:** Users can upload, store, and view assets.

**Tasks:**
- [ ] Database migration: Create `assets`, `asset_folders` tables
- [ ] Set up Vercel Blob storage integration
- [ ] Build upload API endpoint (`/api/assets/upload`)
- [ ] Create asset upload UI component (drag-and-drop)
- [ ] Implement file validation (type, size)
- [ ] Build asset gallery view (grid layout)
- [ ] Add delete asset functionality (soft delete)
- [ ] Track storage usage per user

**Deliverables:**
- Users can upload images, PDFs, videos
- Assets display in gallery with thumbnails
- Storage usage shows in account settings

**Success Metrics:**
- 50 assets uploaded by beta users
- 0 upload failures due to size/type issues
- Average upload time < 3 seconds for 5MB file

---

### Phase 2: Organization & Search (Weeks 3-4)

**Goal:** Users can organize assets in folders and search efficiently.

**Tasks:**
- [ ] Build folder creation UI
- [ ] Implement folder tree sidebar navigation
- [ ] Auto-create client folders when strategy is created
- [ ] Add drag-and-drop asset moving between folders
- [ ] Build full-text search with filters
- [ ] Implement tag input and autocomplete
- [ ] Add "Recent Uploads" section
- [ ] Create empty states with helpful prompts

**Deliverables:**
- Folders work with nested support (2 levels)
- Search returns results in < 200ms
- Tags autocomplete based on user's existing tags

**Success Metrics:**
- 80% of users create at least one folder
- Average search time < 1 second
- 60% of assets have at least one tag

---

### Phase 3: Integrations (Weeks 5-6)

**Goal:** Assets integrate with blog posts, MOUs, and branding.

**Tasks:**
- [ ] Add asset picker modal component
- [ ] Integrate asset picker in blog post editor (featured image)
- [ ] Migrate agency logo in branding settings to use DAM
- [ ] Add client logo selection in strategy creation
- [ ] Track asset usage in `asset_usage` table
- [ ] Show "Used in X posts" on asset details
- [ ] Auto-populate client name from strategy

**Deliverables:**
- Blog posts can select featured images from DAM
- Agency branding uses DAM for logo
- Asset usage tracking shows which posts use each asset

**Success Metrics:**
- 70% of new blog posts use DAM for featured images
- 50% of agencies migrate logo to DAM
- 0 broken image links in posts

---

### Phase 4: Client Sharing & Advanced Features (Weeks 7-9)

**Goal:** Agencies can share assets with clients and manage versions.

**Tasks:**
- [ ] Build client sharing UI (generate shareable links)
- [ ] Create public asset gallery page (no login)
- [ ] Implement password protection for shares
- [ ] Add version history (replace asset, keep old versions)
- [ ] Build approval workflow (pending/approved status)
- [ ] Create bulk download feature (ZIP download)
- [ ] Add asset expiration dates (auto-delete after X days)
- [ ] Implement asset duplication detection (warn if identical file uploaded)

**Deliverables:**
- Shareable links work for 30 days by default
- Clients can view/download assets without login
- Version history tracks up to 20 versions per asset

**Success Metrics:**
- 40% of Agency tier users create at least one share link
- 20% of shares result in client downloads
- 10% of assets have version history

---

### Phase 5: Polish & Optimization (Weeks 10-12)

**Goal:** Performance optimization, mobile support, analytics.

**Tasks:**
- [ ] Optimize image loading (lazy loading, CDN)
- [ ] Add mobile-responsive asset gallery
- [ ] Build asset analytics dashboard (most used, least used)
- [ ] Implement bulk upload (20 files at once)
- [ ] Add keyboard shortcuts (delete, search)
- [ ] Create admin dashboard for storage monitoring
- [ ] Add email notifications (storage limit warnings)
- [ ] Write user documentation and video tutorials

**Deliverables:**
- Gallery loads in < 1 second with 100 assets
- Mobile upload works via camera or file picker
- Analytics show top 10 most-used assets

**Success Metrics:**
- Page load time < 1.5 seconds
- 90% of users on mobile can upload assets
- 5% reduction in support tickets about asset management

---

## 10. Technical Specifications

### 10.1 API Endpoints

#### `POST /api/assets/upload`
**Description:** Upload one or multiple files to DAM.

**Request:**
```typescript
// Multipart form data
{
  files: File[], // Array of files
  folder_id?: string, // Optional folder
  client_name?: string, // Optional client association
  tags?: string[], // Optional tags
  description?: string // Optional description
}
```

**Response:**
```json
{
  "success": true,
  "assets": [
    {
      "id": "uuid",
      "file_name": "logo.png",
      "display_name": "Acme Corp Logo",
      "storage_url": "https://blob.vercel-storage.com/...",
      "thumbnail_url": "https://blob.vercel-storage.com/.../thumbnail",
      "file_size_bytes": 204800,
      "file_type": "image"
    }
  ],
  "storage_used_bytes": 5242880,
  "storage_limit_bytes": 5368709120
}
```

**Error Handling:**
- 413 Payload Too Large (file size exceeds limit)
- 415 Unsupported Media Type (invalid file type)
- 507 Insufficient Storage (user over quota)

---

#### `GET /api/assets`
**Description:** Get all assets for current user with filters.

**Query Parameters:**
```typescript
{
  folder_id?: string,
  client_name?: string,
  file_type?: 'image' | 'video' | 'document',
  tags?: string[], // Comma-separated
  search?: string, // Full-text search
  sort?: 'created_at' | 'file_name' | 'file_size',
  order?: 'asc' | 'desc',
  limit?: number,
  offset?: number
}
```

**Response:**
```json
{
  "success": true,
  "assets": [...],
  "total": 247,
  "page": 1,
  "per_page": 50
}
```

---

#### `GET /api/assets/:id`
**Description:** Get single asset details with usage history.

**Response:**
```json
{
  "success": true,
  "asset": {
    "id": "uuid",
    "display_name": "Hero Image",
    "file_type": "image",
    "storage_url": "https://...",
    "width": 1920,
    "height": 1080,
    "tags": ["hero", "homepage"],
    "download_count": 12,
    "last_used_at": "2025-11-20T10:30:00Z"
  },
  "usage": [
    {
      "usage_type": "blog_post",
      "entity_id": "post-uuid",
      "entity_title": "10 Marketing Tips",
      "created_at": "2025-11-19T08:00:00Z"
    }
  ],
  "versions": [
    {
      "version": 2,
      "file_name": "hero-v2.png",
      "created_at": "2025-11-18T12:00:00Z"
    },
    {
      "version": 1,
      "file_name": "hero.png",
      "created_at": "2025-11-01T09:00:00Z"
    }
  ]
}
```

---

#### `PATCH /api/assets/:id`
**Description:** Update asset metadata (name, description, tags).

**Request:**
```json
{
  "display_name": "New Name",
  "description": "Updated description",
  "tags": ["new", "tags"],
  "client_name": "Acme Corp"
}
```

---

#### `DELETE /api/assets/:id`
**Description:** Soft delete asset (mark as deleted, hard delete after 30 days).

**Response:**
```json
{
  "success": true,
  "message": "Asset moved to trash. Permanently deleted after 30 days."
}
```

---

#### `POST /api/assets/:id/restore`
**Description:** Restore soft-deleted asset.

---

#### `POST /api/assets/:id/versions`
**Description:** Upload new version of existing asset.

**Request:**
```typescript
{
  file: File // Replacement file
}
```

**Response:**
```json
{
  "success": true,
  "new_version": 3,
  "asset": {...}
}
```

---

#### `GET /api/folders`
**Description:** Get folder tree structure.

**Response:**
```json
{
  "success": true,
  "folders": [
    {
      "id": "uuid",
      "folder_name": "Acme Corp Assets",
      "client_name": "Acme Corp",
      "asset_count": 24,
      "children": [
        {
          "id": "uuid-2",
          "folder_name": "Logos",
          "asset_count": 5
        }
      ]
    }
  ]
}
```

---

#### `POST /api/folders`
**Description:** Create new folder.

**Request:**
```json
{
  "folder_name": "Stock Photos",
  "parent_folder_id": "uuid", // Optional
  "client_name": "Acme Corp", // Optional
  "color_tag": "#6366f1" // Optional
}
```

---

#### `POST /api/assets/share`
**Description:** Create shareable link for asset or folder.

**Request:**
```json
{
  "share_type": "folder",
  "folder_id": "uuid",
  "share_name": "Acme Corp Brand Assets",
  "expires_at": "2025-12-31T23:59:59Z",
  "can_download": true,
  "password": "optional-password"
}
```

**Response:**
```json
{
  "success": true,
  "share_url": "https://aiso.studio/shared/abc123token",
  "share_token": "abc123token",
  "expires_at": "2025-12-31T23:59:59Z"
}
```

---

#### `GET /api/shared/:token`
**Description:** Public endpoint to view shared assets (no auth required).

**Response:**
```json
{
  "success": true,
  "share_name": "Acme Corp Brand Assets",
  "assets": [...],
  "can_download": true,
  "expires_at": "2025-12-31T23:59:59Z"
}
```

---

### 10.2 UI Components

#### `<AssetUploader>`
**Props:**
```typescript
{
  folderId?: string,
  onUploadComplete?: (assets: Asset[]) => void,
  maxFiles?: number,
  acceptedFileTypes?: string[]
}
```

**Features:**
- Drag-and-drop zone
- File type validation
- Progress indicator
- Preview before upload
- Bulk upload support

---

#### `<AssetGallery>`
**Props:**
```typescript
{
  assets: Asset[],
  view?: 'grid' | 'list',
  selectable?: boolean,
  onSelect?: (asset: Asset) => void,
  showFilters?: boolean
}
```

**Features:**
- Grid/list view toggle
- Hover preview
- Quick actions (download, delete, share)
- Lazy loading (virtualized scrolling)
- Empty state

---

#### `<AssetPicker>`
**Props:**
```typescript
{
  isOpen: boolean,
  onClose: () => void,
  onSelect: (asset: Asset) => void,
  fileType?: 'image' | 'video' | 'document',
  clientName?: string
}
```

**Features:**
- Modal overlay
- Search and filter
- Preview on hover
- Upload new asset inline
- Keyboard navigation (arrow keys)

---

#### `<FolderTree>`
**Props:**
```typescript
{
  folders: Folder[],
  selectedFolderId?: string,
  onFolderSelect: (folderId: string) => void,
  onFolderCreate: (parentId?: string) => void
}
```

**Features:**
- Collapsible tree structure
- Drag-and-drop folder reordering
- Right-click context menu
- Asset count badges
- Color-coded folders

---

### 10.3 Security Considerations

#### Access Control
- **User-level isolation:** Users can only access their own assets
- **Signed URLs:** Generate time-limited signed URLs for file access (expire after 1 hour)
- **Share token validation:** Verify token + expiration before serving public shares
- **Password protection:** Hash passwords with bcrypt for protected shares

#### File Upload Security
- **File type validation:** Check MIME type on server (not just extension)
- **Virus scanning:** Integrate ClamAV or VirusTotal API (Phase 2)
- **File size limits:** Hard limit at 100MB, soft limit by tier
- **Rate limiting:** Max 20 uploads per minute per user

#### CDN & Storage Security
- **Private buckets:** All Vercel Blob uploads are private by default
- **CORS policy:** Restrict uploads to app domain only
- **Content-Type enforcement:** Serve files with correct Content-Type headers
- **No executable files:** Block .exe, .sh, .bat uploads

#### Data Privacy
- **Soft delete:** Keep deleted assets for 30 days for recovery
- **GDPR compliance:** Allow users to export/delete all assets on account deletion
- **Audit logs:** Track all asset access, downloads, shares in `asset_usage` table

---

## 11. Success Metrics

### 11.1 Adoption Metrics

**Week 1-2 (Phase 1 Launch):**
- 30% of active users upload at least one asset
- Average 10 assets uploaded per user
- 0% upload failure rate

**Month 1 (Phase 2-3):**
- 60% of users create at least one folder
- 40% of blog posts use DAM for featured images
- 20% of users tag assets

**Month 3 (Phase 4):**
- 15% of Agency tier users create share links
- 50% of agencies use version history
- 5% upgrade from Starter to Professional due to storage limits

### 11.2 Usage Metrics

**Track Weekly:**
- Total assets uploaded (target: 10,000 by month 3)
- Total storage used across all users (target: 500GB by month 3)
- Asset downloads per user (target: 20/week)
- Search queries per user (target: 5/week)

**Track Monthly:**
- % of assets used in content (target: 60%)
- % of assets unused for 90+ days (target: < 20%)
- Average assets per client folder (target: 15)

### 11.3 Business Metrics

**Revenue Impact:**
- Storage overage revenue (target: $500/month by month 3)
- Upgrade conversions (trial → paid due to DAM) (target: +10%)
- Feature adoption by tier:
  - Starter: 80% use basic upload
  - Professional: 40% use version history
  - Agency: 25% use client sharing

**Retention:**
- Users who upload 10+ assets have 30% higher retention
- Users who create folders have 25% higher retention

### 11.4 Performance Metrics

**Speed:**
- Upload time: < 3 seconds for 5MB file (target: 90th percentile)
- Gallery load time: < 1 second for 100 assets (target: 95th percentile)
- Search response time: < 200ms (target: 99th percentile)

**Reliability:**
- Upload success rate: > 99%
- Asset availability: > 99.9% (CDN uptime)
- Zero data loss events

---

## 12. Cost Analysis

### 12.1 Development Costs

**Team:**
- 1 Full-stack Engineer (12 weeks × 40 hours = 480 hours)
- Hourly rate: $100/hour (contractor) or $75/hour (in-house loaded cost)

**Phase Breakdown:**
| Phase | Weeks | Hours | Cost |
|-------|-------|-------|------|
| Phase 1: Core Upload | 2 | 80 | $8,000 |
| Phase 2: Organization | 2 | 80 | $8,000 |
| Phase 3: Integrations | 2 | 80 | $8,000 |
| Phase 4: Sharing | 3 | 120 | $12,000 |
| Phase 5: Polish | 3 | 120 | $12,000 |
| **Total** | **12** | **480** | **$48,000** |

**Additional Costs:**
- Design (UI/UX mockups): $5,000
- QA Testing: $3,000
- Documentation/Tutorials: $2,000
- **Total Development Cost:** $58,000

---

### 12.2 Infrastructure Costs (Monthly)

**Storage (Vercel Blob):**
- Assuming 1,000 users with average storage distribution:
  - Starter (600 users × 3GB avg): 1,800GB
  - Professional (300 users × 15GB avg): 4,500GB
  - Agency (80 users × 60GB avg): 4,800GB
  - Enterprise (20 users × 200GB avg): 4,000GB
  - **Total:** 15,100GB × $0.15/GB = **$2,265/month**

**Bandwidth (Transfer):**
- Estimate 2x storage usage monthly (assets viewed 2x/month avg)
- 30,200GB × $0.15/GB = **$4,530/month**

**Cloudinary (Image Processing):**
- Free tier (25GB transformations)
- Overage: ~10GB/month × $0.18/GB = **$1.80/month**

**Database (Neon PostgreSQL):**
- Current plan already covers this
- Estimate +500MB storage for asset metadata
- **$0 additional** (within existing plan)

**Total Monthly Infrastructure:** $6,797/month

---

### 12.3 Revenue Potential

**Conservative Scenario (Year 1):**
- 1,000 paid users
- Average revenue per user (ARPU): $62/month
- MRR: $62,000
- Infrastructure costs: $6,797/month
- **Gross profit:** $55,203/month
- **Annual gross profit:** $662,436

**Moderate Scenario (Year 2):**
- 3,000 paid users
- ARPU: $75/month (more users on Pro/Agency tiers)
- MRR: $225,000
- Infrastructure costs: $20,000/month
- **Gross profit:** $205,000/month
- **Annual gross profit:** $2,460,000

**Optimistic Scenario (Year 3):**
- 8,000 paid users
- ARPU: $90/month (25% on Agency/Enterprise tiers)
- MRR: $720,000
- Infrastructure costs: $55,000/month
- **Gross profit:** $665,000/month
- **Annual gross profit:** $7,980,000

---

### 12.4 Break-Even Analysis

**Fixed Costs:**
- Development: $58,000 (one-time)
- Monthly infrastructure: $6,797

**Break-Even Point:**
- Need to cover $58,000 development cost
- At $62 ARPU and 95% gross margin: $58.90 gross profit per user/month
- Break-even: $58,000 ÷ $58.90 = **985 user-months**
- With 1,000 users: **Break-even in Month 1** (after launch)
- With 500 users: Break-even in Month 2

**Return on Investment (ROI):**
- **Year 1:** ($662,436 - $58,000) ÷ $58,000 = **1,042% ROI**
- **Year 2:** $2,460,000 ÷ $58,000 = **4,141% ROI**

---

### 12.5 Exit Valuation Estimate

**SaaS Valuation Multiples:**
- Early-stage SaaS: 3-5x ARR
- Growth-stage SaaS: 8-12x ARR
- Mature SaaS: 10-20x ARR (if profitable + growing)

**Valuation Scenarios:**

**Year 1 (Conservative):**
- ARR: $744,000
- Multiple: 4x (early-stage, proving PMF)
- **Valuation:** $2,976,000

**Year 3 (Moderate):**
- ARR: $2,700,000
- Multiple: 8x (strong growth, 3,000 customers)
- **Valuation:** $21,600,000

**Year 5 (Optimistic):**
- ARR: $8,640,000
- Multiple: 10x (profitable, dominant in niche)
- **Valuation:** $86,400,000

**Notes:**
- DAM feature alone won't drive valuation—full platform does
- But DAM increases retention (20-30%), which boosts multiples
- Agencies with DAM stay 2x longer → higher LTV → higher valuation

---

## 13. Competitive Analysis

### 13.1 How Other Agency Tools Handle DAM

| Platform | DAM Approach | Strengths | Weaknesses |
|----------|-------------|-----------|------------|
| **HubSpot** | Built-in file manager with folders, tags | Integrated with CRM, email | Not asset-focused, basic features |
| **Semrush** | No native DAM, recommends Brandfolder integration | N/A | Missing entirely |
| **CoSchedule** | Basic media library for blog posts | Simple, works with calendars | No client folders, no versioning |
| **Loomly** | Asset library for social media posts | Social-first, preview assets | Not designed for long-form content |
| **Monday.com** | File attachments to tasks | Flexible, custom workflows | Manual organization, no CDN |

**AISO Studio's Advantage:**
- Only content marketing platform with DAM built specifically for agencies
- Client-based organization by default (not generic folders)
- Deep integration with blog posts, MOUs, and strategies
- Priced for small/mid agencies, not enterprises

---

### 13.2 Feature Comparison

| Feature | AISO Studio | HubSpot | CoSchedule | Brandfolder |
|---------|-------------|---------|-----------|-------------|
| **Pricing** | $39-$299 | $800+ | $29+ | $500+ |
| **Storage** | 5GB-100GB | 15GB-500GB | 10GB-50GB | 100GB-1TB |
| **Client Folders** | Yes | No | No | Yes |
| **Blog Integration** | Yes | Yes | Yes | No |
| **Client Sharing** | Yes | No | No | Yes |
| **Version History** | Yes | No | No | Yes |
| **Approval Workflows** | Yes (Phase 4) | No | No | Yes |
| **Target Audience** | Agencies (5-50 people) | Enterprise (50+) | Solo/Small teams | Enterprise brands |

**Key Insight:** AISO Studio is the only affordable ($39-$299) platform targeting content marketing agencies specifically.

---

## 14. Risks & Mitigations

### 14.1 Technical Risks

**Risk 1: Storage Costs Exceed Projections**
- **Likelihood:** Medium
- **Impact:** High (reduces margins)
- **Mitigation:**
  - Implement strict file size limits
  - Compress images automatically (reduce 30-50% size)
  - Archive unused assets after 180 days (move to cheaper cold storage)
  - Monitor storage usage weekly and adjust tier limits if needed

**Risk 2: Vercel Blob Outage**
- **Likelihood:** Low
- **Impact:** High (assets unavailable)
- **Mitigation:**
  - Implement Cloudinary as fallback storage provider
  - Cache frequently accessed assets on CDN
  - Display graceful error messages with retry logic
  - SLA monitoring and alerts

**Risk 3: File Upload Abuse (Spam/Malware)**
- **Likelihood:** Medium
- **Impact:** Medium (storage waste, security risk)
- **Mitigation:**
  - Rate limiting (20 uploads/minute)
  - File type validation (server-side MIME check)
  - Virus scanning integration (Phase 2)
  - Monitor for unusual upload patterns (100+ files in 1 hour)

---

### 14.2 Market Risks

**Risk 4: Low Feature Adoption**
- **Likelihood:** Medium
- **Impact:** High (wasted development)
- **Mitigation:**
  - Beta test with 20 agencies before full launch
  - Add onboarding tooltips and tutorials
  - Offer migration service (import from Google Drive/Dropbox)
  - Track adoption metrics weekly and iterate

**Risk 5: Competitors Add DAM Features**
- **Likelihood:** Medium
- **Impact:** Medium (reduced differentiation)
- **Mitigation:**
  - Focus on agency-specific features (client folders, MOU integration)
  - Move fast—launch MVP in 3 months
  - Build network effects (shared asset libraries between agencies)
  - Double down on integrations (blog posts, strategies)

---

### 14.3 Cost Risks

**Risk 6: Users Don't Upgrade for Storage**
- **Likelihood:** Low
- **Impact:** Medium (low revenue)
- **Mitigation:**
  - Make Trial tier very restrictive (1GB) to encourage upgrades
  - Show storage usage prominently (banner at 80%)
  - Offer one-time overage purchases to test willingness to pay
  - A/B test pricing ($39 vs $49 for Starter)

**Risk 7: Infrastructure Costs Spike Unexpectedly**
- **Likelihood:** Low
- **Impact:** Medium
- **Mitigation:**
  - Set billing alerts on Vercel/Cloudinary accounts
  - Implement hard caps on storage per user
  - Negotiate volume discounts with Vercel at 10TB+
  - Consider self-hosted S3 for Enterprise tier

---

## 15. Complexity Rating

### COMPLEXITY: **MEDIUM**

**Justification:**

**Why Not EASY:**
- Requires new database schema (4 tables)
- File upload integration with external storage provider (Vercel Blob)
- Complex UI components (folder tree, asset picker, gallery)
- Security considerations (signed URLs, access control)
- Cross-feature integrations (blog posts, MOUs, branding)

**Why Not COMPLEX:**
- No real-time collaboration features (like Figma)
- No AI/ML features (auto-tagging can be Phase 5)
- Single user type (agencies)—no multi-tenant permissions yet
- Standard CRUD operations for most features
- Existing Next.js + PostgreSQL stack (no new tech)

**Estimated Timeline:**
- MVP (Phases 1-2): **4 weeks** with 1 engineer
- Full Feature Set (Phases 1-4): **9 weeks** with 1 engineer
- Production-Ready (Phases 1-5): **12 weeks** with 1 engineer

**Variables:**
- Vercel Blob integration learning curve (1-2 days)
- Image processing optimization (Cloudinary) (2-3 days)
- Folder tree UI complexity (3-4 days)
- Client sharing security (2-3 days)

**Recommendation:** Start with Phase 1-2 (4 weeks) to validate demand, then decide on Phases 3-4 based on user feedback.

---

## 16. Future Enhancements (Post-MVP)

### Phase 6: AI-Powered Features (Month 6-9)

**Auto-Tagging:**
- Use Claude Vision API to analyze images and auto-generate tags
- Example: Upload photo of lawyer → tags: "professional," "law," "headshot"
- Confidence score shown, user can accept/edit tags

**Smart Asset Recommendations:**
- "You used this logo in 5 blog posts about cybersecurity. Use it again?"
- Suggest assets based on blog post topic/keyword

**Duplicate Detection:**
- Hash-based deduplication (SHA-256)
- Warn user: "This image is identical to 'hero-old.png'—replace or keep both?"

**Color Extraction:**
- Auto-detect brand colors from uploaded logos
- Suggest: "Update your agency primary color to match your logo (#FF5733)?"

---

### Phase 7: Collaboration Features (Month 9-12)

**Comments on Assets:**
- Allow team members to comment on assets
- "This logo needs a higher resolution version"
- Mention teammates with @ to notify

**Asset Approvals:**
- Client approves/rejects assets via email
- Show approval status in DAM
- Only approved assets available for blog posts

**Multi-User Uploads:**
- Team members can upload to shared client folders
- Track who uploaded what
- Permissions: Admin (full control), Editor (upload/edit), Viewer (view only)

---

### Phase 8: Advanced Integrations (Year 2)

**Canva Integration:**
- Edit images in Canva directly from DAM
- Save back to DAM automatically

**Unsplash/Pexels Integration:**
- Search stock photos within DAM
- Download directly to library with attribution

**Google Drive Sync:**
- Two-way sync between DAM and Google Drive folder
- Auto-import client assets from shared Drive folders

**Figma Integration:**
- Import Figma frames as images
- Keep Figma designs synced with DAM

---

### Phase 9: White-Label & Enterprise (Year 2-3)

**Custom Domain:**
- Share assets via agency's own domain: `assets.clientagency.com`

**SSO (Single Sign-On):**
- Enterprise clients can use SAML/OAuth for team access

**API Access:**
- RESTful API for programmatic asset management
- Webhooks for asset events (upload, delete, share)

**On-Premise Storage:**
- Enterprise clients can use their own S3 buckets
- AISO manages metadata, client controls storage

**Unlimited Storage:**
- Enterprise tier with pass-through S3 costs + 40% markup

---

## 17. Open Questions

### Question 1: Should We Support Video Streaming?
- **Context:** Videos are large files. Should we transcode to HLS/DASH for streaming?
- **Options:**
  - Option A: Store videos as-is, users download to view
  - Option B: Use Cloudinary/Mux for video streaming (adds cost)
  - Option C: Video streaming only for Enterprise tier
- **Recommendation:** Option A for MVP, Option C for Phase 6

---

### Question 2: How Aggressive Should Storage Limits Be?
- **Context:** Tight limits drive upgrades but frustrate users.
- **Options:**
  - Option A: Very tight (Trial: 500MB, Starter: 2GB)
  - Option B: Moderate (Trial: 1GB, Starter: 5GB) ← **Current**
  - Option C: Generous (Trial: 2GB, Starter: 10GB)
- **Recommendation:** Option B, adjust after 3 months based on usage data

---

### Question 3: Should We Allow Guest Access (Unlicensed Users)?
- **Context:** Agencies want freelance writers to access assets without paying for extra seats.
- **Options:**
  - Option A: No guest access (every user is a paid seat)
  - Option B: Read-only guest access (view/download only)
  - Option C: Limited guest uploads (5 uploads/month)
- **Recommendation:** Option B for Agency tier, Option A for Starter/Pro

---

### Question 4: What's the Default for Auto-Generated Client Folders?
- **Context:** Should we auto-create folders when strategies are created?
- **Options:**
  - Option A: Always auto-create (may clutter sidebar)
  - Option B: Ask user on first strategy creation
  - Option C: Auto-create only if user uploads assets during strategy setup
- **Recommendation:** Option B (one-time prompt with checkbox "Always do this")

---

## 18. Launch Plan

### Pre-Launch (Weeks 1-2)

**Beta Testing:**
- Invite 20 existing customers (Agency tier)
- Provide early access to Phases 1-2
- Collect feedback via Typeform survey
- Track usage metrics (uploads, searches, time saved)

**Marketing Materials:**
- Create demo video (2 minutes) showing DAM workflow
- Write launch blog post: "Introducing AISO Studio Digital Asset Manager"
- Update pricing page with storage tiers
- Create comparison chart vs. Brandfolder/HubSpot

**Documentation:**
- Write 5 help articles:
  1. Getting Started with DAM
  2. Organizing Assets with Folders
  3. Using Assets in Blog Posts
  4. Sharing Assets with Clients
  5. Managing Storage Limits
- Record 3 tutorial videos (< 3 minutes each)

---

### Launch Day (Week 3)

**Rollout:**
- Enable DAM for all users (Starter+ tiers)
- Show one-time modal: "New Feature: Digital Asset Manager"
- Add banner to dashboard with "Upload Your First Asset" CTA

**Announcements:**
- Email blast to all customers (segmented by tier)
- Social media posts (LinkedIn, Twitter)
- ProductHunt launch (optional)
- Post in relevant communities (Indie Hackers, r/marketing)

**Monitoring:**
- Track error rates (should be < 1%)
- Monitor storage costs vs. projections
- Watch for support tickets (aim for < 10/day)

---

### Post-Launch (Weeks 4-12)

**Week 1-2:**
- Daily check-ins on usage metrics
- Fix critical bugs within 24 hours
- Send follow-up email: "How's the new DAM working for you?"

**Week 3-4:**
- Analyze adoption: % of users who uploaded assets
- Identify drop-off points (where users stop using DAM)
- A/B test onboarding flow improvements

**Month 2:**
- Release Phase 3 features (blog post integration)
- Survey early adopters for Phase 4 priorities
- Write case study featuring 1-2 power users

**Month 3:**
- Review financials: Did storage upgrades happen as projected?
- Adjust pricing if needed (e.g., increase Starter to $49 if demand is high)
- Plan Phase 4 development

---

## 19. Appendix

### Appendix A: Sample User Journey

**Sarah's First Week with DAM:**

**Day 1 (Onboarding):**
1. Sarah upgrades to Professional tier ($99/mo)
2. Sees modal: "Upload your client assets to get organized"
3. Clicks "Get Started" → Upload page
4. Drags 15 client logos from desktop → uploads in 20 seconds
5. AISO auto-detects file names ("acme-corp-logo.png") and suggests tags ("logo," "acme corp")
6. Sarah clicks "Save All"
7. Dashboard shows: "15 assets uploaded. Create folders to organize."

**Day 2 (Organizing):**
1. Sarah clicks "Create Folder" → "Acme Corp Assets"
2. Drags 3 Acme logos into folder
3. Repeats for 4 more clients
4. Sidebar shows folder tree:
   - Acme Corp Assets (3)
   - Beta Industries (2)
   - Gamma LLC (5)
   - Stock Photos (5)

**Day 3 (Using Assets):**
1. Sarah creates blog post for Acme Corp
2. In featured image section, clicks "Choose from Library"
3. Searches "acme" → sees 3 logos
4. Selects "acme-corp-logo.png" → auto-fills URL
5. Publishes post in 30 seconds (vs. 5 minutes before)

**Day 7 (Sharing with Client):**
1. Sarah creates share link for "Acme Corp Assets" folder
2. Sends link to client: `aiso.studio/shared/abc123`
3. Client views assets, downloads 2 logos
4. Sarah gets notification: "Acme Corp downloaded 2 assets"
5. Feedback: "This is so much easier than Dropbox!"

---

### Appendix B: Database Triggers & Automation

**Auto-Update Storage Usage:**
```sql
-- Trigger to update user's storage_used_bytes when assets are uploaded
CREATE OR REPLACE FUNCTION update_user_storage_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE users
    SET storage_used_bytes = storage_used_bytes + NEW.file_size_bytes,
        assets_count = assets_count + 1,
        last_asset_uploaded_at = NOW()
    WHERE id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE users
    SET storage_used_bytes = storage_used_bytes - OLD.file_size_bytes,
        assets_count = assets_count - 1
    WHERE id = OLD.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_storage_usage
AFTER INSERT OR DELETE ON assets
FOR EACH ROW EXECUTE FUNCTION update_user_storage_usage();
```

**Auto-Create Client Folders:**
```sql
-- Trigger to create asset folder when strategy is created
CREATE OR REPLACE FUNCTION auto_create_client_folder()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO asset_folders (user_id, folder_name, client_name, strategy_id)
  VALUES (NEW.user_id, NEW.client_name || ' Assets', NEW.client_name, NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_create_folder
AFTER INSERT ON strategies
FOR EACH ROW EXECUTE FUNCTION auto_create_client_folder();
```

---

### Appendix C: Glossary

- **DAM (Digital Asset Manager):** Software for organizing, storing, and retrieving digital files.
- **Asset:** Any uploaded file (image, video, PDF, document).
- **Folder:** Container for organizing assets (like directories in a file system).
- **Tag:** Keyword associated with an asset for search and filtering.
- **Metadata:** Information about an asset (file size, dimensions, upload date).
- **Version History:** Record of all versions of an asset (when replacements occur).
- **Soft Delete:** Marking an asset as deleted without removing it from storage (reversible).
- **Hard Delete:** Permanently removing an asset from storage (irreversible).
- **Signed URL:** Time-limited URL for secure file access (expires after 1 hour).
- **Share Link:** Public URL for viewing assets without login.
- **CDN (Content Delivery Network):** Network of servers that cache and serve files globally (faster access).
- **Storage Provider:** Service that stores files (Vercel Blob, Cloudinary, S3).
- **Thumbnail:** Small preview version of an image or video.
- **MIME Type:** File format identifier (e.g., `image/png`, `video/mp4`).

---

**END OF DOCUMENT**

---

## Document Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-22 | Product Team | Initial PRD creation |

---

**Next Steps:**
1. Review PRD with engineering team (estimate effort)
2. Review with design team (create UI mockups)
3. Review with customer success (validate with 5 agencies)
4. Prioritize phases based on feedback
5. Begin Phase 1 development (target: 2 weeks)
