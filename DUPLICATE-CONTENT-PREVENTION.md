## Duplicate Content Prevention System

## Overview

This system prevents generating blog posts that are too similar to content already published on your client's website. Duplicate content can harm SEO rankings, so it's critical to check before publishing.

## How It Works

### 3-Layer Duplicate Detection:

**1. Text Similarity (Word Overlap)**
   - Compares word overlap between titles and content
   - Uses Jaccard similarity algorithm
   - Fast, runs first for quick screening
   - Threshold: >70% similarity flagged

**2. Content Excerpt Matching**
   - Compares first 500 characters of generated content
   - Checks against stored excerpts from existing posts
   - Threshold: >60% similarity flagged

**3. AI-Powered Semantic Analysis** (Claude Sonnet 4)
   - Triggered when similarity >50%
   - Understands meaning, not just words
   - Detects if topics/angles are too similar
   - Answers: "Would Google flag this as duplicate?"
   - Most accurate but costs ~$0.001 per check

## Setup Required

### Step 1: Run Database Migration

```bash
psql $DATABASE_URL < migrations/002_add_existing_content_tracking.sql
```

This adds:
- `strategies.existing_blog_urls` - Array of client's blog URLs
- `existing_content` table - Scraped content for comparison
- `posts.similarity_checked` - Whether duplicate check ran
- `posts.similarity_score` - Highest similarity found (0-100)
- `posts.duplicate_warnings` - Array of warning messages

### Step 2: Add Existing Content URLs

For each strategy, you'll need to provide URLs of existing blog posts on the client's website. The system will:
1. Scrape the URLs
2. Extract titles and content excerpts
3. Store them for comparison during generation

## Usage Flow

### Adding Existing Content:

**API Endpoint:**
```
POST /api/strategies/[id]/existing-content
```

**Request Body:**
```json
{
  "urls": [
    "https://clientwebsite.com/blog/post-1",
    "https://clientwebsite.com/blog/post-2",
    "https://clientwebsite.com/blog/post-3"
  ]
}
```

**What Happens:**
1. System scrapes each URL
2. Extracts title and first 500 chars
3. Stores in `existing_content` table
4. Updates strategy's `existing_blog_urls` array

### Content Generation with Duplicate Check:

When generating a blog post, the system automatically:

1. **Generates content** with Claude + Brave Search
2. **Checks for duplicates** against existing content
3. **Scores similarity** (0-100)
4. **Flags warnings** if too similar
5. **Stores results** in post record

**Response includes:**
```json
{
  "duplicateCheck": {
    "checked": true,
    "isDuplicate": false,
    "similarityScore": 25,
    "warnings": [],
    "matchedUrls": []
  }
}
```

## Interpreting Results

### Similarity Scores:

- **0-30%**: ✅ Safe - Very different content
- **31-50%**: ⚠️ Caution - Some overlap, but likely okay
- **51-70%**: ⚠️⚠️ Warning - Significant similarity, review carefully
- **71-100%**: ❌ Duplicate - Too similar, should not publish

### Warning Messages:

```
⚠️ Title very similar to: "Original Title" (85% match)
⚠️ Content similar to: https://example.com/blog/post (65% match)
🤖 AI detected semantic similarity: Topics cover same ground with similar angle
```

## Cost Breakdown

| Operation | Cost | When It Runs |
|-----------|------|-------------|
| **URL Scraping** | Free | When adding existing URLs |
| **Text Similarity** | Free | Every generation |
| **Semantic Check (AI)** | ~$0.001 | Only if similarity >50% |

**Total per post:** $0.00-0.001 (negligible)

## Database Schema

### existing_content table:
```sql
CREATE TABLE existing_content (
  id uuid PRIMARY KEY,
  strategy_id uuid REFERENCES strategies,
  url text NOT NULL,
  title text,
  content_excerpt text,
  scraped_at timestamp,
  created_at timestamp
);
```

### posts table additions:
```sql
ALTER TABLE posts
ADD COLUMN similarity_checked boolean DEFAULT false,
ADD COLUMN similarity_score decimal(5, 2),
ADD COLUMN duplicate_warnings jsonb DEFAULT '[]';
```

## API Endpoints

### 1. Get Existing Content
```
GET /api/strategies/[id]/existing-content
```

Returns all existing content URLs for a strategy.

### 2. Add Existing Content
```
POST /api/strategies/[id]/existing-content
Body: { "urls": ["url1", "url2", ...] }
```

Scrapes and stores existing content.

### 3. Delete Existing Content
```
DELETE /api/strategies/[id]/existing-content?contentId=xxx
```

Removes an existing content entry.

## How to Use (Agency Workflow)

### Initial Setup for New Client:

1. **Get their blog URLs**
   - Ask client for their blog sitemap
   - Or manually list important existing posts

2. **Add to system**
   ```bash
   POST /api/strategies/[strategyId]/existing-content
   {
     "urls": [
       "https://client.com/blog/post1",
       "https://client.com/blog/post2"
     ]
   }
   ```

3. **System automatically**
   - Scrapes all URLs
   - Stores content for comparison
   - Ready for duplicate checking

### During Content Generation:

1. **Generate blog post** (as usual)
2. **System automatically checks** for duplicates
3. **Review results**:
   - Check `similarityScore`
   - Read `warnings` array
   - Inspect `matchedUrls`

4. **Take action**:
   - Score <30%: ✅ Approve for publishing
   - Score 30-70%: ⚠️ Review and maybe edit
   - Score >70%: ❌ Regenerate with different angle

### Updating Existing Content:

When client publishes new posts:
```bash
POST /api/strategies/[strategyId]/existing-content
{
  "urls": ["https://client.com/blog/new-post"]
}
```

System adds it to the comparison database.

## Limitations & Considerations

### Current Limitations:

1. **URL Scraping**
   - May fail on JavaScript-heavy sites
   - Respects robots.txt
   - Rate-limited to avoid blocking

2. **Text Similarity**
   - Basic algorithm (Jaccard)
   - Good for exact matches
   - May miss paraphrasing

3. **Semantic Check**
   - Small cost ($0.001 per check)
   - Only runs when needed
   - Requires ANTHROPIC_API_KEY

### Best Practices:

1. **Add existing content BEFORE generating**
   - System can only check against what it knows
   - Update regularly as client publishes

2. **Review high-similarity posts**
   - Don't auto-reject >70% matches
   - Sometimes legitimate overlap exists
   - Use judgment

3. **Keep URLs updated**
   - Add new published posts
   - Remove deleted/redirected URLs

4. **Monitor warnings**
   - Check duplicate_warnings in post record
   - Address before publishing

## Advanced: Custom Thresholds

Want to adjust sensitivity? Edit thresholds in:
```
lib/duplicate-checker.ts
```

Current thresholds:
- Title similarity: 70% (line ~XX)
- Content similarity: 60% (line ~XX)
- Duplicate flag: 70% (line ~XX)

## Troubleshooting

### "No existing content found"
- Ensure URLs were added via API
- Check `existing_content` table
- Verify `strategy_id` matches

### "Scraping failed"
- URL may be invalid
- Site may block scrapers
- Check console logs for details

### "High false positive rate"
- Lower thresholds in `duplicate-checker.ts`
- Industry-specific vocabulary may trigger matches
- Consider semantic check only

## Future Enhancements

Potential improvements:
- [ ] UI for managing existing URLs
- [ ] Bulk URL import from sitemap
- [ ] Visual diff viewer
- [ ] Auto-regenerate on high similarity
- [ ] Plagiarism detection integration
- [ ] Competitor content tracking
