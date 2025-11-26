'use client';

import { useState, useRef } from 'react';
import { AISOMascotInline } from './AISOMascot';

interface LogoUploadProps {
  currentLogoUrl?: string;
  onUpload: (url: string) => void;
  onRemove?: () => void;
}

export default function LogoUpload({ currentLogoUrl, onUpload, onRemove }: LogoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, SVG, etc.)');
      return;
    }

    // Validate file size (5MB max for logos)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setError('Logo must be under 5MB');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tags', 'agency-logo,branding');
      formData.append('description', 'Agency logo for branded materials');

      const response = await fetch('/api/assets/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Upload failed');
      }

      const data = await response.json();
      onUpload(data.asset.blob_url);
    } catch (err: any) {
      setError(err.message || 'Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove();
    } else {
      onUpload('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Current logo preview */}
      {currentLogoUrl && (
        <div className="flex items-center gap-4">
          <div className="rounded-xl border-2 border-slate-200 bg-slate-50 p-4">
            <img
              src={currentLogoUrl}
              alt="Current agency logo"
              className="h-16 w-auto max-w-[200px] object-contain"
            />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="text-sm font-medium text-red-600 hover:text-red-700"
          >
            Remove
          </button>
        </div>
      )}

      {/* Upload area */}
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all
          ${dragOver
            ? 'border-orange-500 bg-orange-50'
            : 'border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100'
          }
          ${uploading ? 'pointer-events-none opacity-60' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <AISOMascotInline state="running" />
            <span className="text-sm font-medium text-slate-600">Uploading...</span>
          </div>
        ) : (
          <>
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-200">
              <svg className="h-6 w-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-700">
              {currentLogoUrl ? 'Replace logo' : 'Upload your logo'}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Drag & drop or click to browse
            </p>
            <p className="mt-1 text-xs text-slate-400">
              PNG, JPG, SVG up to 5MB. Horizontal logos work best.
            </p>
          </>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
