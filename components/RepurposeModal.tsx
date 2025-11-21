'use client';

import { useState } from 'react';
import { X, Twitter, Linkedin, Instagram, Facebook, Mail, Video, Copy, Check, Loader2, Zap } from 'lucide-react';

type RepurposeFormat = 'twitter_thread' | 'linkedin' | 'instagram' | 'facebook' | 'email' | 'video_script';

interface RepurposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  title?: string;
}

const FORMAT_OPTIONS: { id: RepurposeFormat; label: string; icon: any; description: string }[] = [
  { id: 'twitter_thread', label: 'Twitter/X Thread', icon: Twitter, description: '3-5 tweet thread with hooks' },
  { id: 'linkedin', label: 'LinkedIn Post', icon: Linkedin, description: 'Professional engagement post' },
  { id: 'instagram', label: 'Instagram Caption', icon: Instagram, description: 'Visual-first with hashtags' },
  { id: 'facebook', label: 'Facebook Post', icon: Facebook, description: 'Conversational community post' },
  { id: 'email', label: 'Email Newsletter', icon: Mail, description: 'Subject + body format' },
  { id: 'video_script', label: 'Video Script', icon: Video, description: 'Hook, points, CTA structure' },
];

export default function RepurposeModal({ isOpen, onClose, content, title }: RepurposeModalProps) {
  const [selectedFormats, setSelectedFormats] = useState<Set<RepurposeFormat>>(new Set());
  const [results, setResults] = useState<Record<RepurposeFormat, string>>({} as Record<RepurposeFormat, string>);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingFormats, setLoadingFormats] = useState<Set<RepurposeFormat>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const toggleFormat = (format: RepurposeFormat) => {
    const newSelected = new Set(selectedFormats);
    if (newSelected.has(format)) {
      newSelected.delete(format);
    } else {
      newSelected.add(format);
    }
    setSelectedFormats(newSelected);
  };

  const selectAll = () => {
    setSelectedFormats(new Set(FORMAT_OPTIONS.map(f => f.id)));
  };

  const handleGenerateAll = async () => {
    if (selectedFormats.size === 0) return;

    setIsLoading(true);
    setError(null);
    setLoadingFormats(new Set(selectedFormats));

    const newResults: Record<RepurposeFormat, string> = { ...results };

    // Generate all selected formats in parallel
    const promises = Array.from(selectedFormats).map(async (format) => {
      try {
        const response = await fetch('/api/repurpose', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, format, title }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to repurpose content');
        }

        newResults[format] = data.content;
        setLoadingFormats(prev => {
          const next = new Set(prev);
          next.delete(format);
          return next;
        });
        setResults({ ...newResults });
      } catch (err: any) {
        setError(err.message);
      }
    });

    await Promise.all(promises);
    setIsLoading(false);
    setLoadingFormats(new Set());
  };

  const handleCopy = async (format: RepurposeFormat) => {
    await navigator.clipboard.writeText(results[format]);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const handleCopyAll = async () => {
    const allContent = FORMAT_OPTIONS
      .filter(f => results[f.id])
      .map(f => `=== ${f.label.toUpperCase()} ===\n\n${results[f.id]}`)
      .join('\n\n---\n\n');

    await navigator.clipboard.writeText(allContent);
    setCopiedFormat('all');
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const handleClose = () => {
    setSelectedFormats(new Set());
    setResults({} as Record<RepurposeFormat, string>);
    setError(null);
    onClose();
  };

  const hasResults = Object.keys(results).length > 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Repurpose Content</h2>
            <p className="text-slate-600 mt-1">Select formats and generate all at once</p>
          </div>
          <div className="flex items-center gap-3">
            {hasResults && (
              <button
                onClick={handleCopyAll}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-lg hover:shadow-lg transition-all"
              >
                {copiedFormat === 'all' ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied All!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy All
                  </>
                )}
              </button>
            )}
            <button
              onClick={handleClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-slate-500" />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Format Selection Sidebar */}
          <div className="w-72 border-r border-slate-200 p-4 overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-500 uppercase">Select Formats</h3>
              <button
                onClick={selectAll}
                className="text-xs font-semibold text-violet-600 hover:text-violet-800"
              >
                Select All
              </button>
            </div>
            <div className="space-y-2 flex-1">
              {FORMAT_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedFormats.has(option.id);
                const isLoadingThis = loadingFormats.has(option.id);
                const hasResult = !!results[option.id];
                return (
                  <button
                    key={option.id}
                    onClick={() => toggleFormat(option.id)}
                    disabled={isLoading}
                    className={`w-full text-left p-3 rounded-xl transition-all border-2 ${
                      isSelected
                        ? 'border-violet-500 bg-violet-50'
                        : 'border-transparent hover:bg-slate-100'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        isSelected ? 'border-violet-500 bg-violet-500' : 'border-slate-300'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-violet-600' : 'text-slate-500'}`} />
                      <div className="flex-1">
                        <div className="font-medium text-slate-700 flex items-center gap-2">
                          {option.label}
                          {isLoadingThis && <Loader2 className="w-3 h-3 animate-spin text-violet-500" />}
                          {hasResult && !isLoadingThis && <Check className="w-3 h-3 text-green-500" />}
                        </div>
                        <div className="text-xs text-slate-500">{option.description}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateAll}
              disabled={selectedFormats.size === 0 || isLoading}
              className="mt-4 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating {loadingFormats.size} format{loadingFormats.size !== 1 ? 's' : ''}...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Generate {selectedFormats.size > 0 ? `(${selectedFormats.size})` : ''}
                </>
              )}
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            {!hasResults && !isLoading && (
              <div className="h-full flex items-center justify-center text-slate-500">
                <div className="text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-lg font-medium">Select formats and click Generate</p>
                  <p className="text-sm mt-1">All formats will be created in parallel</p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 mb-4">
                {error}
              </div>
            )}

            {/* Results */}
            <div className="space-y-6">
              {FORMAT_OPTIONS.filter(f => results[f.id] || loadingFormats.has(f.id)).map((option) => {
                const Icon = option.icon;
                const isLoadingThis = loadingFormats.has(option.id);
                return (
                  <div key={option.id} className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between p-4 bg-white border-b border-slate-200">
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-violet-600" />
                        <h3 className="font-semibold text-slate-900">{option.label}</h3>
                      </div>
                      {results[option.id] && (
                        <button
                          onClick={() => handleCopy(option.id)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-sm font-medium"
                        >
                          {copiedFormat === option.id ? (
                            <>
                              <Check className="w-4 h-4 text-green-600" />
                              <span className="text-green-600">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 text-slate-600" />
                              <span className="text-slate-600">Copy</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    <div className="p-4">
                      {isLoadingThis ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
                        </div>
                      ) : (
                        <pre className="whitespace-pre-wrap font-sans text-slate-800 leading-relaxed text-sm">
                          {results[option.id]}
                        </pre>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
