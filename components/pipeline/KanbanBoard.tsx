'use client';

import { useState, DragEvent } from 'react';
import AIVisibilityButton from '@/components/AIVisibilityButton';

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
  discovery_data?: Record<string, unknown>;
}

interface KanbanBoardProps {
  leads: Lead[];
  onStatusChange: (leadId: number, newStatus: string) => Promise<void>;
  onLeadClick: (lead: Lead) => void;
  onSendEmail: (lead: Lead) => void;
  onDelete: (leadId: number, businessName: string) => void;
  onConvert?: (lead: Lead) => void;
}

const PIPELINE_STAGES = [
  { id: 'new', label: 'New', color: 'bg-blue-500', lightBg: 'bg-blue-50', border: 'border-blue-200' },
  { id: 'researching', label: 'Researching', color: 'bg-purple-500', lightBg: 'bg-purple-50', border: 'border-purple-200' },
  { id: 'contacted', label: 'Contacted', color: 'bg-yellow-500', lightBg: 'bg-yellow-50', border: 'border-yellow-200' },
  { id: 'engaged', label: 'Engaged', color: 'bg-orange-500', lightBg: 'bg-orange-50', border: 'border-orange-200' },
  { id: 'demo_scheduled', label: 'Demo', color: 'bg-pink-500', lightBg: 'bg-pink-50', border: 'border-pink-200' },
  { id: 'trial', label: 'Trial', color: 'bg-indigo-500', lightBg: 'bg-indigo-50', border: 'border-indigo-200' },
  { id: 'negotiating', label: 'Negotiating', color: 'bg-cyan-500', lightBg: 'bg-cyan-50', border: 'border-cyan-200' },
  { id: 'won', label: 'Won', color: 'bg-green-500', lightBg: 'bg-green-50', border: 'border-green-200' },
  { id: 'lost', label: 'Lost', color: 'bg-gray-500', lightBg: 'bg-gray-50', border: 'border-gray-200' },
];

// Default service pricing for calculating lead value
const DEFAULT_SERVICE_PRICING = {
  content_marketing: { price: 400, type: 'monthly' as const },
  accessibility: { price: 1500, type: 'one-time' as const },
  seo_package: { price: 500, type: 'monthly' as const },
  content_refresh: { price: 300, type: 'one-time' as const },
};

// Calculate recommended services count and value from lead data
function getLeadServicesInfo(lead: Lead): { count: number; value: number } {
  let count = 0;
  let value = 0;

  // Content Marketing
  if (!lead.has_blog || lead.blog_post_count < 10) {
    count++;
    value += DEFAULT_SERVICE_PRICING.content_marketing.price;
  }

  // Accessibility
  const needsAccessibility =
    (lead.accessibility_score !== undefined && lead.accessibility_score < 70) ||
    (lead.wcag_critical_violations && lead.wcag_critical_violations > 0);
  if (needsAccessibility) {
    count++;
    value += Math.round(DEFAULT_SERVICE_PRICING.accessibility.price / 12);
  }

  // SEO
  const needsSEO =
    lead.seo_score < 70 ||
    (lead.ranking_keywords !== undefined && lead.ranking_keywords < 20) ||
    (lead.avg_search_position !== undefined && lead.avg_search_position > 20);
  if (needsSEO) {
    count++;
    value += DEFAULT_SERVICE_PRICING.seo_package.price;
  }

  // Content Optimization
  if (lead.content_score < 70 && lead.has_blog && lead.blog_post_count >= 10) {
    count++;
    value += Math.round(DEFAULT_SERVICE_PRICING.content_refresh.price / 12);
  }

  return { count, value };
}

