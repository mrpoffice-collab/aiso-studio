'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Asset } from '@/types';

export default function AssetsPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isDragging, setIsDragging] = useState(false);

  // Load assets on mount
  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/assets');
      const data = await response.json();

      if (data.success) {
        setAssets(data.assets);
      } else {
        setError(data.error || 'Failed to load assets');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load assets');
    } finally {
      setLoading(false);
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

      const response = await fetch('/api/assets/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`Successfully uploaded ${file.name}`);
        loadAssets(); // Reload the asset list
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
        loadAssets(); // Reload the asset list
      } else {
        setError(data.error || 'Delete failed');
      }
    } catch (err: any) {
      setError(err.message || 'Delete failed');
    }
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

  // Filter assets
  const filteredAssets = filterType === 'all'
    ? assets
    : assets.filter(asset => asset.file_type === filterType);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="mx-auto max-w-7xl p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">Digital Assets</h1>
          <p className="mt-2 text-slate-600">
            Upload and manage your images, PDFs, videos, and documents
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-800 border border-red-200">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 rounded-lg bg-green-50 p-4 text-green-800 border border-green-200">
            {success}
          </div>
        )}

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
              </p>
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

                  {/* Tags */}
                  {asset.tags && asset.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {asset.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
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
  );
}
