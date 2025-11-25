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
  initialSubject?: string;
  initialBody?: string;
}

const EMAIL_TEMPLATES = [
  {
    id: 'accessibility_urgent',
    name: 'ADA Legal Risk',
    description: 'WCAG violations = lawsuit risk. High urgency.',
    condition: (lead: Lead) => (lead.wcag_critical_violations || 0) > 0,
  },
  {
    id: 'search_visibility',
    name: 'Search Data Hook',
    description: 'Lead with their actual ranking data',
    condition: (lead: Lead) => (lead.ranking_keywords || 0) > 0,
  },
  {
    id: 'hot_lead',
    name: 'High-Value Opportunity',
    description: 'AISO 70+ - ready to buy',
    condition: (lead: Lead) => (lead.aiso_opportunity_score || 0) >= 70,
  },
  {
    id: 'warm_lead',
    name: 'Warm Introduction',
    description: 'AISO 40-69 - needs nurturing',
    condition: (lead: Lead) => {
      const score = lead.aiso_opportunity_score || 0;
      return score >= 40 && score < 70;
    },
  },
  {
    id: 'cold_lead',
    name: 'AI Search Angle',
    description: 'ChatGPT/AI discovery hook',
    condition: () => true,
  },
  {
    id: 'proposal',
    name: 'Proposal',
    description: 'Generated proposal email',
    condition: () => true,
  },
  {
    id: 'custom',
    name: 'Custom Email',
    description: 'Write your own',
    condition: () => true,
  },
];

