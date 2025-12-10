'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Search, HelpCircle, Users, ExternalLink, CheckCircle, XCircle, AlertTriangle, Trophy, MessageCircle, Target } from 'lucide-react';

// Admin emails - must match server-side check
const ADMIN_EMAILS = ['mrpoffice@gmail.com', 'kim@aliidesign.com'];

interface IndustryQuestion {
  question: string;
  category: 'informational' | 'commercial' | 'navigational' | 'transactional';
  intent: string;
}

interface AIDiscoveryResult {
  url: string;
  domain: string;
  businessName?: string;
  industry: string;
  questionsChecked: IndustryQuestion[];
  citedFor: {
    question: IndustryQuestion;
    citationType: string;
    position: number | null;
    competitors: string[];
  }[];
  notCitedFor: IndustryQuestion[];
  summary: {
    totalQuestions: number;
    citedCount: number;
    citationRate: number;
    strongestCategory: string | null;
    weakestCategory: string | null;
    topCompetitors: { domain: string; count: number }[];
  };
  checkedAt: string;
}

interface IndustryTrustResult {
  industry: string;
  location?: string;
  questionsAsked: IndustryQuestion[];
  trustedSources: {
    domain: string;
    url: string;
    citationCount: number;
    avgPosition: number;
    questionsAnswered: string[];
    categories: string[];
  }[];
  summary: {
    totalQuestions: number;
    uniqueSourcesCited: number;
    dominantPlayer: string | null;
    dominantPlayerShare: number;
  };
  checkedAt: string;
}

type ActiveTab = 'ai-discovery' | 'industry-trust';

