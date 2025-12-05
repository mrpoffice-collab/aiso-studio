'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardNav from '@/components/DashboardNav';
import { AISOMascotLoading } from '@/components/AISOMascot';

interface WizardState {
  currentStep: number;
  prospectUrl: string;
  auditResult: any | null;
  comparisonResult: any | null;
  leadId: number | null;
  proposalGenerated: boolean;
  competitorUrls: string[];
}

const STEPS = [
  { id: 1, name: 'Audit', description: 'Analyze the prospect\'s website' },
  { id: 2, name: 'Insights', description: 'Review scores & pain points' },
  { id: 3, name: 'Compare', description: 'Stack up against competitors' },
  { id: 4, name: 'Pipeline', description: 'Add to your sales pipeline' },
  { id: 5, name: 'Proposal', description: 'Generate winning proposal' },
  { id: 6, name: 'Close', description: 'Send & follow up' },
];

export default function WinClientWizard() {
  const [state, setState] = useState<WizardState>({
    currentStep: 1,
    prospectUrl: '',
    auditResult: null,
    comparisonResult: null,
    leadId: null,
    proposalGenerated: false,
    competitorUrls: ['', ''],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [proposal, setProposal] = useState<any>(null);

  const updateState = (updates: Partial<WizardState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  // Step 1: Run Audit
  const handleRunAudit = async () => {
    if (!state.prospectUrl.trim()) {
      setError('Please enter a URL');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: state.prospectUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Audit failed');
      }

      updateState({ auditResult: data, currentStep: 2 });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Run Comparison
  const handleRunComparison = async () => {
    const competitors = state.competitorUrls.filter(u => u.trim());
    if (competitors.length === 0) {
      // Skip comparison if no competitors entered
      updateState({ currentStep: 4 });
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/audit/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUrl: state.prospectUrl,
          competitorUrls: competitors,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Comparison failed');
      }

      updateState({ comparisonResult: data, currentStep: 4 });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 4: Add to Pipeline
  const handleAddToPipeline = async () => {
    setIsLoading(true);
    setError('');

    try {
      const domain = new URL(state.prospectUrl).hostname.replace('www.', '');
      const businessName = domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);

      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_name: businessName,
          domain: domain,
          source: 'win-client-wizard',
          overall_score: state.auditResult?.aisoScore || state.auditResult?.overallScore || 0,
          notes: `Added via Win a Client wizard. AISO Score: ${state.auditResult?.aisoScore || 'N/A'}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add to pipeline');
      }

      updateState({ leadId: data.lead?.id, currentStep: 5 });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 5: Generate Proposal
  const handleGenerateProposal = async () => {
    if (!state.leadId) {
      setError('Please add to pipeline first');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/leads/${state.leadId}/proposal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate proposal');
      }

      setProposal(data.proposal);
      updateState({ proposalGenerated: true, currentStep: 6 });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 80) return '✅';
    if (score >= 60) return '⚠️';
    return '🔴';
  };

  const getPainPoints = (): { issue: string; detail: string; severity: string }[] => {
    const points: { issue: string; detail: string; severity: string }[] = [];
    const result = state.auditResult;
    if (!result) return points;

    if ((result.aisoScore || result.overallScore || 0) < 70) {
      points.push({ issue: 'Low AI Visibility', detail: 'Their content won\'t be cited by ChatGPT, Perplexity, or Google SGE', severity: 'high' });
    }
    if (result.accessibilityScore && result.accessibilityScore < 70) {
      points.push({ issue: 'Accessibility Issues', detail: `${result.criticalCount || 0} critical + ${result.seriousCount || 0} serious WCAG violations`, severity: 'high' });
    }
    if (result.aeoScore && result.aeoScore < 60) {
      points.push({ issue: 'Poor AEO', detail: 'Content not optimized for AI answer engines', severity: 'medium' });
    }
    if (result.seoScore && result.seoScore < 70) {
      points.push({ issue: 'SEO Weaknesses', detail: 'Missing optimization for traditional search', severity: 'medium' });
    }
    if (result.factCheckScore && result.factCheckScore < 70) {
      points.push({ issue: 'Fact-Check Concerns', detail: 'Unverified claims may hurt credibility with AI', severity: 'medium' });
    }
    if (result.readabilityScore && result.readabilityScore < 60) {
      points.push({ issue: 'Readability Issues', detail: 'Content too complex for broad audience', severity: 'low' });
    }

    return points;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50">
      <DashboardNav />

      <main className="container mx-auto px-6 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-black bg-gradient-to-r from-orange-500 to-pink-600 bg-clip-text text-transparent mb-2">
            Win a Client
          </h1>
          <p className="text-slate-600">Step-by-step wizard to turn a prospect into a paying client</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                      state.currentStep > step.id
                        ? 'bg-green-500 text-white'
                        : state.currentStep === step.id
                        ? 'bg-orange-500 text-white ring-4 ring-orange-200'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {state.currentStep > step.id ? '✓' : step.id}
                  </div>
                  <div className="mt-2 text-center">
                    <div className={`text-xs font-bold ${state.currentStep >= step.id ? 'text-slate-900' : 'text-slate-400'}`}>
                      {step.name}
                    </div>
                    <div className="text-xs text-slate-500 hidden md:block">{step.description}</div>
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`w-full h-1 mx-2 rounded ${state.currentStep > step.id ? 'bg-green-500' : 'bg-slate-200'}`} style={{ minWidth: '40px' }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
            {error}
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-8">
          {/* Step 1: Audit */}
          {state.currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🔍</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900">Step 1: Audit Their Website</h2>
                <p className="text-slate-600 mt-2">Enter the prospect's website URL to analyze their AI readiness</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Prospect's Website URL</label>
                <input
                  type="url"
                  value={state.prospectUrl}
                  onChange={(e) => updateState({ prospectUrl: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all text-slate-900"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                  <span className="font-bold">💡 Tip:</span> The audit will analyze their AISO score (AI Search Optimization),
                  WCAG accessibility, SEO, readability, and fact-checking. Lower scores = bigger opportunity for you!
                </p>
              </div>

              <button
                onClick={handleRunAudit}
                disabled={isLoading || !state.prospectUrl.trim()}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-pink-600 text-white font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    Running Full Audit...
                  </span>
                ) : (
                  'Run AISO Audit →'
                )}
              </button>
            </div>
          )}

          {/* Step 2: Insights */}
          {state.currentStep === 2 && state.auditResult && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📊</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900">Step 2: Review the Opportunity</h2>
                <p className="text-slate-600 mt-2">Here's what we found - use these insights in your pitch</p>
              </div>

              {/* Main Score */}
              <div className="text-center p-6 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200">
                <div className="text-sm font-bold text-slate-500 uppercase mb-2">Overall AISO Score</div>
                <div className={`text-6xl font-black ${
                  (state.auditResult.aisoScore || state.auditResult.overallScore || 0) >= 80 ? 'text-green-600' :
                  (state.auditResult.aisoScore || state.auditResult.overallScore || 0) >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {state.auditResult.aisoScore || state.auditResult.overallScore || 0}
                </div>
                <div className="text-sm text-slate-500 mt-2">out of 100</div>
              </div>

              {/* Score Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {state.auditResult.accessibilityScore !== undefined && state.auditResult.accessibilityScore !== null && (
                  <div className={`p-3 rounded-lg border ${getScoreColor(state.auditResult.accessibilityScore)}`}>
                    <div className="text-xs font-bold uppercase">WCAG</div>
                    <div className="text-2xl font-black">{getScoreEmoji(state.auditResult.accessibilityScore)} {state.auditResult.accessibilityScore}</div>
                  </div>
                )}
                {state.auditResult.aeoScore !== undefined && (
                  <div className={`p-3 rounded-lg border ${getScoreColor(state.auditResult.aeoScore)}`}>
                    <div className="text-xs font-bold uppercase">AEO</div>
                    <div className="text-2xl font-black">{getScoreEmoji(state.auditResult.aeoScore)} {state.auditResult.aeoScore}</div>
                  </div>
                )}
                <div className={`p-3 rounded-lg border ${getScoreColor(state.auditResult.seoScore || 0)}`}>
                  <div className="text-xs font-bold uppercase">SEO</div>
                  <div className="text-2xl font-black">{getScoreEmoji(state.auditResult.seoScore || 0)} {state.auditResult.seoScore || 0}</div>
                </div>
                <div className={`p-3 rounded-lg border ${getScoreColor(state.auditResult.factCheckScore || 0)}`}>
                  <div className="text-xs font-bold uppercase">Fact-Check</div>
                  <div className="text-2xl font-black">{getScoreEmoji(state.auditResult.factCheckScore || 0)} {state.auditResult.factCheckScore || 0}</div>
                </div>
                <div className={`p-3 rounded-lg border ${getScoreColor(state.auditResult.readabilityScore || 0)}`}>
                  <div className="text-xs font-bold uppercase">Readability</div>
                  <div className="text-2xl font-black">{getScoreEmoji(state.auditResult.readabilityScore || 0)} {state.auditResult.readabilityScore || 0}</div>
                </div>
                <div className={`p-3 rounded-lg border ${getScoreColor(state.auditResult.engagementScore || 0)}`}>
                  <div className="text-xs font-bold uppercase">Engagement</div>
                  <div className="text-2xl font-black">{getScoreEmoji(state.auditResult.engagementScore || 0)} {state.auditResult.engagementScore || 0}</div>
                </div>
              </div>

              {/* Pain Points */}
              {getPainPoints().length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">🎯 Sales Angles (Pain Points)</h3>
                  <div className="space-y-2">
                    {getPainPoints().map((point, i) => (
                      <div key={i} className={`p-3 rounded-lg border ${
                        point.severity === 'high' ? 'bg-red-50 border-red-200' :
                        point.severity === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                        'bg-blue-50 border-blue-200'
                      }`}>
                        <div className="font-bold text-slate-900">{point.issue}</div>
                        <div className="text-sm text-slate-600">{point.detail}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => updateState({ currentStep: 1 })}
                  className="px-6 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-all"
                >
                  ← Back
                </button>
                <button
                  onClick={() => updateState({ currentStep: 3 })}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-600 text-white font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                >
                  Continue to Competitor Comparison →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Compare */}
          {state.currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">⚔️</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900">Step 3: Compare Against Competitors</h2>
                <p className="text-slate-600 mt-2">Show them how they stack up (creates urgency!)</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Competitor 1 URL</label>
                  <input
                    type="url"
                    value={state.competitorUrls[0]}
                    onChange={(e) => {
                      const newUrls = [...state.competitorUrls];
                      newUrls[0] = e.target.value;
                      updateState({ competitorUrls: newUrls });
                    }}
                    placeholder="https://competitor1.com"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Competitor 2 URL (optional)</label>
                  <input
                    type="url"
                    value={state.competitorUrls[1]}
                    onChange={(e) => {
                      const newUrls = [...state.competitorUrls];
                      newUrls[1] = e.target.value;
                      updateState({ competitorUrls: newUrls });
                    }}
                    placeholder="https://competitor2.com"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-slate-900"
                  />
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <p className="text-sm text-purple-800">
                  <span className="font-bold">💡 Tip:</span> Showing prospects they rank below competitors creates urgency.
                  "You're #3 out of 3 for AI visibility in your market" is a powerful sales message.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => updateState({ currentStep: 2 })}
                  className="px-6 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-all"
                >
                  ← Back
                </button>
                <button
                  onClick={() => updateState({ currentStep: 4 })}
                  className="px-6 py-3 rounded-xl border-2 border-slate-300 text-slate-600 font-bold hover:bg-slate-50 transition-all"
                >
                  Skip This Step
                </button>
                <button
                  onClick={handleRunComparison}
                  disabled={isLoading || !state.competitorUrls.some(u => u.trim())}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Running Comparison...' : 'Run Comparison →'}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Pipeline */}
          {state.currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📋</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900">Step 4: Add to Pipeline</h2>
                <p className="text-slate-600 mt-2">Track this opportunity in your sales pipeline</p>
              </div>

              {/* Comparison Results if available */}
              {state.comparisonResult && (
                <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 mb-6">
                  <h3 className="font-bold text-purple-900 mb-2">📊 Comparison Results</h3>
                  <p className="text-sm text-purple-800">
                    Your prospect ranks #{state.comparisonResult.targetRank || '?'} out of {(state.comparisonResult.results?.length || 1)} sites analyzed.
                  </p>
                  {state.comparisonResult.salesPitch && (
                    <p className="text-sm text-purple-700 mt-2 italic">"{state.comparisonResult.salesPitch}"</p>
                  )}
                </div>
              )}

              <div className="p-6 rounded-xl bg-slate-50 border border-slate-200">
                <h3 className="font-bold text-slate-900 mb-4">Lead Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Website:</span>
                    <span className="ml-2 font-medium text-slate-900">{state.prospectUrl}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">AISO Score:</span>
                    <span className="ml-2 font-medium text-slate-900">{state.auditResult?.aisoScore || state.auditResult?.overallScore || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Pain Points:</span>
                    <span className="ml-2 font-medium text-slate-900">{getPainPoints().length} identified</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Source:</span>
                    <span className="ml-2 font-medium text-slate-900">Win Client Wizard</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => updateState({ currentStep: 3 })}
                  className="px-6 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-all"
                >
                  ← Back
                </button>
                <button
                  onClick={handleAddToPipeline}
                  disabled={isLoading}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Adding to Pipeline...' : 'Add to Pipeline & Continue →'}
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Proposal */}
          {state.currentStep === 5 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📄</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900">Step 5: Generate Proposal</h2>
                <p className="text-slate-600 mt-2">Create a professional proposal with ROI projections</p>
              </div>

              <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                <p className="text-sm text-green-800">
                  <span className="font-bold">✅ Lead Added!</span> This prospect is now in your pipeline.
                  {state.leadId && <span className="ml-1">(Lead ID: {state.leadId})</span>}
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                <h3 className="font-bold text-slate-900 mb-3">The proposal will include:</h3>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> Current state analysis based on audit
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> Recommended services to fix issues
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> ROI projections (score → traffic → leads → revenue)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> Pricing options (monthly + one-time)
                  </li>
                </ul>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => updateState({ currentStep: 4 })}
                  className="px-6 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-all"
                >
                  ← Back
                </button>
                <button
                  onClick={handleGenerateProposal}
                  disabled={isLoading}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Generating Proposal...' : 'Generate Proposal →'}
                </button>
              </div>
            </div>
          )}

          {/* Step 6: Close */}
          {state.currentStep === 6 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🎉</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900">Step 6: Close the Deal!</h2>
                <p className="text-slate-600 mt-2">Send your proposal and follow up to win</p>
              </div>

              {/* Proposal Preview */}
              {proposal && (
                <div className="p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                  <h3 className="font-bold text-green-900 mb-4">✅ Proposal Generated!</h3>

                  {proposal.recommendedServices && (
                    <div className="mb-4">
                      <h4 className="text-sm font-bold text-slate-700 mb-2">Recommended Services:</h4>
                      <ul className="space-y-1">
                        {proposal.recommendedServices.map((service: any, i: number) => (
                          <li key={i} className="text-sm text-slate-600">
                            • {service.name} - ${service.price}/{service.type === 'monthly' ? 'mo' : 'one-time'}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {proposal.roi && (
                    <div className="p-3 rounded-lg bg-white/50">
                      <h4 className="text-sm font-bold text-slate-700 mb-1">Projected ROI:</h4>
                      <p className="text-sm text-slate-600">
                        Score improvement: {proposal.roi.currentScore} → {proposal.roi.projectedScore} (+{proposal.roi.projectedScore - proposal.roi.currentScore} points)
                      </p>
                      {proposal.roi.annualROI && (
                        <p className="text-sm font-bold text-green-700">
                          Annual ROI: {proposal.roi.annualROI}%
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Next Actions */}
              <div className="grid md:grid-cols-2 gap-4">
                <Link
                  href={`/dashboard/pipeline?lead=${state.leadId}`}
                  className="p-4 rounded-xl border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-center"
                >
                  <div className="text-2xl mb-2">📧</div>
                  <div className="font-bold text-slate-900">Send Email</div>
                  <div className="text-sm text-slate-500">Open lead & compose email</div>
                </Link>

                <Link
                  href="/dashboard/pipeline"
                  className="p-4 rounded-xl border-2 border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-all text-center"
                >
                  <div className="text-2xl mb-2">📋</div>
                  <div className="font-bold text-slate-900">View Pipeline</div>
                  <div className="text-sm text-slate-500">See all your leads</div>
                </Link>

                <button
                  onClick={() => {
                    setState({
                      currentStep: 1,
                      prospectUrl: '',
                      auditResult: null,
                      comparisonResult: null,
                      leadId: null,
                      proposalGenerated: false,
                      competitorUrls: ['', ''],
                    });
                    setProposal(null);
                  }}
                  className="p-4 rounded-xl border-2 border-slate-200 hover:border-orange-300 hover:bg-orange-50 transition-all text-center"
                >
                  <div className="text-2xl mb-2">🔄</div>
                  <div className="font-bold text-slate-900">Win Another Client</div>
                  <div className="text-sm text-slate-500">Start fresh with new prospect</div>
                </button>

                <Link
                  href="/dashboard"
                  className="p-4 rounded-xl border-2 border-slate-200 hover:border-green-300 hover:bg-green-50 transition-all text-center"
                >
                  <div className="text-2xl mb-2">🏠</div>
                  <div className="font-bold text-slate-900">Dashboard</div>
                  <div className="text-sm text-slate-500">Return to main dashboard</div>
                </Link>
              </div>

              {/* Follow-up Tips */}
              <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200">
                <h3 className="font-bold text-yellow-900 mb-2">📞 Follow-up Playbook</h3>
                <ul className="space-y-1 text-sm text-yellow-800">
                  <li><strong>Day 0:</strong> Send audit summary + "I found some issues worth discussing"</li>
                  <li><strong>Day 3:</strong> Follow up with competitor comparison if they haven't replied</li>
                  <li><strong>Day 7:</strong> Send full proposal with ROI projections</li>
                  <li><strong>Day 14:</strong> Final check-in, offer limited-time discount</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-sm text-center">
              <AISOMascotLoading message={
                state.currentStep === 1 ? "Running full AISO audit..." :
                state.currentStep === 3 ? "Comparing against competitors..." :
                state.currentStep === 4 ? "Adding to pipeline..." :
                state.currentStep === 5 ? "Generating proposal..." :
                "Processing..."
              } />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