function generateEmailContent(lead: Lead, templateId: string): { subject: string; body: string } {
  const businessName = lead.business_name;
  const firstName = businessName.split(' ')[0]; // Use first word as informal name
  const city = lead.city || 'your area';
  const industry = lead.industry || 'your industry';
  const painPoint = lead.primary_pain_point || 'content gaps hurting your visibility';

  // Rich data points
  const criticalViolations = lead.wcag_critical_violations || 0;
  const seriousViolations = lead.wcag_serious_violations || 0;
  const totalViolations = lead.wcag_total_violations || 0;
  const accessibilityScore = lead.accessibility_score || 0;
  const aisoScore = lead.aiso_opportunity_score || 0;
  const monthlyValue = lead.estimated_monthly_value || 0;
  const keywords = lead.ranking_keywords || 0;
  const avgPosition = lead.avg_search_position || 0;
  const organicTraffic = lead.estimated_organic_traffic || 0;
  const timeToClose = lead.time_to_close || '30 days';

  // Format numbers nicely
  const formatNumber = (n: number) => n.toLocaleString();
  const formatMoney = (n: number) => n >= 1000 ? `$${(n/1000).toFixed(0)}k` : `$${n}`;

  switch (templateId) {
    case 'accessibility_urgent':
      return {
        subject: `${criticalViolations} ADA violations on ${lead.domain} - lawsuit risk?`,
        body: `Hi,

I ran an accessibility audit on ${lead.domain} and found ${criticalViolations} critical + ${seriousViolations} serious WCAG violations.

Why this matters: ADA website lawsuits hit a record 4,600+ in 2023. Average settlement: $25,000-$75,000.

The fixes aren't hard - most take under 2 weeks. I put together a free report showing exactly what needs fixing, prioritized by legal risk.

Want me to send it over?

—
The AISO Team
AI Search Optimization
aiso.studio
P.S. These issues are also hurting your Google rankings - accessibility is now a core ranking signal.`
      };

    case 'search_visibility':
      return {
        subject: `${businessName}: ${keywords} keywords, position ${avgPosition.toFixed(0)} - room to grow?`,
        body: `Hi,

I was analyzing ${industry} websites in ${city} and pulled some data on ${lead.domain}:

${keywords > 0 ? `• Ranking for ${formatNumber(keywords)} keywords` : ''}
${avgPosition > 0 ? `• Average position: ${avgPosition.toFixed(1)} (page ${Math.ceil(avgPosition / 10)})` : ''}
${organicTraffic > 0 ? `• ~${formatNumber(organicTraffic)} monthly organic visitors` : ''}

The gap I noticed: ${painPoint}

For context, your top competitors are averaging position 3-5 for similar keywords. There's definitely room to capture more traffic.

I have a detailed breakdown if you're interested - no pitch, just data.

—
The AISO Team
aiso.studio`
      };

    case 'hot_lead':
      return {
        subject: `${businessName}: found ${keywords > 0 ? keywords + ' keywords' : 'an opportunity'} your competitors are missing`,
        body: `Hi,

I analyzed ${lead.domain} and found something interesting:

${keywords > 0 ? `• You rank for ${formatNumber(keywords)} keywords (avg position: ${avgPosition.toFixed(0)})` : ''}
${organicTraffic > 0 ? `• Estimated ${formatNumber(organicTraffic)} monthly organic visits` : ''}
• Primary gap: ${painPoint}

Here's the opportunity: 40% of searches now happen in AI tools (ChatGPT, Perplexity, etc). Your competitors aren't optimized for this yet.

I built a free AI visibility report for ${businessName} showing exactly where you're invisible in AI search and how to fix it.

Worth a look?

—
The AISO Team
AI Search Optimization
aiso.studio`
      };

    case 'warm_lead':
      return {
        subject: `Quick question about ${businessName}'s content`,
        body: `Hi,

Noticed ${lead.domain} while researching ${industry} in ${city}.

One thing stood out: ${painPoint}

This is fixable - usually takes ${timeToClose} to see results.

I put together a quick analysis showing your current AI search visibility. Happy to share if useful.

—
The AISO Team
aiso.studio`
      };

    case 'cold_lead':
      return {
        subject: `${firstName} - how ${industry} businesses get found in 2024`,
        body: `Hi,

Quick question: when someone asks ChatGPT for "${industry} recommendations in ${city}" - does ${businessName} come up?

For most local businesses, the answer is no. That's a problem because 40% of searches now happen in AI tools.

We help ${industry} businesses show up in both Google AND AI search results.

Interested in seeing where ${businessName} currently stands?

—
The AISO Team
AI Search Optimization
aiso.studio`
      };

    default:
      return {
        subject: `${businessName} - AI search visibility`,
        body: lead.recommended_pitch || `Hi,

I'd love to share some insights about ${businessName}'s online visibility opportunities.

${monthlyValue > 0 ? `Based on my analysis, there's approximately ${formatMoney(monthlyValue)}/month in untapped potential.` : ''}

Worth a quick conversation?

—
The AISO Team
aiso.studio`
      };
  }
}

export default function EmailModal({ lead, onClose, onSend, initialSubject, initialBody }: EmailModalProps) {
  // If we have initial content (from proposal), use 'proposal' template, otherwise auto-select
  const [selectedTemplate, setSelectedTemplate] = useState<string>(() => {
    if (initialBody) return 'proposal';
    // Auto-select best template based on lead data
    if ((lead.wcag_critical_violations || 0) > 0) return 'accessibility_urgent';
    if ((lead.aiso_opportunity_score || 0) >= 70) return 'hot_lead';
    if ((lead.aiso_opportunity_score || 0) >= 40) return 'warm_lead';
    return 'cold_lead';
  });

  const [emailTo, setEmailTo] = useState(lead.email || '');
  const [emailSubject, setEmailSubject] = useState(() => {
    if (initialSubject) return initialSubject;
    if (initialBody) return `Digital Growth Proposal for ${lead.business_name}`;
    const { subject } = generateEmailContent(lead,
      (lead.wcag_critical_violations || 0) > 0 ? 'accessibility_urgent' :
      (lead.aiso_opportunity_score || 0) >= 70 ? 'hot_lead' :
      (lead.aiso_opportunity_score || 0) >= 40 ? 'warm_lead' : 'cold_lead'
    );
    return subject;
  });
  const [emailBody, setEmailBody] = useState(() => {
    if (initialBody) return initialBody;
    const { body } = generateEmailContent(lead,
      (lead.wcag_critical_violations || 0) > 0 ? 'accessibility_urgent' :
      (lead.aiso_opportunity_score || 0) >= 70 ? 'hot_lead' :
      (lead.aiso_opportunity_score || 0) >= 40 ? 'warm_lead' : 'cold_lead'
    );
    return body;
  });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Generate content when template changes
  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    if (templateId === 'proposal' && initialBody) {
      // Restore proposal content
      setEmailSubject(initialSubject || `Digital Growth Proposal for ${lead.business_name}`);
      setEmailBody(initialBody);
    } else if (templateId !== 'custom' && templateId !== 'proposal') {
      const { subject, body } = generateEmailContent(lead, templateId);
      setEmailSubject(subject);
      setEmailBody(body);
    }
  };

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
