'use client';

import { useState } from 'react';

interface Lead {
  id: number;
  domain: string;
  business_name: string;
  city: string | null;
  state: string | null;
  industry: string | null;
  overall_score: number;
  content_score: number;
  seo_score: number;
  design_score: number;
  speed_score: number;
  has_blog: boolean;
  blog_post_count: number;
  phone: string | null;
  address: string | null;
  email: string | null;
  status: string;
  opportunity_rating: string | null;
  report_generated_at: string | null;
  contacted_at: string | null;
  notes: string | null;
  discovered_at: string;
  project_id: number | null;
  aiso_opportunity_score?: number;
  estimated_monthly_value?: number;
  primary_pain_point?: string;
  secondary_pain_points?: string[];
  recommended_pitch?: string;
  time_to_close?: string;
  accessibility_score?: number;
  wcag_critical_violations?: number;
  wcag_serious_violations?: number;
  wcag_moderate_violations?: number;
  wcag_minor_violations?: number;
  wcag_total_violations?: number;
  ranking_keywords?: number;
  avg_search_position?: number;
  estimated_organic_traffic?: number;
  discovery_data?: Record<string, unknown>;
}

interface EmailModalProps {
  lead: Lead;
  onClose: () => void;
  onSend: (data: { to: string; subject: string; body: string; template: string }) => Promise<boolean>;
}

const EMAIL_TEMPLATES = [
  {
    id: 'accessibility_urgent',
    name: 'Accessibility Urgent (Legal Risk)',
    description: 'For leads with critical WCAG violations',
    condition: (lead: Lead) => (lead.wcag_critical_violations || 0) > 0,
  },
  {
    id: 'hot_lead',
    name: 'Hot Lead (High Value)',
    description: 'For AISO score 70+',
    condition: (lead: Lead) => (lead.aiso_opportunity_score || 0) >= 70,
  },
  {
    id: 'warm_lead',
    name: 'Warm Lead',
    description: 'For AISO score 40-69',
    condition: (lead: Lead) => {
      const score = lead.aiso_opportunity_score || 0;
      return score >= 40 && score < 70;
    },
  },
  {
    id: 'cold_lead',
    name: 'Cold Intro',
    description: 'General outreach for any lead',
    condition: () => true,
  },
  {
    id: 'custom',
    name: 'Custom Email',
    description: 'Write your own message',
    condition: () => true,
  },
];

function generateEmailContent(lead: Lead, templateId: string): { subject: string; body: string } {
  const businessName = lead.business_name;
  const city = lead.city || 'your area';
  const industry = lead.industry || 'your industry';
  const painPoint = lead.primary_pain_point || 'improving your online presence';
  const criticalViolations = lead.wcag_critical_violations || 0;

  switch (templateId) {
    case 'accessibility_urgent':
      return {
        subject: `${businessName} - ${criticalViolations} Critical Website Accessibility Issues Found`,
        body: `Hi there,

I was researching ${industry} businesses in ${city} and came across ${businessName}'s website.

I noticed your site has ${criticalViolations} critical accessibility violations that could expose your business to ADA-related lawsuits. In 2023 alone, there were over 4,500 web accessibility lawsuits filed in the US.

These issues also hurt your search rankings - Google now factors accessibility into its core ranking signals.

I'd love to share a free accessibility audit report showing exactly what needs to be fixed and how it impacts your visibility in AI search results.

Would you be open to a 15-minute call this week?

Best regards`
      };

    case 'hot_lead':
      return {
        subject: `${businessName} - Quick Question About Your Content Strategy`,
        body: `Hi there,

I was looking at ${industry} businesses in ${city} and noticed ${businessName} has some significant opportunities to improve your online visibility.

Specifically, I found: ${painPoint}

Our AI-powered platform helps businesses like yours get found in ChatGPT, Google, and other AI search engines - where 40% of searches now happen.

Given what I've seen on your site, I think we could help you:
- Increase leads from AI-powered search
- Fix content gaps costing you customers
- Outrank competitors in your area

Can I send you a free analysis showing your current AI searchability score?

Best regards`
      };

    case 'warm_lead':
      return {
        subject: `Improving ${businessName}'s Online Visibility`,
        body: `Hi there,

I came across ${businessName} while researching ${industry} businesses in ${city}.

I noticed ${painPoint} - this is actually a common challenge we help local businesses solve.

Our AI-optimization platform helps businesses get found not just on Google, but also in ChatGPT, Claude, and other AI search tools that more and more customers are using.

Would you be interested in a free 5-minute audit showing how your business currently appears in AI search results?

Best regards`
      };

    case 'cold_lead':
      return {
        subject: `${businessName} - Quick Question`,
        body: `Hi there,

I'm reaching out to select ${industry} businesses in ${city} about a new way to get found online.

Did you know that 40% of people now use AI tools like ChatGPT and Claude to find local businesses? If your content isn't optimized for these platforms, you're missing out on potential customers.

We help businesses like ${businessName} create AI-optimized content that ranks in both traditional search AND AI search engines.

Would you be open to a brief conversation about how this could work for your business?

Best regards`
      };

    default:
      return {
        subject: `Reaching out from AISO`,
        body: lead.recommended_pitch || `Hi there,

I'd love to connect with you about improving ${businessName}'s online presence.

Best regards`
      };
  }
}

