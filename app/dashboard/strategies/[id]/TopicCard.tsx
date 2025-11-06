'use client';
// Force recompile - darker text update v2
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import EditTopicModal from '@/components/EditTopicModal';

interface TopicCardProps {
  topic: any;
  strategyFleschScore: number;
  onTopicUpdated?: () => void;
}

export default function TopicCard({ topic, strategyFleschScore, onTopicUpdated }: TopicCardProps) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [localTopic, setLocalTopic] = useState(topic);

  const handleGenerate = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch(`/api/topics/${localTopic.id}/generate`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        // Show detailed message if available (for fact-check failures, readability failures, etc.)
        const errorMessage = data.message || data.error || 'Failed to generate content';
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Redirect to the generated post
      router.push(`/dashboard/posts/${data.post.id}`);
    } catch (err: any) {
      console.error('Generation error:', err);
      setError(err.message);
      setIsGenerating(false);
    }
  };

  const handleSaveTopic = async (updates: any) => {
    const response = await fetch(`/api/topics/${localTopic.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to update topic');
    }

    const data = await response.json();
    setLocalTopic(data.topic);
    if (onTopicUpdated) onTopicUpdated();
  };

  const isCompleted = localTopic.status === 'completed';
  const isFailed = localTopic.status === 'failed';
  const isGeneratingStatus = localTopic.status === 'generating';

  return (
    <>
      {showEditModal && (
        <EditTopicModal
          topic={localTopic}
          strategyFleschScore={strategyFleschScore}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveTopic}
        />
      )}
      <div className="group rounded-2xl border border-slate-200/60 bg-white p-6 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-300/50 transition-all duration-300 hover:-translate-y-1">
        <div className="mb-5 flex items-start justify-between">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sunset-orange to-orange-600 text-sm font-black text-white shadow-lg shadow-orange-200">
            {localTopic.position || '?'}
          </span>
          <div className="flex flex-col items-end gap-2">
            <span className="rounded-full bg-gradient-to-r from-deep-indigo/10 to-blue-600/10 border border-deep-indigo/20 px-4 py-1.5 text-xs font-bold text-deep-indigo uppercase tracking-wide">
              {localTopic.seo_intent || 'N/A'}
            </span>
          {isCompleted && (
            <span className="rounded-full bg-gradient-to-r from-green-500/10 to-emerald-600/10 border border-green-500/20 px-3 py-1 text-xs font-bold text-green-700 uppercase tracking-wide flex items-center gap-1.5">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Generated
            </span>
          )}
          {isFailed && (
            <span className="rounded-full bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/30 px-3 py-1 text-xs font-bold text-red-700 uppercase tracking-wide flex items-center gap-1.5">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Failed
            </span>
          )}
        </div>
      </div>

      <h3 className="mb-4 text-base font-bold text-slate-900 group-hover:text-deep-indigo transition-colors leading-snug break-words">
        {localTopic.title || 'Untitled'}
      </h3>

      <div className="mb-4">
        <p className="mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Target Keyword</p>
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 text-sm font-bold text-blue-700">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.87 18.87 0 01-1.724 4.78c.29.354.596.696.914 1.026a1 1 0 11-1.44 1.389c-.188-.196-.373-.396-.554-.6a19.098 19.098 0 01-3.107 3.567 1 1 0 01-1.334-1.49 17.087 17.087 0 003.13-3.733 18.992 18.992 0 01-1.487-2.494 1 1 0 111.79-.89c.234.47.489.928.764 1.372.417-.934.752-1.913.997-2.927H3a1 1 0 110-2h3V3a1 1 0 011-1zm6 6a1 1 0 01.894.553l2.991 5.982a.869.869 0 01.02.037l.99 1.98a1 1 0 11-1.79.894L15.383 16h-4.764l-.724 1.447a1 1 0 11-1.788-.894l.99-1.98.019-.038 2.99-5.982A1 1 0 0113 8zm-1.382 6h2.764L13 11.236 11.618 14z" clipRule="evenodd" />
          </svg>
          {localTopic.keyword || 'N/A'}
        </span>
      </div>

      <div className="mb-5">
        <p className="mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Outline</p>
        <ul className="space-y-2 text-sm font-semibold" style={{ color: '#0f172a' }}>
          {Array.isArray(localTopic.outline) && localTopic.outline.length > 0 ? (
            localTopic.outline.map((item: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-sunset-orange font-bold mt-0.5">→</span>
                <span className="font-semibold">{item || ''}</span>
              </li>
            ))
          ) : (
            <li className="font-semibold">{typeof localTopic.outline === 'string' ? localTopic.outline : 'No outline available'}</li>
          )}
        </ul>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-300 p-4 shadow-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-bold text-red-900 mb-1">Content Generation Failed</p>
              <p className="text-xs text-red-800 whitespace-pre-wrap leading-relaxed">{error}</p>
            </div>
          </div>
        </div>
      )}

      {isFailed && !error && (
        <div className="mb-4 rounded-xl bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-300 p-4 shadow-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-bold text-red-900 mb-1">Topic Failed Quality Check</p>
              <p className="text-xs text-red-800 mb-3">Content couldn't meet readability target after 5 attempts. Try one of these options:</p>
              <ul className="text-xs text-red-800 space-y-1 ml-1">
                <li className="flex items-start gap-1.5">
                  <span className="text-red-600 font-bold mt-0.5">•</span>
                  <span><strong>Edit Topic</strong> - Adjust reading level to a higher score (easier to read)</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-red-600 font-bold mt-0.5">•</span>
                  <span><strong>Simplify Outline</strong> - Break complex sections into simpler parts</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-red-600 font-bold mt-0.5">•</span>
                  <span><strong>Retry</strong> - Sometimes generation succeeds on second attempt</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-slate-200 pt-4">
        <span className="flex items-center gap-2 text-sm font-bold" style={{ color: '#0f172a' }}>
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          ~{localTopic.word_count || 0} words
        </span>
        <div className="flex items-center gap-2">
          {isFailed && (
            <button
              onClick={() => setShowEditModal(true)}
              className="group/btn relative rounded-xl px-4 py-2 text-sm font-bold text-slate-700 border-2 border-slate-300 hover:border-slate-400 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 bg-white"
              title="Edit this topic's title, outline, or reading level"
            >
              <span className="relative z-10 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Topic
              </span>
            </button>
          )}
          <button
            onClick={handleGenerate}
            className={`group/btn relative rounded-xl px-4 py-2 text-sm font-bold text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden ${
              isFailed
                ? 'bg-gradient-to-r from-orange-500 to-red-600'
                : 'bg-gradient-to-r from-deep-indigo to-blue-600'
            }`}
            disabled={isGenerating || isGeneratingStatus || isCompleted}
          >
            <span className="relative z-10 flex items-center gap-2">
              {(isGenerating || isGeneratingStatus) ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Generating...
                </>
              ) : isCompleted ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Post
                </>
              ) : isFailed ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Try Again
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generate Post
                </>
              )}
            </span>
            <div className={`absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200 ${
              isFailed
                ? 'bg-gradient-to-r from-red-600 to-red-700'
                : 'bg-gradient-to-r from-blue-600 to-indigo-700'
            }`}></div>
          </button>
        </div>
      </div>
    </div>
    </>
  );
}
