'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function MOUPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [mouData, setMouData] = useState<{
    mou: string;
    pricing: {
      totalWordCount: number;
      totalPrice: number;
      pricePerWord: number;
    };
    deliveryTimeframe: string;
    topicsCount: number;
  } | null>(null);
  const [pricePerWord, setPricePerWord] = useState(0.10);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [topics, setTopics] = useState<any[]>([]);

  useEffect(() => {
    // Fetch topics for this strategy only if id is defined
    if (id) {
      fetchTopics();
    }
  }, [id]);

  const fetchTopics = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/strategies/${id}/topics`);
      if (!response.ok) {
        throw new Error('Failed to fetch topics');
      }
      const data = await response.json();
      setTopics(data.topics || []);
      // Select all topics by default
      setSelectedTopics(data.topics.map((t: any) => t.id));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateMOU = async () => {
    if (selectedTopics.length < 1) {
      setError('Please select at least 1 topic');
      return;
    }

    try {
      setIsGenerating(true);
      setError('');

      const response = await fetch(`/api/strategies/${id}/mou`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedTopicIds: selectedTopics,
          pricePerWord: pricePerWord,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate MOU');
      }

      const data = await response.json();
      setMouData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadMOU = () => {
    if (!mouData) return;

    const blob = new Blob([mouData.mou], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MOU-${id}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleTopic = (topicId: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId]
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <div className="text-deep-indigo">Loading topics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <header className="border-b border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-sm sticky top-0 z-50">
        <div className="container mx-auto flex h-20 items-center justify-between px-6">
          <div className="flex items-center gap-12">
            <Link href="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-sunset-orange to-orange-600 bg-clip-text text-transparent">
              Content Command Studio
            </Link>
            <nav className="flex gap-8">
              <Link href="/dashboard" className="text-sm font-semibold text-slate-600 hover:text-deep-indigo transition-all duration-200 hover:scale-105">
                Dashboard
              </Link>
              <Link href="/dashboard/strategies" className="text-sm font-semibold text-deep-indigo border-b-2 border-sunset-orange pb-1">
                Strategies
              </Link>
              <Link href="/dashboard/posts" className="text-sm font-semibold text-slate-600 hover:text-deep-indigo transition-all duration-200 hover:scale-105">
                Posts
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <Link
            href={`/dashboard/strategies/${id}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-sunset-orange transition-all duration-200 group"
          >
            <span className="transition-transform group-hover:-translate-x-1">←</span>
            Back to Strategy
          </Link>
        </div>

        <div className="mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-deep-indigo via-blue-600 to-deep-indigo bg-clip-text text-transparent mb-4">
            Generate Proposal
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl">
            Create a professional, client-ready Memorandum of Understanding with custom pricing and topic selection
          </p>
        </div>

        {error && (
          <div className="mb-8 rounded-xl bg-red-50 border border-red-200 p-6 text-red-700 shadow-lg shadow-red-100/50">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {!mouData ? (
          <div className="space-y-8">
            {/* Pricing Configuration */}
            <div className="rounded-2xl border border-slate-200/60 bg-white p-8 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-300/50 transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sunset-orange to-orange-600 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Pricing Configuration</h2>
              </div>
              <div className="max-w-md">
                <label className="block text-sm font-bold text-slate-700 mb-3 tracking-wide uppercase text-xs">
                  Price per Word (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={pricePerWord}
                    onChange={(e) => setPricePerWord(parseFloat(e.target.value) || 0.10)}
                    className="w-full rounded-xl border-2 border-slate-200 pl-8 pr-4 py-3.5 text-slate-900 font-semibold text-lg focus:border-sunset-orange focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all duration-200 bg-slate-50/50 hover:bg-white"
                  />
                </div>
                <p className="mt-3 text-sm text-slate-500 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Premium content marketing rates: $0.08 - $0.20/word
                </p>
              </div>
            </div>

            {/* Topic Selection */}
            <div className="rounded-2xl border border-slate-200/60 bg-white p-8 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-300/50 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-deep-indigo to-blue-600 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Select Topics</h2>
                </div>
                <div className="px-4 py-2 rounded-full bg-gradient-to-r from-sunset-orange to-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-200">
                  {selectedTopics.length} Selected
                </div>
              </div>
              <div className="space-y-3">
                {topics.map((topic) => (
                  <label
                    key={topic.id}
                    className="group flex items-start gap-4 p-5 rounded-xl border-2 border-slate-200 hover:border-sunset-orange hover:shadow-lg hover:shadow-orange-100/50 transition-all duration-200 cursor-pointer bg-gradient-to-br from-white to-slate-50/30 hover:from-orange-50/30 hover:to-orange-50/10"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTopics.includes(topic.id)}
                      onChange={() => toggleTopic(topic.id)}
                      className="mt-1.5 h-5 w-5 rounded-lg border-2 border-slate-300 text-sunset-orange focus:ring-4 focus:ring-orange-100 transition-all cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="font-bold text-slate-900 group-hover:text-deep-indigo transition-colors leading-snug">{topic.title}</div>
                      <div className="text-sm text-slate-500 mt-2 flex items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-semibold text-xs">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.87 18.87 0 01-1.724 4.78c.29.354.596.696.914 1.026a1 1 0 11-1.44 1.389c-.188-.196-.373-.396-.554-.6a19.098 19.098 0 01-3.107 3.567 1 1 0 01-1.334-1.49 17.087 17.087 0 003.13-3.733 18.992 18.992 0 01-1.487-2.494 1 1 0 111.79-.89c.234.47.489.928.764 1.372.417-.934.752-1.913.997-2.927H3a1 1 0 110-2h3V3a1 1 0 011-1zm6 6a1 1 0 01.894.553l2.991 5.982a.869.869 0 01.02.037l.99 1.98a1 1 0 11-1.79.894L15.383 16h-4.764l-.724 1.447a1 1 0 11-1.788-.894l.99-1.98.019-.038 2.99-5.982A1 1 0 0113 8zm-1.382 6h2.764L13 11.236 11.618 14z" clipRule="evenodd" />
                          </svg>
                          {topic.keyword}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-slate-600 font-medium">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          ~{topic.word_count} words
                        </span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <div className="flex justify-end">
              <button
                onClick={handleGenerateMOU}
                disabled={isGenerating || selectedTopics.length === 0}
                className="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-sunset-orange to-orange-600 text-white font-bold text-lg shadow-2xl shadow-orange-300/50 hover:shadow-orange-400/60 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-3">
                  {isGenerating ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating Proposal...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Generate Professional MOU
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Pricing Summary */}
            <div className="rounded-2xl border border-slate-200/60 bg-gradient-to-br from-white via-slate-50/30 to-blue-50/30 p-8 shadow-2xl shadow-slate-300/50">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-200">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Proposal Summary</h2>
                  <p className="text-slate-600 text-sm">Your professional MOU is ready</p>
                </div>
              </div>
              <div className="grid gap-6 md:grid-cols-3 mb-6">
                <div className="p-6 rounded-xl bg-white/80 backdrop-blur border border-slate-200 shadow-lg overflow-hidden">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Topics Selected</div>
                  <div className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-deep-indigo to-blue-600 bg-clip-text text-transparent">{mouData.topicsCount}</div>
                </div>
                <div className="p-6 rounded-xl bg-white/80 backdrop-blur border border-slate-200 shadow-lg overflow-hidden">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Total Words</div>
                  <div className="text-2xl lg:text-3xl font-black bg-gradient-to-r from-deep-indigo to-blue-600 bg-clip-text text-transparent">
                    {mouData.pricing.totalWordCount.toLocaleString()}
                  </div>
                </div>
                <div className="p-6 rounded-xl bg-gradient-to-br from-sunset-orange to-orange-600 shadow-xl shadow-orange-300/50 overflow-hidden">
                  <div className="text-xs font-bold text-orange-100 uppercase tracking-wider mb-3">Total Investment</div>
                  <div className="text-2xl lg:text-3xl font-black text-white leading-tight">
                    ${mouData.pricing.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
              <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-6 text-sm text-slate-600">
                  <span className="flex items-center gap-2 font-semibold">
                    <svg className="w-5 h-5 text-sunset-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    ${mouData.pricing.pricePerWord.toFixed(3)}/word
                  </span>
                  <span className="flex items-center gap-2 font-semibold">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {mouData.deliveryTimeframe} delivery
                  </span>
                </div>
              </div>
            </div>

            {/* MOU Content */}
            <div className="rounded-2xl border border-slate-200/60 bg-white p-8 shadow-xl shadow-slate-200/50">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-deep-indigo to-blue-600 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Professional MOU Document</h2>
                </div>
                <button
                  onClick={handleDownloadMOU}
                  className="group flex items-center gap-2 rounded-xl border-2 border-deep-indigo bg-white px-5 py-3 text-sm font-bold text-deep-indigo hover:bg-deep-indigo hover:text-white transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download MOU
                </button>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 p-8 border-2 border-slate-200 max-h-[600px] overflow-y-auto custom-scrollbar">
                <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 leading-relaxed">
                  {mouData.mou}
                </pre>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-4">
              <button
                onClick={() => setMouData(null)}
                className="group flex items-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200"
              >
                <svg className="w-5 h-5 group-hover:-rotate-45 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Generate New MOU
              </button>
              <Link
                href={`/dashboard/strategies/${id}`}
                className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-deep-indigo to-blue-600 px-8 py-3 text-sm font-bold text-white shadow-xl shadow-blue-300/50 hover:shadow-blue-400/60 hover:scale-105 transition-all duration-200"
              >
                <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Strategy
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
