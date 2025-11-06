'use client';

import { useState, useEffect } from 'react';

interface AuditResultsProps {
  strategyId: string;
}

interface Audit {
  id: string;
  site_url: string;
  status: string;
  pages_found: number;
  images_found: number;
  avg_aiso_score: number;
  started_at: string;
  completed_at: string;
}

interface Page {
  id: string;
  url: string;
  title: string;
  meta_description: string;
  word_count: number;
  aiso_score: number;
  aeo_score: number;
  seo_score: number;
  readability_score: number;
  engagement_score: number;
  flesch_score: number;
}

interface Image {
  id: string;
  url: string;
  alt_text: string;
  source_page_url: string;
  context: string;
}

export default function AuditResults({ strategyId }: AuditResultsProps) {
  const [audit, setAudit] = useState<Audit | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPages, setShowPages] = useState(false);
  const [showImages, setShowImages] = useState(false);

  useEffect(() => {
    fetchAuditResults();
  }, [strategyId]);

  const fetchAuditResults = async () => {
    try {
      const response = await fetch(`/api/strategies/${strategyId}/audit`);
      const data = await response.json();

      if (data.audit) {
        setAudit(data.audit);
        setPages(data.pages || []);
        setImages(data.images || []);
      }
    } catch (error) {
      console.error('Failed to fetch audit results:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  if (!audit) {
    return null;
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 70) return 'bg-green-50 border-green-200';
    if (score >= 50) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="mb-8 rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-lg">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-600 text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Website Audit Results</h2>
            <p className="text-sm text-slate-600 mt-1">
              {audit.status === 'completed'
                ? `Completed ${new Date(audit.completed_at).toLocaleString()}`
                : `Status: ${audit.status}`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl bg-white border-2 border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-slate-600">Pages Found</p>
              <p className="text-3xl font-bold text-slate-900">{audit.pages_found}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white border-2 border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-slate-600">Images Found</p>
              <p className="text-3xl font-bold text-slate-900">{audit.images_found}</p>
            </div>
          </div>
        </div>

        <div className={`rounded-xl border-2 p-4 ${getScoreBg(audit.avg_aiso_score)}`}>
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-slate-600">Avg AISO Score</p>
              <p className={`text-3xl font-bold ${getScoreColor(audit.avg_aiso_score)}`}>
                {audit.avg_aiso_score}/100
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pages Section */}
      <div className="mb-4">
        <button
          onClick={() => setShowPages(!showPages)}
          className="w-full flex items-center justify-between p-4 rounded-xl bg-white border-2 border-slate-200 hover:border-blue-300 transition-all"
        >
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="font-bold text-slate-900">Discovered Pages ({pages.length})</span>
          </div>
          <svg
            className={`w-5 h-5 text-slate-600 transition-transform ${showPages ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showPages && (
          <div className="mt-3 space-y-3">
            {pages.map((page) => (
              <div key={page.id} className="p-4 rounded-xl bg-white border-2 border-slate-200">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 mb-1">{page.title}</h4>
                    <a
                      href={page.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline break-all"
                    >
                      {page.url}
                    </a>
                    {page.meta_description && (
                      <p className="text-sm text-slate-600 mt-2">{page.meta_description}</p>
                    )}
                  </div>
                  <div className={`ml-4 px-3 py-1 rounded-lg font-bold text-sm ${getScoreBg(page.aiso_score)}`}>
                    <span className={getScoreColor(page.aiso_score)}>{page.aiso_score}</span>
                  </div>
                </div>
                <div className="flex gap-4 text-xs text-slate-600 mt-3">
                  <span>Words: {page.word_count}</span>
                  <span>AEO: {page.aeo_score}</span>
                  <span>SEO: {page.seo_score}</span>
                  <span>Readability: {page.readability_score}</span>
                  <span>Flesch: {page.flesch_score}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Images Section */}
      {images.length > 0 && (
        <div>
          <button
            onClick={() => setShowImages(!showImages)}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-white border-2 border-slate-200 hover:border-purple-300 transition-all"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-bold text-slate-900">Discovered Images ({images.length})</span>
            </div>
            <svg
              className={`w-5 h-5 text-slate-600 transition-transform ${showImages ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showImages && (
            <div className="mt-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {images.map((image) => (
                <div key={image.id} className="p-3 rounded-xl bg-white border-2 border-slate-200">
                  <div className="aspect-square rounded-lg bg-slate-100 mb-2 overflow-hidden">
                    <img
                      src={image.url}
                      alt={image.alt_text || 'Image'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  </div>
                  <p className="text-xs text-slate-600 truncate" title={image.alt_text}>
                    {image.alt_text || 'No alt text'}
                  </p>
                  {image.context && (
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
                      {image.context}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
