# Product Requirements Document: Agency Branding System

**Version:** 1.0
**Last Updated:** 2025-01-21
**Status:** Planning

---

## 1. Executive Summary

### Problem Statement
The current MOU generation system produces generic, non-branded proposals that don't reflect the agency's identity. Agencies need professionally branded documents that include their logo, colors, and company information to present to clients.

### Solution
Implement a comprehensive agency branding system that:
- Collects branding information during signup and stores it in the database
- Allows users to update their branding in account settings
- Applies branding to all MOU documents automatically
- Enhances the MOU UI with branded colors and styling

### Business Value
- **Professional Presentation**: Agencies can deliver branded proposals without manual editing
- **Time Savings**: Eliminates need to manually brand each MOU in external tools
- **Competitive Advantage**: White-label capability makes the product more appealing to agencies
- **Higher Conversion**: Professionally branded MOUs increase client conversion rates

---

## 2. Current State vs. Desired State

### Current State
- **Database**: Users table has `agency_name` field only
- **Signup**: Basic Clerk authentication, minimal user info collected
- **MOU Generation**: Generic template with placeholder text like "the agency" and "the client"
- **MOU UI**: Standard purple/blue gradient styling, no personalization
- **Download**: Plain text file with no branding

### Desired State
- **Database**: Extended user profile with comprehensive branding data
- **Signup**: Optional branding collection step after initial account creation
- **Settings**: Dedicated branding management page for updates
- **MOU Generation**: Fully branded document with agency name, logo, colors, and contact info
- **MOU UI**: Dynamically styled based on agency brand colors
- **Download**: Professionally formatted document with branding

---

## 3. Database Schema Changes

### 3.1 Migration: Add Branding Fields to Users Table

Create migration file: `migrations/add-agency-branding.sql`

```sql
-- Add branding fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS agency_logo_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS agency_primary_color VARCHAR(7) DEFAULT '#6366f1'; -- Default indigo
ALTER TABLE users ADD COLUMN IF NOT EXISTS agency_secondary_color VARCHAR(7) DEFAULT '#3b82f6'; -- Default blue
ALTER TABLE users ADD COLUMN IF NOT EXISTS agency_email TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS agency_phone VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS agency_website TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS agency_address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS agency_tagline TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);

-- Add comment for documentation
COMMENT ON COLUMN users.agency_logo_url IS 'URL to agency logo (uploaded to cloud storage)';
COMMENT ON COLUMN users.agency_primary_color IS 'Hex color code for primary brand color';
COMMENT ON COLUMN users.agency_secondary_color IS 'Hex color code for secondary brand color';
```

### 3.2 Data Structure

```typescript
interface AgencyBranding {
  agency_name: string;           // Already exists
  agency_logo_url?: string;      // Cloud storage URL (Cloudinary, S3, etc.)
  agency_primary_color: string;  // Hex color (e.g., "#6366f1")
  agency_secondary_color: string; // Hex color (e.g., "#3b82f6")
  agency_email?: string;         // Contact email
  agency_phone?: string;         // Contact phone
  agency_website?: string;       // Agency website URL
  agency_address?: string;       // Physical address (optional)
  agency_tagline?: string;       // Tagline/slogan (optional)
}
```

---

## 4. User Flows

### 4.1 Signup Flow Enhancement

**Current Flow:**
1. User signs up with Clerk
2. Redirected to dashboard immediately

**Enhanced Flow:**
1. User signs up with Clerk
2. **[NEW]** Redirect to `/onboarding/branding` (optional step)
3. Show branding collection form with:
   - Agency name (required)
   - Logo upload (optional, can skip)
   - Primary color picker (optional, defaults to current theme)
   - Secondary color picker (optional, defaults to current theme)
   - Contact info fields (optional)
   - "Skip for now" button (saves just agency name, other fields default)
   - "Save and Continue" button
4. On save or skip, create user record in database
5. Redirect to dashboard

**Implementation Notes:**
- Make this step optional but encouraged
- Use a progress indicator showing "Step 2 of 2" or similar
- Save partial data if user abandons midway
- Allow "Skip for now" to reduce friction

