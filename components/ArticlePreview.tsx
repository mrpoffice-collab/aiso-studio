'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { marked } from 'marked';

interface ArticlePreviewProps {
  content: string;
  title?: string;
  scoreImprovement: number;
  originalScore: number;
  newScore: number;
  wordCount?: number;
  readingTime?: number;
}

export default function ArticlePreview({
  content,
  title,
  scoreImprovement,
  originalScore,
  newScore,
  wordCount,
  readingTime,
}: ArticlePreviewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportHTML = async () => {
    // Convert markdown to HTML
    const htmlContent = await marked(content);

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || 'Article'}</title>
  <style>
    body {
      font-family: 'Georgia', serif;
      line-height: 1.8;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      color: #1e293b;
      background: #ffffff;
    }
    h1, h2, h3, h4, h5, h6 {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-weight: 700;
      line-height: 1.3;
      margin-top: 2em;
      margin-bottom: 0.5em;
      color: #0f172a;
    }
    h1 { font-size: 2.5em; margin-top: 0; }
    h2 { font-size: 1.8em; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.3em; }
    h3 { font-size: 1.4em; }
    p { margin-bottom: 1.5em; }
    a { color: #3b82f6; text-decoration: none; }
    a:hover { text-decoration: underline; }
    strong { font-weight: 600; color: #0f172a; }
    code { background: #f1f5f9; padding: 0.2em 0.4em; border-radius: 3px; font-size: 0.9em; }
    pre { background: #f8fafc; padding: 1.5em; border-radius: 8px; overflow-x: auto; }
    blockquote {
      border-left: 4px solid #f97316;
      margin: 1.5em 0;
      padding: 0.5em 1.5em;
      background: #fff7ed;
      font-style: italic;
    }
    ul, ol { margin-bottom: 1.5em; padding-left: 2em; }
    li { margin-bottom: 0.5em; }
    img { max-width: 100%; height: auto; border-radius: 8px; }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1.5em 0;
    }
    th, td {
      border: 1px solid #e2e8f0;
      padding: 12px;
      text-align: left;
    }
    th {
      background: #f8fafc;
      font-weight: 600;
    }
  </style>
</head>
<body>
${htmlContent}
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'article'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const estimatedReadingTime = readingTime || Math.ceil((wordCount || content.split(/\s+/).length) / 200);

  return (
    <div className="space-y-6">
      {/* Success Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 p-8 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h2 className="text-3xl font-black text-white mb-1">Content Improved!</h2>
                <p className="text-green-50 font-semibold text-lg">Your article is ready to publish</p>
              </div>
            </div>
            <div className="flex items-center gap-6 mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-white">{originalScore}</span>
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span className="text-5xl font-black text-white">{newScore}</span>
              </div>
              <div className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/40">
                <p className="text-white font-black text-xl">+{scoreImprovement} points</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/90 backdrop-blur-sm shadow-xl mb-3">
              <span className="text-3xl">✨</span>
              <span className="text-lg font-black text-green-700">Ready to Publish</span>
            </div>
            <p className="text-green-50 text-sm font-semibold">
              This improvement would cost <span className="text-white font-black">$150+</span> with a human editor
            </p>
          </div>
        </div>
      </div>

      {/* Article Preview */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        {/* Article Header */}
        <div className="bg-gradient-to-br from-slate-50 to-blue-50 px-12 py-8 border-b border-slate-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="px-3 py-1 rounded-full bg-blue-100 border border-blue-200">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">Blog Post</span>
            </div>
            <span className="text-sm text-slate-600 font-semibold">{estimatedReadingTime} min read</span>
            <span className="text-sm text-slate-600">•</span>
            <span className="text-sm text-slate-600 font-semibold">
              {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          {title && (
            <h1 className="text-4xl font-black text-slate-900 mb-3 leading-tight">{title}</h1>
          )}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-sm">
              AI
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">AISO Studio</p>
              <p className="text-xs text-slate-600">AI-Optimized Content</p>
            </div>
          </div>
        </div>

        {/* Article Body */}
        <div className="px-12 py-10">
          <article className="prose prose-lg prose-slate max-w-none">
            <style jsx global>{`
              .prose {
                color: #1e293b;
              }
              .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
                font-weight: 800;
                color: #0f172a;
                scroll-margin-top: 100px;
              }
              .prose h2 {
                font-size: 1.875rem;
                margin-top: 2.5em;
                margin-bottom: 1em;
                padding-bottom: 0.5em;
                border-bottom: 2px solid #e2e8f0;
              }
              .prose h3 {
                font-size: 1.5rem;
                margin-top: 2em;
                margin-bottom: 0.75em;
                color: #334155;
              }
              .prose h4 {
                font-size: 1.25rem;
                margin-top: 1.75em;
                margin-bottom: 0.5em;
              }
              .prose p {
                margin-bottom: 1.5em;
                line-height: 1.8;
                font-size: 1.125rem;
              }
              .prose strong {
                color: #0f172a;
                font-weight: 700;
              }
              .prose a {
                color: #3b82f6;
                text-decoration: none;
                font-weight: 600;
                border-bottom: 2px solid #93c5fd;
                transition: all 0.2s;
              }
              .prose a:hover {
                color: #2563eb;
                border-bottom-color: #3b82f6;
              }
              .prose blockquote {
                border-left: 4px solid #f97316;
                background: linear-gradient(to right, #fff7ed, transparent);
                padding: 1em 1.5em;
                margin: 2em 0;
                font-style: italic;
                font-size: 1.125rem;
                color: #78350f;
              }
              .prose ul, .prose ol {
                margin: 1.5em 0;
                padding-left: 1.5em;
              }
              .prose li {
                margin-bottom: 0.75em;
                line-height: 1.8;
              }
              .prose li strong {
                color: #f97316;
              }
              .prose code {
                background: #f1f5f9;
                padding: 0.2em 0.5em;
                border-radius: 4px;
                font-size: 0.9em;
                font-family: 'Courier New', monospace;
                color: #e11d48;
                font-weight: 600;
              }
              .prose pre {
                background: #0f172a;
                color: #e2e8f0;
                padding: 1.5em;
                border-radius: 12px;
                overflow-x: auto;
                margin: 2em 0;
              }
              .prose pre code {
                background: transparent;
                padding: 0;
                color: #e2e8f0;
              }
              .prose img {
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.1);
                margin: 2em 0;
              }
              .prose table {
                border-collapse: collapse;
                width: 100%;
                margin: 2em 0;
                font-size: 0.95rem;
              }
              .prose th {
                background: linear-gradient(to bottom, #f8fafc, #f1f5f9);
                font-weight: 700;
                text-align: left;
                padding: 1em;
                border: 1px solid #e2e8f0;
                color: #0f172a;
              }
              .prose td {
                padding: 0.875em 1em;
                border: 1px solid #e2e8f0;
              }
              .prose tr:hover {
                background: #fafafa;
              }
              .prose hr {
                border: none;
                border-top: 2px solid #e2e8f0;
                margin: 3em 0;
              }
            `}</style>
            <ReactMarkdown
              rehypePlugins={[rehypeRaw, rehypeSanitize]}
              components={{
                h2: ({ children, ...props }) => (
                  <h2 {...props}>
                    <span className="inline-block w-1 h-8 bg-gradient-to-b from-orange-500 to-red-600 mr-3 rounded-full"></span>
                    {children}
                  </h2>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </article>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm font-bold text-slate-700">
            Your improved content is ready to publish across all platforms
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCopy}
            className="group px-6 py-3 rounded-xl bg-white border-2 border-slate-300 font-bold text-slate-700 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-all shadow-sm hover:shadow-md flex items-center gap-2"
          >
            {copied ? (
              <>
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy to Clipboard
              </>
            )}
          </button>
          <button
            onClick={handleExportHTML}
            className="px-6 py-3 rounded-xl bg-white border-2 border-slate-300 font-bold text-slate-700 hover:border-purple-500 hover:bg-purple-50 hover:text-purple-700 transition-all shadow-sm hover:shadow-md flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Export HTML
          </button>
          <button
            className="group px-8 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Publish Now
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
