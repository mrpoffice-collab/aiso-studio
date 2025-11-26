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

type TabId = 'overview' | 'tasks' | 'audits' | 'content' | 'emails' | 'notes';

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

  const tabs: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Overview' },
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
                <div className="space-y-3">
                  {audits.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-slate-500">No audits for this client</p>
                      <button
                        onClick={handleRunAudit}
                        className="mt-4 px-4 py-2 bg-orange-100 text-orange-700 font-medium rounded-lg hover:bg-orange-200 transition"
                      >
                        Run First Audit
                      </button>
                    </div>
                  ) : (
                    audits.map((audit) => (
                      <div
                        key={audit.id}
                        className="bg-slate-50 rounded-lg p-4 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-medium text-slate-900">
                            Score: {audit.accessibilityScore}/100
                          </div>
                          <div className="text-sm text-slate-500">
                            {new Date(audit.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <a
                          href={`/api/audit/pdf/${audit.id}`}
                          target="_blank"
                          className="text-sm text-orange-600 hover:underline"
                        >
                          Download PDF
                        </a>
                      </div>
                    ))
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
        isLoading={runningAudit}
        loadingMessage="Running AISO Audit..."
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
