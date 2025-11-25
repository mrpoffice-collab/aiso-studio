'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardNav from '@/components/DashboardNav';
import KanbanBoard from '@/components/pipeline/KanbanBoard';
import EmailModal from '@/components/pipeline/EmailModal';
import ProposalModal from '@/components/pipeline/ProposalModal';

// Default service pricing (lower market rates for realistic pipeline value)
const DEFAULT_SERVICE_PRICING = {
  content_marketing: { name: 'Content Marketing', price: 400, type: 'monthly' as const },
  accessibility: { name: 'Accessibility Remediation', price: 1500, type: 'one-time' as const },
  seo_package: { name: 'SEO Package', price: 500, type: 'monthly' as const },
  content_refresh: { name: 'Content Optimization', price: 300, type: 'one-time' as const },
};

interface RecommendedService {
  id: string;
  name: string;
  reason: string;
  type: 'monthly' | 'one-time';
  defaultPrice: number;
}

// Calculate recommended services from lead data
function getRecommendedServices(lead: Lead): RecommendedService[] {
  const services: RecommendedService[] = [];

  // Content Marketing: No blog OR blog posts < 10
  if (!lead.has_blog || lead.blog_post_count < 10) {
    services.push({
      id: 'content_marketing',
      name: DEFAULT_SERVICE_PRICING.content_marketing.name,
      reason: !lead.has_blog ? 'No blog detected' : `Only ${lead.blog_post_count} blog posts`,
      type: 'monthly',
      defaultPrice: DEFAULT_SERVICE_PRICING.content_marketing.price,
    });
  }

  // Accessibility: Score < 70 OR critical violations > 0
  const needsAccessibility =
    (lead.accessibility_score !== undefined && lead.accessibility_score < 70) ||
    (lead.wcag_critical_violations && lead.wcag_critical_violations > 0);

  if (needsAccessibility) {
    const reason = lead.wcag_critical_violations
      ? `${lead.wcag_critical_violations} critical WCAG violations`
      : `Accessibility score ${lead.accessibility_score}/100`;
    services.push({
      id: 'accessibility',
      name: DEFAULT_SERVICE_PRICING.accessibility.name,
      reason,
      type: 'one-time',
      defaultPrice: DEFAULT_SERVICE_PRICING.accessibility.price,
    });
  }

  // SEO: Score < 70 OR keywords < 20 OR position > 20
  const needsSEO =
    lead.seo_score < 70 ||
    (lead.ranking_keywords !== undefined && lead.ranking_keywords < 20) ||
    (lead.avg_search_position !== undefined && lead.avg_search_position > 20);

  if (needsSEO) {
    let reason = `SEO score ${lead.seo_score}/100`;
    if (lead.ranking_keywords !== undefined && lead.ranking_keywords < 20) {
      reason = `Only ${lead.ranking_keywords} ranking keywords`;
    }
    services.push({
      id: 'seo_package',
      name: DEFAULT_SERVICE_PRICING.seo_package.name,
      reason,
      type: 'monthly',
      defaultPrice: DEFAULT_SERVICE_PRICING.seo_package.price,
    });
  }

  // Content Optimization: Content score < 70 AND has existing blog
  if (lead.content_score < 70 && lead.has_blog && lead.blog_post_count >= 10) {
    services.push({
      id: 'content_refresh',
      name: DEFAULT_SERVICE_PRICING.content_refresh.name,
      reason: `Content quality score ${lead.content_score}/100`,
      type: 'one-time',
      defaultPrice: DEFAULT_SERVICE_PRICING.content_refresh.price,
    });
  }

  return services;
}

// Calculate realistic pipeline value from recommended services
function calculateLeadValue(lead: Lead): number {
  const services = getRecommendedServices(lead);
  let value = 0;

  for (const service of services) {
    if (service.type === 'monthly') {
      value += service.defaultPrice;
    } else {
      // Amortize one-time over 12 months
      value += Math.round(service.defaultPrice / 12);
    }
  }

  return value;
}

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
  // AISO-specific fields
  aiso_opportunity_score?: number;
  estimated_monthly_value?: number;
  primary_pain_point?: string;
  secondary_pain_points?: string[];
  recommended_pitch?: string;
  time_to_close?: string;
  // Accessibility/WCAG fields
  accessibility_score?: number;
  wcag_critical_violations?: number;
  wcag_serious_violations?: number;
  wcag_moderate_violations?: number;
  wcag_minor_violations?: number;
  wcag_total_violations?: number;
  // Searchability fields
  ranking_keywords?: number;
  avg_search_position?: number;
  estimated_organic_traffic?: number;
  discovery_data?: {
    seoIssues?: Array<{
      category: string;
      issue: string;
      severity: 'critical' | 'high' | 'medium' | 'low';
      fix: string;
    }>;
    opportunityType?: string;
    technicalSEO?: number;
    onPageSEO?: number;
    contentMarketing?: number;
    localSEO?: number;
    accessibilityAudit?: {
      url: string;
      score: number;
      violations: any[];
      wcagBreakdown: any;
      pageTitle: string;
    };
  };
}

