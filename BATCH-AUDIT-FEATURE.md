# Batch Content Audit Feature

## Overview

The Batch Content Audit feature allows you to analyze multiple blog posts at once from a blog URL (like `https://fireflygrove.app/blog`). Instead of auditing one post at a time, you can:

1. **Discover** all blog posts from a blog index URL
2. **Audit** up to 50 posts in one batch (configurable limit)
3. **View summary statistics** showing overall quality across all posts
4. **See a table** with scores for each post
5. **Rewrite** individual low-scoring posts directly from the table

---

## How It Works

### Step 1: Discovery

Enter a blog URL (e.g., `https://example.com/blog`) and the system will automatically discover blog posts using three strategies:

1. **Sitemap.xml** - Parses the XML sitemap for blog post URLs
2. **HTML scraping** - Scans the blog index page for post links
3. **RSS/Atom feeds** - Reads RSS or Atom feeds

The discovery returns:
- Post URL
- Post title
- Excerpt (if available)
- Published date (if available from RSS)

### Step 2: Batch Audit

Once posts are discovered, click "Audit All Posts" to analyze them. The system:

- Scrapes content from each URL (converts HTML → Markdown)
- Scores each post on **SEO, Readability, and Engagement**
- Skips fact-checking to save cost/time (batch audits use lighter scoring)
- Returns results with overall scores

**Cost**: ~$0.01 per post (compared to $0.03 for full single-post audit with fact-checking)

### Step 3: View Results

After auditing, you see:

**Summary Statistics**:
- Average score across all posts
- Score distribution: Excellent (85+), Good (75-84), Needs Work (<75)
- Total cost
- Success rate

**Results Table**:
- Post title with link
- Overall score
- SEO score
- Readability score
- Engagement score
- Word count
- Action button (Rewrite for scores <75)

---

## Scoring Details

### Single Post Audit (Full)
**Used when**: Auditing one post at a time
**Includes**: Fact-checking + SEO + Readability + Engagement
**Cost**: $0.03 per post
**Overall Score Formula**:
- Fact-check: 40%
- SEO: 20%
- Readability: 20%
- Engagement: 20%

### Batch Audit (Quick)
**Used when**: Auditing multiple posts at once
**Includes**: SEO + Readability + Engagement (no fact-checking)
**Cost**: $0.01 per post
**Overall Score Formula**:
- SEO: 35%
- Readability: 30%
- Engagement: 35%

---

## Usage Examples

### Example 1: Audit Last 24 Blog Posts

```
1. Go to /dashboard/audit/batch
2. Enter: https://fireflygrove.app/blog
3. Set limit: 24
4. Click "Discover Blog Posts"
5. Review discovered posts
6. Click "Audit All Posts"
7. Wait ~30 seconds for results
8. Review summary and table
9. Click "Rewrite" for any post scoring <75
```

**Cost**: 24 posts × $0.01 = $0.24

### Example 2: Competitive Analysis

```
1. Enter competitor blog URL
2. Set limit: 10
3. Discover and audit
4. See average score and distribution
5. Identify content gaps and opportunities
```

---

## API Endpoints

### POST /api/audit/discover
**Purpose**: Discover blog posts from a blog URL

**Request**:
```json
{
  "blogUrl": "https://example.com/blog",
  "limit": 24
}
```

**Response**:
```json
{
  "success": true,
  "posts": [
    {
      "url": "https://example.com/blog/post-1",
      "title": "Blog Post Title",
      "excerpt": "Short excerpt...",
      "publishedDate": "2025-01-01"
    }
  ],
  "total": 24
}
```

### POST /api/audit/batch
**Purpose**: Audit multiple blog posts

**Request**:
```json
{
  "urls": [
    "https://example.com/blog/post-1",
    "https://example.com/blog/post-2"
  ]
}
```

**Response**:
```json
{
  "success": true,
  "results": [
    {
      "url": "https://example.com/blog/post-1",
      "title": "Post Title",
      "overallScore": 82,
      "seoScore": 75,
      "readabilityScore": 88,
      "engagementScore": 85,
      "wordCount": 1500,
      "success": true
    }
  ],
  "summary": {
    "total": 2,
    "successful": 2,
    "failed": 0,
    "avgScore": 82,
    "scoreDistribution": {
      "excellent": 1,
      "good": 1,
      "needsImprovement": 0
    },
    "totalCost": 0.02
  }
}
```

---

## Limitations

1. **Max posts per batch**: 50 (configurable via limit parameter)
2. **No fact-checking in batch mode**: To keep costs low, batch audits skip fact-checking
3. **Discovery depends on site structure**: If a blog doesn't have a sitemap, RSS feed, or standard HTML structure, discovery may fail
4. **Timeout risk**: Very large batches (50 posts) may timeout depending on server response times

---

## Cost Comparison

| Operation | Single Post | Batch (24 posts) |
|-----------|------------|------------------|
| Full Audit (with fact-checking) | $0.03 | - |
| Quick Audit (no fact-checking) | - | $0.24 |
| Per Post Cost | $0.03 | $0.01 |
| **Savings** | - | **67% cheaper** |

---

## UI Navigation

- **Single Post Audit**: `/dashboard/audit`
- **Batch Audit**: `/dashboard/audit/batch`
- **Rewrite from batch**: Clicking "Rewrite" in table → redirects to single audit with URL pre-filled

---

## Future Enhancements (Not Yet Implemented)

**Phase 4 Ideas**:
- Export results to CSV/PDF
- Schedule recurring audits
- Email reports
- Historical tracking (compare audits over time)
- Competitive benchmarking
- Content calendar integration
- Batch rewrite (rewrite multiple posts at once)

---

## Technical Notes

### HTML → Markdown Conversion

Both single and batch audits convert HTML to Markdown format to preserve:
- Headers: `<h2>` → `## Heading`
- Images: `<img>` → `![alt](src)`
- Links: `<a>` → `[text](url)`
- Lists: `<ul>` → `- item`
- Emphasis: `<strong>` → `**text**`

This ensures scoring algorithms can detect structural elements.

### Discovery Strategy Order

1. Try sitemap.xml first (fastest, most reliable)
2. Fall back to HTML scraping (slower, pattern-dependent)
3. Try RSS/Atom feeds (may have limited posts)

### Rate Limiting

Currently no rate limiting is implemented. For production:
- Consider adding delays between URL fetches
- Implement queueing for very large batches
- Add progress indicators for long-running batches

---

**Last Updated**: 2025-01-03
**Version**: 1.0 (Initial Release)
