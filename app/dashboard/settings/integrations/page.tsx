'use client';

import { useState, useEffect } from 'react';
import DashboardNav from '@/components/DashboardNav';

interface Pipeline {
  id: string;
  name: string;
  stages: Array<{ id: string; name: string }>;
}

interface CustomField {
  id: string;
  name: string;
  fieldKey: string;
}

interface HighLevelSettings {
  connected: boolean;
  locationId: string | null;
  pipelineId: string | null;
  pipelineStageId: string | null;
  aisoScoreFieldId: string | null;
  aisoSourceFieldId: string | null;
  autoSync: boolean;
  connectedAt: string | null;
}

export default function IntegrationsSettingsPage() {
  // HighLevel state
  const [hlSettings, setHlSettings] = useState<HighLevelSettings | null>(null);
  const [hlApiKey, setHlApiKey] = useState('');
  const [hlLocationId, setHlLocationId] = useState('');
  const [hlPipelineId, setHlPipelineId] = useState('');
  const [hlStageId, setHlStageId] = useState('');
  const [hlScoreFieldId, setHlScoreFieldId] = useState('');
  const [hlSourceFieldId, setHlSourceFieldId] = useState('');
  const [hlAutoSync, setHlAutoSync] = useState(false);

  // Dropdown data
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Load pipelines and custom fields when connected
  useEffect(() => {
    if (hlSettings?.connected) {
      loadPipelines();
      loadCustomFields();
    }
  }, [hlSettings?.connected]);

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/integrations/highlevel/settings');
      if (res.ok) {
        const data = await res.json();
        setHlSettings(data);
        if (data.connected) {
          setHlLocationId(data.locationId || '');
          setHlPipelineId(data.pipelineId || '');
          setHlStageId(data.pipelineStageId || '');
          setHlScoreFieldId(data.aisoScoreFieldId || '');
          setHlSourceFieldId(data.aisoSourceFieldId || '');
          setHlAutoSync(data.autoSync || false);
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPipelines = async () => {
    try {
      const res = await fetch('/api/integrations/highlevel/pipelines');
      if (res.ok) {
        const data = await res.json();
        setPipelines(data.pipelines || []);
      }
    } catch (error) {
      console.error('Failed to load pipelines:', error);
    }
  };

  const loadCustomFields = async () => {
    try {
      const res = await fetch('/api/integrations/highlevel/custom-fields');
      if (res.ok) {
        const data = await res.json();
        setCustomFields(data.customFields || []);
      }
    } catch (error) {
      console.error('Failed to load custom fields:', error);
    }
  };

  const handleConnect = async () => {
    if (!hlApiKey || !hlLocationId) {
      setMessage({ type: 'error', text: 'API Key and Location ID are required' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/integrations/highlevel/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: hlApiKey,
          locationId: hlLocationId,
          pipelineId: hlPipelineId || null,
          pipelineStageId: hlStageId || null,
          aisoScoreFieldId: hlScoreFieldId || null,
          aisoSourceFieldId: hlSourceFieldId || null,
          autoSync: hlAutoSync,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({
          type: 'success',
          text: data.locationName
            ? `Connected to "${data.locationName}"`
            : 'HighLevel connected successfully!',
        });
        setHlApiKey(''); // Clear for security
        loadSettings();
      } else {
        setMessage({
          type: 'error',
          text: data.details || data.error || 'Failed to connect',
        });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Connection failed' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSettings = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/integrations/highlevel/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: hlApiKey || undefined, // Only send if changed
          locationId: hlLocationId,
          pipelineId: hlPipelineId || null,
          pipelineStageId: hlStageId || null,
          aisoScoreFieldId: hlScoreFieldId || null,
          aisoSourceFieldId: hlSourceFieldId || null,
          autoSync: hlAutoSync,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: 'Settings updated!' });
        setHlApiKey('');
        loadSettings();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Update failed' });
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect HighLevel?')) return;

    setSaving(true);
    try {
      const res = await fetch('/api/integrations/highlevel/settings', {
        method: 'DELETE',
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'HighLevel disconnected' });
        setHlSettings({ connected: false } as HighLevelSettings);
        setHlApiKey('');
        setHlLocationId('');
        setHlPipelineId('');
        setHlStageId('');
        setHlScoreFieldId('');
        setHlSourceFieldId('');
        setHlAutoSync(false);
        setPipelines([]);
        setCustomFields([]);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to disconnect' });
    } finally {
      setSaving(false);
    }
  };

  const selectedPipeline = pipelines.find(p => p.id === hlPipelineId);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <DashboardNav />
        <main className="container mx-auto px-6 py-8 max-w-4xl">
          <div className="text-center py-12">Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <DashboardNav />

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Integrations</h1>
        <p className="text-slate-600 mb-8">Connect AISO Studio with your other tools</p>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* HighLevel Integration */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-blue-600 to-indigo-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-600">HL</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">HighLevel (GoHighLevel)</h2>
                  <p className="text-blue-100">Sync leads and opportunities with your CRM</p>
                </div>
              </div>
              {hlSettings?.connected && (
                <span className="px-3 py-1 bg-green-500 text-white text-sm font-medium rounded-full">
                  Connected
                </span>
              )}
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Connection Status */}
            {hlSettings?.connected && hlSettings.connectedAt && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800">
                  Connected since {new Date(hlSettings.connectedAt).toLocaleDateString()}
                </p>
              </div>
            )}

            {/* API Key */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Private Integration Token {hlSettings?.connected && '(leave blank to keep current)'}
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={hlApiKey}
                  onChange={(e) => setHlApiKey(e.target.value)}
                  placeholder={hlSettings?.connected ? '••••••••••••••••' : 'pit-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-20"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 hover:text-slate-700"
                >
                  {showApiKey ? 'Hide' : 'Show'}
                </button>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Find this in HighLevel: Settings &gt; Integrations &gt; Private Integrations
              </p>
            </div>

            {/* Location ID */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Location ID (Sub-Account ID)
              </label>
              <input
                type="text"
                value={hlLocationId}
                onChange={(e) => setHlLocationId(e.target.value)}
                placeholder="xxxxxxxxxxxxxxxxxx"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-sm text-slate-500">
                Find this in your HighLevel URL: app.gohighlevel.com/v2/location/<strong>[this-part]</strong>/...
              </p>
            </div>

            {/* Connected-only settings */}
            {hlSettings?.connected && (
              <>
                {/* Pipeline Selection */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Default Pipeline
                    </label>
                    <select
                      value={hlPipelineId}
                      onChange={(e) => {
                        setHlPipelineId(e.target.value);
                        setHlStageId('');
                      }}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select pipeline...</option>
                      {pipelines.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Default Stage
                    </label>
                    <select
                      value={hlStageId}
                      onChange={(e) => setHlStageId(e.target.value)}
                      disabled={!selectedPipeline}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100"
                    >
                      <option value="">Select stage...</option>
                      {selectedPipeline?.stages.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Custom Field Mapping */}
                <div className="border-t border-slate-200 pt-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Custom Field Mapping</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Map AISO data to custom fields in HighLevel. Create these fields in HighLevel first.
                  </p>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        AISO Score Field
                      </label>
                      <select
                        value={hlScoreFieldId}
                        onChange={(e) => setHlScoreFieldId(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Not mapped</option>
                        {customFields.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Source URL Field
                      </label>
                      <select
                        value={hlSourceFieldId}
                        onChange={(e) => setHlSourceFieldId(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Not mapped</option>
                        {customFields.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Auto Sync */}
                <div className="border-t border-slate-200 pt-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hlAutoSync}
                      onChange={(e) => setHlAutoSync(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="font-semibold text-slate-900">Auto-Audit New Contacts</span>
                      <p className="text-sm text-slate-500">
                        Automatically run AISO audit when a new contact with a website is added in HighLevel
                      </p>
                    </div>
                  </label>
                </div>

                {/* Webhook URL */}
                <div className="border-t border-slate-200 pt-6">
                  <h3 className="font-semibold text-slate-900 mb-2">Webhook URL</h3>
                  <p className="text-sm text-slate-600 mb-3">
                    Add this URL in HighLevel to receive events (Contacts, Opportunities)
                  </p>
                  <div className="flex gap-2">
                    <code className="flex-1 px-4 py-3 bg-slate-100 rounded-lg text-sm font-mono text-slate-700 overflow-x-auto">
                      https://aiso.studio/api/webhooks/highlevel
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('https://aiso.studio/api/webhooks/highlevel');
                        setMessage({ type: 'success', text: 'Webhook URL copied!' });
                      }}
                      className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg text-sm font-medium transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t border-slate-200">
              {hlSettings?.connected ? (
                <>
                  <button
                    onClick={handleUpdateSettings}
                    disabled={saving}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {saving ? 'Saving...' : 'Save Settings'}
                  </button>
                  <button
                    onClick={handleDisconnect}
                    disabled={saving}
                    className="px-6 py-3 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 disabled:opacity-50 transition-colors"
                  >
                    Disconnect
                  </button>
                </>
              ) : (
                <button
                  onClick={handleConnect}
                  disabled={saving || !hlApiKey || !hlLocationId}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Connecting...' : 'Connect HighLevel'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Don't Have HighLevel? */}
        <div className="mt-8 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-200">
          <h3 className="font-bold text-slate-900 mb-2">Don't have HighLevel?</h3>
          <p className="text-slate-600 mb-4">
            HighLevel is the #1 CRM for marketing agencies. AISO Studio works great as a standalone tool,
            but pairing it with HighLevel gives you powerful automation for lead nurturing.
          </p>
          <a
            href="https://www.gohighlevel.com/?fp_ref=aiso"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
          >
            Try HighLevel Free for 14 Days
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

        {/* Future Integrations */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Coming Soon</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { name: 'HubSpot', icon: 'HB', color: 'orange' },
              { name: 'Salesforce', icon: 'SF', color: 'blue' },
              { name: 'Zapier', icon: 'ZP', color: 'orange' },
            ].map((integration) => (
              <div
                key={integration.name}
                className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200"
              >
                <div className={`w-10 h-10 bg-${integration.color}-100 rounded-lg flex items-center justify-center`}>
                  <span className={`font-bold text-${integration.color}-600`}>{integration.icon}</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{integration.name}</p>
                  <p className="text-sm text-slate-500">Coming soon</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