### 4.2 Settings Page for Branding Updates

Create new page: `/dashboard/settings/branding`

**Features:**
- View current branding settings
- Upload/replace logo with preview
- Color pickers for primary and secondary colors with live preview
- Edit all contact information fields
- Save/Cancel buttons
- Success confirmation message
- Preview of how MOU will look with current branding

**UI Layout:**
```
┌─────────────────────────────────────────┐
│  Agency Branding                        │
│  ─────────────────────────────────────  │
│                                         │
│  Logo                                   │
│  [Current Logo Preview or Upload Area] │
│  [Upload New Logo Button]               │
│                                         │
│  Brand Colors                           │
│  Primary Color:   [Color Picker] #6366f1│
│  Secondary Color: [Color Picker] #3b82f6│
│  [Preview Button - Show Sample MOU]     │
│                                         │
│  Company Information                    │
│  Agency Name:    [Input Field]          │
│  Email:          [Input Field]          │
│  Phone:          [Input Field]          │
│  Website:        [Input Field]          │
│  Address:        [Textarea]             │
│  Tagline:        [Input Field]          │
│                                         │
│  [Cancel] [Save Branding]               │
└─────────────────────────────────────────┘
```

---

## 5. MOU Enhancement Specifications

### 5.1 MOU Content Changes

**Current Prompt Issues:**
- Generic "PARTIES section identifying the agency and client"
- No agency branding details included

**Enhanced Prompt:**
```typescript
const prompt = `You are a professional proposal writer. Generate a branded MOU document.

AGENCY INFORMATION:
- Agency Name: ${user.agency_name || 'Your Agency Name'}
- Email: ${user.agency_email || '[Agency Email]'}
- Phone: ${user.agency_phone || '[Agency Phone]'}
- Website: ${user.agency_website || '[Agency Website]'}
- Address: ${user.agency_address || '[Agency Address]'}
${user.agency_tagline ? `- Tagline: "${user.agency_tagline}"` : ''}

CLIENT INFORMATION:
- Client Name: ${data.clientName}
- Industry: ${data.industry}
...

Generate a professional MOU with:
1. HEADER:
   - "MEMORANDUM OF UNDERSTANDING"
   - ${user.agency_tagline ? `Agency tagline: "${user.agency_tagline}"` : ''}
   - Current date

2. PARTIES:
   - BETWEEN: ${user.agency_name} ("Agency")
     ${user.agency_address}
     Email: ${user.agency_email}
     Phone: ${user.agency_phone}
   - AND: ${data.clientName} ("Client")

...
```

### 5.2 MOU UI Enhancements

**Dynamic Styling Based on Brand Colors:**

```typescript
// In app/dashboard/strategies/[id]/mou/page.tsx
const [brandColors, setBrandColors] = useState({
  primary: '#6366f1',  // Default
  secondary: '#3b82f6' // Default
});

useEffect(() => {
  // Fetch user branding on mount
  fetchUserBranding();
}, []);

const fetchUserBranding = async () => {
  const response = await fetch('/api/user/branding');
  const data = await response.json();
  if (data.success) {
    setBrandColors({
      primary: data.agency_primary_color,
      secondary: data.agency_secondary_color,
    });
  }
};

// Apply to gradient classes dynamically
<div
  className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl"
  style={{
    background: `linear-gradient(to bottom right,
      ${brandColors.primary}10,
      white,
      ${brandColors.secondary}10)`
  }}
