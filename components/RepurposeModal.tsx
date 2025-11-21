'use client';

import { useState } from 'react';
import { X, Twitter, Linkedin, Instagram, Facebook, Mail, Video, Copy, Check, Loader2 } from 'lucide-react';

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
  const [selectedFormat, setSelectedFormat] = useState<RepurposeFormat | null>(null);
  const [repurposedContent, setRepurposedContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleRepurpose = async (format: RepurposeFormat) => {
    setSelectedFormat(format);
    setIsLoading(true);
    setError(null);
    setRepurposedContent('');

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

      setRepurposedContent(data.content);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(repurposedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setSelectedFormat(null);
    setRepurposedContent('');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Repurpose Content</h2>
            <p className="text-slate-600 mt-1">Transform your content for different platforms</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Format Selection Sidebar */}
          <div className="w-64 border-r border-slate-200 p-4 overflow-y-auto">
            <h3 className="text-sm font-semibold text-slate-500 uppercase mb-3">Select Format</h3>
            <div className="space-y-2">
              {FORMAT_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedFormat === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleRepurpose(option.id)}
                    disabled={isLoading}
                    className={`w-full text-left p-3 rounded-xl transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg'
                        : 'hover:bg-slate-100 text-slate-700'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className={`text-xs ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                          {option.description}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            {!selectedFormat && !isLoading && (
              <div className="h-full flex items-center justify-center text-slate-500">
                <div className="text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Copy className="w-8 h-8 text-slate-400" />
                  </div>
                  <p>Select a format to repurpose your content</p>
                </div>
              </div>
            )}

            {isLoading && (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 text-violet-500 animate-spin mx-auto mb-4" />
                  <p className="text-slate-600">Transforming your content...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
                {error}
              </div>
            )}

            {repurposedContent && !isLoading && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900">
                    {FORMAT_OPTIONS.find(f => f.id === selectedFormat)?.label}
                  </h3>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-slate-700"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-green-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                  <pre className="whitespace-pre-wrap font-sans text-slate-800 leading-relaxed">
                    {repurposedContent}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
