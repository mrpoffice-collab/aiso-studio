# WordPress Integration Plan

## Overview
Enable agencies to publish approved posts directly to their clients' WordPress sites.

## Strategy-Level Configuration

### Database Schema Changes
Add to `strategies` table:
```sql
ALTER TABLE strategies ADD COLUMN wordpress_enabled boolean DEFAULT false;
ALTER TABLE strategies ADD COLUMN wordpress_url text;
ALTER TABLE strategies ADD COLUMN wordpress_username text;
ALTER TABLE strategies ADD COLUMN wordpress_app_password text; -- Encrypted
ALTER TABLE strategies ADD COLUMN wordpress_category_id integer;
ALTER TABLE strategies ADD COLUMN wordpress_author_id integer;
ALTER TABLE strategies ADD COLUMN wordpress_auto_publish boolean DEFAULT false; -- Draft vs Publish
```

### Strategy Edit Page Enhancement
Add "WordPress Integration" section to strategy settings:

```typescript
// Strategy Settings > WordPress Integration
{
  wordpress_enabled: boolean,
  wordpress_url: string,          // e.g., "https://clientsite.com"
  wordpress_username: string,      // WordPress admin username
  wordpress_app_password: string,  // WordPress Application Password (encrypted)
  wordpress_category_id: number,   // Default category for posts
  wordpress_author_id: number,     // Author to assign posts to
  wordpress_auto_publish: boolean  // true = Publish, false = Draft
}
```

### Security Considerations
- **NEVER store plain WordPress passwords**
- Use WordPress Application Passwords (built into WP 5.6+)
- Encrypt credentials in database
- Use environment variable for encryption key
- Test connection before saving

## Post Publishing Flow

### UI Changes (Post Detail Page)
When post is approved AND strategy has WordPress enabled:

```
✅ Post Approved - Ready to Export

[Copy] [Markdown] [HTML] [📤 Publish to WordPress]
```

### Publish to WordPress Button
```typescript
async function handlePublishToWordPress() {
  // 1. Get strategy WordPress settings
  const strategy = await db.getStrategyById(topic.strategy_id);

  // 2. Prepare WordPress post data
  const wpPost = {
    title: post.title,
    content: convertMarkdownToWPBlocks(post.content), // Gutenberg blocks
    excerpt: post.meta_description,
    status: strategy.wordpress_auto_publish ? 'publish' : 'draft',
    categories: [strategy.wordpress_category_id],
    author: strategy.wordpress_author_id,
    meta: {
      _yoast_wpseo_title: post.title,
      _yoast_wpseo_metadesc: post.meta_description,
    }
  };

  // 3. Publish via WordPress REST API
  const response = await fetch(`${strategy.wordpress_url}/wp-json/wp/v2/posts`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`${strategy.wordpress_username}:${decrypted_app_password}`)}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(wpPost)
  });

  // 4. Store WordPress post ID in database
  await db.updatePost(post.id, {
    wordpress_post_id: wpPostId,
    wordpress_published_at: new Date(),
    status: 'published'
  });
}
```

### Post Status Workflow
```
draft → approved → published
```

- **draft**: Generated content, being reviewed
- **approved**: Ready for export/publishing
- **published**: Posted to WordPress (or exported)

## WordPress REST API Integration

### Required WordPress Plugins (Client Side)
- WordPress 5.6+ (Application Passwords built-in)
- Yoast SEO (optional, for meta tags)

### Connection Test Feature
Add "Test Connection" button in strategy settings:
```typescript
async function testWordPressConnection(strategy) {
  // Test authentication
  const response = await fetch(`${strategy.wordpress_url}/wp-json/wp/v2/users/me`, {
    headers: {
      'Authorization': `Basic ${credentials}`
    }
  });

  if (response.ok) {
    // Verify categories and authors exist
    // Show success message
  } else {
    // Show error with troubleshooting steps
  }
}
```

## Markdown to WordPress Conversion

### Gutenberg Blocks Format
Convert markdown to WordPress Gutenberg blocks:

