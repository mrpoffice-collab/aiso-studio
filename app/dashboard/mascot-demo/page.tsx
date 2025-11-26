'use client';

import DashboardNav from '@/components/DashboardNav';
import AISOMascot, {
  AISOMascotLoading,
  AISOMascotInline,
  AISOMascotProgress,
} from '@/components/AISOMascot';
import { useState } from 'react';

export default function MascotDemoPage() {
  const [demoState, setDemoState] = useState<'idle' | 'running' | 'thinking' | 'success' | 'error'>('running');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <DashboardNav />

      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <h1 className="text-4xl font-black text-slate-900 mb-2">AISO Mascot Demo</h1>
        <p className="text-slate-600 mb-8">Your stickman walking animation in action!</p>

        {/* Size Demo */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Sizes</h2>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-end gap-8 flex-wrap">
              <div className="text-center">
                <AISOMascot size="xs" showMessage={false} />
                <p className="text-xs text-slate-500 mt-2">xs (32px)</p>
              </div>
              <div className="text-center">
                <AISOMascot size="sm" showMessage={false} />
                <p className="text-xs text-slate-500 mt-2">sm (48px)</p>
              </div>
              <div className="text-center">
                <AISOMascot size="md" showMessage={false} />
                <p className="text-xs text-slate-500 mt-2">md (80px)</p>
              </div>
              <div className="text-center">
                <AISOMascot size="lg" showMessage={false} />
                <p className="text-xs text-slate-500 mt-2">lg (120px)</p>
              </div>
              <div className="text-center">
                <AISOMascot size="xl" showMessage={false} />
                <p className="text-xs text-slate-500 mt-2">xl (200px)</p>
              </div>
            </div>
          </div>
        </section>

        {/* State Demo */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">States</h2>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex gap-4 mb-6 flex-wrap">
              {(['idle', 'running', 'thinking', 'success', 'error'] as const).map((state) => (
                <button
                  key={state}
                  onClick={() => setDemoState(state)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    demoState === state
                      ? 'bg-orange-500 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {state}
                </button>
              ))}
            </div>
            <div className="flex justify-center py-8 bg-slate-50 rounded-lg">
              <AISOMascot state={demoState} size="lg" />
            </div>
          </div>
        </section>

        {/* Loading Component */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Loading Component</h2>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <AISOMascotLoading message="Running AISO Audit..." size="lg" />
          </div>
        </section>

        {/* Inline Usage */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Inline (Button)</h2>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold inline-flex items-center gap-3">
              <AISOMascot size="xs" showMessage={false} state="running" />
              Running Audit...
            </button>
          </div>
        </section>

        {/* Progress Demo */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Progress Indicator</h2>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <AISOMascotProgress
              message="Analyzing website..."
              progress={65}
              steps={[
                { label: 'Fetching page content', complete: true },
                { label: 'Running WCAG checks', complete: true },
                { label: 'Analyzing SEO factors', complete: false },
                { label: 'Generating report', complete: false },
              ]}
            />
          </div>
        </section>

        {/* Usage Examples */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Code Examples</h2>
          <div className="bg-slate-900 rounded-xl p-6 text-sm">
            <pre className="text-green-400 overflow-x-auto">
{`// Basic usage
<AISOMascot state="running" size="md" />

// Loading state with message
<AISOMascotLoading message="Running audit..." />

// Inline in a button
<button>
  <AISOMascot size="xs" showMessage={false} />
  Processing...
</button>

// Progress with steps
<AISOMascotProgress
  message="Analyzing..."
  progress={65}
  steps={[
    { label: 'Step 1', complete: true },
    { label: 'Step 2', complete: false },
  ]}
/>`}
            </pre>
          </div>
        </section>
      </main>
    </div>
  );
}
