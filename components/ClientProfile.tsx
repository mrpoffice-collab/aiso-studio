'use client';

import { useState, useEffect } from 'react';
import AISOMascot from '@/components/AISOMascot';
import AuditResultModal from '@/components/AuditResultModal';
import { runAISOAudit, checkRecentAudit, type AuditResult } from '@/lib/aiso-audit-engine';

interface Client {
  id: number;
  business_name: string;
  domain: string;
  city?: string;
  state?: string;
  industry?: string;
  email?: string;
  phone?: string;
  estimated_monthly_value: number;
  status: string;
  aiso_opportunity_score: number;
  accessibility_score: number;
  overall_score: number;
  discovered_at: string;
  primary_pain_point?: string;
}

interface ClientProfileProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onRefresh?: () => void;
}

type TabId = 'overview' | 'progress' | 'tasks' | 'audits' | 'content' | 'emails' | 'notes';

export default function ClientProfile({
  isOpen,
  onClose,
  client,
  onRefresh,
}: ClientProfileProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [audits, setAudits] = useState<any[]>([]);
  const [strategies, setStrategies] = useState<any[]>([]);
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [runningAudit, setRunningAudit] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<any>(null);
  const [loadingAuditDetails, setLoadingAuditDetails] = useState(false);
  const [progress, setProgress] = useState<any>(null);
  const [loadingProgress, setLoadingProgress] = useState(false);

  useEffect(() => {
    if (isOpen && client) {
      loadClientData();
    }
  }, [isOpen, client]);

  const loadClientData = async () => {
    if (!client) return;
    setLoading(true);

    try {
      // Load audits for this domain
      const auditsRes = await fetch(`/api/audit/accessibility?domain=${encodeURIComponent(client.domain)}`);
      if (auditsRes.ok) {
        const data = await auditsRes.json();
        setAudits(data.audits || []);
      }

      // Load strategies (would need lead_id linking)
      // For now, fetch all and filter by domain in strategy's website_url
      const strategiesRes = await fetch('/api/strategies');
      if (strategiesRes.ok) {
        const data = await strategiesRes.json();
        // Filter strategies that match this client's domain
        const clientStrategies = (data.strategies || []).filter((s: any) =>
          s.website_url && s.website_url.includes(client.domain)
        );
        setStrategies(clientStrategies);
      }

      // Load emails sent to this client
      const emailsRes = await fetch(`/api/leads/${client.id}/emails`);
      if (emailsRes.ok) {
        const data = await emailsRes.json();
        setEmails(data.emails || []);
      }

      // Load progress/before-after data
      const progressRes = await fetch(`/api/clients/${client.id}/progress`);
      if (progressRes.ok) {
        const data = await progressRes.json();
        setProgress(data);
      }
    } catch (err) {
      console.error('Failed to load client data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAudit = async () => {
    if (!client) return;

    setRunningAudit(true);
    setShowAuditModal(true);
    setAuditResult(null);

    try {
      const response = await fetch('/api/audit/accessibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: `https://${client.domain}` }),
      });

      if (!response.ok) throw new Error('Audit failed');

      const data = await response.json();
      setAuditResult({
        id: data.audit.id,
        url: data.audit.url,
        domain: client.domain,
        accessibilityScore: data.audit.accessibilityScore,
        criticalCount: data.audit.criticalCount,
        seriousCount: data.audit.seriousCount,
        moderateCount: data.audit.moderateCount,
        minorCount: data.audit.minorCount,
        totalViolations: data.audit.totalViolations,
        totalPasses: data.audit.totalPasses,
        violations: data.audit.violations || [],
        passes: data.audit.passes || [],
        wcagBreakdown: data.audit.wcagBreakdown || {},
        pageTitle: data.audit.pageTitle || '',
        aisoScore: 0,
        aeoScore: 0,
        seoScore: 0,
        readabilityScore: 0,
        engagementScore: 0,
        factCheckScore: 0,
        seoDetails: {},
        readabilityDetails: {},
        engagementDetails: {},
        aeoDetails: {},
        factChecks: [],
        createdAt: new Date(),
        isExisting: false,
        pdfUrl: `/api/audit/pdf/${data.audit.id}`,
      });

      // Refresh audits list
      loadClientData();
    } catch (err) {
      console.error('Audit failed:', err);
    } finally {
      setRunningAudit(false);
    }
  };

  const handleSaveNotes = async () => {
    // In future, save notes to database
    setSavingNotes(true);
    await new Promise((r) => setTimeout(r, 500));
    setSavingNotes(false);
  };

  const handleViewAudit = async (audit: any) => {
    setLoadingAuditDetails(true);
    setShowAuditModal(true);
    setAuditResult(null);

    try {
      // Fetch full audit details
      const response = await fetch(`/api/audit/accessibility/${audit.id}`);
      if (!response.ok) throw new Error('Failed to load audit');

      const data = await response.json();
      const fullAudit = data.audit;

      setAuditResult({
        id: fullAudit.id,
        url: fullAudit.url,
        domain: client?.domain || '',
        accessibilityScore: fullAudit.accessibilityScore || fullAudit.accessibility_score,
        criticalCount: fullAudit.criticalCount || fullAudit.critical_count || 0,
        seriousCount: fullAudit.seriousCount || fullAudit.serious_count || 0,
        moderateCount: fullAudit.moderateCount || fullAudit.moderate_count || 0,
        minorCount: fullAudit.minorCount || fullAudit.minor_count || 0,
        totalViolations: fullAudit.totalViolations || fullAudit.total_violations || 0,
        totalPasses: fullAudit.totalPasses || fullAudit.total_passes || 0,
        violations: fullAudit.violations || [],
        passes: fullAudit.passes || [],
        wcagBreakdown: fullAudit.wcagBreakdown || fullAudit.wcag_breakdown || {},
        pageTitle: fullAudit.pageTitle || fullAudit.page_title || '',
        aisoScore: fullAudit.aisoScore || fullAudit.aiso_score || 0,
        aeoScore: fullAudit.aeoScore || fullAudit.aeo_score || 0,
        seoScore: fullAudit.seoScore || fullAudit.seo_score || 0,
        readabilityScore: fullAudit.readabilityScore || fullAudit.readability_score || 0,
        engagementScore: fullAudit.engagementScore || fullAudit.engagement_score || 0,
        factCheckScore: fullAudit.factCheckScore || fullAudit.fact_check_score || 0,
        seoDetails: fullAudit.seoDetails || fullAudit.seo_details || {},
        readabilityDetails: fullAudit.readabilityDetails || fullAudit.readability_details || {},
        engagementDetails: fullAudit.engagementDetails || fullAudit.engagement_details || {},
        aeoDetails: fullAudit.aeoDetails || fullAudit.aeo_details || {},
        factChecks: fullAudit.factChecks || fullAudit.fact_checks || [],
        createdAt: new Date(fullAudit.createdAt || fullAudit.created_at),
        isExisting: true,
        pdfUrl: `/api/audit/pdf/${fullAudit.id}`,
      });
    } catch (err) {
      console.error('Failed to load audit:', err);
      // Show basic info if full fetch fails
      setAuditResult({
        id: audit.id,
        url: audit.url || `https://${client?.domain}`,
        domain: client?.domain || '',
        accessibilityScore: audit.accessibilityScore,
        criticalCount: audit.criticalCount || 0,
        seriousCount: audit.seriousCount || 0,
        moderateCount: audit.moderateCount || 0,
        minorCount: audit.minorCount || 0,
        totalViolations: audit.totalViolations || 0,
        totalPasses: 0,
        violations: [],
        passes: [],
        wcagBreakdown: {},
        pageTitle: audit.pageTitle || '',
        aisoScore: 0,
        aeoScore: 0,
        seoScore: 0,
        readabilityScore: 0,
        engagementScore: 0,
        factCheckScore: 0,
        seoDetails: {},
        readabilityDetails: {},
        engagementDetails: {},
        aeoDetails: {},
        factChecks: [],
        createdAt: new Date(audit.createdAt),
        isExisting: true,
        pdfUrl: `/api/audit/pdf/${audit.id}`,
      });
    } finally {
      setLoadingAuditDetails(false);
    }
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'progress', label: 'Progress' },
    { id: 'tasks', label: 'Tasks' },
    { id: 'audits', label: 'Audits' },
    { id: 'content', label: 'Content' },
    { id: 'emails', label: 'Emails' },
    { id: 'notes', label: 'Notes' },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-white shadow-2xl z-50 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {client?.business_name || 'Client'}
              </h2>
              <p className="text-slate-500">{client?.domain}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Contact Info */}
          {client && (
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              {client.phone && (
                <a
                  href={`tel:${client.phone}`}
                  className="inline-flex items-center gap-2 text-slate-600 hover:text-orange-600 transition-colors"
                >
                  <span>📞</span>
                  <span>{client.phone}</span>
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-medium">Call</span>
                </a>
              )}
              {client.email && (
                <a
                  href={`mailto:${client.email}`}
                  className="inline-flex items-center gap-2 text-slate-600 hover:text-orange-600 transition-colors"
                >
                  <span>✉️</span>
                  <span>{client.email}</span>
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-medium">Email</span>
                </a>
              )}
              {client.domain && (
                <a
                  href={`https://${client.domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-slate-600 hover:text-orange-600 transition-colors"
                >
                  <span>🌐</span>
                  <span>{client.domain}</span>
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-medium">Visit</span>
                </a>
              )}
            </div>
          )}

          {/* Meta Info */}
          {client && (
            <div className="mt-4 flex items-center gap-4 text-sm">
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded font-medium">Active</span>
              <span className="text-slate-600">
                Since {new Date(client.discovered_at).toLocaleDateString()}
              </span>
              <span className="font-bold text-slate-900">
                ${client.estimated_monthly_value}/mo
              </span>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 flex-shrink-0 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'text-orange-600 border-b-2 border-orange-500'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <AISOMascot state="running" size="md" message="Loading..." />
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && client && (
                <div className="space-y-6">
                  {/* Latest Audit */}
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-slate-900">Latest Audit</h3>
                      {audits.length > 0 && (
                        <span className="text-xs text-slate-500">
                          {new Date(audits[0].createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {audits.length > 0 ? (
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-black text-slate-900">{audits[0].accessibilityScore}</div>
                          <div className="text-xs text-slate-500">WCAG</div>
                        </div>
                        <button
                          onClick={() => window.open(`/api/audit/pdf/${audits[0].id}`, '_blank')}
                          className="text-sm text-orange-600 hover:underline"
                        >
                          View Report →
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">No audits yet</p>
                    )}
                  </div>

                  {/* Strategy */}
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h3 className="font-bold text-slate-900 mb-2">Strategy</h3>
                    {strategies.length > 0 ? (
                      <div>
                        <p className="text-sm text-slate-600">
                          {strategies[0].topics_count || 0} topics • {strategies[0].posts_count || 0} posts written
                        </p>
                        <a
                          href={`/dashboard/strategies/${strategies[0].id}`}
                          className="text-sm text-orange-600 hover:underline"
                        >
                          View Strategy →
                        </a>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm text-slate-500 mb-2">No strategy created</p>
                        <a
                          href={`/dashboard/strategies/new?domain=${client.domain}&client=${client.business_name}`}
                          className="text-sm text-orange-600 hover:underline"
                        >
                          Create Strategy →
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleRunAudit}
                      disabled={runningAudit}
                      className="px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {runningAudit ? (
                        <AISOMascot state="running" size="xs" showMessage={false} />
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                      )}
                      Run Audit
                    </button>
                    <a
                      href={`/dashboard/strategies/new?domain=${client.domain}&client=${client.business_name}`}
                      className="px-4 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      New Strategy
                    </a>
                  </div>
                </div>
              )}

              {/* Progress Tab - Before/After Comparison */}
              {activeTab === 'progress' && (
                <div className="space-y-6">
                  {!progress || !progress.hasData ? (
                    <div className="text-center py-12">
                      <AISOMascot state="idle" size="lg" showMessage={false} />
                      <h3 className="text-lg font-bold text-slate-900 mt-4">No Progress Data Yet</h3>
                      <p className="text-slate-500 mt-2">
                        Run audits on this client's content to track progress over time.
                      </p>
                      <button
                        onClick={handleRunAudit}
                        className="mt-4 px-4 py-2 bg-orange-100 text-orange-700 font-medium rounded-lg hover:bg-orange-200 transition"
                      >
                        Run First Audit
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Summary Card */}
                      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                        <h3 className="text-lg font-bold mb-2">Progress Summary</h3>
                        <p className="text-white/90">{progress.insights?.summary}</p>
                      </div>

                      {/* Before/After Scores */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* First Audit */}
                        <div className="bg-slate-100 rounded-xl p-4">
                          <div className="text-xs font-semibold text-slate-500 uppercase mb-2">First Audit</div>
                          <div className="text-3xl font-black text-slate-400">
                            {progress.comparison?.first?.scores?.overall || 0}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            {progress.comparison?.first?.date
                              ? new Date(progress.comparison.first.date).toLocaleDateString()
                              : 'N/A'}
                          </div>
                        </div>

                        {/* Latest Audit */}
                        <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                          <div className="text-xs font-semibold text-green-600 uppercase mb-2">Latest Audit</div>
                          <div className="text-3xl font-black text-green-600">
                            {progress.comparison?.latest?.scores?.overall || 0}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            {progress.comparison?.latest?.date
                              ? new Date(progress.comparison.latest.date).toLocaleDateString()
                              : 'N/A'}
                          </div>
                        </div>
                      </div>

                      {/* Change Indicator */}
                      {progress.comparison?.changes && (
                        <div className={`text-center p-4 rounded-xl ${
                          progress.comparison.changes.overall >= 0
                            ? 'bg-green-50 border border-green-200'
                            : 'bg-red-50 border border-red-200'
                        }`}>
                          <div className={`text-4xl font-black ${
                            progress.comparison.changes.overall >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {progress.comparison.changes.overall >= 0 ? '+' : ''}
                            {progress.comparison.changes.overall} pts
                          </div>
                          <div className="text-sm text-slate-600 mt-1">
                            Overall score change across {progress.totalAudits} audits
                          </div>
                        </div>
                      )}

                      {/* Score Breakdown */}
                      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <div className="p-4 border-b border-slate-200">
                          <h4 className="font-bold text-slate-900">Score Breakdown</h4>
                        </div>
                        <div className="divide-y divide-slate-100">
                          {[
                            { key: 'aeo', label: 'AI Optimization', icon: '🤖' },
                            { key: 'seo', label: 'SEO', icon: '🔍' },
                            { key: 'readability', label: 'Readability', icon: '📖' },
                            { key: 'engagement', label: 'Engagement', icon: '💡' },
                          ].map((metric) => {
                            const firstScore = progress.comparison?.first?.scores?.[metric.key] || 0;
                            const latestScore = progress.comparison?.latest?.scores?.[metric.key] || 0;
                            const change = latestScore - firstScore;
                            return (
                              <div key={metric.key} className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-2">
                                  <span>{metric.icon}</span>
                                  <span className="font-medium text-slate-700">{metric.label}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span className="text-slate-400 text-sm">{firstScore}</span>
                                  <span className="text-slate-300">→</span>
                                  <span className="font-bold text-slate-900">{latestScore}</span>
                                  <span className={`text-sm font-semibold px-2 py-0.5 rounded ${
                                    change > 0
                                      ? 'bg-green-100 text-green-700'
                                      : change < 0
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}>
                                    {change > 0 ? '+' : ''}{change}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Highlights & Concerns */}
                      {progress.insights?.highlights?.length > 0 && (
                        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                          <h4 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                            <span>✓</span> Highlights
                          </h4>
                          <ul className="space-y-1">
                            {progress.insights.highlights.map((item: string, i: number) => (
                              <li key={i} className="text-sm text-green-700">• {item}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {progress.insights?.concerns?.length > 0 && (
                        <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                          <h4 className="font-bold text-red-800 mb-2 flex items-center gap-2">
                            <span>!</span> Areas of Concern
                          </h4>
                          <ul className="space-y-1">
                            {progress.insights.concerns.map((item: string, i: number) => (
                              <li key={i} className="text-sm text-red-700">• {item}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Recommendation */}
                      {progress.insights?.recommendation && (
                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                          <h4 className="font-bold text-blue-800 mb-2">Recommendation</h4>
                          <p className="text-sm text-blue-700">{progress.insights.recommendation}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Tasks Tab */}
              {activeTab === 'tasks' && (
                <div className="text-center py-12">
                  <AISOMascot state="idle" size="lg" showMessage={false} />
                  <h3 className="text-lg font-bold text-slate-900 mt-4">Tasks Coming Soon</h3>
                  <p className="text-slate-500 mt-2">
                    Task management for clients will be available in the next update.
                  </p>
                </div>
              )}

              {/* Audits Tab */}
              {activeTab === 'audits' && (
                <div className="space-y-4">
                  {/* Run New Audit Button */}
                  <button
                    onClick={handleRunAudit}
                    disabled={runningAudit}
                    className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {runningAudit ? (
                      <AISOMascot state="running" size="xs" showMessage={false} />
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    )}
                    Run New Audit
                  </button>

                  {audits.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-slate-500">No audits for this client yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {audits.map((audit) => (
                        <div
                          key={audit.id}
                          className="bg-slate-50 rounded-xl p-4 border border-slate-200"
                        >
                          {/* Score and Date Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`text-3xl font-black ${
                                (audit.accessibilityScore || 0) >= 90 ? 'text-green-600' :
                                (audit.accessibilityScore || 0) >= 70 ? 'text-blue-600' :
                                (audit.accessibilityScore || 0) >= 50 ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                                {audit.accessibilityScore ?? 'N/A'}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-slate-900">WCAG Score</div>
                                <div className="text-xs text-slate-500">
                                  {audit.createdAt ? new Date(audit.createdAt).toLocaleDateString() : 'Unknown date'}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Violations Breakdown */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {(audit.criticalCount || 0) > 0 && (
                              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                                {audit.criticalCount} Critical
                              </span>
                            )}
                            {(audit.seriousCount || 0) > 0 && (
                              <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded">
                                {audit.seriousCount} Serious
                              </span>
                            )}
                            {(audit.moderateCount || 0) > 0 && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">
                                {audit.moderateCount} Moderate
                              </span>
                            )}
                            {(audit.minorCount || 0) > 0 && (
                              <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded">
                                {audit.minorCount} Minor
                              </span>
                            )}
                            {(audit.totalViolations || 0) === 0 && (audit.criticalCount || 0) === 0 && (audit.seriousCount || 0) === 0 && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                                No Issues Found
                              </span>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewAudit(audit)}
                              className="flex-1 px-3 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View
                            </button>
                            <a
                              href={`/api/audit/pdf/${audit.id}`}
                              target="_blank"
                              className="flex-1 px-3 py-2 bg-orange-100 text-orange-700 font-medium rounded-lg hover:bg-orange-200 transition-colors flex items-center justify-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Download PDF
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Content Tab */}
              {activeTab === 'content' && (
                <div className="space-y-4">
                  {strategies.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-slate-500">No content strategy for this client</p>
                      <a
                        href={`/dashboard/strategies/new?domain=${client?.domain}&client=${client?.business_name}`}
                        className="inline-block mt-4 px-4 py-2 bg-orange-100 text-orange-700 font-medium rounded-lg hover:bg-orange-200 transition"
                      >
                        Create Strategy
                      </a>
                    </div>
                  ) : (
                    strategies.map((strategy) => (
                      <a
                        key={strategy.id}
                        href={`/dashboard/strategies/${strategy.id}`}
                        className="block bg-slate-50 rounded-lg p-4 hover:bg-slate-100 transition"
                      >
                        <div className="font-medium text-slate-900">{strategy.client_name}</div>
                        <div className="text-sm text-slate-500">
                          {strategy.industry} • {strategy.frequency}
                        </div>
                      </a>
                    ))
                  )}
                </div>
              )}

              {/* Emails Tab */}
              {activeTab === 'emails' && (
                <div className="space-y-3">
                  {emails.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-slate-500">No emails sent to this client</p>
                    </div>
                  ) : (
                    emails.map((email) => (
                      <div
                        key={email.id}
                        className="bg-slate-50 rounded-lg p-4"
                      >
                        <div className="font-medium text-slate-900">{email.subject}</div>
                        <div className="text-sm text-slate-500 mt-1">
                          Sent {new Date(email.sent_at).toLocaleDateString()}
                          {email.opened_at && ' • Opened'}
                          {email.clicked_at && ' • Clicked'}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Notes Tab */}
              {activeTab === 'notes' && (
                <div className="space-y-4">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this client..."
                    className="w-full h-48 px-4 py-3 border border-slate-200 rounded-xl resize-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <button
                    onClick={handleSaveNotes}
                    disabled={savingNotes}
                    className="px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition disabled:opacity-50"
                  >
                    {savingNotes ? 'Saving...' : 'Save Notes'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Audit Result Modal */}
      <AuditResultModal
        isOpen={showAuditModal}
        onClose={() => setShowAuditModal(false)}
        audit={auditResult}
        isLoading={runningAudit || loadingAuditDetails}
        loadingMessage={runningAudit ? "Running AISO Audit..." : "Loading audit details..."}
        onDownloadPDF={() => {
          if (auditResult?.pdfUrl) {
            window.open(auditResult.pdfUrl, '_blank');
          }
        }}
        onViewFullReport={() => {
          if (auditResult?.id) {
            window.location.href = `/dashboard/audit?auditId=${auditResult.id}`;
          }
        }}
      />
    </>
  );
}
