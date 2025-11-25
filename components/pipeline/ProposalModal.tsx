'use client';

import { useState, useRef } from 'react';

interface Service {
  id: string;
  name: string;
  reason: string;
  type: 'monthly' | 'one-time';
  price: number;
  description: string;
}

interface Proposal {
  lead: {
    businessName: string;
    domain: string;
    industry: string | null;
    city: string | null;
    state: string | null;
  };
  scores: {
    overall: number;
    content: number;
    seo: number;
    accessibility?: number;
    wcagViolations?: number;
  };
  personalizedIntro: string;
  painPoints: {
    primary: string | null;
    secondary: string[];
  };
  services: Service[];
  pricing: {
    monthlyTotal: number;
    oneTimeTotal: number;
    firstMonthTotal: number;
  };
  generatedAt: string;
}

interface ProposalModalProps {
  proposal: Proposal;
  onClose: () => void;
}

export default function ProposalModal({ proposal, onClose }: ProposalModalProps) {
  const [copied, setCopied] = useState(false);
  const proposalRef = useRef<HTMLDivElement>(null);

  const copyToClipboard = async () => {
    if (proposalRef.current) {
      try {
        // Get the HTML content
        const htmlContent = proposalRef.current.innerHTML;

        // Also create a plain text version
        const textContent = proposalRef.current.innerText;

        // Copy both HTML and text
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': new Blob([htmlContent], { type: 'text/html' }),
            'text/plain': new Blob([textContent], { type: 'text/plain' }),
          }),
        ]);

        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        // Fallback to text only
        const textContent = proposalRef.current.innerText;
        await navigator.clipboard.writeText(textContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const location = [proposal.lead.city, proposal.lead.state].filter(Boolean).join(', ');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-orange-500 to-orange-600">
          <div>
            <h2 className="text-xl font-bold text-white">Proposal for {proposal.lead.businessName}</h2>
            <p className="text-orange-100 text-sm">{proposal.lead.domain}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium text-sm transition-colors inline-flex items-center gap-2"
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Proposal Content */}
        <div className="overflow-y-auto flex-1 p-6">
          <div ref={proposalRef} className="proposal-content">
            {/* Header */}
            <div className="text-center mb-8 pb-6 border-b border-slate-200">
              <div className="inline-block bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-full text-sm font-semibold mb-4">
                Digital Growth Proposal
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                {proposal.lead.businessName}
              </h1>
              {location && (
                <p className="text-slate-600">{location}</p>
              )}
              <p className="text-sm text-slate-500 mt-2">
                Prepared on {new Date(proposal.generatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            {/* Personalized Intro */}
            <div className="mb-8">
              <p className="text-lg text-slate-700 leading-relaxed">
                {proposal.personalizedIntro}
              </p>
            </div>

            {/* Current State / Audit Summary */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                Website Audit Summary
              </h2>
              <div className="bg-slate-50 rounded-xl p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${
                      proposal.scores.overall >= 70 ? 'text-green-600' :
                      proposal.scores.overall >= 50 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {proposal.scores.overall}
                    </div>
                    <div className="text-xs text-slate-600">Overall Score</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${
                      proposal.scores.content >= 70 ? 'text-green-600' :
                      proposal.scores.content >= 50 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {proposal.scores.content}
                    </div>
                    <div className="text-xs text-slate-600">Content</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${
                      proposal.scores.seo >= 70 ? 'text-green-600' :
                      proposal.scores.seo >= 50 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {proposal.scores.seo}
                    </div>
                    <div className="text-xs text-slate-600">SEO</div>
                  </div>
                  {proposal.scores.accessibility !== undefined && (
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${
                        proposal.scores.accessibility >= 70 ? 'text-green-600' :
                        proposal.scores.accessibility >= 50 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {proposal.scores.accessibility}
                      </div>
                      <div className="text-xs text-slate-600">Accessibility</div>
                    </div>
                  )}
                </div>

                {/* Key Issues */}
                {proposal.painPoints.primary && (
                  <div className="border-t border-slate-200 pt-4 mt-4">
                    <h4 className="font-semibold text-slate-900 mb-2">Key Findings:</h4>
                    <ul className="space-y-1">
                      <li className="text-slate-700 flex items-start gap-2">
                        <span className="text-orange-500 mt-1">•</span>
                        {proposal.painPoints.primary}
                      </li>
                      {proposal.painPoints.secondary.map((point, idx) => (
                        <li key={idx} className="text-slate-700 flex items-start gap-2">
                          <span className="text-orange-500 mt-1">•</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {proposal.scores.wcagViolations && proposal.scores.wcagViolations > 0 && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 text-sm">
                      <strong>Legal Risk:</strong> {proposal.scores.wcagViolations} critical WCAG accessibility violations detected.
                      These could expose your business to ADA compliance lawsuits.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Recommended Services */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                Recommended Solutions
              </h2>
              <div className="space-y-4">
                {proposal.services.map((service) => (
                  <div key={service.id} className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-50 px-6 py-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900">{service.name}</h3>
                        <p className="text-sm text-orange-600">{service.reason}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-slate-900">
                          ${service.price.toLocaleString()}
                          {service.type === 'monthly' && <span className="text-sm font-normal text-slate-500">/mo</span>}
                        </div>
                        <div className={`text-xs px-2 py-0.5 rounded inline-block ${
                          service.type === 'monthly'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {service.type === 'monthly' ? 'Monthly' : 'One-time'}
                        </div>
                      </div>
                    </div>
                    <div className="px-6 py-4">
                      <p className="text-slate-700">{service.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Investment Summary */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                Investment Summary
              </h2>
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 text-white">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {proposal.pricing.monthlyTotal > 0 && (
                    <div className="text-center">
                      <div className="text-3xl font-bold">${proposal.pricing.monthlyTotal.toLocaleString()}</div>
                      <div className="text-slate-400 text-sm">Monthly Investment</div>
                    </div>
                  )}
                  {proposal.pricing.oneTimeTotal > 0 && (
                    <div className="text-center">
                      <div className="text-3xl font-bold">${proposal.pricing.oneTimeTotal.toLocaleString()}</div>
                      <div className="text-slate-400 text-sm">One-Time Investment</div>
                    </div>
                  )}
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-400">${proposal.pricing.firstMonthTotal.toLocaleString()}</div>
                    <div className="text-slate-400 text-sm">First Month Total</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                Next Steps
              </h2>
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                <ol className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                    <span className="text-slate-700"><strong>Schedule a Call:</strong> Let's discuss your goals and answer any questions about our recommendations.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                    <span className="text-slate-700"><strong>Customize Your Plan:</strong> We'll tailor the services to match your specific needs and budget.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                    <span className="text-slate-700"><strong>Get Started:</strong> Once approved, we can begin implementation within 48 hours.</span>
                  </li>
                </ol>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-slate-500 text-sm pt-6 border-t border-slate-200">
              <p>This proposal was generated using AI-powered website analysis.</p>
              <p className="mt-1">Questions? Reply to this email or call us directly.</p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="text-sm text-slate-600">
            Cost: ~$0.01 to generate this proposal
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-100 transition-colors"
            >
              Close
            </button>
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:shadow-lg transition-all inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {copied ? 'Copied!' : 'Copy Proposal'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