export default function EmailModal({ lead, onClose, onSend }: EmailModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>(() => {
    // Auto-select best template based on lead data
    if ((lead.wcag_critical_violations || 0) > 0) return 'accessibility_urgent';
    if ((lead.aiso_opportunity_score || 0) >= 70) return 'hot_lead';
    if ((lead.aiso_opportunity_score || 0) >= 40) return 'warm_lead';
    return 'cold_lead';
  });

  const [emailTo, setEmailTo] = useState(lead.email || '');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Generate content when template changes
  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    if (templateId !== 'custom') {
      const { subject, body } = generateEmailContent(lead, templateId);
      setEmailSubject(subject);
      setEmailBody(body);
    }
  };

  // Initialize email content
  useState(() => {
    const { subject, body } = generateEmailContent(lead, selectedTemplate);
    setEmailSubject(subject);
    setEmailBody(body);
  });

  const handleSend = async () => {
    if (!emailTo || !emailSubject || !emailBody) {
      setError('Please fill in all fields');
      return;
    }

    setSending(true);
    setError(null);

    try {
      const result = await onSend({
        to: emailTo,
        subject: emailSubject,
        body: emailBody,
        template: selectedTemplate,
      });

      if (result) {
        setSuccess(true);
        setTimeout(() => onClose(), 1500);
      } else {
        setError('Failed to send email. Please try again.');
      }
    } catch (err) {
      setError('An error occurred while sending the email.');
    } finally {
      setSending(false);
    }
  };

  // Filter templates that match this lead
  const relevantTemplates = EMAIL_TEMPLATES.filter(t => t.condition(lead));

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Email Sent!</h2>
          <p className="text-slate-600">Your email to {lead.business_name} has been sent successfully.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Send Email</h2>
            <p className="text-sm text-slate-600">to {lead.business_name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email Template</label>
            <div className="grid grid-cols-2 gap-2">
              {relevantTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateChange(template.id)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    selectedTemplate === template.id
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="font-medium text-sm text-slate-900">{template.name}</div>
                  <div className="text-xs text-slate-500">{template.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Lead Context */}
          <div className="bg-slate-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-700 mb-2">Lead Context</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {lead.aiso_opportunity_score !== undefined && (
                <div>
                  <span className="text-slate-500">AISO Score:</span>
                  <span className={`ml-1 font-semibold ${
                    lead.aiso_opportunity_score >= 70 ? 'text-red-600' :
                    lead.aiso_opportunity_score >= 40 ? 'text-yellow-600' : 'text-blue-600'
                  }`}>
                    {lead.aiso_opportunity_score}
                  </span>
                </div>
              )}
              {lead.wcag_critical_violations !== undefined && lead.wcag_critical_violations > 0 && (
                <div>
                  <span className="text-slate-500">Critical Violations:</span>
                  <span className="ml-1 font-semibold text-red-600">{lead.wcag_critical_violations}</span>
                </div>
              )}
              {lead.primary_pain_point && (
                <div className="col-span-2">
                  <span className="text-slate-500">Pain Point:</span>
                  <span className="ml-1 text-orange-700">{lead.primary_pain_point}</span>
                </div>
              )}
            </div>
          </div>

          {/* Email Form */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">To</label>
            <input
              type="email"
              value={emailTo}
              onChange={(e) => setEmailTo(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
            <input
              type="text"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Email subject"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
            <textarea
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              rows={10}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              placeholder="Type your message..."
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending || !emailTo || !emailSubject || !emailBody}
            className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            {sending ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Sending...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Send Email
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