```typescript
function convertMarkdownToWPBlocks(markdown: string): string {
  // Convert:
  // ## Heading → <!-- wp:heading -->
  // **bold** → <!-- wp:paragraph -->
  // ![image] → <!-- wp:image -->
  // [link] → <!-- wp:paragraph --> with <a>

  // Or use WordPress Classic Editor (simpler):
  return convertMarkdownToHTML(markdown);
}
```

## Database Updates

### Migration Script
```sql
-- Add WordPress fields to strategies table
ALTER TABLE strategies
  ADD COLUMN wordpress_enabled boolean DEFAULT false,
  ADD COLUMN wordpress_url text,
  ADD COLUMN wordpress_username text,
  ADD COLUMN wordpress_app_password text,
  ADD COLUMN wordpress_category_id integer,
  ADD COLUMN wordpress_author_id integer,
  ADD COLUMN wordpress_auto_publish boolean DEFAULT false;

-- Add WordPress tracking to posts
ALTER TABLE posts
  ADD COLUMN wordpress_post_id integer,
  ADD COLUMN wordpress_published_at timestamp with time zone;

-- Update status check constraint to include 'published'
ALTER TABLE posts
  DROP CONSTRAINT IF EXISTS posts_status_check;

ALTER TABLE posts
  ADD CONSTRAINT posts_status_check
  CHECK (status IN ('draft', 'approved', 'published'));
```

## UI/UX Flow

### 1. Strategy Settings (One-time Setup)
```
Strategy Settings > WordPress Integration

[ ] Enable WordPress Publishing

WordPress Site URL: https://clientsite.com
Username: admin
Application Password: [Generate in WordPress]
                     [Test Connection]

Default Category: [Select...] | Blogging
Default Author:   [Select...] | John Doe
Publish Status:   (*) Draft  ( ) Publish Immediately

[Save Settings]
```

### 2. Post Detail Page (After Approval)
```
✅ Post Approved - Ready to Export

[Copy] [Markdown] [HTML] [📤 Publish to WordPress]

Note: Will publish as DRAFT to "Blogging" category
```

### 3. After Publishing
```
✅ Published to WordPress!

View on WordPress: https://clientsite.com/wp-admin/post.php?post=123&action=edit
Status: Draft (ready for client review)

[Copy] [Markdown] [HTML] [View on WordPress]
```

## Error Handling

### Common Issues & Solutions
1. **Invalid credentials**: Show link to create Application Password
2. **Category not found**: Let user select from available categories
3. **Network error**: Retry with exponential backoff
4. **SSL certificate issues**: Show warning, allow bypass (with user confirmation)

## Security Best Practices

1. **Encrypt WordPress credentials** in database using encryption key from env
2. **Use Application Passwords** instead of main WordPress password
3. **HTTPS only** - refuse to connect to non-HTTPS WordPress sites
4. **Rate limiting** - prevent API abuse
5. **Audit logging** - track all WordPress publish attempts

## Future Enhancements

### Batch Publishing
- Select multiple approved posts
- Publish all to WordPress at once
- Schedule future publishing dates

### WordPress Category Sync
- Auto-fetch categories from WordPress
- Create new categories from CCS

### Custom Fields
- Support for ACF (Advanced Custom Fields)
- Featured image upload
- Custom taxonomy assignment

### Multi-Site Support
- Agencies managing multiple client WordPress sites
- Switch between sites easily

## Implementation Priority

**Phase 1 (MVP):**
- Strategy-level WordPress settings
- Basic auth with Application Passwords
- Publish single post as draft/publish
- Connection test

**Phase 2:**
- Batch publishing
- Schedule publishing
- Category/author sync

**Phase 3:**
- Custom fields support
- Featured images
- Advanced meta tags

## Cost Estimate
- MVP Implementation: 4-6 hours
- Testing & refinement: 2-3 hours
- Documentation: 1 hour

**Total: ~8 hours for Phase 1**

## Notes
- WordPress REST API is well-documented and stable
- Application Passwords are the recommended auth method
- Most WordPress sites support REST API out of the box
- This will be a major value-add for agencies