>
```

**Logo Display:**
- Show agency logo in header of MOU page (if uploaded)
- Include in downloaded MOU document (if format supports it)

### 5.3 Download Format Enhancement

**Current:** Plain text (.txt)

**Enhanced Options:**
1. **Text with branding** (.txt) - Include ASCII logo/header
2. **PDF** (Future Phase 2) - Fully branded PDF with logo, colors
3. **DOCX** (Future Phase 3) - Editable Word document

---

## 6. API Endpoints

### 6.1 New Endpoints

**GET `/api/user/branding`**
- Returns current user's branding settings
- Used for UI customization and MOU generation

**POST `/api/user/branding`**
- Updates user branding settings
- Validates color codes, URLs, etc.
- Used by settings page and onboarding

**POST `/api/user/branding/logo`**
- Handles logo upload
- Integrates with cloud storage (Cloudinary recommended)
- Returns logo URL for storage in database

### 6.2 Modified Endpoints

**POST `/api/strategies/[id]/mou`**
- Fetch user branding data before generating MOU
- Pass branding to `generateMOU()` function
- Include branding in response for UI styling

---

## 7. File Upload Strategy

### Logo Upload Options

**Option 1: Cloudinary (Recommended)**
- Pros: Free tier, image optimization, CDN, transformations
- Cons: External dependency
- Implementation: Next.js API route → Cloudinary upload → Store URL

**Option 2: Vercel Blob Storage**
- Pros: Same platform, simple integration
- Cons: Paid service
- Implementation: Direct upload to Vercel Blob → Store URL

**Option 3: AWS S3**
- Pros: Industry standard, reliable
- Cons: More complex setup, additional cost
- Implementation: API route → S3 upload → Store URL

**Recommendation:** Start with Cloudinary for MVP, migrate to Vercel Blob if needed later.

---

## 8. Implementation Phases

### Phase 1: Database & Core Infrastructure (Week 1)
- [ ] Create and run migration to add branding fields
- [ ] Add branding fetch/update functions to `lib/db.ts`
- [ ] Create `/api/user/branding` GET endpoint
- [ ] Create `/api/user/branding` POST endpoint
- [ ] Set up Cloudinary account and integration

### Phase 2: Settings Page (Week 1-2)
- [ ] Create `/dashboard/settings/branding` page
- [ ] Build logo upload component
- [ ] Add color picker components
- [ ] Implement save functionality
- [ ] Add preview capability

### Phase 3: Onboarding Enhancement (Week 2)
- [ ] Create `/onboarding/branding` page
- [ ] Integrate into signup flow
- [ ] Add skip functionality
- [ ] Update user creation logic

### Phase 4: MOU Integration (Week 2-3)
- [ ] Update `lib/mou.ts` prompt with branding data
- [ ] Modify MOU API to fetch and include branding
- [ ] Update MOU UI page to use brand colors
- [ ] Add logo display to MOU page
- [ ] Enhance downloaded MOU with branding

### Phase 5: Testing & Polish (Week 3)
- [ ] Test with various logo sizes and formats
- [ ] Test color contrast and accessibility
- [ ] Test MOU generation with all branding fields
- [ ] Test with missing/optional fields
- [ ] Polish UI/UX based on testing

---

## 9. Design Specifications

### Color Picker Component
- Use `react-colorful` or similar library
- Show color preview swatch
- Validate hex codes
- Provide color presets for common brand colors
- Show contrast checker for accessibility

### Logo Upload Component
- Drag-and-drop support
- File type validation (PNG, JPG, SVG)
- Size validation (max 2MB recommended)
- Image preview before upload
- Crop/resize option (optional for Phase 2)
- Clear/remove uploaded logo option

### Brand Color Application Areas
1. MOU page gradients and accents
2. Button hover states (optional)
3. Progress indicators
4. Success/confirmation messages (optional)
5. Section headers in MOU document

---

## 10. Edge Cases & Validation

### Validation Rules
- **Agency Name:** Required, 2-100 characters
- **Logo:** Optional, PNG/JPG/SVG, max 2MB, min 100x100px recommended
- **Colors:** Valid hex codes (#RRGGBB), contrast check against white backgrounds
- **Email:** Valid email format
- **Phone:** Optional, flexible format (international support)
- **Website:** Valid URL format
- **Address:** Optional, max 500 characters
- **Tagline:** Optional, max 100 characters

### Fallback Behavior
- **No logo:** Use agency name as text header
- **No colors:** Use default purple/blue theme
- **No contact info:** Use placeholders in MOU with note to update
- **Partial branding:** Use available fields, fill rest with defaults

---

## 11. Success Metrics

### User Adoption
- % of users who complete branding setup during onboarding
- % of users who update branding in settings
- % of users who upload logos

### Feature Usage
- Number of branded MOUs generated per week
- User satisfaction survey: "How professional does the MOU look?"
- Support tickets related to MOU branding (should decrease)

### Business Impact
- Client conversion rate for agencies using branded MOUs
- User retention for agencies with complete branding vs. without
- Premium feature consideration for future pricing tiers

---

## 12. Future Enhancements (Post-MVP)

### Phase 6: Advanced Features
- **PDF Export:** Generate fully branded PDFs with logo and colors
- **Email Templates:** Branded email templates for sending MOUs
- **Multiple Brands:** Allow agencies to manage multiple brand profiles (for sub-brands)
- **Brand Kit Library:** Pre-made color schemes and templates
- **Client Portal Branding:** White-label the entire dashboard (Premium feature)
- **Custom Fonts:** Allow agencies to upload custom font files
- **Watermarks:** Add agency watermark to generated content (optional)

---

## 13. Technical Dependencies

### Required Packages
```json
{
  "cloudinary": "^1.41.0",           // Logo upload
  "react-colorful": "^5.6.1",        // Color picker
  "react-dropzone": "^14.2.3",       // File upload
  "@types/react-color": "^3.0.9"    // Type definitions
}
```

### Environment Variables
```env
# Cloudinary configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Or Vercel Blob (alternative)
BLOB_READ_WRITE_TOKEN=your-token
```

---

## 14. Migration Plan

### Database Migration Steps
1. Create migration file in `migrations/add-agency-branding.sql`
2. Test migration locally
3. Review migration in staging
4. Run migration in production via `/api/migrate?secret=...`
5. Verify all new columns exist
6. Monitor for errors in first 24 hours

### User Communication
- **Email announcement:** "New Feature: Brand Your Proposals"
- **In-app notification:** Prompt to complete branding setup
- **Help documentation:** Create guide for branding setup
- **Demo video:** Short video showing how to set up branding

---

## 15. Open Questions

1. **Logo position in MOU:**
   - Top-left corner?
   - Centered header?
   - Footer watermark?
   - **Decision needed:** User preference?

2. **Color usage intensity:**
   - Full backgrounds or just accents?
   - Ensure readability with all color combinations
   - **Decision needed:** Design review required

3. **Branding required vs. optional:**
   - Should we require branding before MOU generation?
   - Or allow generic MOUs with a banner encouraging branding setup?
   - **Decision needed:** Product decision

4. **Premium feature consideration:**
   - Should advanced branding be a paid feature?
   - Which elements should be free vs. premium?
   - **Decision needed:** Business strategy discussion

---

## Appendix A: Database Schema Visualization

```
users table (before)
├── id (uuid)
├── clerk_id (text)
├── email (text)
├── name (text)
├── agency_name (text)
├── timezone (text)
├── created_at (timestamp)
└── updated_at (timestamp)

