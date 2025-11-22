'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Asset, AssetFolder } from '@/types';
import { HexColorPicker } from 'react-colorful';

function AssetsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentFolderId = searchParams.get('folder');
  const activeTag = searchParams.get('tag');

  const [assets, setAssets] = useState<Asset[]>([]);
  const [folders, setFolders] = useState<AssetFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isDragging, setIsDragging] = useState(false);

  // Folder creation state
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDescription, setNewFolderDescription] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#6366f1');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [parentFolderId, setParentFolderId] = useState<string | null>(null);

  // Tag state
  const [uploadTags, setUploadTags] = useState('');
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [editTags, setEditTags] = useState('');
  const [allTags, setAllTags] = useState<string[]>([]);

  // Move asset state
  const [movingAssetId, setMovingAssetId] = useState<string | null>(null);

  // Folder expand/collapse state
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [minSize, setMinSize] = useState('');
  const [maxSize, setMaxSize] = useState('');
  const [smartCollection, setSmartCollection] = useState<string | null>(null);

  // Load assets and folders on mount
  useEffect(() => {
    loadAssets();
    loadFolders();
  }, [currentFolderId, activeTag]);

  const loadAssets = async () => {
    try {
      setLoading(true);
      let url = '/api/assets';
      const params = new URLSearchParams();

      if (currentFolderId) params.append('folderId', currentFolderId);
      if (activeTag) params.append('tags', activeTag);

      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setAssets(data.assets);

        // Extract all unique tags
        const tags = new Set<string>();
        data.assets.forEach((asset: Asset) => {
          if (asset.tags) {
            asset.tags.forEach((tag: string) => tags.add(tag));
          }
        });
        setAllTags(Array.from(tags).sort());
      } else {
        setError(data.error || 'Failed to load assets');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  const loadFolders = async () => {
    try {
      const response = await fetch('/api/assets/folders');
      const data = await response.json();

      if (data.success) {
        setFolders(data.folders);
      }
    } catch (err: any) {
      console.error('Failed to load folders:', err);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file size (25MB)
    const MAX_SIZE = 25 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setError('File too large. Maximum size is 25MB.');
      return;
    }

    try {
      setUploading(true);
      setError('');
      setSuccess('');

      const formData = new FormData();
      formData.append('file', file);
      if (currentFolderId) {
        formData.append('folderId', currentFolderId);
      }
      if (uploadTags.trim()) {
        formData.append('tags', uploadTags);
      }

      const response = await fetch('/api/assets/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`Successfully uploaded ${file.name}`);
        setUploadTags(''); // Clear tags after upload
        loadAssets();
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (assetId: string, filename: string) => {
    if (!confirm(`Are you sure you want to delete "${filename}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/assets/${assetId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`Deleted ${filename}`);
        loadAssets();
      } else if (response.status === 409) {
        // Asset is in use
        const usageDetails = data.usage?.map((u: any) =>
          `${u.entity_type} (${u.usage_type || 'unknown'})`
        ).join(', ') || 'unknown locations';

        setError(
          `Cannot delete "${filename}": This asset is being used in ${data.usageCount} location(s): ${usageDetails}. ` +
          `Please remove it from these locations before deleting.`
        );
      } else {
        setError(data.error || 'Delete failed');
      }
    } catch (err: any) {
      setError(err.message || 'Delete failed');
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      setError('Folder name is required');
      return;
    }

    try {
      const response = await fetch('/api/assets/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFolderName,
          description: newFolderDescription,
          color: newFolderColor,
          parent_folder_id: parentFolderId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`Folder "${newFolderName}" created`);
        setNewFolderName('');
        setNewFolderDescription('');
        setNewFolderColor('#6366f1');
        setParentFolderId(null);
        setShowCreateFolder(false);
        loadFolders();
      } else {
        setError(data.error || 'Failed to create folder');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create folder');
    }
  };

  const handleMoveAsset = async (assetId: string, folderId: string | null) => {
    try {
      const response = await fetch(`/api/assets/${assetId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder_id: folderId }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Asset moved successfully');
        loadAssets();
      } else {
        setError(data.error || 'Failed to move asset');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to move asset');
    } finally {
      setMovingAssetId(null);
    }
  };

  const handleUpdateTags = async (assetId: string) => {
    try {
      const tagsArray = editTags.split(',').map(t => t.trim()).filter(Boolean);

      const response = await fetch(`/api/assets/${assetId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags: tagsArray }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Tags updated successfully');
        setEditingAssetId(null);
        setEditTags('');
        loadAssets();
      } else {
        setError(data.error || 'Failed to update tags');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update tags');
    }
  };

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    handleFileUpload(files);
  }, []);

  // Filter assets with search, advanced filters, and smart collections
  const filteredAssets = assets.filter(asset => {
    // File type filter
    if (filterType !== 'all' && asset.file_type !== filterType) {
      return false;
    }

    // Search filter (filename, description, alt_text, tags)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesFilename = asset.original_filename.toLowerCase().includes(query);
      const matchesDescription = asset.description?.toLowerCase().includes(query);
      const matchesAltText = asset.alt_text?.toLowerCase().includes(query);
      const matchesTags = asset.tags?.some(tag => tag.toLowerCase().includes(query));

      if (!matchesFilename && !matchesDescription && !matchesAltText && !matchesTags) {
        return false;
      }
    }

    // Date range filter
    if (dateFrom) {
      const assetDate = new Date(asset.created_at);
      const fromDate = new Date(dateFrom);
      if (assetDate < fromDate) return false;
    }
    if (dateTo) {
      const assetDate = new Date(asset.created_at);
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      if (assetDate > toDate) return false;
    }

    // File size filter (in bytes)
    if (minSize) {
      const minBytes = parseFloat(minSize) * 1024 * 1024; // Convert MB to bytes
      if (asset.file_size < minBytes) return false;
    }
    if (maxSize) {
      const maxBytes = parseFloat(maxSize) * 1024 * 1024; // Convert MB to bytes
      if (asset.file_size > maxBytes) return false;
    }

    // Smart collection filters
    if (smartCollection === 'recent') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const assetDate = new Date(asset.created_at);
      if (assetDate < sevenDaysAgo) return false;
    }
    if (smartCollection === 'large') {
      const fiveMB = 5 * 1024 * 1024;
      if (asset.file_size < fiveMB) return false;
    }
    if (smartCollection === 'untagged') {
      if (asset.tags && asset.tags.length > 0) return false;
    }
    if (smartCollection === 'images') {
      if (asset.file_type !== 'image') return false;
    }

    return true;
  });

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Get file type icon
  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'image':
        return '🖼️';
      case 'pdf':
        return '📄';
      case 'video':
        return '🎥';
      case 'document':
        return '📎';
      default:
        return '📁';
    }
  };

  // Build folder tree
  const buildFolderTree = () => {
    const rootFolders = folders.filter(f => !f.parent_folder_id);

    const renderFolder = (folder: AssetFolder, depth: number = 0): React.JSX.Element[] => {
      const children = folders.filter(f => f.parent_folder_id === folder.id);
      const hasChildren = children.length > 0;
      const isExpanded = expandedFolders.has(folder.id);
      const isActive = currentFolderId === folder.id;

      const result: React.JSX.Element[] = [
        <div key={folder.id} className="relative">
          <button
            onClick={() => router.push(`/dashboard/assets?folder=${folder.id}`)}
            className={`w-full px-3 py-2 rounded-lg text-left font-medium transition-colors flex items-center gap-2 ${
              isActive
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
            style={{ paddingLeft: `${12 + depth * 16}px` }}
          >
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFolder(folder.id);
                }}
                className="flex-shrink-0"
              >
                <span className="text-xs">{isExpanded ? '▼' : '▶'}</span>
              </button>
            )}
            {!hasChildren && <span className="w-3" />}
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: folder.color || '#6366f1' }}
            />
            <span className="truncate flex-1">{folder.name}</span>
          </button>
        </div>
      ];

      if (hasChildren && isExpanded) {
        children.forEach(child => {
          result.push(...renderFolder(child, depth + 1));
        });
      }

      return result;
    };

    return rootFolders.flatMap(folder => renderFolder(folder));
  };

  // Get breadcrumb path
  const getBreadcrumbs = () => {
    if (!currentFolderId) return [];

    const path: AssetFolder[] = [];
    let current = folders.find(f => f.id === currentFolderId);

    while (current) {
      path.unshift(current);
      current = current.parent_folder_id
        ? folders.find(f => f.id === current!.parent_folder_id)
        : undefined;
    }

    return path;
  };

  // Get current folder
  const currentFolder = folders.find(f => f.id === currentFolderId);
  const breadcrumbs = getBreadcrumbs();

  // Render folder options for move dropdown (hierarchical)
  const renderFolderOptions = (parentId: string | null = null, depth: number = 0): JSX.Element[] => {
    const folderList = folders.filter(f => f.parent_folder_id === parentId);

    return folderList.flatMap(folder => [
      <option key={folder.id} value={folder.id}>
        {'  '.repeat(depth)}
        {folder.name}
      </option>,
      ...renderFolderOptions(folder.id, depth + 1)
    ]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="flex">
        {/* Folder Sidebar */}
        <div className="w-64 min-h-screen bg-white border-r border-slate-200 p-4">
          <div className="mb-4 space-y-2">
            <button
              onClick={() => {
                setParentFolderId(currentFolderId);
                setShowCreateFolder(true);
              }}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
            >
              + New {currentFolderId ? 'Subfolder' : 'Folder'}
            </button>
          </div>

          {/* All Files */}
          <button
            onClick={() => router.push('/dashboard/assets')}
            className={`w-full px-3 py-2 rounded-lg text-left font-medium transition-colors mb-2 ${
              !currentFolderId && !activeTag
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            📁 All Files
          </button>

          {/* Folders Tree */}
          <div className="space-y-1">
            {buildFolderTree()}
          </div>

          {/* Tags Section */}
          {allTags.length > 0 && (
            <>
              <div className="mt-6 mb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Tags
              </div>
              <div className="space-y-1">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => router.push(`/dashboard/assets?tag=${tag}`)}
                    className={`w-full px-3 py-2 rounded-lg text-left font-medium transition-colors flex items-center gap-2 text-sm ${
                      activeTag === tag
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xs">🏷️</span>
                    <span className="truncate">{tag}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Smart Collections */}
          <div className="mt-6 mb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Smart Collections
          </div>
          <div className="space-y-1">
            {[
              { id: 'recent', label: 'Recently Uploaded', icon: '🕐', desc: 'Last 7 days' },
              { id: 'large', label: 'Large Files', icon: '📦', desc: 'Over 5MB' },
              { id: 'untagged', label: 'Untagged', icon: '🏷️', desc: 'No tags' },
              { id: 'images', label: 'All Images', icon: '🖼️', desc: 'Images only' },
            ].map((collection) => (
              <button
                key={collection.id}
                onClick={() => {
                  setSmartCollection(smartCollection === collection.id ? null : collection.id);
                  router.push('/dashboard/assets');
                }}
                className={`w-full px-3 py-2 rounded-lg text-left font-medium transition-colors text-sm ${
                  smartCollection === collection.id
                    ? 'bg-purple-50 text-purple-700'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
                title={collection.desc}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs">{collection.icon}</span>
                  <span className="truncate flex-1">{collection.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Header with Breadcrumbs */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2 text-sm text-slate-600">
              <button
                onClick={() => router.push('/dashboard/assets')}
                className="hover:text-slate-900 hover:underline"
              >
                All Files
              </button>
              {breadcrumbs.map((folder, idx) => (
                <span key={folder.id} className="flex items-center gap-2">
                  <span>/</span>
                  <button
                    onClick={() => router.push(`/dashboard/assets?folder=${folder.id}`)}
                    className={`hover:text-slate-900 hover:underline ${
                      idx === breadcrumbs.length - 1 ? 'font-medium text-slate-900' : ''
                    }`}
                  >
                    {folder.name}
                  </button>
                </span>
              ))}
              {activeTag && (
                <>
                  <span>/</span>
                  <span className="font-medium text-blue-700">🏷️ {activeTag}</span>
                </>
              )}
            </div>
            <h1 className="text-4xl font-bold text-slate-900">
              {activeTag ? `Tagged: ${activeTag}` : currentFolder ? currentFolder.name : 'Digital Assets'}
            </h1>
            {currentFolder?.description && (
              <p className="mt-2 text-slate-600">{currentFolder.description}</p>
            )}
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-800 border border-red-200 flex items-start gap-2">
              <button onClick={() => setError('')} className="text-red-600 hover:text-red-800 font-bold">×</button>
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-6 rounded-lg bg-green-50 p-4 text-green-800 border border-green-200 flex items-start gap-2">
              <button onClick={() => setSuccess('')} className="text-green-600 hover:text-green-800 font-bold">×</button>
              <span>{success}</span>
            </div>
          )}

          {/* Search and Filters */}
          <div className="mb-6 bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex gap-3">
              {/* Search Bar */}
              <div className="flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search files, tags, descriptions..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Filter Toggle Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  showFilters || dateFrom || dateTo || minSize || maxSize
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>🔍</span>
                <span>Filters</span>
                {(dateFrom || dateTo || minSize || maxSize) && (
                  <span className="px-2 py-0.5 bg-white text-blue-600 rounded-full text-xs font-bold">
                    •
                  </span>
                )}
              </button>

              {/* Clear All Filters */}
              {(searchQuery || dateFrom || dateTo || minSize || maxSize || smartCollection) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setDateFrom('');
                    setDateTo('');
                    setMinSize('');
                    setMaxSize('');
                    setSmartCollection(null);
                  }}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Date Range
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      placeholder="From"
                    />
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      placeholder="To"
                    />
                  </div>
                </div>

                {/* File Size Range */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    File Size (MB)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={minSize}
                      onChange={(e) => setMinSize(e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      placeholder="Min"
                      min="0"
                      step="0.1"
                    />
                    <input
                      type="number"
                      value={maxSize}
                      onChange={(e) => setMaxSize(e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      placeholder="Max"
                      min="0"
                      step="0.1"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Upload Area */}
          <div
            className={`mb-8 rounded-xl border-2 border-dashed p-8 text-center transition-all ${
              isDragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-slate-50'
            }`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="text-6xl">📤</div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {uploading ? 'Uploading...' : 'Drop files here or click to upload'}
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  Maximum file size: 25MB
                  {currentFolder && ` • Uploading to ${currentFolder.name}`}
                </p>
              </div>

              {/* Tags Input */}
              <div className="w-full max-w-md">
                <input
                  type="text"
                  value={uploadTags}
                  onChange={(e) => setUploadTags(e.target.value)}
                  placeholder="Add tags (comma-separated): logo, brand, social"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <label className="cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  disabled={uploading}
                />
                <span className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 transition-colors">
                  {uploading ? 'Uploading...' : 'Choose File'}
                </span>
              </label>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="mb-6 flex gap-2 border-b border-slate-200">
            {[
              { value: 'all', label: 'All Files', icon: '📁' },
              { value: 'image', label: 'Images', icon: '🖼️' },
              { value: 'pdf', label: 'PDFs', icon: '📄' },
              { value: 'video', label: 'Videos', icon: '🎥' },
              { value: 'document', label: 'Documents', icon: '📎' },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setFilterType(filter.value)}
                className={`px-4 py-2 font-medium transition-colors ${
                  filterType === filter.value
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="mr-2">{filter.icon}</span>
                {filter.label}
              </button>
            ))}
          </div>

          {/* Assets Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">⏳</div>
              <p className="text-slate-600">Loading assets...</p>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                No assets yet
              </h3>
              <p className="text-slate-600">
                {filterType === 'all'
                  ? 'Upload your first file to get started'
                  : `No ${filterType} files found`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="group relative rounded-xl bg-white border border-slate-200 overflow-hidden hover:shadow-lg transition-all"
                >
                  {/* Asset Preview */}
                  <div className="aspect-square bg-slate-100 flex items-center justify-center">
                    {asset.file_type === 'image' ? (
                      <img
                        src={asset.public_url || asset.blob_url}
                        alt={asset.alt_text || asset.original_filename}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-6xl">{getFileIcon(asset.file_type)}</div>
                    )}
                  </div>

                  {/* Asset Info */}
                  <div className="p-4">
                    <h3 className="font-medium text-slate-900 truncate mb-1">
                      {asset.original_filename}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {formatFileSize(asset.file_size)}
                      {asset.width && asset.height && (
                        <span className="ml-2">
                          {asset.width} × {asset.height}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(asset.created_at).toLocaleDateString()}
                    </p>

                    {/* Usage Count */}
                    {asset.usage_count !== undefined && asset.usage_count > 0 && (
                      <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium">
                        <span>📊</span>
                        <span>Used {asset.usage_count}×</span>
                      </div>
                    )}

                    {/* Tags */}
                    {editingAssetId === asset.id ? (
                      <div className="mt-2 flex gap-1">
                        <input
                          type="text"
                          value={editTags}
                          onChange={(e) => setEditTags(e.target.value)}
                          placeholder="tag1, tag2, tag3"
                          className="flex-1 text-xs px-2 py-1 border border-slate-300 rounded"
                          autoFocus
                        />
                        <button
                          onClick={() => handleUpdateTags(asset.id)}
                          className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => {
                            setEditingAssetId(null);
                            setEditTags('');
                          }}
                          className="px-2 py-1 bg-slate-200 text-slate-700 text-xs rounded hover:bg-slate-300"
                        >
                          ×
                        </button>
                      </div>
                    ) : asset.tags && asset.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {asset.tags.slice(0, 3).map((tag, idx) => (
                          <button
                            key={idx}
                            onClick={() => router.push(`/dashboard/assets?tag=${tag}`)}
                            className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                          >
                            {tag}
                          </button>
                        ))}
                        {asset.tags.length > 3 && (
                          <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded">
                            +{asset.tags.length - 3}
                          </span>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingAssetId(asset.id);
                          setEditTags('');
                        }}
                        className="mt-2 text-xs text-slate-500 hover:text-slate-700"
                      >
                        + Add tags
                      </button>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <a
                      href={asset.public_url || asset.blob_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-white rounded-lg shadow-lg hover:bg-slate-50 transition-colors"
                      title="View"
                    >
                      👁️
                    </a>
                    <button
                      onClick={() => {
                        setEditingAssetId(asset.id);
                        setEditTags(asset.tags?.join(', ') || '');
                      }}
                      className="p-2 bg-white rounded-lg shadow-lg hover:bg-slate-50 transition-colors"
                      title="Edit Tags"
                    >
                      🏷️
                    </button>
                    {movingAssetId === asset.id ? (
                      <div className="p-2 bg-white rounded-lg shadow-lg">
                        <select
                          onChange={(e) => handleMoveAsset(asset.id, e.target.value || null)}
                          className="text-xs"
                          defaultValue=""
                        >
                          <option value="">Select folder...</option>
                          <option value="">📁 No Folder</option>
                          {renderFolderOptions()}
                        </select>
                      </div>
                    ) : (
                      <button
                        onClick={() => setMovingAssetId(asset.id)}
                        className="p-2 bg-white rounded-lg shadow-lg hover:bg-slate-50 transition-colors"
                        title="Move"
                      >
                        📁
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(asset.id, asset.original_filename)}
                      className="p-2 bg-white rounded-lg shadow-lg hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stats */}
          {!loading && assets.length > 0 && (
            <div className="mt-8 text-center text-sm text-slate-600">
              Showing {filteredAssets.length} of {assets.length} assets
            </div>
          )}
        </div>
      </div>

      {/* Create Folder Modal */}
      {showCreateFolder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full m-4">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Create {parentFolderId ? 'Subfolder' : 'Folder'}
            </h2>

            {parentFolderId && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                Creating subfolder in: <strong>{currentFolder?.name}</strong>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Folder Name *
                </label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={parentFolderId ? "Logos" : "Client Assets"}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={newFolderDescription}
                  onChange={(e) => setNewFolderDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Store client logos and brand assets"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Folder Color
                </label>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg border-2 border-slate-300 cursor-pointer"
                    style={{ backgroundColor: newFolderColor }}
                    onClick={() => setShowColorPicker(!showColorPicker)}
                  />
                  <input
                    type="text"
                    value={newFolderColor}
                    onChange={(e) => setNewFolderColor(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                    placeholder="#6366f1"
                  />
                </div>
                {showColorPicker && (
                  <div className="mt-2">
                    <HexColorPicker color={newFolderColor} onChange={setNewFolderColor} />
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowCreateFolder(false);
                  setNewFolderName('');
                  setNewFolderDescription('');
                  setNewFolderColor('#6366f1');
                  setShowColorPicker(false);
                  setParentFolderId(null);
                }}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Create {parentFolderId ? 'Subfolder' : 'Folder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AssetsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-slate-600 text-lg">Loading assets...</p>
        </div>
      </div>
    }>
      <AssetsContent />
    </Suspense>
  );
}
