/**
 * WordPress REST API Client
 * Handles publishing content to WordPress sites via the WP REST API
 *
 * Supports:
 * - Mock mode for testing without a real WordPress site
 * - Application Password authentication (WordPress 5.6+)
 * - Publishing posts as draft or publish
 * - Fetching categories and authors
 */

export interface WordPressConfig {
  url: string;
  username: string;
  appPassword: string;
  mockMode?: boolean;
}

export interface WordPressCategory {
  id: number;
  name: string;
  slug: string;
  count: number;
}

export interface WordPressAuthor {
  id: number;
  name: string;
  slug: string;
}

export interface WordPressPostData {
  title: string;
  content: string;
  excerpt?: string;
  status: 'draft' | 'publish' | 'pending' | 'private';
  categories?: number[];
  author?: number;
  featured_media?: number;
  meta?: Record<string, string>;
}

export interface WordPressPublishResult {
  success: boolean;
  postId?: number;
  postUrl?: string;
  editUrl?: string;
  error?: string;
  mockMode?: boolean;
}

export interface WordPressConnectionResult {
  success: boolean;
  siteTitle?: string;
  siteUrl?: string;
  userId?: number;
  userName?: string;
  error?: string;
  mockMode?: boolean;
}

// Mock data for testing
const MOCK_CATEGORIES: WordPressCategory[] = [
  { id: 1, name: 'Uncategorized', slug: 'uncategorized', count: 5 },
  { id: 2, name: 'Blog', slug: 'blog', count: 12 },
  { id: 3, name: 'News', slug: 'news', count: 8 },
  { id: 4, name: 'Resources', slug: 'resources', count: 3 },
  { id: 5, name: 'Case Studies', slug: 'case-studies', count: 2 },
];

const MOCK_AUTHORS: WordPressAuthor[] = [
  { id: 1, name: 'Admin', slug: 'admin' },
  { id: 2, name: 'Editor', slug: 'editor' },
  { id: 3, name: 'Content Writer', slug: 'content-writer' },
];

let mockPostIdCounter = 1000;

/**
 * Test connection to WordPress site
 */
