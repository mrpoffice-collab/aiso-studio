'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardNav from '@/components/DashboardNav';

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
}

interface Project {
  id: number;
  name: string;
  industry: string | null;
  location: string | null;
  created_at: string;
}

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

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-500';
    if (score >= 75) return 'text-blue-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      new: 'bg-blue-100 text-blue-800',
      report_generated: 'bg-purple-100 text-purple-800',
      contacted: 'bg-yellow-100 text-yellow-800',
      qualified: 'bg-green-100 text-green-800',
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

  const filteredLeads = leads;
  const leadsByStatus = {
    new: filteredLeads.filter(l => l.status === 'new').length,
    report_generated: filteredLeads.filter(l => l.status === 'report_generated').length,
    contacted: filteredLeads.filter(l => l.status === 'contacted').length,
    qualified: filteredLeads.filter(l => l.status === 'qualified').length,
    won: filteredLeads.filter(l => l.status === 'won').length,
    lost: filteredLeads.filter(l => l.status === 'lost').length,
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
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
            <div className="text-2xl font-bold text-slate-900">{filteredLeads.length}</div>
            <div className="text-xs text-slate-600">Total Leads</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 shadow-sm border border-blue-200">
            <div className="text-2xl font-bold text-blue-900">{leadsByStatus.new}</div>
            <div className="text-xs text-blue-700">New</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 shadow-sm border border-purple-200">
            <div className="text-2xl font-bold text-purple-900">{leadsByStatus.report_generated}</div>
            <div className="text-xs text-purple-700">Reports</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 shadow-sm border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-900">{leadsByStatus.contacted}</div>
            <div className="text-xs text-yellow-700">Contacted</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 shadow-sm border border-green-200">
            <div className="text-2xl font-bold text-green-900">{leadsByStatus.qualified}</div>
            <div className="text-xs text-green-700">Qualified</div>
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

        {/* Filters */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
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

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="new">New</option>
                  <option value="report_generated">Report Generated</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="won">Won</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
            </div>

            {/* New Project Button */}
            <button
              onClick={() => setShowNewProjectModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all"
            >
              + New Project
            </button>
          </div>
        </div>

        {/* Leads Table */}
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Business</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Score</th>
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
                        <div className="font-semibold text-slate-900">{lead.business_name}</div>
                        <div className="text-sm text-slate-600">{lead.domain}</div>
                        {lead.city && lead.state && (
                          <div className="text-xs text-slate-500">{lead.city}, {lead.state}</div>
                        )}
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
                        <div className={`text-2xl font-bold ${getScoreColor(lead.overall_score)}`}>
                          {lead.overall_score}
                        </div>
                        <div className="text-xs text-slate-600">
                          C:{lead.content_score} S:{lead.seo_score} D:{lead.design_score} Sp:{lead.speed_score}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={lead.status}
                          onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                          className="px-3 py-1 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="new">New</option>
                          <option value="report_generated">Report Generated</option>
                          <option value="contacted">Contacted</option>
                          <option value="qualified">Qualified</option>
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
                        <a
                          href={`https://${lead.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-orange-600 hover:text-orange-700 font-semibold text-sm inline-flex items-center gap-1"
                        >
                          Visit Site
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

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
    </div>
  );
}