interface Project {
  id: number;
  name: string;
  industry: string | null;
  location: string | null;
  created_at: string;
}

type ViewMode = 'kanban' | 'table';

export default function PipelinePage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectIndustry, setNewProjectIndustry] = useState('');
  const [newProjectLocation, setNewProjectLocation] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [deletingLeadId, setDeletingLeadId] = useState<number | null>(null);
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<number>>(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailLead, setEmailLead] = useState<Lead | null>(null);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [proposal, setProposal] = useState<any>(null);
  const [proposalLead, setProposalLead] = useState<Lead | null>(null);
  const [generatingProposal, setGeneratingProposal] = useState(false);
  const [proposalEmailBody, setProposalEmailBody] = useState<string | null>(null);
  const [runningAudit, setRunningAudit] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedProject, selectedStatus]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load projects
      const projectsRes = await fetch('/api/leads/projects');
      const projectsData = await projectsRes.json();
      setProjects(projectsData.projects || []);

      // Load leads with filters
      const params = new URLSearchParams();
      if (selectedProject) params.append('project_id', selectedProject.toString());
      if (selectedStatus !== 'all') params.append('status', selectedStatus);

      const leadsRes = await fetch(`/api/leads/pipeline?${params}`);
      const leadsData = await leadsRes.json();
      setLeads(leadsData.leads || []);
    } catch (error) {
      console.error('Failed to load pipeline:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async () => {
    try {
      const res = await fetch('/api/leads/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProjectName,
          industry: newProjectIndustry || undefined,
          location: newProjectLocation || undefined,
        }),
      });

      if (res.ok) {
        setShowNewProjectModal(false);
        setNewProjectName('');
        setNewProjectIndustry('');
        setNewProjectLocation('');
        loadData();
      }
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const updateLeadStatus = async (leadId: number, status: string) => {
    try {
      const res = await fetch('/api/leads/pipeline', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: leadId,
          status,
          activity_description: `Status changed to: ${status}`,
        }),
      });

      if (res.ok) {
        loadData();
      }
    } catch (error) {
      console.error('Failed to update lead:', error);
    }
  };

  const deleteLead = async (leadId: number, businessName: string) => {
    if (!confirm(`Are you sure you want to delete "${businessName}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingLeadId(leadId);
    try {
      const res = await fetch(`/api/leads/pipeline?lead_id=${leadId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        loadData();
      } else {
        const data = await res.json();
        alert(`Failed to delete lead: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to delete lead:', error);
      alert('Failed to delete lead. Please try again.');
    } finally {
      setDeletingLeadId(null);
    }
  };

  const toggleLeadSelection = (leadId: number) => {
    const newSelection = new Set(selectedLeadIds);
    if (newSelection.has(leadId)) {
      newSelection.delete(leadId);
    } else {
      newSelection.add(leadId);
    }
    setSelectedLeadIds(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedLeadIds.size === filteredLeads.length) {
      setSelectedLeadIds(new Set());
    } else {
      setSelectedLeadIds(new Set(filteredLeads.map(l => l.id)));
    }
  };

  const bulkDeleteLeads = async () => {
    if (selectedLeadIds.size === 0) return;

    if (!confirm(`Are you sure you want to delete ${selectedLeadIds.size} lead(s)? This action cannot be undone.`)) {
      return;
    }

    setIsBulkDeleting(true);
    try {
      const deletePromises = Array.from(selectedLeadIds).map(leadId =>
        fetch(`/api/leads/pipeline?lead_id=${leadId}`, {
          method: 'DELETE',
        })
      );

      await Promise.all(deletePromises);
      setSelectedLeadIds(new Set());
      loadData();
    } catch (error) {
      console.error('Failed to bulk delete leads:', error);
      alert('Failed to delete some leads. Please try again.');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-500';
    if (score >= 75) return 'text-blue-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      new: 'bg-blue-100 text-blue-800',
      researching: 'bg-purple-100 text-purple-800',
      contacted: 'bg-yellow-100 text-yellow-800',
      engaged: 'bg-orange-100 text-orange-800',
      demo_scheduled: 'bg-pink-100 text-pink-800',
      trial: 'bg-indigo-100 text-indigo-800',
      negotiating: 'bg-cyan-100 text-cyan-800',
      won: 'bg-emerald-100 text-emerald-800',
      lost: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const getRatingBadge = (rating: string | null) => {
    if (!rating) return null;

    const styles: Record<string, string> = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[rating] || 'bg-gray-100 text-gray-800'}`}>
        {rating.toUpperCase()} PRIORITY
      </span>
    );
  };

  // Filter out archived leads unless specifically viewing archived
  const filteredLeads = selectedStatus === 'archived'
    ? leads
    : leads.filter(l => l.status !== 'archived');

  const leadsByStatus = {
    new: leads.filter(l => l.status === 'new').length,
    researching: leads.filter(l => l.status === 'researching').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    engaged: leads.filter(l => l.status === 'engaged').length,
    demo_scheduled: leads.filter(l => l.status === 'demo_scheduled').length,
    trial: leads.filter(l => l.status === 'trial').length,
    negotiating: leads.filter(l => l.status === 'negotiating').length,
    won: leads.filter(l => l.status === 'won').length,
    lost: leads.filter(l => l.status === 'lost').length,
  };

  // Calculate pipeline value from recommended services (realistic pricing)
  const totalPipelineValue = leads
    .filter(l => !['won', 'lost'].includes(l.status))
    .reduce((sum, l) => sum + calculateLeadValue(l), 0);

  const handleSendEmail = async (data: { to: string; subject: string; body: string; template: string }) => {
    if (!emailLead) return false;

    try {
      const res = await fetch(`/api/leads/${emailLead.id}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        // Update lead status to contacted if it was new
        if (emailLead.status === 'new') {
          await updateLeadStatus(emailLead.id, 'contacted');
        }
        loadData();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  };

  const openEmailModal = (lead: Lead) => {
    setEmailLead(lead);
    setShowEmailModal(true);
  };

  const generateProposal = async (lead: Lead) => {
    setGeneratingProposal(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}/proposal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        const data = await res.json();
        setProposal(data.proposal);
        setProposalLead(lead);
        setShowProposalModal(true);
      } else {
        const error = await res.json();
        alert(`Failed to generate proposal: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to generate proposal:', error);
      alert('Failed to generate proposal. Please try again.');
    } finally {
      setGeneratingProposal(false);
    }
  };

  const handleProposalEmail = (proposalHtml: string) => {
    if (proposalLead) {
      setProposalEmailBody(proposalHtml);
      setEmailLead(proposalLead);
      setShowProposalModal(false);
      setShowEmailModal(true);
    }
  };

  const runAudit = async (lead: Lead) => {
    setRunningAudit(true);
    try {
      const response = await fetch(`/api/leads/${lead.id}/audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auditType: 'full' }),
      });

      if (response.ok) {
        const data = await response.json();
        // Update the selected lead with new audit data
        if (data.updatedLead) {
          setSelectedLead(data.updatedLead);
          // Also update in the leads list
          setLeads(prev => prev.map(l =>
            l.id === lead.id ? data.updatedLead : l
          ));
        }
        alert(`Audit completed for ${lead.business_name}! Check the updated scores.`);
      } else {
        const error = await response.json();
        alert(`Audit failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Failed to run audit:', error);
      alert('Failed to run audit. Please try again.');
    } finally {
      setRunningAudit(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <DashboardNav />

      <main className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-orange-900 to-slate-900 bg-clip-text text-transparent mb-2">
            Lead Pipeline
          </h1>
          <p className="text-slate-600">
            Track and manage your discovered leads
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
            <div className="text-2xl font-bold text-slate-900">{filteredLeads.length}</div>
            <div className="text-xs text-slate-600">Total Leads</div>
          </div>
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4 shadow-sm border border-orange-200">
            <div className="text-2xl font-bold text-orange-900">${totalPipelineValue.toLocaleString()}</div>
            <div className="text-xs text-orange-700">Pipeline Value/mo</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 shadow-sm border border-blue-200">
            <div className="text-2xl font-bold text-blue-900">{leadsByStatus.new}</div>
            <div className="text-xs text-blue-700">New</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 shadow-sm border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-900">{leadsByStatus.contacted}</div>
            <div className="text-xs text-yellow-700">Contacted</div>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4 shadow-sm border border-emerald-200">
            <div className="text-2xl font-bold text-emerald-900">{leadsByStatus.won}</div>
            <div className="text-xs text-emerald-700">Won</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{leadsByStatus.lost}</div>
            <div className="text-xs text-gray-700">Lost</div>
          </div>
        </div>

        {/* Filters & View Toggle */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              {/* View Toggle */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">View</label>
                <div className="flex rounded-lg border border-slate-300 overflow-hidden">
                  <button
                    onClick={() => setViewMode('kanban')}
                    className={`px-4 py-2 text-sm font-medium flex items-center gap-2 transition-colors ${
                      viewMode === 'kanban'
                        ? 'bg-orange-500 text-white'
                        : 'bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                    </svg>
                    Kanban
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`px-4 py-2 text-sm font-medium flex items-center gap-2 transition-colors ${
                      viewMode === 'table'
                        ? 'bg-orange-500 text-white'
                        : 'bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Table
                  </button>
                </div>
              </div>

              {/* Project Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Project</label>
                <select
                  value={selectedProject || ''}
                  onChange={(e) => setSelectedProject(e.target.value ? parseInt(e.target.value) : null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">All Projects</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter (only show in table view) */}
              {viewMode === 'table' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="new">New</option>
                    <option value="researching">Researching</option>
                    <option value="contacted">Contacted</option>
                    <option value="engaged">Engaged</option>
                    <option value="demo_scheduled">Demo Scheduled</option>
                    <option value="trial">Trial</option>
                    <option value="negotiating">Negotiating</option>
                    <option value="won">Won</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {viewMode === 'table' && selectedLeadIds.size > 0 && (
                <button
                  onClick={bulkDeleteLeads}
                  disabled={isBulkDeleting}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  {isBulkDeleting ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete Selected ({selectedLeadIds.size})
                    </>
                  )}
                </button>
              )}
              <button
                onClick={() => setShowNewProjectModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all"
              >
                + New Project
              </button>
            </div>
          </div>
        </div>

        {/* Kanban View */}
        {viewMode === 'kanban' && (
          <div className="mb-8">
            {loading ? (
              <div className="bg-white rounded-lg p-8 text-center text-slate-600 shadow-sm border border-slate-200">
                Loading pipeline...
              </div>
            ) : leads.length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center text-slate-600 shadow-sm border border-slate-200">
                No leads found. Start discovering leads from the Leads page!
              </div>
            ) : (
              <KanbanBoard
                leads={leads}
                onStatusChange={updateLeadStatus}
                onLeadClick={(lead) => {
                  setSelectedLead(lead);
                  setShowDetailsModal(true);
                }}
                onSendEmail={openEmailModal}
                onDelete={deleteLead}
              />
            )}
          </div>
        )}

        {/* Table View */}
        {viewMode === 'table' && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-600">Loading...</div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-8 text-center text-slate-600">
              No leads found. Start discovering leads from the Leads page!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={filteredLeads.length > 0 && selectedLeadIds.size === filteredLeads.length}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 text-orange-600 border-slate-300 rounded focus:ring-orange-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Business</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      <div>Scores</div>
                      <div className="text-[10px] font-normal text-slate-500 normal-case mt-0.5">Overall / AISO / WCAG</div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Discovered</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedLeadIds.has(lead.id)}
                          onChange={() => toggleLeadSelection(lead.id)}
                          className="w-4 h-4 text-orange-600 border-slate-300 rounded focus:ring-orange-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="font-semibold text-slate-900">{lead.business_name}</div>
                          {lead.aiso_opportunity_score !== undefined && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              lead.aiso_opportunity_score >= 70
                                ? 'bg-red-100 text-red-800'
                                : lead.aiso_opportunity_score >= 40
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {lead.aiso_opportunity_score >= 70 ? '🔥 HOT' : lead.aiso_opportunity_score >= 40 ? 'WARM' : 'COLD'}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-slate-600">{lead.domain}</div>
                        {lead.city && lead.state && (
                          <div className="text-xs text-slate-500">{lead.city}, {lead.state}</div>
                        )}
                        {lead.primary_pain_point && (
                          <div className="mt-2 text-xs text-orange-700 bg-orange-50 px-2 py-1 rounded border border-orange-200">
                            💡 {lead.primary_pain_point}
                          </div>
                        )}
                        {/* Recommended Services Badge */}
                        {(() => {
                          const services = getRecommendedServices(lead);
                          if (services.length === 0) return null;
                          const value = calculateLeadValue(lead);
                          return (
                            <div className="mt-1 flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-orange-100 text-orange-800 text-[10px] font-bold rounded">
                                {services.length} service{services.length > 1 ? 's' : ''} needed
                              </span>
                              <span className="text-xs text-green-700 font-semibold">
                                ${value}/mo
                              </span>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1 text-sm">
                          {lead.phone && (
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              <a href={`tel:${lead.phone}`} className="text-slate-700 hover:text-orange-600">
                                {lead.phone}
                              </a>
                            </div>
                          )}
                          {lead.email && (
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              <a href={`mailto:${lead.email}`} className="text-slate-700 hover:text-orange-600 truncate max-w-[200px]">
                                {lead.email}
                              </a>
                            </div>
                          )}
                          {lead.address && (
                            <div className="flex items-start gap-2">
                              <svg className="w-4 h-4 text-slate-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span className="text-slate-600 text-xs">{lead.address}</span>
                            </div>
                          )}
                          {!lead.phone && !lead.email && !lead.address && (
                            <span className="text-xs text-slate-400 italic">No contact info</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {/* Overall Score */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 w-16">Overall:</span>
                            <span className={`text-lg font-bold ${getScoreColor(lead.overall_score)}`}>
                              {lead.overall_score}
                            </span>
                          </div>
                          {/* AISO Fit Score */}
                          {lead.aiso_opportunity_score !== undefined && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-500 w-16">AISO:</span>
                              <span className={`text-lg font-bold ${
                                lead.aiso_opportunity_score >= 70 ? 'text-red-600' :
                                lead.aiso_opportunity_score >= 40 ? 'text-yellow-600' :
                                'text-blue-600'
                              }`}>
                                {lead.aiso_opportunity_score}
                              </span>
                            </div>
                          )}
                          {/* Accessibility Score */}
                          {lead.accessibility_score !== undefined && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-500 w-16">WCAG:</span>
                              <span className={`text-lg font-bold ${getScoreColor(lead.accessibility_score)}`}>
                                {lead.accessibility_score}
                              </span>
                              {lead.wcag_critical_violations! > 0 && (
                                <span className="px-1.5 py-0.5 bg-red-100 text-red-800 text-[10px] font-bold rounded">
                                  {lead.wcag_critical_violations} CRITICAL
                                </span>
                              )}
                            </div>
                          )}
                          <div className="text-[10px] text-slate-500 mt-1">
                            C:{lead.content_score} S:{lead.seo_score} D:{lead.design_score} Sp:{lead.speed_score}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={lead.status}
                          onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                          className="px-3 py-1 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="new">New</option>
                          <option value="researching">Researching</option>
                          <option value="contacted">Contacted</option>
                          <option value="engaged">Engaged</option>
                          <option value="demo_scheduled">Demo Scheduled</option>
                          <option value="trial">Trial</option>
                          <option value="negotiating">Negotiating</option>
                          <option value="won">Won</option>
                          <option value="lost">Lost</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        {getRatingBadge(lead.opportunity_rating)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(lead.discovered_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedLead(lead);
                              setShowDetailsModal(true);
                            }}
                            className="text-orange-600 hover:text-orange-700 font-semibold text-sm inline-flex items-center gap-1"
                          >
                            View Details
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </button>
                          {lead.email && (
                            <>
                              <span className="text-slate-300">|</span>
                              <button
                                onClick={() => openEmailModal(lead)}
                                className="text-orange-600 hover:text-orange-700 text-sm inline-flex items-center gap-1"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Email
                              </button>
                            </>
                          )}
                          <span className="text-slate-300">|</span>
                          <a
                            href={`https://${lead.domain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-600 hover:text-orange-600 text-sm inline-flex items-center gap-1"
                          >
                            Visit Site
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                          <span className="text-slate-300">|</span>
                          <button
                            onClick={() => deleteLead(lead.id, lead.business_name)}
                            disabled={deletingLeadId === lead.id}
                            className="text-red-600 hover:text-red-700 text-sm inline-flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete lead"
                          >
                            {deletingLeadId === lead.id ? (
                              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        )}
      </main>

      {/* Email Modal */}
      {showEmailModal && emailLead && (
        <EmailModal
          lead={emailLead}
          onClose={() => {
            setShowEmailModal(false);
            setEmailLead(null);
            setProposalEmailBody(null);
          }}
          onSend={handleSendEmail}
          initialBody={proposalEmailBody || undefined}
        />
      )}

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Create New Project</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Project Name *</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., Dallas Landscaping Campaign"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Industry</label>
                <input
                  type="text"
                  value={newProjectIndustry}
                  onChange={(e) => setNewProjectIndustry(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., Landscaping"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                <input
                  type="text"
                  value={newProjectLocation}
                  onChange={(e) => setNewProjectLocation(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., Dallas, TX"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNewProjectModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createProject}
                disabled={!newProjectName}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lead Details Modal */}
      {showDetailsModal && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{selectedLead.business_name}</h2>
                <p className="text-slate-600">{selectedLead.domain}</p>
                {selectedLead.city && selectedLead.state && (
                  <p className="text-sm text-slate-500">{selectedLead.city}, {selectedLead.state}</p>
                )}
              </div>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedLead(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Overall Scores */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-slate-50 rounded-lg p-4 text-center">
                <div className={`text-3xl font-bold ${getScoreColor(selectedLead.overall_score)}`}>
                  {selectedLead.overall_score}
                </div>
                <div className="text-xs text-slate-600 mt-1">Overall</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 text-center">
                <div className={`text-2xl font-bold ${getScoreColor(selectedLead.content_score)}`}>
                  {selectedLead.content_score}
                </div>
                <div className="text-xs text-slate-600 mt-1">Content</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 text-center">
                <div className={`text-2xl font-bold ${getScoreColor(selectedLead.seo_score)}`}>
                  {selectedLead.seo_score}
                </div>
                <div className="text-xs text-slate-600 mt-1">SEO</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 text-center">
                <div className={`text-2xl font-bold ${getScoreColor(selectedLead.design_score)}`}>
                  {selectedLead.design_score}
                </div>
                <div className="text-xs text-slate-600 mt-1">Design</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 text-center">
                <div className={`text-2xl font-bold ${getScoreColor(selectedLead.speed_score)}`}>
                  {selectedLead.speed_score}
                </div>
                <div className="text-xs text-slate-600 mt-1">Speed</div>
              </div>
            </div>

            {/* AISO Fit & Accessibility Section */}
            {(selectedLead.aiso_opportunity_score !== undefined || selectedLead.accessibility_score !== undefined) && (
              <div className="space-y-4 mb-6">
                {/* AISO Fit Score */}
                {selectedLead.aiso_opportunity_score !== undefined && (
                  <div className={`rounded-lg p-4 border-2 ${
                    selectedLead.aiso_opportunity_score >= 70
                      ? 'bg-red-50 border-red-200'
                      : selectedLead.aiso_opportunity_score >= 40
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-blue-50 border-blue-200'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-slate-900">AISO Opportunity Score</h3>
                      <div className="flex items-center gap-3">
                        <span className={`text-3xl font-bold ${
                          selectedLead.aiso_opportunity_score >= 70 ? 'text-red-600' :
                          selectedLead.aiso_opportunity_score >= 40 ? 'text-yellow-600' :
                          'text-blue-600'
                        }`}>
                          {selectedLead.aiso_opportunity_score}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                          selectedLead.aiso_opportunity_score >= 70
                            ? 'bg-red-100 text-red-800'
                            : selectedLead.aiso_opportunity_score >= 40
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {selectedLead.aiso_opportunity_score >= 70 ? '🔥 HOT LEAD' : selectedLead.aiso_opportunity_score >= 40 ? 'WARM LEAD' : 'COLD LEAD'}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {selectedLead.estimated_monthly_value && (
                        <div>
                          <span className="text-slate-600">Est. Monthly Value:</span>
                          <span className="ml-2 font-semibold text-green-700">${selectedLead.estimated_monthly_value}/mo</span>
                        </div>
                      )}
                      {selectedLead.time_to_close && (
                        <div>
                          <span className="text-slate-600">Time to Close:</span>
                          <span className="ml-2 font-semibold capitalize">{selectedLead.time_to_close}</span>
                        </div>
                      )}
                    </div>
                    {selectedLead.primary_pain_point && (
                      <div className="mt-3 p-3 bg-white rounded border border-orange-200">
                        <div className="text-xs font-semibold text-slate-700 mb-1">PRIMARY PAIN POINT:</div>
                        <div className="text-sm text-orange-700 font-medium">💡 {selectedLead.primary_pain_point}</div>
                      </div>
                    )}
                    {selectedLead.secondary_pain_points && selectedLead.secondary_pain_points.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <div className="text-xs font-semibold text-slate-700">ADDITIONAL OPPORTUNITIES:</div>
                        {selectedLead.secondary_pain_points.map((point, idx) => (
                          <div key={idx} className="text-xs text-slate-600">• {point}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Accessibility Score */}
                {selectedLead.accessibility_score !== undefined && (
                  <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-slate-900">♿ Accessibility (WCAG) Score</h3>
                      <span className={`text-3xl font-bold ${getScoreColor(selectedLead.accessibility_score)}`}>
                        {selectedLead.accessibility_score}
                      </span>
                    </div>
                    {selectedLead.wcag_total_violations! > 0 && (
                      <div className="grid grid-cols-4 gap-2 text-sm">
                        <div className="bg-red-100 rounded p-2 text-center">
                          <div className="font-bold text-red-800">{selectedLead.wcag_critical_violations}</div>
                          <div className="text-xs text-red-700">Critical</div>
                        </div>
                        <div className="bg-orange-100 rounded p-2 text-center">
                          <div className="font-bold text-orange-800">{selectedLead.wcag_serious_violations}</div>
                          <div className="text-xs text-orange-700">Serious</div>
                        </div>
                        <div className="bg-yellow-100 rounded p-2 text-center">
                          <div className="font-bold text-yellow-800">{selectedLead.wcag_moderate_violations}</div>
                          <div className="text-xs text-yellow-700">Moderate</div>
                        </div>
                        <div className="bg-blue-100 rounded p-2 text-center">
                          <div className="font-bold text-blue-800">{selectedLead.wcag_minor_violations}</div>
                          <div className="text-xs text-blue-700">Minor</div>
                        </div>
                      </div>
                    )}
                    {selectedLead.wcag_critical_violations! > 0 && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                        ⚠️ Critical violations create legal risk (ADA lawsuits) and hurt SEO rankings
                      </div>
                    )}
                    <Link
                      href={`/dashboard/audit?url=https://${selectedLead.domain}&wcag=true`}
                      className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      View Full Accessibility Report
                    </Link>
                  </div>
                )}

                {/* Recommended Pitch */}
                {selectedLead.recommended_pitch && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">💬 Recommended Pitch</h3>
                    <div className="text-sm text-slate-700 italic bg-white p-3 rounded border border-green-300">
                      {selectedLead.recommended_pitch}
                    </div>
                    <div className="mt-2 text-xs text-slate-600">
                      📋 Copy this pitch for outreach emails or calls
                    </div>
                  </div>
                )}

                {/* Recommended Services */}
                {(() => {
                  const services = getRecommendedServices(selectedLead);
                  if (services.length === 0) return null;

                  const monthlyTotal = services
                    .filter(s => s.type === 'monthly')
                    .reduce((sum, s) => sum + s.defaultPrice, 0);
                  const oneTimeTotal = services
                    .filter(s => s.type === 'one-time')
                    .reduce((sum, s) => sum + s.defaultPrice, 0);

                  return (
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-slate-900">🎯 Recommended Services</h3>
                        <div className="text-right">
                          {monthlyTotal > 0 && (
                            <div className="text-lg font-bold text-green-700">${monthlyTotal}/mo</div>
                          )}
                          {oneTimeTotal > 0 && (
                            <div className="text-sm text-slate-600">+ ${oneTimeTotal} one-time</div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        {services.map((service) => (
                          <div
                            key={service.id}
                            className="bg-white rounded-lg p-3 border border-orange-200 flex items-center justify-between"
                          >
                            <div>
                              <div className="font-medium text-slate-900">{service.name}</div>
                              <div className="text-sm text-slate-600">{service.reason}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-green-700">
                                ${service.defaultPrice}
                                {service.type === 'monthly' && <span className="text-xs text-slate-500">/mo</span>}
                              </div>
                              <div className={`text-xs px-2 py-0.5 rounded ${
                                service.type === 'monthly'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-purple-100 text-purple-700'
                              }`}>
                                {service.type === 'monthly' ? 'Recurring' : 'One-time'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-orange-200 text-xs text-slate-600">
                        💡 These services are recommended based on detected problems. Prices are default estimates - adjust to your agency's rates.
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Discovery Data */}
            {selectedLead.discovery_data && (
              <div className="space-y-6">
                {/* Opportunity Type */}
                {selectedLead.discovery_data.opportunityType && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-orange-900 mb-2">Opportunity Type</h3>
                    <p className="text-orange-800 capitalize">
                      {selectedLead.discovery_data.opportunityType.replace(/-/g, ' ')}
                    </p>
                  </div>
                )}

                {/* Score Breakdown */}
                {(selectedLead.discovery_data.technicalSEO !== undefined ||
                  selectedLead.discovery_data.onPageSEO !== undefined ||
                  selectedLead.discovery_data.contentMarketing !== undefined ||
                  selectedLead.discovery_data.localSEO !== undefined) && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">SEO Score Breakdown</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {selectedLead.discovery_data.technicalSEO !== undefined && (
                        <div className="bg-blue-50 rounded-lg p-3 text-center">
                          <div className={`text-xl font-bold ${getScoreColor(selectedLead.discovery_data.technicalSEO)}`}>
                            {selectedLead.discovery_data.technicalSEO}
                          </div>
                          <div className="text-xs text-slate-600 mt-1">Technical SEO</div>
                        </div>
                      )}
                      {selectedLead.discovery_data.onPageSEO !== undefined && (
                        <div className="bg-green-50 rounded-lg p-3 text-center">
                          <div className={`text-xl font-bold ${getScoreColor(selectedLead.discovery_data.onPageSEO)}`}>
                            {selectedLead.discovery_data.onPageSEO}
                          </div>
                          <div className="text-xs text-slate-600 mt-1">On-Page SEO</div>
                        </div>
                      )}
                      {selectedLead.discovery_data.contentMarketing !== undefined && (
                        <div className="bg-purple-50 rounded-lg p-3 text-center">
                          <div className={`text-xl font-bold ${getScoreColor(selectedLead.discovery_data.contentMarketing)}`}>
                            {selectedLead.discovery_data.contentMarketing}
                          </div>
                          <div className="text-xs text-slate-600 mt-1">Content</div>
                        </div>
                      )}
                      {selectedLead.discovery_data.localSEO !== undefined && (
                        <div className="bg-yellow-50 rounded-lg p-3 text-center">
                          <div className={`text-xl font-bold ${getScoreColor(selectedLead.discovery_data.localSEO)}`}>
                            {selectedLead.discovery_data.localSEO}
                          </div>
                          <div className="text-xs text-slate-600 mt-1">Local SEO</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* SEO Issues */}
                {selectedLead.discovery_data.seoIssues && selectedLead.discovery_data.seoIssues.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">SEO Issues Found</h3>
                    <div className="space-y-3">
                      {selectedLead.discovery_data.seoIssues.map((issue, idx) => {
                        const severityColors = {
                          critical: 'bg-red-50 border-red-300 text-red-900',
                          high: 'bg-orange-50 border-orange-300 text-orange-900',
                          medium: 'bg-yellow-50 border-yellow-300 text-yellow-900',
                          low: 'bg-blue-50 border-blue-300 text-blue-900',
                        };
                        const severityBadgeColors = {
                          critical: 'bg-red-100 text-red-800',
                          high: 'bg-orange-100 text-orange-800',
                          medium: 'bg-yellow-100 text-yellow-800',
                          low: 'bg-blue-100 text-blue-800',
                        };

                        return (
                          <div
                            key={idx}
                            className={`border rounded-lg p-4 ${severityColors[issue.severity]}`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="font-semibold">{issue.issue}</div>
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${severityBadgeColors[issue.severity]}`}>
                                {issue.severity.toUpperCase()}
                              </span>
                            </div>
                            <div className="text-sm opacity-90 mb-2">
                              <span className="font-medium">Category:</span> {issue.category}
                            </div>
                            <div className="text-sm opacity-90">
                              <span className="font-medium">How to fix:</span> {issue.fix}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* No Discovery Data Message */}
            {!selectedLead.discovery_data && (
              <div className="bg-slate-50 rounded-lg p-8 text-center">
                <p className="text-slate-600">
                  No detailed SEO analysis available for this lead. The lead may have been added manually or before the discovery feature was enhanced.
                </p>
              </div>
            )}

            {/* Contact Info */}
            {(selectedLead.phone || selectedLead.email || selectedLead.address) && (
              <div className="mt-6 pt-6 border-t border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Contact Information</h3>
                <div className="space-y-2">
                  {selectedLead.phone && (
                    <div className="flex items-center gap-2 text-slate-700">
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <a href={`tel:${selectedLead.phone}`} className="hover:text-orange-600">
                        {selectedLead.phone}
                      </a>
                    </div>
                  )}
                  {selectedLead.email && (
                    <div className="flex items-center gap-2 text-slate-700">
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <a href={`mailto:${selectedLead.email}`} className="hover:text-orange-600">
                        {selectedLead.email}
                      </a>
                    </div>
                  )}
                  {selectedLead.address && (
                    <div className="flex items-start gap-2 text-slate-700">
                      <svg className="w-5 h-5 text-slate-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{selectedLead.address}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3 mt-6">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedLead(null);
                }}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => runAudit(selectedLead)}
                disabled={runningAudit}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                {runningAudit ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Auditing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    Run Audit
                  </>
                )}
              </button>
              <button
                onClick={() => generateProposal(selectedLead)}
                disabled={generatingProposal}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                {generatingProposal ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Generate Proposal
                  </>
                )}
              </button>
              <a
                href={`https://${selectedLead.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all text-center"
              >
                Visit Website
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Proposal Modal */}
      {showProposalModal && proposal && (
        <ProposalModal
          proposal={proposal}
          onClose={() => {
            setShowProposalModal(false);
            setProposal(null);
            setProposalLead(null);
          }}
          onSendEmail={handleProposalEmail}
        />
      )}
    </div>
  );
}