export async function testWordPressConnection(
  config: WordPressConfig
): Promise<WordPressConnectionResult> {
  // Mock mode for testing
  if (config.mockMode) {
    console.log('[WordPress Mock] Testing connection to:', config.url);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Validate mock credentials
    if (config.username === 'invalid' || config.appPassword === 'invalid') {
      return {
        success: false,
        error: 'Invalid credentials',
        mockMode: true,
      };
    }

    return {
      success: true,
      siteTitle: 'Mock WordPress Site',
      siteUrl: config.url,
      userId: 1,
      userName: config.username,
      mockMode: true,
    };
  }

  // Real WordPress API call
  try {
    const credentials = Buffer.from(`${config.username}:${config.appPassword}`).toString('base64');

    // Test authentication by fetching current user
    const response = await fetch(`${normalizeUrl(config.url)}/wp-json/wp/v2/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Connection failed';

      if (response.status === 401) {
        errorMessage = 'Invalid username or application password';
      } else if (response.status === 403) {
        errorMessage = 'Access forbidden - check user permissions';
      } else if (response.status === 404) {
        errorMessage = 'WordPress REST API not found - is this a WordPress site?';
      } else {
        errorMessage = `HTTP ${response.status}: ${errorText.substring(0, 100)}`;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }

    const userData = await response.json();

    // Also fetch site info
    const siteResponse = await fetch(`${normalizeUrl(config.url)}/wp-json`);
    const siteData = siteResponse.ok ? await siteResponse.json() : null;

    return {
      success: true,
      siteTitle: siteData?.name || 'WordPress Site',
      siteUrl: siteData?.url || config.url,
      userId: userData.id,
      userName: userData.name,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Network error - could not reach WordPress site',
    };
  }
}

/**
 * Fetch categories from WordPress site
 */
export async function fetchWordPressCategories(
  config: WordPressConfig
): Promise<WordPressCategory[]> {
  if (config.mockMode) {
    console.log('[WordPress Mock] Fetching categories');
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_CATEGORIES;
  }

  try {
    const credentials = Buffer.from(`${config.username}:${config.appPassword}`).toString('base64');

    const response = await fetch(`${normalizeUrl(config.url)}/wp-json/wp/v2/categories?per_page=100`, {
      headers: {
        'Authorization': `Basic ${credentials}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch categories:', response.status);
      return [];
    }

    const categories = await response.json();
    return categories.map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      count: cat.count,
    }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

/**
 * Fetch authors from WordPress site
 */
export async function fetchWordPressAuthors(
  config: WordPressConfig
): Promise<WordPressAuthor[]> {
  if (config.mockMode) {
    console.log('[WordPress Mock] Fetching authors');
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_AUTHORS;
  }

  try {
    const credentials = Buffer.from(`${config.username}:${config.appPassword}`).toString('base64');

    const response = await fetch(`${normalizeUrl(config.url)}/wp-json/wp/v2/users?per_page=100`, {
      headers: {
        'Authorization': `Basic ${credentials}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch authors:', response.status);
      return [];
    }

    const users = await response.json();
    return users.map((user: any) => ({
      id: user.id,
      name: user.name,
      slug: user.slug,
    }));
  } catch (error) {
    console.error('Error fetching authors:', error);
    return [];
  }
}

/**
 * Publish a post to WordPress
 */
export async function publishToWordPress(
  config: WordPressConfig,
  postData: WordPressPostData
): Promise<WordPressPublishResult> {
  if (config.mockMode) {
    console.log('[WordPress Mock] Publishing post:', postData.title);
    await new Promise(resolve => setTimeout(resolve, 800));

    const mockPostId = ++mockPostIdCounter;
    const slug = postData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    return {
      success: true,
      postId: mockPostId,
      postUrl: `${config.url}/${slug}/`,
      editUrl: `${config.url}/wp-admin/post.php?post=${mockPostId}&action=edit`,
      mockMode: true,
    };
  }

  try {
    const credentials = Buffer.from(`${config.username}:${config.appPassword}`).toString('base64');

    // Convert markdown content to HTML for WordPress
    const htmlContent = convertMarkdownToWordPressHTML(postData.content);

    const wpPost = {
      title: postData.title,
      content: htmlContent,
      excerpt: postData.excerpt || '',
      status: postData.status,
      categories: postData.categories || [],
      author: postData.author,
      meta: postData.meta || {},
    };

    const response = await fetch(`${normalizeUrl(config.url)}/wp-json/wp/v2/posts`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(wpPost),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || `HTTP ${response.status}: Failed to publish`,
      };
    }

    const publishedPost = await response.json();

    return {
      success: true,
      postId: publishedPost.id,
      postUrl: publishedPost.link,
      editUrl: `${normalizeUrl(config.url)}/wp-admin/post.php?post=${publishedPost.id}&action=edit`,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Network error while publishing',
    };
  }
}

/**
 * Convert markdown to WordPress-compatible HTML
 */
function convertMarkdownToWordPressHTML(markdown: string): string {
  let html = markdown;

  // Convert headers
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Convert bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Convert italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Convert links
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');

  // Convert bullet lists
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

  // Convert numbered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

  // Convert blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

  // Convert paragraphs (lines not already wrapped in tags)
  const lines = html.split('\n');
  const processedLines = lines.map(line => {
    const trimmed = line.trim();
    if (trimmed === '') return '';
    if (trimmed.startsWith('<')) return line;
    return `<p>${trimmed}</p>`;
  });

  html = processedLines.join('\n');

  // Clean up empty paragraphs
  html = html.replace(/<p><\/p>/g, '');
  html = html.replace(/\n+/g, '\n');

  return html;
}

/**
 * Normalize WordPress URL (ensure no trailing slash, add https if missing)
 */
function normalizeUrl(url: string): string {
  let normalized = url.trim();

  // Add https if no protocol
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
    normalized = `https://${normalized}`;
  }

  // Remove trailing slash
  normalized = normalized.replace(/\/+$/, '');

  return normalized;
}

/**
 * Simple encryption for storing WordPress credentials
 * Note: In production, use a proper encryption library with a secure key
 */
export function encryptCredential(credential: string, key?: string): string {
  // Simple base64 encoding for now - in production use proper encryption
  const encryptionKey = key || process.env.WORDPRESS_ENCRYPTION_KEY || 'default-key';
  const combined = `${encryptionKey}:${credential}`;
  return Buffer.from(combined).toString('base64');
}

export function decryptCredential(encrypted: string, key?: string): string {
  try {
    const encryptionKey = key || process.env.WORDPRESS_ENCRYPTION_KEY || 'default-key';
    const decoded = Buffer.from(encrypted, 'base64').toString('utf-8');
    const prefix = `${encryptionKey}:`;
    if (decoded.startsWith(prefix)) {
      return decoded.substring(prefix.length);
    }
    return decoded;
  } catch {
    return encrypted;
  }
}
