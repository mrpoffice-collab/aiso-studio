'use client';

import { useState, useEffect } from 'react';
import DashboardNav from '@/components/DashboardNav';
import ClientProfile from '@/components/ClientProfile';
import AISOMascot, { AISOMascotLoading } from '@/components/AISOMascot';

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

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'recent' | 'value' | 'name'>('recent');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      // Fetch leads with status = 'won'
      const response = await fetch('/api/leads?status=won');
      if (!response.ok) throw new Error('Failed to load clients');
      const data = await response.json();
      setClients(data.leads || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openClientProfile = (client: Client) => {
    setSelectedClient(client);
    setIsProfileOpen(true);
  };

  const closeClientProfile = () => {
    setIsProfileOpen(false);
    setSelectedClient(null);
  };

  // Filter and sort clients
  const filteredClients = clients
    .filter((c) => {
      if (filter === 'all') return true;
      // Add more filters as needed
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'value':
          return b.estimated_monthly_value - a.estimated_monthly_value;
        case 'name':
          return a.business_name.localeCompare(b.business_name);
        case 'recent':
        default:
          return new Date(b.discovered_at).getTime() - new Date(a.discovered_at).getTime();
      }
    });

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'bg-green-100 text-green-700';
    if (score >= 70) return 'bg-blue-100 text-blue-700';
    if (score >= 50) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const totalValue = clients.reduce((sum, c) => sum + c.estimated_monthly_value, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <DashboardNav />
        <main className="container mx-auto px-6 py-12">
          <AISOMascotLoading message="Loading clients..." />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <DashboardNav />

      <main className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Clients</h1>
            <p className="text-slate-600 mt-1">
              {clients.length} client{clients.length !== 1 ? 's' : ''} • ${totalValue.toLocaleString()}/mo total value
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Client
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm border border-slate-200">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded ${viewMode === 'cards' ? 'bg-slate-100 text-slate-900' : 'text-slate-500'}`}
              title="Card View"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded ${viewMode === 'table' ? 'bg-slate-100 text-slate-900' : 'text-slate-500'}`}
              title="Table View"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
          >
            <option value="recent">Sort: Recent</option>
            <option value="value">Sort: Value</option>
            <option value="name">Sort: Name</option>
          </select>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Empty State */}
        {filteredClients.length === 0 && !loading && (
          <div className="text-center py-16">
            <AISOMascot state="idle" size="xl" showMessage={false} />
            <h3 className="text-xl font-bold text-slate-900 mt-4">No clients yet</h3>
            <p className="text-slate-600 mt-2">
              Clients appear here when leads are marked as "Won" in the Pipeline.
            </p>
            <a
              href="/dashboard/pipeline"
              className="inline-block mt-4 px-4 py-2 bg-orange-100 text-orange-700 font-medium rounded-lg hover:bg-orange-200 transition"
            >
              Go to Pipeline
            </a>
          </div>
        )}

        {/* Cards View */}
        {viewMode === 'cards' && filteredClients.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map((client) => (
              <div
                key={client.id}
                onClick={() => openClientProfile(client)}
                className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 hover:shadow-md hover:border-orange-300 cursor-pointer transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                      {client.business_name}
                    </h3>
                    <p className="text-sm text-slate-500">{client.domain}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${getScoreColor(client.aiso_opportunity_score || client.overall_score)}`}>
                    {client.aiso_opportunity_score || client.overall_score}
                  </span>
                </div>

                {client.city && client.state && (
                  <p className="text-sm text-slate-500 mb-3">
                    📍 {client.city}, {client.state}
                  </p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-lg font-bold text-slate-900">
                    ${client.estimated_monthly_value}/mo
                  </span>
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded font-medium">
                    Active
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Table View */}
        {viewMode === 'table' && filteredClients.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Client</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Location</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Score</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Value</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClients.map((client) => (
                  <tr
                    key={client.id}
                    onClick={() => openClientProfile(client)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-slate-900">{client.business_name}</p>
                        <p className="text-sm text-slate-500">{client.domain}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {client.city && client.state ? `${client.city}, ${client.state}` : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${getScoreColor(client.aiso_opportunity_score || client.overall_score)}`}>
                        {client.aiso_opportunity_score || client.overall_score}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      ${client.estimated_monthly_value}/mo
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded font-medium">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Client Profile Drawer */}
      <ClientProfile
        isOpen={isProfileOpen}
        onClose={closeClientProfile}
        client={selectedClient}
        onRefresh={loadClients}
      />

      {/* Add Client Modal */}
      {showAddModal && (
        <AddClientModal
          onClose={() => setShowAddModal(false)}
          onAdded={() => {
            setShowAddModal(false);
            loadClients();
          }}
        />
      )}
    </div>
  );
}

// Add Client Modal Component
function AddClientModal({
  onClose,
  onAdded,
}: {
  onClose: () => void;
  onAdded: () => void;
}) {
  const [formData, setFormData] = useState({
    business_name: '',
    domain: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    industry: '',
    estimated_monthly_value: 299,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.business_name || !formData.domain) {
      setError('Business name and domain are required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          status: 'won',  // Directly add as client
          overall_score: 50,
          content_score: 50,
          seo_score: 50,
          design_score: 50,
          speed_score: 50,
        }),
      });

      if (!response.ok) throw new Error('Failed to add client');

      onAdded();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <form onSubmit={handleSubmit} className="p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Add New Client</h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Business Name *
                </label>
                <input
                  type="text"
                  value={formData.business_name}
                  onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Acme Plumbing Co"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Domain *
                </label>
                <input
                  type="text"
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="acmeplumbing.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="john@acme.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Dallas"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="TX"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Monthly Value ($)
                </label>
                <input
                  type="number"
                  value={formData.estimated_monthly_value}
                  onChange={(e) => setFormData({ ...formData, estimated_monthly_value: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  min="0"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-lg hover:shadow-lg transition disabled:opacity-50"
              >
                {saving ? 'Adding...' : 'Add Client'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
