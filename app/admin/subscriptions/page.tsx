'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  name: string | null;
  subscription_tier: string;
  subscription_status: string;
  trial_ends_at: string | null;
  article_limit: number;
  articles_used_this_month: number;
  created_at: string;
}

export default function AdminSubscriptions() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSubscription = async (userId: string, tier: string, articleLimit: number) => {
    try {
      const response = await fetch('/api/admin/update-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          tier,
          articleLimit,
          status: 'active',
          reason: 'Manual activation - backdoor access',
        }),
      });

      if (!response.ok) throw new Error('Failed to update subscription');

      alert(`✅ User upgraded to ${tier}!`);
      setShowModal(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating subscription:', error);
      alert('❌ Failed to update subscription');
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'trial': return 'bg-gray-100 text-gray-700';
      case 'starter': return 'bg-blue-100 text-blue-700';
      case 'professional': return 'bg-purple-100 text-purple-700';
      case 'agency': return 'bg-orange-100 text-orange-700';
      case 'enterprise': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'trialing': return 'text-blue-600';
      case 'expired': return 'text-red-600';
      case 'canceled': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-sunset-orange border-t-transparent"></div>
          <p className="text-slate-600 mt-4">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-white">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-black text-slate-900">Subscription Management</h1>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
            >
              ← Back to Dashboard
            </Link>
          </div>
          <p className="text-slate-600">Manually manage user subscriptions (Backdoor Admin)</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="text-3xl font-black text-gray-600 mb-2">
              {users.filter(u => u.subscription_tier === 'trial').length}
            </div>
            <div className="text-sm text-slate-600">Trial</div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="text-3xl font-black text-blue-600 mb-2">
              {users.filter(u => u.subscription_tier === 'starter').length}
            </div>
            <div className="text-sm text-slate-600">Starter</div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="text-3xl font-black text-purple-600 mb-2">
              {users.filter(u => u.subscription_tier === 'professional').length}
            </div>
            <div className="text-sm text-slate-600">Professional</div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="text-3xl font-black text-orange-600 mb-2">
              {users.filter(u => u.subscription_tier === 'agency').length}
            </div>
            <div className="text-sm text-slate-600">Agency</div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="text-3xl font-black text-green-600 mb-2">
              {users.filter(u => u.subscription_tier === 'enterprise').length}
            </div>
            <div className="text-sm text-slate-600">Enterprise</div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Tier</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Usage</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Trial Ends</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-slate-900">{user.name || 'Unknown'}</div>
                    <div className="text-xs text-slate-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getTierColor(user.subscription_tier)}`}>
                      {user.subscription_tier}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-bold ${getStatusColor(user.subscription_status)}`}>
                      {user.subscription_status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-700">
                      {user.articles_used_this_month} / {user.article_limit}
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-sunset-orange h-2 rounded-full"
                        style={{ width: `${Math.min((user.articles_used_this_month / user.article_limit) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.trial_ends_at ? (
                      <div className="text-xs text-slate-600">
                        {new Date(user.trial_ends_at).toLocaleDateString()}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowModal(true);
                      }}
                      className="px-4 py-2 bg-sunset-orange text-white rounded-lg text-sm font-bold hover:bg-opacity-90"
                    >
                      Upgrade
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Upgrade Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4">
            <h2 className="text-2xl font-black text-slate-900 mb-4">
              Upgrade {selectedUser.email}
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => updateSubscription(selectedUser.id, 'starter', 25)}
                className="p-6 border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all"
              >
                <div className="text-lg font-black text-blue-600 mb-2">Starter</div>
                <div className="text-sm text-slate-600 mb-2">$39/month</div>
                <div className="text-xs text-slate-500">25 articles/month</div>
              </button>

              <button
                onClick={() => updateSubscription(selectedUser.id, 'professional', 75)}
                className="p-6 border-2 border-purple-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all"
              >
                <div className="text-lg font-black text-purple-600 mb-2">Professional</div>
                <div className="text-sm text-slate-600 mb-2">$99/month</div>
                <div className="text-xs text-slate-500">75 articles/month</div>
              </button>

              <button
                onClick={() => updateSubscription(selectedUser.id, 'agency', 250)}
                className="p-6 border-2 border-orange-200 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all"
              >
                <div className="text-lg font-black text-orange-600 mb-2">Agency</div>
                <div className="text-sm text-slate-600 mb-2">$299/month</div>
                <div className="text-xs text-slate-500">250 articles/month</div>
              </button>

              <button
                onClick={() => updateSubscription(selectedUser.id, 'enterprise', 1000)}
                className="p-6 border-2 border-green-200 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all"
              >
                <div className="text-lg font-black text-green-600 mb-2">Enterprise</div>
                <div className="text-sm text-slate-600 mb-2">$799/month</div>
                <div className="text-xs text-slate-500">1000 articles/month</div>
              </button>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="mt-6 w-full px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-bold hover:bg-slate-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