export default function KanbanBoard({ leads, onStatusChange, onLeadClick, onSendEmail, onDelete, onConvert }: KanbanBoardProps) {
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const handleDragStart = (e: DragEvent<HTMLDivElement>, lead: Lead) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', lead.id.toString());
  };

  const handleDragEnd = () => {
    setDraggedLead(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>, stageId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(stageId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>, stageId: string) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (draggedLead && draggedLead.status !== stageId) {
      await onStatusChange(draggedLead.id, stageId);
    }
    setDraggedLead(null);
  };

  const getLeadsForStage = (stageId: string) => {
    return leads.filter(lead => lead.status === stageId);
  };

  const getAISOBadge = (score?: number) => {
    if (score === undefined) return null;
    if (score >= 70) return { label: 'HOT', class: 'bg-red-100 text-red-800' };
    if (score >= 40) return { label: 'WARM', class: 'bg-yellow-100 text-yellow-800' };
    return { label: 'COLD', class: 'bg-blue-100 text-blue-800' };
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 min-h-[600px]">
      {PIPELINE_STAGES.map((stage) => {
        const stageLeads = getLeadsForStage(stage.id);
        const isDropTarget = dragOverColumn === stage.id;
        // Calculate realistic pipeline value from recommended services
        const totalValue = stageLeads.reduce((sum, l) => sum + getLeadServicesInfo(l).value, 0);

        return (
          <div
            key={stage.id}
            className={`flex-shrink-0 w-72 rounded-lg border-2 transition-all ${
              isDropTarget
                ? `${stage.border} ${stage.lightBg} ring-2 ring-offset-2 ring-orange-400`
                : 'border-slate-200 bg-slate-50'
            }`}
            onDragOver={(e) => handleDragOver(e, stage.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, stage.id)}
          >
            {/* Column Header */}
            <div className={`${stage.color} text-white px-4 py-3 rounded-t-md`}>
              <div className="flex items-center justify-between">
                <span className="font-semibold">{stage.label}</span>
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">
                  {stageLeads.length}
                </span>
              </div>
              {totalValue > 0 && (
                <div className="text-xs text-white/80 mt-1">
                  ${totalValue.toLocaleString()}/mo potential
                </div>
              )}
            </div>

            {/* Cards Container */}
            <div className="p-3 space-y-3 min-h-[400px]">
              {stageLeads.map((lead) => {
                const aisoBadge = getAISOBadge(lead.aiso_opportunity_score);
                const isDragging = draggedLead?.id === lead.id;

                return (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead)}
                    onDragEnd={handleDragEnd}
                    className={`bg-white rounded-lg border border-slate-200 shadow-sm cursor-grab active:cursor-grabbing transition-all hover:shadow-md ${
                      isDragging ? 'opacity-50 scale-95' : ''
                    }`}
                  >
                    {/* Card Header */}
                    <div className="p-3 border-b border-slate-100 group/card">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-slate-900 truncate text-sm">
                            {lead.business_name}
                          </h4>
                          <p className="text-xs text-slate-500 truncate">{lead.domain}</p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {aisoBadge && (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${aisoBadge.class}`}>
                              {aisoBadge.label}
                            </span>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(lead.id, lead.business_name);
                            }}
                            className="opacity-0 group-hover/card:opacity-100 p-1 rounded hover:bg-red-100 text-slate-400 hover:text-red-600 transition-all"
                            title="Delete lead"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      {(lead.city || lead.industry) && (
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                          {lead.city && lead.state && (
                            <span>{lead.city}, {lead.state}</span>
                          )}
                          {lead.industry && (
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded">
                              {lead.industry}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Card Body - Scores & Pain Points */}
                    <div className="p-3 space-y-2">
                      {/* Score Row */}
                      <div className="flex items-center gap-2 text-xs">
                        {lead.aiso_opportunity_score !== undefined && (
                          <div className="flex items-center gap-1">
                            <span className="text-slate-500">AISO:</span>
                            <span className={`font-bold ${
                              lead.aiso_opportunity_score >= 70 ? 'text-red-600' :
                              lead.aiso_opportunity_score >= 40 ? 'text-yellow-600' : 'text-blue-600'
                            }`}>
                              {lead.aiso_opportunity_score}
                            </span>
                          </div>
                        )}
                        {lead.accessibility_score !== undefined && (
                          <div className="flex items-center gap-1">
                            <span className="text-slate-500">WCAG:</span>
                            <span className={`font-bold ${
                              lead.accessibility_score >= 85 ? 'text-green-600' :
                              lead.accessibility_score >= 60 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {lead.accessibility_score}
                            </span>
                          </div>
                        )}
                        {lead.wcag_critical_violations! > 0 && (
                          <span className="bg-red-100 text-red-700 px-1 py-0.5 rounded text-[10px] font-semibold">
                            {lead.wcag_critical_violations} crit
                          </span>
                        )}
                      </div>

                      {/* Primary Pain Point */}
                      {lead.primary_pain_point && (
                        <div className="text-xs text-orange-700 bg-orange-50 px-2 py-1.5 rounded border border-orange-100 line-clamp-2">
                          {lead.primary_pain_point}
                        </div>
                      )}

                      {/* Services & Value */}
                      {(() => {
                        const servicesInfo = getLeadServicesInfo(lead);
                        if (servicesInfo.count === 0) return null;
                        return (
                          <div className="flex items-center justify-between text-xs">
                            <span className="px-1.5 py-0.5 bg-orange-100 text-orange-800 rounded font-medium">
                              {servicesInfo.count} service{servicesInfo.count > 1 ? 's' : ''}
                            </span>
                            <span className="text-green-700 font-semibold">
                              ${servicesInfo.value}/mo
                            </span>
                          </div>
                        );
                      })()}

                      {/* Time to close */}
                      {lead.time_to_close && (
                        <div className="flex items-center justify-end">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] capitalize ${
                            lead.time_to_close === 'immediate' ? 'bg-red-100 text-red-700' :
                            lead.time_to_close === 'short' ? 'bg-orange-100 text-orange-700' :
                            lead.time_to_close === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {lead.time_to_close}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Card Footer - Actions */}
                    <div className="px-3 py-2 bg-slate-50 rounded-b-lg border-t border-slate-100 flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onLeadClick(lead);
                        }}
                        className="flex-1 text-xs text-slate-600 hover:text-orange-600 font-medium py-1"
                      >
                        View Details
                      </button>
                      {/* AI Visibility - Admin Only */}
                      <AIVisibilityButton
                        url={`https://${lead.domain}`}
                        keywords={lead.industry ? [lead.industry] : []}
                        businessName={lead.business_name}
                        industry={lead.industry || undefined}
                        location={lead.city && lead.state ? `${lead.city}, ${lead.state}` : undefined}
                        variant="icon"
                      />
                      {lead.email && (
                        <>
                          <span className="text-slate-300">|</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSendEmail(lead);
                            }}
                            className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 font-medium py-1"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Email
                          </button>
                        </>
                      )}
                      {lead.status !== 'won' && lead.status !== 'lost' && onConvert && (
                        <>
                          <span className="text-slate-300">|</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onConvert(lead);
                            }}
                            className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium py-1"
                            title="Convert to client"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Convert
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Empty State */}
              {stageLeads.length === 0 && (
                <div className="flex items-center justify-center h-32 border-2 border-dashed border-slate-200 rounded-lg">
                  <p className="text-sm text-slate-400">Drop leads here</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