users table (after)
├── id (uuid)
├── clerk_id (text)
├── email (text)
├── name (text)
├── agency_name (text)
├── agency_logo_url (text)              ← NEW
├── agency_primary_color (varchar(7))   ← NEW
├── agency_secondary_color (varchar(7)) ← NEW
├── agency_email (text)                 ← NEW
├── agency_phone (varchar(20))          ← NEW
├── agency_website (text)               ← NEW
├── agency_address (text)               ← NEW
├── agency_tagline (text)               ← NEW
├── timezone (text)
├── created_at (timestamp)
└── updated_at (timestamp)
```

---

## Appendix B: Example MOU Header (Before & After)

### Before (Generic)
```
MEMORANDUM OF UNDERSTANDING

Date: January 21, 2025

BETWEEN:
    The Agency ("Agency")
    [Agency Address]

AND:
    Acme Corp ("Client")
    [Client Address]
```

### After (Branded)
```
[AGENCY LOGO]

MEMORANDUM OF UNDERSTANDING
"Your Content Marketing Partner"

Date: January 21, 2025

BETWEEN:
    Content Command Agency ("Agency")
    123 Marketing Street, Suite 400
    New York, NY 10001
    Email: hello@contentcommand.com
    Phone: (555) 123-4567
    Web: www.contentcommand.com

AND:
    Acme Corp ("Client")
    [Client Address]
```

---

**END OF DOCUMENT**
