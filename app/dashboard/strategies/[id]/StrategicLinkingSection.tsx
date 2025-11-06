'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MoneyPageForm from './MoneyPageForm';
import ClusterForm from './ClusterForm';

interface StrategicLinkingSectionProps {
  strategyId: string;
  initialMoneyPages: any[];
  initialClusters: any[];
}

export default function StrategicLinkingSection({
  strategyId,
  initialMoneyPages,
  initialClusters,
}: StrategicLinkingSectionProps) {
  const router = useRouter();
  const [moneyPages] = useState(initialMoneyPages);
  const [clusters] = useState(initialClusters);

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <>
      {/* Money Pages Section */}
      <div className="mb-12">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black bg-gradient-to-r from-deep-indigo via-blue-600 to-deep-indigo bg-clip-text text-transparent mb-2">
              Money Pages
            </h2>
            <p className="text-lg text-slate-600">
              High-value pages to promote through content ({moneyPages.length} pages)
            </p>
          </div>
          <MoneyPageForm strategyId={strategyId} onSuccess={handleRefresh} />
        </div>

        {moneyPages.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xl">
            <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-slate-600 mb-4 font-semibold">No money pages defined yet</p>
            <p className="text-sm text-slate-500">Define high-value pages (products, services, signup) to target with your content</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {moneyPages.map((page: any) => (
              <div key={page.id} className="p-6 rounded-xl border border-slate-200 bg-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-slate-900">{page.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      page.priority === 1 ? 'bg-red-100 text-red-700' :
                      page.priority === 2 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {page.priority === 1 ? 'HIGH' : page.priority === 2 ? 'MEDIUM' : 'LOW'}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase">
                      {page.page_type}
                    </span>
                  </div>
                  <a href={page.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-mono text-sm">
                    {page.url}
                  </a>
                  {page.description && (
                    <p className="text-slate-600 mt-2">{page.description}</p>
                  )}
                  {page.target_keywords && page.target_keywords.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {page.target_keywords.map((keyword: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Topic Clusters Section */}
      <div className="mb-12">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black bg-gradient-to-r from-deep-indigo via-blue-600 to-deep-indigo bg-clip-text text-transparent mb-2">
              Topic Clusters
            </h2>
            <p className="text-lg text-slate-600">
              Campaign-based content groups ({clusters.length} clusters)
            </p>
          </div>
          <ClusterForm
            strategyId={strategyId}
            moneyPages={moneyPages}
            onSuccess={handleRefresh}
          />
        </div>

        {clusters.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xl">
            <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-slate-600 mb-4 font-semibold">No clusters created yet</p>
            <p className="text-sm text-slate-500">Create topic clusters to organize content campaigns around your money pages</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {clusters.map((cluster: any) => (
              <div key={cluster.id} className="p-6 rounded-xl border border-slate-200 bg-white shadow-lg hover:shadow-xl transition-all duration-200">
                <h3 className="text-xl font-bold text-slate-900 mb-2">{cluster.name}</h3>
                {cluster.description && (
                  <p className="text-slate-600 mb-3">{cluster.description}</p>
                )}
                {cluster.primary_money_page_url && (
                  <div className="mb-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Target Page:</p>
                    <a href={cluster.primary_money_page_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm font-mono">
                      {cluster.primary_money_page_url}
                    </a>
                    {cluster.primary_money_page_title && (
                      <p className="text-xs text-slate-600 mt-1">{cluster.primary_money_page_title}</p>
                    )}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {cluster.funnel_stage && (
                      <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold uppercase">
                        {cluster.funnel_stage}
                      </span>
                    )}
                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                      {cluster.topic_count || 0} topics
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
