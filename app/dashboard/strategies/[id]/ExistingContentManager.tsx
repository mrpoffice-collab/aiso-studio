'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ExistingContent {
  id: string;
  url: string;
  title: string;
  content_excerpt: string;
  scraped_at: string;
}

export default function ExistingContentManager({ strategyId }: { strategyId: string }) {
  const [existingContent, setExistingContent] = useState<ExistingContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showDiscoverForm, setShowDiscoverForm] = useState(false);
  const [discoverPattern, setDiscoverPattern] = useState('');
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveredUrls, setDiscoveredUrls] = useState<string[]>([]);
  const router = useRouter();

  // Fetch existing content on load
  useEffect(() => {
    fetchExistingContent();
  }, []);

  const fetchExistingContent = async () => {
    try {
      const response = await fetch(`/api/strategies/${strategyId}/existing-content`);
      const data = await response.json();
      if (data.success) {
        setExistingContent(data.existingContent || []);
      }
    } catch (error) {
      console.error('Failed to fetch existing content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUrls = async () => {
    if (!urlInput.trim()) {
      alert('Please enter at least one URL');
      return;
    }

    setIsAdding(true);

    try {
      // Split by newlines and filter empty lines
      const urls = urlInput
        .split('\n')
        .map(url => url.trim())
        .filter(url => url.length > 0);

      const response = await fetch(`/api/strategies/${strategyId}/existing-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ urls }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add URLs');
      }

      alert(
        `✅ Success!\n\n` +
        `Added: ${data.addedCount} URLs\n` +
        `Failed: ${data.failedCount} URLs\n\n` +
        `These blog posts will now be checked against when generating new content.`
      );

      setUrlInput('');
      setShowAddForm(false);
      fetchExistingContent();
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDiscoverUrls = async () => {
    if (!discoverPattern.trim()) {
      alert('Please enter a URL pattern');
      return;
    }

    setIsDiscovering(true);

    try {
      const response = await fetch(`/api/strategies/${strategyId}/discover-urls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pattern: discoverPattern }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to discover URLs');
      }

      if (data.count === 0) {
        alert('⚠️ No blog post URLs found at this location.\n\nTry:\n- Adding /blog to the URL\n- Using the sitemap URL\n- Manually pasting URLs instead');
        return;
      }

      setDiscoveredUrls(data.urls);
      alert(
        `🎉 Found ${data.count} blog post URLs!\n\n` +
        `Review the discovered URLs below, then click "Add All Discovered URLs" to import them.`
      );
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleAddDiscoveredUrls = async () => {
    if (discoveredUrls.length === 0) {
      alert('No URLs to add. Discover URLs first.');
      return;
    }

    setIsAdding(true);

    try {
      const response = await fetch(`/api/strategies/${strategyId}/existing-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ urls: discoveredUrls }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add URLs');
      }

      alert(
        `✅ Success!\\n\\n` +
        `Added: ${data.addedCount} URLs\\n` +
        `Failed: ${data.failedCount} URLs\\n\\n` +
        `These blog posts will now be checked against when generating new content.`
      );

      setDiscoveredUrls([]);
      setDiscoverPattern('');
      setShowDiscoverForm(false);
      fetchExistingContent();
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (contentId: string, url: string) => {
    if (!confirm(`Remove this URL from duplicate checking?\n\n${url}`)) {
      return;
    }

    try {
      const response = await fetch(
        `/api/strategies/${strategyId}/existing-content?contentId=${contentId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        throw new Error('Failed to delete');
      }

      alert('✅ Removed successfully');
      fetchExistingContent();
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="flex items-center justify-center py-8">
          <svg className="animate-spin h-8 w-8 text-deep-indigo" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Existing Blog Posts
          </h3>
          <p className="text-slate-600">
            Add URLs of existing blog posts to prevent duplicate content.{' '}
            <span className="font-semibold text-purple-600">
              {existingContent.length} URL{existingContent.length !== 1 ? 's' : ''} tracked
            </span>
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setShowDiscoverForm(!showDiscoverForm);
              setShowAddForm(false);
            }}
            className="group flex items-center gap-2 rounded-xl border-2 border-blue-500 bg-white px-4 py-2 font-bold text-blue-600 hover:bg-blue-500 hover:text-white transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Auto-Discover
          </button>
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setShowDiscoverForm(false);
            }}
            className="group flex items-center gap-2 rounded-xl border-2 border-purple-500 bg-white px-4 py-2 font-bold text-purple-600 hover:bg-purple-500 hover:text-white transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add URLs
          </button>
        </div>
      </div>

      {showDiscoverForm && (
        <div className="mb-6 p-6 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Blog URL Pattern
          </label>
          <input
            type="text"
            value={discoverPattern}
            onChange={(e) => setDiscoverPattern(e.target.value)}
            placeholder="https://fireflygrove.app/blog/"
            className="w-full px-4 py-3 rounded-lg border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-slate-900 placeholder:text-slate-400"
            disabled={isDiscovering || isAdding}
          />
          <p className="text-xs text-slate-600 mt-2 mb-4">
            💡 Enter the base URL of the blog section. We'll automatically find all blog posts via sitemap, RSS feed, or by scanning the page.
          </p>

          {discoveredUrls.length > 0 && (
            <div className="mb-4 p-4 rounded-lg bg-white border border-blue-300">
              <h4 className="font-bold text-slate-900 mb-2">
                ✅ Discovered {discoveredUrls.length} URLs
              </h4>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {discoveredUrls.slice(0, 10).map((url, idx) => (
                  <div key={idx} className="text-xs text-slate-600 truncate">
                    {idx + 1}. {url}
                  </div>
                ))}
                {discoveredUrls.length > 10 && (
                  <div className="text-xs text-slate-500 italic">
                    ... and {discoveredUrls.length - 10} more
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            {discoveredUrls.length === 0 ? (
              <button
                onClick={handleDiscoverUrls}
                disabled={isDiscovering || !discoverPattern.trim()}
                className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold hover:from-blue-600 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDiscovering ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Discovering URLs...
                  </span>
                ) : (
                  'Discover URLs'
                )}
              </button>
            ) : (
              <button
                onClick={handleAddDiscoveredUrls}
                disabled={isAdding}
                className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAdding ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding {discoveredUrls.length} URLs...
                  </span>
                ) : (
                  `Add All ${discoveredUrls.length} Discovered URLs`
                )}
              </button>
            )}
            <button
              onClick={() => {
                setShowDiscoverForm(false);
                setDiscoverPattern('');
                setDiscoveredUrls([]);
              }}
              disabled={isDiscovering || isAdding}
              className="px-4 py-2 rounded-lg border-2 border-slate-300 font-bold text-slate-700 hover:bg-slate-50 transition-all duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="mb-6 p-6 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Paste URLs (one per line)
          </label>
          <textarea
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://clientwebsite.com/blog/post-1&#10;https://clientwebsite.com/blog/post-2&#10;https://clientwebsite.com/blog/post-3"
            className="w-full h-32 px-4 py-3 rounded-lg border-2 border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all font-mono text-sm text-slate-900 placeholder:text-slate-400"
            disabled={isAdding}
          />
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleAddUrls}
              disabled={isAdding || !urlInput.trim()}
              className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold hover:from-purple-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAdding ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Scraping & Adding...
                </span>
              ) : (
                'Add & Scrape URLs'
              )}
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setUrlInput('');
              }}
              disabled={isAdding}
              className="px-4 py-2 rounded-lg border-2 border-slate-300 font-bold text-slate-700 hover:bg-slate-50 transition-all duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            💡 The system will automatically scrape each URL to extract the title and content for duplicate checking.
          </p>
        </div>
      )}

      {existingContent.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-xl bg-gradient-to-br from-slate-50 to-purple-50 border-2 border-dashed border-purple-200">
          <svg className="w-16 h-16 mx-auto mb-4 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h4 className="text-lg font-bold text-slate-900 mb-2">No Existing Content Yet</h4>
          <p className="text-slate-600 mb-4 max-w-md mx-auto">
            Add URLs of your client's existing blog posts to prevent generating duplicate content.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setShowDiscoverForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold hover:from-blue-600 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Auto-Discover URLs
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold hover:from-purple-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Manually
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {existingContent.map((content) => (
            <div
              key={content.id}
              className="group p-4 rounded-xl bg-gradient-to-br from-slate-50 to-purple-50 border border-purple-100 hover:border-purple-300 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 mb-1 truncate">
                    {content.title || 'Untitled'}
                  </h4>
                  <a
                    href={content.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-purple-600 hover:text-purple-800 hover:underline truncate block mb-2"
                  >
                    {content.url}
                  </a>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {content.content_excerpt || 'No excerpt available'}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(content.id, content.url)}
                  className="flex-shrink-0 p-2 rounded-lg text-red-600 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                  title="Remove"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-200">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-bold mb-1">How To Use:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li><strong>Auto-Discover:</strong> Enter blog URL like "https://site.com/blog/" to automatically find all posts</li>
              <li><strong>Add Manually:</strong> Paste specific URLs one per line</li>
              <li>System scrapes each URL to extract title and content</li>
              <li>When generating new posts, checks similarity automatically</li>
              <li>Warns you if similarity score is too high (&gt;70%)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
