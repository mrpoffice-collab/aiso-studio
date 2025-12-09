'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardNav from '@/components/DashboardNav';

export default function NewStrategyPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    clientName: '',
    industry: '',
    goals: '',
    targetAudience: '',
    brandVoice: '',
    frequency: 'weekly',
    contentLength: 'medium',
    keywords: '',
    targetFleschScore: 55, // NEW - target reading level
    contentType: 'national', // NEW - national, local, hybrid
    city: '', // NEW - for local/hybrid
    state: '', // NEW - for local/hybrid
    serviceArea: '', // NEW - for local/hybrid
    websiteUrl: '', // NEW - for site audit & integration
  });

  // Analyze keywords and audience for reading level recommendation
  const [readabilityAnalysis, setReadabilityAnalysis] = useState<{
    suggestedFlesch: number;
    reasoning: string;
    confidence: 'high' | 'medium' | 'low';
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/strategies/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          goals: formData.goals.split(',').map(g => g.trim()).filter(Boolean),
          targetFleschScore: parseInt(formData.targetFleschScore.toString()),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate strategy');
      }

      const data = await response.json();
      router.push(`/dashboard/strategies/${data.strategyId}`);
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Trigger analysis when keywords or audience changes
    if (name === 'keywords' || name === 'targetAudience') {
      analyzeReadability();
    }
  };

  // Analyze keywords and audience to suggest reading level
  const analyzeReadability = () => {
    const keywords = formData.keywords.split(',').map(k => k.trim()).filter(Boolean);
    const audience = formData.targetAudience.toLowerCase();

    if (keywords.length === 0 && !audience) {
      setReadabilityAnalysis(null);
      return;
    }

    // Technical indicators
    const technicalTerms = ['api', 'rest', 'php', 'development', 'implementation', 'optimization',
      'configuration', 'integration', 'authentication', 'migration', 'deployment', 'framework',
      'architecture', 'infrastructure', 'database', 'server', 'cloud', 'devops'];

    // Professional indicators
    const professionalTerms = ['business', 'strategy', 'professional', 'services', 'consulting',
      'management', 'planning', 'analysis', 'marketing', 'sales', 'revenue', 'roi'];

    // Consumer indicators
    const consumerTerms = ['how to', 'guide', 'tips', 'easy', 'simple', 'beginner',
      'home', 'family', 'personal', 'diy', 'tutorial', 'basic'];

    let technicalCount = 0;
    let professionalCount = 0;
    let consumerCount = 0;

    keywords.forEach(keyword => {
      const lower = keyword.toLowerCase();
      if (technicalTerms.some(term => lower.includes(term))) technicalCount++;
      if (professionalTerms.some(term => lower.includes(term))) professionalCount++;
      if (consumerTerms.some(term => lower.includes(term))) consumerCount++;
    });

    // Audience analysis
    const isOlderAudience = /\b(40|50|60|70|senior|elderly|retiree)\b/.test(audience);
    const isDeveloperAudience = /\b(developer|engineer|programmer|technical)\b/.test(audience);
    const isBusinessAudience = /\b(executive|manager|business|professional|b2b)\b/.test(audience);
    const isGeneralPublic = /\b(public|consumer|homeowner|parent|family|anyone)\b/.test(audience);
    const isEmotionalTopic = /\b(grief|memorial|loss|funeral|remembrance|legacy|death)\b/.test(audience + ' ' + keywords.join(' ').toLowerCase());

    let suggestedFlesch = 55;
    let reasoning = 'Default for educated general audience';
    let confidence: 'high' | 'medium' | 'low' = 'medium';

    if (technicalCount > keywords.length * 0.4 || isDeveloperAudience) {
      suggestedFlesch = 35;
      reasoning = 'High technical content - developer/expert audience';
      confidence = 'high';
    } else if (professionalCount > keywords.length * 0.3 || isBusinessAudience) {
      suggestedFlesch = 50;
      reasoning = 'Professional/business audience';
      confidence = 'high';
    } else if (consumerCount > keywords.length * 0.3 || isGeneralPublic) {
      suggestedFlesch = 70;
      reasoning = 'General consumer audience';
      confidence = 'high';
    } else if (isEmotionalTopic && isOlderAudience) {
      suggestedFlesch = 58;
      reasoning = 'Emotional topics for adults 40+ need clarity';
      confidence = 'high';
    }

    setReadabilityAnalysis({ suggestedFlesch, reasoning, confidence });

    // Auto-set target if not manually changed
    setFormData(prev => ({
      ...prev,
      targetFleschScore: suggestedFlesch
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <DashboardNav />

      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="mb-8">
          <Link
            href="/dashboard/strategies"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-deep-indigo hover:text-sunset-orange transition-all"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Strategies
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200/60 bg-white p-10 shadow-2xl shadow-slate-300/50">
          <div className="mb-8">
            <h1 className="mb-3 text-4xl font-black bg-gradient-to-r from-deep-indigo via-blue-600 to-deep-indigo bg-clip-text text-transparent">
              Create Content Strategy
            </h1>
            <p className="text-lg text-slate-600 font-medium">
              Fill in your client details and we'll generate 12 SEO-optimized blog topics tailored to their needs.
            </p>
          </div>

          {error && (
            <div className="mb-8 rounded-xl bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 p-5 text-red-700 font-semibold flex items-start gap-3">
              <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-7">
            <div>
              <label htmlFor="clientName" className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-sunset-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Client Name *
              </label>
              <input
                type="text"
                id="clientName"
                name="clientName"
                required
                value={formData.clientName}
                onChange={handleChange}
                className="w-full rounded-xl border-2 border-slate-200 px-5 py-3.5 text-slate-900 font-medium focus:border-sunset-orange focus:outline-none focus:ring-4 focus:ring-sunset-orange/10 transition-all bg-slate-50/50"
                placeholder="Acme Corp"
              />
            </div>

            <div>
              <label htmlFor="industry" className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-sunset-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Industry *
              </label>
              <input
                type="text"
                id="industry"
                name="industry"
                required
                value={formData.industry}
                onChange={handleChange}
                className="w-full rounded-xl border-2 border-slate-200 px-5 py-3.5 text-slate-900 font-medium focus:border-sunset-orange focus:outline-none focus:ring-4 focus:ring-sunset-orange/10 transition-all bg-slate-50/50"
                placeholder="SaaS, E-commerce, Healthcare, etc."
              />
            </div>

            <div>
              <label htmlFor="websiteUrl" className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-sunset-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                Client Website URL
              </label>
              <input
                type="url"
                id="websiteUrl"
                name="websiteUrl"
                value={formData.websiteUrl}
                onChange={handleChange}
                className="w-full rounded-xl border-2 border-slate-200 px-5 py-3.5 text-slate-900 font-medium focus:border-sunset-orange focus:outline-none focus:ring-4 focus:ring-sunset-orange/10 transition-all bg-slate-50/50"
                placeholder="https://example.com"
              />
              <p className="mt-2 text-xs text-slate-600">
                Optional: Provide client website URL to discover existing content, images, and link opportunities
              </p>
            </div>

            <div>
              <label htmlFor="goals" className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-sunset-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                Content Goals *
              </label>
              <textarea
                id="goals"
                name="goals"
                required
                rows={3}
                value={formData.goals}
                onChange={handleChange}
                className="w-full rounded-xl border-2 border-slate-200 px-5 py-3.5 text-slate-900 font-medium focus:border-sunset-orange focus:outline-none focus:ring-4 focus:ring-sunset-orange/10 transition-all bg-slate-50/50"
                placeholder="Separate multiple goals with commas: Increase organic traffic, Build thought leadership, Generate leads"
              />
              <p className="mt-2 text-sm text-slate-500 font-medium">Separate multiple goals with commas</p>
            </div>

            <div>
              <label htmlFor="targetAudience" className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-sunset-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Target Audience *
              </label>
              <textarea
                id="targetAudience"
                name="targetAudience"
                required
                rows={3}
                value={formData.targetAudience}
                onChange={handleChange}
                className="w-full rounded-xl border-2 border-slate-200 px-5 py-3.5 text-slate-900 font-medium focus:border-sunset-orange focus:outline-none focus:ring-4 focus:ring-sunset-orange/10 transition-all bg-slate-50/50"
                placeholder="Marketing managers at B2B SaaS companies with 50-200 employees"
              />
            </div>

            <div>
              <label htmlFor="brandVoice" className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-sunset-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                Brand Voice *
              </label>
              <input
                type="text"
                id="brandVoice"
                name="brandVoice"
                required
                value={formData.brandVoice}
                onChange={handleChange}
                className="w-full rounded-xl border-2 border-slate-200 px-5 py-3.5 text-slate-900 font-medium focus:border-sunset-orange focus:outline-none focus:ring-4 focus:ring-sunset-orange/10 transition-all bg-slate-50/50"
                placeholder="Professional yet approachable, data-driven, conversational"
              />
            </div>

            <div className="grid gap-7 md:grid-cols-2">
              <div>
                <label htmlFor="frequency" className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-sunset-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Publishing Frequency *
                </label>
                <select
                  id="frequency"
                  name="frequency"
                  required
                  value={formData.frequency}
                  onChange={handleChange}
                  className="w-full rounded-xl border-2 border-slate-200 px-5 py-3.5 text-slate-900 font-medium focus:border-sunset-orange focus:outline-none focus:ring-4 focus:ring-sunset-orange/10 transition-all bg-slate-50/50"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label htmlFor="contentLength" className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-sunset-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Content Length *
                </label>
                <select
                  id="contentLength"
                  name="contentLength"
                  required
                  value={formData.contentLength}
                  onChange={handleChange}
                  className="w-full rounded-xl border-2 border-slate-200 px-5 py-3.5 text-slate-900 font-medium focus:border-sunset-orange focus:outline-none focus:ring-4 focus:ring-sunset-orange/10 transition-all bg-slate-50/50"
                >
                  <option value="short">Short (500-800 words)</option>
                  <option value="medium">Medium (1000-1500 words)</option>
                  <option value="long">Long (2000+ words)</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="keywords" className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-sunset-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Target Keywords (Optional)
              </label>
              <input
                type="text"
                id="keywords"
                name="keywords"
                value={formData.keywords}
                onChange={handleChange}
                className="w-full rounded-xl border-2 border-slate-200 px-5 py-3.5 text-slate-900 font-medium focus:border-sunset-orange focus:outline-none focus:ring-4 focus:ring-sunset-orange/10 transition-all bg-slate-50/50"
                placeholder="content marketing, SEO strategy, digital marketing"
              />
              <p className="mt-2 text-sm text-slate-500 font-medium">Comma-separated list of keywords to focus on</p>
            </div>

            {/* Reading Level Recommendation & Selection */}
            {readabilityAnalysis && (
              <div className="border-2 border-blue-200 rounded-xl p-6 bg-gradient-to-br from-blue-50 to-purple-50">
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="text-blue-600">🤖</span>
                  Reading Level Recommendation
                </h3>
                <div className="mb-4 p-4 rounded-lg bg-white/70 border border-blue-300">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <p className="text-sm text-slate-700 font-semibold mb-1">
                        ✅ Recommended: {
                          readabilityAnalysis.suggestedFlesch >= 70 ? '7th Grade (General Public)' :
                          readabilityAnalysis.suggestedFlesch >= 60 ? '8th-9th Grade (Standard)' :
                          readabilityAnalysis.suggestedFlesch >= 50 ? '10th Grade (Educated Adults)' :
                          readabilityAnalysis.suggestedFlesch >= 40 ? 'College Level (Professionals)' :
                          'Graduate Level (Technical Experts)'
                        }
                      </p>
                      <p className="text-xs text-slate-600">
                        <span className="font-bold">Target Flesch:</span> {readabilityAnalysis.suggestedFlesch} &nbsp;|&nbsp;
                        <span className="font-bold">Confidence:</span> {readabilityAnalysis.confidence.charAt(0).toUpperCase() + readabilityAnalysis.confidence.slice(1)}
                      </p>
                      <p className="text-xs text-blue-700 mt-2 font-medium">
                        💡 {readabilityAnalysis.reasoning}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="targetFleschScore" className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-sunset-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Target Reading Level *
                  </label>
                  <select
                    id="targetFleschScore"
                    name="targetFleschScore"
                    required
                    value={formData.targetFleschScore}
                    onChange={handleChange}
                    className="w-full rounded-xl border-2 border-slate-200 px-5 py-3.5 text-slate-900 font-medium focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all bg-white"
                  >
                    <option value={70}>General Public (7th grade, Flesch 70)</option>
                    <option value={60}>Standard Audience (8th-9th grade, Flesch 60)</option>
                    <option value={58}>Educated Adults (10th grade, Flesch 58)</option>
                    <option value={55}>Professionals (10th-12th grade, Flesch 55)</option>
                    <option value={50}>Business Audience (College level, Flesch 50)</option>
                    <option value={35}>Technical Experts (Graduate level, Flesch 35)</option>
                  </select>
                  <p className="mt-2 text-xs text-slate-600 font-medium">
                    ⚠️ This affects all topics and content generated for this strategy
                  </p>
                </div>
              </div>
            )}

            {/* AISO Stack - Content Type Selection */}
            <div className="border-t-2 border-slate-200 pt-7">
              <div className="mb-4 p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
                <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <span className="text-purple-600">🧭</span>
                  AISO Stack: Content Optimization Type
                </h3>
                <p className="text-xs text-slate-600">
                  Choose whether this content targets national or local audiences. Local content gets GEO (Local Intent Optimization) scoring.
                </p>
              </div>

              <div>
                <label htmlFor="contentType" className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-sunset-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Content Type *
                </label>
                <select
                  id="contentType"
                  name="contentType"
                  required
                  value={formData.contentType}
                  onChange={handleChange}
                  className="w-full rounded-xl border-2 border-slate-200 px-5 py-3.5 text-slate-900 font-medium focus:border-sunset-orange focus:outline-none focus:ring-4 focus:ring-sunset-orange/10 transition-all bg-slate-50/50"
                >
                  <option value="national">National Content (AEO + SEO)</option>
                  <option value="local">Local Business (AEO + GEO + SEO)</option>
                  <option value="hybrid">Hybrid (National + Local)</option>
                </select>
                <p className="mt-2 text-sm text-slate-500 font-medium">
                  {formData.contentType === 'national' && '✅ Standard content optimization for national audiences'}
                  {formData.contentType === 'local' && '📍 Optimized for local searches and "near me" queries'}
                  {formData.contentType === 'hybrid' && '🌐 Targets both national and local audiences'}
                </p>
              </div>
            </div>

            {/* Local Business Fields - Show only if local or hybrid */}
            {(formData.contentType === 'local' || formData.contentType === 'hybrid') && (
              <div className="border-2 border-green-200 rounded-xl p-6 bg-gradient-to-br from-green-50 to-blue-50">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Local Business Information
                </h3>
                <p className="text-sm text-slate-600 mb-6">
                  This information enables GEO (Local Intent Optimization) scoring for "near me" searches.
                </p>

                <div className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="city" className="block text-sm font-bold text-slate-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full rounded-lg border-2 border-slate-200 px-4 py-2.5 text-slate-900 font-medium focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition-all"
                        placeholder="San Francisco"
                      />
                    </div>

                    <div>
                      <label htmlFor="state" className="block text-sm font-bold text-slate-700 mb-2">
                        State *
                      </label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        required
                        value={formData.state}
                        onChange={handleChange}
                        className="w-full rounded-lg border-2 border-slate-200 px-4 py-2.5 text-slate-900 font-medium focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition-all"
                        placeholder="California"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="serviceArea" className="block text-sm font-bold text-slate-700 mb-2">
                      Service Area (Optional)
                    </label>
                    <textarea
                      id="serviceArea"
                      name="serviceArea"
                      rows={2}
                      value={formData.serviceArea}
                      onChange={handleChange}
                      className="w-full rounded-lg border-2 border-slate-200 px-4 py-2.5 text-slate-900 font-medium focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition-all"
                      placeholder="San Francisco Bay Area, including Oakland, San Jose, and surrounding cities"
                    />
                    <p className="mt-1 text-xs text-slate-500">Describe the geographic area you serve</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="group relative flex-1 px-8 py-4 rounded-xl bg-gradient-to-r from-sunset-orange to-orange-600 text-white font-bold text-lg shadow-2xl shadow-orange-300/50 hover:shadow-orange-400/60 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200 overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {isLoading ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Generating Strategy...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Generate Strategy
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </button>
              <Link
                href="/dashboard/strategies"
                className="px-8 py-4 rounded-xl border-2 border-slate-300 font-bold text-slate-700 hover:border-slate-400 hover:bg-slate-50 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-300/50 hover:scale-105 transition-all duration-200 flex items-center justify-center"
              >
                Cancel
              </Link>
            </div>
          </form>

          {isLoading && (
            <div className="mt-8 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 p-6 flex items-start gap-4">
              <div className="p-2 rounded-xl bg-gradient-to-br from-deep-indigo to-blue-600">
                <svg className="w-6 h-6 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-blue-900 mb-1">Thinking Really Hard...</p>
                <p className="text-sm text-blue-700 font-medium">
                  Generating your personalized content strategy with AI-validated topics optimized for search and readability. This may take 30-60 seconds.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