export default function AIVisibilityPage() {
  const { user, isLoaded } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('ai-discovery');

  // AI Discovery state
  const [discoveryResult, setDiscoveryResult] = useState<AIDiscoveryResult | null>(null);
  const [discovering, setDiscovering] = useState(false);
  const [discoveryUrl, setDiscoveryUrl] = useState('');
  const [discoveryIndustry, setDiscoveryIndustry] = useState('');
  const [discoveryServiceType, setDiscoveryServiceType] = useState('');
  const [discoveryBusinessName, setDiscoveryBusinessName] = useState('');
  const [discoveryLocation, setDiscoveryLocation] = useState('');

  // Industry Trust state
  const [trustResult, setTrustResult] = useState<IndustryTrustResult | null>(null);
  const [findingTrust, setFindingTrust] = useState(false);
  const [trustIndustry, setTrustIndustry] = useState('');
  const [trustServiceType, setTrustServiceType] = useState('');
  const [trustLocation, setTrustLocation] = useState('');

  useEffect(() => {
    if (isLoaded && user) {
      const email = user.primaryEmailAddress?.emailAddress;
      if (email && ADMIN_EMAILS.includes(email)) {
        setIsAdmin(true);
      }
      setLoading(false);
    } else if (isLoaded) {
      setLoading(false);
    }
  }, [isLoaded, user]);

  const runAIDiscovery = async () => {
    if (!discoveryUrl || !discoveryIndustry) return;

    setDiscovering(true);
    setDiscoveryResult(null);

    try {
      const res = await fetch('/api/admin/ai-visibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ai-discovery',
          url: discoveryUrl,
          industry: discoveryIndustry,
          serviceType: discoveryServiceType || undefined,
          businessName: discoveryBusinessName || undefined,
          location: discoveryLocation || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setDiscoveryResult(data);
      } else {
        const error = await res.json();
        alert(error.error || 'Discovery failed');
      }
    } catch (error) {
      console.error('AI Discovery failed:', error);
      alert('Failed to run discovery');
    } finally {
      setDiscovering(false);
    }
  };

  const runIndustryTrust = async () => {
    if (!trustIndustry) return;

    setFindingTrust(true);
    setTrustResult(null);

    try {
      const res = await fetch('/api/admin/ai-visibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'industry-trust',
          industry: trustIndustry,
          serviceType: trustServiceType || undefined,
          location: trustLocation || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTrustResult(data);
      } else {
        const error = await res.json();
        alert(error.error || 'Search failed');
      }
    } catch (error) {
      console.error('Industry trust search failed:', error);
      alert('Failed to find trusted sources');
    } finally {
      setFindingTrust(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'informational': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'commercial': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'transactional': return 'bg-green-100 text-green-700 border-green-200';
      case 'navigational': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Not admin - show nothing (secret page)
  if (isLoaded && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-white">
        <p className="text-slate-500">Page not found</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto bg-warm-white min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full text-sm w-fit mb-2">
          <AlertTriangle className="w-4 h-4" />
          Internal Only - Not Visible to Users
        </div>
        <h1 className="text-3xl font-black text-slate-900">AI Visibility Tracker</h1>
        <p className="text-slate-600 mt-1">
          Does AI know your clients exist? Check what questions they get cited for.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('ai-discovery')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'ai-discovery'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Target className="w-4 h-4 inline mr-1.5" />
          AI Discovery
        </button>
        <button
          onClick={() => setActiveTab('industry-trust')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'industry-trust'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Trophy className="w-4 h-4 inline mr-1.5" />
          Who Does AI Trust?
        </button>
      </div>

      {/* AI Discovery Tab */}
      {activeTab === 'ai-discovery' && (
        <div className="bg-white rounded-xl border-2 border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-2">AI Discovery Check</h2>
          <p className="text-slate-600 text-sm mb-4">
            We ask AI the questions people actually ask about your industry, then check if your site gets cited.
            No keywords - just real questions like "How much does SEO cost?" or "What should I look for in an SEO agency?"
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Website URL *
              </label>
              <input
                type="text"
                value={discoveryUrl}
                onChange={(e) => setDiscoveryUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Industry *
              </label>
              <input
                type="text"
                value={discoveryIndustry}
                onChange={(e) => setDiscoveryIndustry(e.target.value)}
                placeholder="SEO, web design, radiology marketing..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Service Type (optional)
              </label>
              <input
                type="text"
                value={discoveryServiceType}
                onChange={(e) => setDiscoveryServiceType(e.target.value)}
                placeholder="agency, consulting, software..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Business Name (optional)
              </label>
              <input
                type="text"
                value={discoveryBusinessName}
                onChange={(e) => setDiscoveryBusinessName(e.target.value)}
                placeholder="Acme Marketing"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Location (optional)
              </label>
              <input
                type="text"
                value={discoveryLocation}
                onChange={(e) => setDiscoveryLocation(e.target.value)}
                placeholder="San Diego, CA"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              />
            </div>
          </div>

          <button
            onClick={runAIDiscovery}
            disabled={discovering || !discoveryUrl || !discoveryIndustry}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {discovering ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Asking AI questions...
              </>
            ) : (
              <>
                <MessageCircle className="w-4 h-4" />
                Run Discovery
              </>
            )}
          </button>

          {/* Discovery Results */}
          {discoveryResult && (
            <div className="mt-6 border-t border-slate-200 pt-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">
                Results for {discoveryResult.domain}
              </h3>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-50 rounded-lg p-4 text-center border border-slate-200">
                  <div className="text-3xl font-black text-indigo-600">
                    {discoveryResult.summary.citationRate}%
                  </div>
                  <div className="text-sm text-slate-600">AI Knows You</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-4 text-center border border-slate-200">
                  <div className="text-3xl font-black text-slate-900">
                    {discoveryResult.summary.citedCount}/{discoveryResult.summary.totalQuestions}
                  </div>
                  <div className="text-sm text-slate-600">Questions Cited</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-4 text-center border border-slate-200">
                  <div className="text-lg font-bold text-green-600 capitalize">
                    {discoveryResult.summary.strongestCategory || 'N/A'}
                  </div>
                  <div className="text-sm text-slate-600">Strongest Area</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-4 text-center border border-slate-200">
                  <div className="text-lg font-bold text-red-600 capitalize">
                    {discoveryResult.summary.weakestCategory || 'N/A'}
                  </div>
                  <div className="text-sm text-slate-600">Weakest Area</div>
                </div>
              </div>

              {/* The Pitch */}
              <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <h4 className="font-bold text-orange-900 mb-2">The Sales Pitch</h4>
                {discoveryResult.summary.citationRate === 0 ? (
                  <p className="text-sm text-orange-800">
                    "When people ask AI about {discoveryResult.industry}, your business doesn't exist.
                    We asked {discoveryResult.summary.totalQuestions} real questions - like 'What is {discoveryResult.industry}?'
                    and 'How do I hire a {discoveryResult.industry} provider?' - and AI never mentioned you once.
                    {discoveryResult.summary.topCompetitors.length > 0 && (
                      <> Instead, it recommended {discoveryResult.summary.topCompetitors.slice(0, 3).map(c => c.domain).join(', ')}.</>
                    )} We can fix that."
                  </p>
                ) : discoveryResult.summary.citationRate < 50 ? (
                  <p className="text-sm text-orange-800">
                    "AI knows you exist, but barely. Out of {discoveryResult.summary.totalQuestions} real questions
                    people ask about {discoveryResult.industry}, you only got cited {discoveryResult.summary.citedCount} times.
                    {discoveryResult.summary.weakestCategory && (
                      <> You're especially weak on {discoveryResult.summary.weakestCategory} questions -
                      the ones where people are ready to buy.</>
                    )} We can make AI recommend you more."
                  </p>
                ) : (
                  <p className="text-sm text-orange-800">
                    "Good news - AI already knows you for {discoveryResult.industry}. You got cited
                    {discoveryResult.summary.citedCount} out of {discoveryResult.summary.totalQuestions} times.
                    {discoveryResult.summary.topCompetitors.length > 0 && (
                      <> But you're competing with {discoveryResult.summary.topCompetitors[0].domain} who appeared even more.</>
                    )} Let's make sure you stay ahead."
                  </p>
                )}
              </div>

              {/* Questions Where You Got Cited */}
              {discoveryResult.citedFor.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    AI Cites You For ({discoveryResult.citedFor.length})
                  </h4>
                  <div className="space-y-2">
                    {discoveryResult.citedFor.map((item, i) => (
                      <div key={i} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-slate-900">"{item.question.question}"</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`px-2 py-0.5 rounded text-xs border ${getCategoryColor(item.question.category)}`}>
                                {item.question.category}
                              </span>
                              {item.position && (
                                <span className="text-xs text-slate-500">Position #{item.position}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        {item.competitors.length > 0 && (
                          <p className="text-xs text-slate-500 mt-2">
                            Also cited: {item.competitors.slice(0, 3).join(', ')}
                            {item.competitors.length > 3 && ` +${item.competitors.length - 3} more`}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Questions Where You're NOT Cited */}
              {discoveryResult.notCitedFor.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    AI Doesn't Know You For ({discoveryResult.notCitedFor.length})
                  </h4>
                  <div className="space-y-2">
                    {discoveryResult.notCitedFor.map((q, i) => (
                      <div key={i} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="font-medium text-slate-900">"{q.question}"</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 rounded text-xs border ${getCategoryColor(q.category)}`}>
                            {q.category}
                          </span>
                          <span className="text-xs text-slate-500">{q.intent}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Competitors */}
              {discoveryResult.summary.topCompetitors.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5 text-slate-600" />
                    Who AI Recommends Instead
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {discoveryResult.summary.topCompetitors.map((comp, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-sm text-slate-700"
                      >
                        {comp.domain} ({comp.count}x)
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Industry Trust Tab */}
      {activeTab === 'industry-trust' && (
        <div className="bg-white rounded-xl border-2 border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Who Does AI Trust?</h2>
          <p className="text-slate-600 text-sm mb-4">
            Find out who AI recommends when people ask questions about an industry.
            Great for competitive intel and understanding who you're up against.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Industry *
              </label>
              <input
                type="text"
                value={trustIndustry}
                onChange={(e) => setTrustIndustry(e.target.value)}
                placeholder="SEO, web design, accounting..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Service Type (optional)
              </label>
              <input
                type="text"
                value={trustServiceType}
                onChange={(e) => setTrustServiceType(e.target.value)}
                placeholder="agency, consulting, software..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Location (optional)
              </label>
              <input
                type="text"
                value={trustLocation}
                onChange={(e) => setTrustLocation(e.target.value)}
                placeholder="San Diego, CA"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              />
            </div>
          </div>

          <button
            onClick={runIndustryTrust}
            disabled={findingTrust || !trustIndustry}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {findingTrust ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Asking AI...
              </>
            ) : (
              <>
                <Trophy className="w-4 h-4" />
                Find Trusted Sources
              </>
            )}
          </button>

          {/* Trust Results */}
          {trustResult && (
            <div className="mt-6 border-t border-slate-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">
                  Who AI Trusts for "{trustResult.industry}"
                </h3>
                <span className="text-sm text-slate-500">
                  {trustResult.summary.uniqueSourcesCited} sources found
                </span>
              </div>

              {/* Questions Asked */}
              <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-600 mb-2">Questions we asked AI:</p>
                <div className="flex flex-wrap gap-1">
                  {trustResult.questionsAsked.map((q, i) => (
                    <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-xs text-slate-700">
                      {q.question}
                    </span>
                  ))}
                </div>
              </div>

              {/* Dominant Player */}
              {trustResult.summary.dominantPlayer && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>{trustResult.summary.dominantPlayer}</strong> dominates this space
                    with {trustResult.summary.dominantPlayerShare}% of all citations.
                  </p>
                </div>
              )}

              {/* Leaders List */}
              {trustResult.trustedSources.length === 0 ? (
                <p className="text-slate-500 text-center py-8">
                  No sources found being cited for this industry. The AI space may be wide open!
                </p>
              ) : (
                <div className="space-y-3">
                  {trustResult.trustedSources.map((source, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors bg-white"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            i === 0 ? 'bg-yellow-100 text-yellow-700' :
                            i === 1 ? 'bg-slate-200 text-slate-700' :
                            i === 2 ? 'bg-orange-100 text-orange-700' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {i + 1}
                          </div>
                          <div>
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-semibold text-indigo-600 hover:underline flex items-center gap-1"
                            >
                              {source.domain}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {source.categories.map((cat, j) => (
                                <span key={j} className={`px-2 py-0.5 rounded text-xs border ${getCategoryColor(cat)}`}>
                                  {cat}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-slate-900">
                            {source.citationCount}x
                          </div>
                          <div className="text-xs text-slate-500">
                            Avg pos: {source.avgPosition.toFixed(1)}
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 ml-11">
                        <p className="text-xs text-slate-500">
                          Answers: {source.questionsAnswered.slice(0, 2).map(q => `"${q.substring(0, 40)}..."`).join(', ')}
                          {source.questionsAnswered.length > 2 && ` +${source.questionsAnswered.length - 2} more`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Sales Pitch */}
              {trustResult.trustedSources.length > 0 && (
                <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <h4 className="font-bold text-orange-900 mb-2">Sales Pitch</h4>
                  <p className="text-sm text-orange-800">
                    "When people ask AI about {trustResult.industry}, here's who gets recommended: {' '}
                    {trustResult.trustedSources.slice(0, 3).map(s => s.domain).join(', ')}.
                    {' '}You're not on that list. We can change that."
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* How it Works */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-bold text-blue-900 mb-2">How This Works</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li><strong>AI Discovery:</strong> We ask AI real questions about your industry and check if your site gets cited.</li>
          <li><strong>Who Does AI Trust:</strong> Find who AI recommends for industry questions - your competitive landscape.</li>
          <li><strong>No keywords:</strong> This isn't about ranking for keywords. It's about being the source AI trusts.</li>
          <li><strong>Cost:</strong> ~$0.005 per question. Discovery runs ~8 questions, Trust runs ~6 questions.</li>
        </ul>
      </div>

      {/* Internal Playbook */}
      <div className="mt-6 p-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl text-white">
        <h3 className="text-xl font-black mb-4">Internal Playbook: How We Use This</h3>

        <div className="space-y-6">
          <div>
            <h4 className="font-bold text-orange-400 mb-2">The Pitch (30 seconds)</h4>
            <p className="text-slate-300 text-sm">
              "Google is becoming irrelevant. 40% of Gen Z uses TikTok and AI for search, not Google.
              When someone asks ChatGPT or Perplexity 'Who's the best [industry] in [city]?' - are you the answer?
              We can check right now. In 10 seconds, I'll show you if AI knows you exist."
            </p>
          </div>

          <div>
            <h4 className="font-bold text-orange-400 mb-2">Lead Gen Flow</h4>
            <ol className="text-slate-300 text-sm space-y-2 list-decimal list-inside">
              <li><strong>Find a prospect</strong> (from Lead Discovery, cold outreach, networking)</li>
              <li><strong>Run AI Discovery</strong> on their URL + their industry</li>
              <li><strong>Screenshot the results</strong> - especially the 0% or low citation rate</li>
              <li><strong>Send the screenshot</strong> with: "I ran your site through our AI visibility tool. When people ask AI about [industry], you're invisible. Here's who AI recommends instead: [competitors]. We fix this."</li>
              <li><strong>Book the call</strong> - they've never seen this data before</li>
            </ol>
          </div>

          <div>
            <h4 className="font-bold text-orange-400 mb-2">Competitive Intel Flow</h4>
            <ol className="text-slate-300 text-sm space-y-2 list-decimal list-inside">
              <li><strong>Run "Who Does AI Trust?"</strong> for your client's industry</li>
              <li><strong>Show them who's winning</strong> - "Here's who AI recommends when people ask about [industry]"</li>
              <li><strong>Position AISO services</strong> - "Our content strategy is designed to make AI cite YOU, not them"</li>
              <li><strong>Track progress</strong> - Re-run monthly to show improvement</li>
            </ol>
          </div>

          <div>
            <h4 className="font-bold text-orange-400 mb-2">Why This Matters (Investor Language)</h4>
            <p className="text-slate-300 text-sm mb-3">
              SEO tools measure Google rankings. But AI search doesn't rank pages - it cites trusted sources.
              There's no tool that tells businesses: "When AI answers questions about your industry, are you mentioned?"
            </p>
            <p className="text-slate-300 text-sm mb-3">
              <strong className="text-white">We built it.</strong> This is the first AI visibility tracker that uses
              real questions - not keywords - to measure if a business exists in AI's knowledge base.
            </p>
            <p className="text-slate-300 text-sm">
              <strong className="text-white">The market:</strong> Every business optimizing for Google (billions in SEO spend)
              will need to optimize for AI search. We're positioning AISO.studio as the platform that gets you there.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-700">
            <h4 className="font-bold text-orange-400 mb-2">Quick Reference</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-400">For prospects:</p>
                <p className="text-white font-medium">AI Discovery + their URL</p>
              </div>
              <div>
                <p className="text-slate-400">For market research:</p>
                <p className="text-white font-medium">Who Does AI Trust? + industry</p>
              </div>
              <div>
                <p className="text-slate-400">Best industries to target:</p>
                <p className="text-white font-medium">Local services, B2B, agencies</p>
              </div>
              <div>
                <p className="text-slate-400">Kill shot question:</p>
                <p className="text-white font-medium">"Does AI know you exist?"</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
