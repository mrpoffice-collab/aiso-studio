# Digital Assets Feature - Roadmap Item

## Current Status: Removed Website Image Suggestions

**Date**: 2025-01-06
**Decision**: Removed the website image suggestion feature that pulled images from client websites during audits.

### Why Removed?

1. **Scalability Issues**: Client websites may not have enough images
2. **Copyright Concerns**: Images on client sites may be licensed only for their use
3. **Dependency Risk**: Relies on client site being accessible
4. **Not Value-Add**: Doesn't provide unique value to the client

### Current Solution: Stock Photo APIs

The system currently uses Claude's built-in knowledge to suggest:
- Unsplash links (free, high-quality stock photos)
- Pexels (via their API when implemented)
- Pixabay (via their API when implemented)

## Future Feature: Digital Assets Library

### Concept
Create a separate resource/library system for managing digital assets that can be used across multiple strategies and clients.

### Features to Consider

1. **Asset Library Management**
   - Upload and organize images, videos, infographics
   - Tag assets by category, industry, topic
   - Store metadata (alt text, usage rights, dimensions)

2. **Stock Photo API Integration**
   - **Pexels API**: Free tier available, 200 requests/hour
   - **Pixabay API**: Free tier available, 100 requests/minute
   - **Unsplash API**: Free tier available, 50 requests/hour
   - Cache popular images locally to save API calls

3. **AI-Powered Asset Selection**
   - Analyze content topic and suggest relevant images
   - Match images to article sections automatically
   - Generate alt text for accessibility

4. **Client-Specific Assets**
   - Allow clients to upload branded images
   - Store logos, product photos, team photos
   - Organize by client/project

5. **Usage Tracking**
   - Track which assets are used in which posts
   - Prevent overuse of same images
   - Monitor API usage and costs

### Implementation Priority

**Phase 1** (MVP - Current):
- ✅ Use Claude's knowledge of Unsplash for image suggestions
- ⏳ Integrate Pexels API for automated stock photo retrieval
- ⏳ Integrate Pixabay API as backup source

**Phase 2** (Enhanced):
- Upload system for client-specific assets
- Asset library UI with tagging and search
- Basic asset management (CRUD operations)

**Phase 3** (Advanced):
- AI-powered asset selection based on content
- Automatic alt text generation
- Usage analytics and reporting
- Image optimization and CDN integration

### API Integration Details

#### Pexels API
```typescript
// Example implementation
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

async function searchPexelsImages(query: string, perPage: number = 5) {
  const response = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}`,
    {
      headers: { Authorization: PEXELS_API_KEY }
    }
  );
  const data = await response.json();
  return data.photos.map(photo => ({
    url: photo.src.large,
    thumbnail: photo.src.medium,
    photographer: photo.photographer,
    alt_text: query
  }));
}
```

#### Pixabay API
```typescript
// Example implementation
const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY;

async function searchPixabayImages(query: string, perPage: number = 5) {
  const response = await fetch(
    `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&image_type=photo&per_page=${perPage}`
  );
  const data = await response.json();
  return data.hits.map(image => ({
    url: image.largeImageURL,
    thumbnail: image.webformatURL,
    photographer: image.user,
    alt_text: query
  }));
}
```

### Cost Considerations

- **Free Tiers Available**: All three APIs (Pexels, Pixabay, Unsplash) offer generous free tiers
- **Caching Strategy**: Cache popular images to reduce API calls
- **Rate Limiting**: Implement rate limiting to stay within free tier limits
- **Fallback Chain**: Pexels → Pixabay → Unsplash to maximize availability

### Discussion Points for Investor/User

1. Should we build a full asset library or just integrate stock photo APIs?
2. What level of asset management is needed for the MVP?
3. Should clients be able to upload their own branded images?
4. How important is AI-powered asset selection vs. manual selection?
5. What's the budget for image API usage if we exceed free tiers?

## Action Items

- [ ] Review this roadmap with investor/user
- [ ] Prioritize Phase 1 vs Phase 2 features
- [ ] Decide on API integration approach
- [ ] Plan database schema for asset library (if needed)
- [ ] Estimate development time and costs
