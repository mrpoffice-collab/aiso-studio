# Image Workflow - Deferred to WordPress Export

**Status**: Active Approach (as of 2025-01-06)

## Overview

Images are **NOT fetched during content generation**. Instead, the system includes image placeholders that will be resolved when exporting/publishing to WordPress.

## Why This Approach?

### Previous Approach (Abandoned):
- Fetched stock images during content generation
- Slowed down generation (extra API calls)
- Less flexible (couldn't use client's own images)
- API keys required upfront

### Current Approach (Active):
- **Faster generation** - No API calls during content creation
- **User control** - Choose between stock photos OR upload custom images
- **Better UX** - Visual image selection at publish time
- **Practical** - Images selected when actually needed

## How It Works

### 1. Content Generation Phase

The AI includes image placeholders in the generated content:

```markdown
## Section Header

[IMAGE PLACEHOLDER: Photo of a family reviewing old photos together]

Content continues here...
```

**Placement Guidelines:**
- 2-4 placeholders per blog post
- After major section headers
- Between paragraphs for visual rhythm
- Descriptive text for easy stock photo matching

### 2. WordPress Export Phase (Future Implementation)

When exporting a post to WordPress, the system will:

1. **Detect image placeholders** in the content
2. **Present options to user:**
   - Upload your own image
   - Search Pexels/Pixabay using placeholder description
   - Skip (remove placeholder)
3. **Fetch/upload images** based on user selection
4. **Replace placeholders** with actual WordPress media URLs
5. **Export to WordPress** with images embedded

## Implementation Plan

### Phase 1: Placeholders (✅ Complete)
- [x] Add image placeholder instructions to content generation prompt
- [x] Remove stock image API calls from generation route
- [x] Update function signature to remove stockImages parameter

### Phase 2: WordPress Export UI (Future)
- [ ] Create image selection interface in export flow
- [ ] Integrate Pexels/Pixabay search when user clicks placeholder
- [ ] Add upload capability for custom images
- [ ] Show preview before export

### Phase 3: WordPress Integration (Future)
- [ ] Upload images to WordPress media library
- [ ] Get WordPress media URLs
- [ ] Replace placeholders with `<img>` tags or markdown
- [ ] Handle image optimization/resizing

## Technical Details

### Image Placeholder Format

```
[IMAGE PLACEHOLDER: {description}]
```

Examples:
- `[IMAGE PLACEHOLDER: Family looking at old photo album]`
- `[IMAGE PLACEHOLDER: Close-up of hands writing in memorial book]`
- `[IMAGE PLACEHOLDER: Digital photo frame displaying family photos]`

### Stock Photo API Integration

The `lib/image-api.ts` module is available for the export phase:

**Functions:**
- `searchStockImages(query, count)` - Search with Pexels → Pixabay fallback
- `getImagesForTopic(title, keyword, count)` - Topic-aware search

**API Keys Required** (only for export phase):
- `PEXELS_API_KEY` - Free tier: 200 requests/hour
- `PIXABAY_API_KEY` - Free tier: 100 requests/minute

## Benefits

1. **Performance**: Content generation remains fast (~2 minutes)
2. **Flexibility**: Users can use their own branded images
3. **Cost**: No API calls until images are actually needed
4. **Quality**: Visual selection ensures images match content
5. **Control**: User reviews images before publishing

## Related Files

- `lib/image-api.ts` - Stock photo API integration (available for export)
- `lib/content.ts` - Content generation with placeholder instructions
- `app/api/topics/[id]/generate/route.ts` - Generation route (no image fetching)

## Next Steps

When ready to implement WordPress export:
1. Review `WORDPRESS-INTEGRATION-PLAN.md` (if exists)
2. Create export UI with image selection
3. Integrate `lib/image-api.ts` for stock photo search
4. Add upload functionality for custom images
5. Handle WordPress media library upload
6. Test end-to-end workflow
