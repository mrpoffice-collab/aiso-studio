'use client';

import Link from 'next/link';

interface TechnicalSEOIssue {
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  issue: string;
  impact: string;
  fix: string;
  estimatedCost: string;
  timeToFix: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface OwnerIssue {
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  issue: string;
  impact: string;
  recommendation: string;
  ownerAction: string;
  difficulty: string;
}

interface Recommendation {
  priority: number;
  action: string;
  benefit: string;
  cost: string;
  timeframe: string;
}

interface TechnicalSEOResultData {
  id?: number;
  url: string;
  overallScore: number;
  aiSearchabilityScore: number;
  technicalSeoScore: number;
  agencyCanFix: {
    count: number;
    estimatedCost: string;
    issues: TechnicalSEOIssue[];
  };
  ownerMustChange: {
    count: number;
    issues: OwnerIssue[];
  };
  checks: any;
  recommendations: Recommendation[];
  createdAt?: string;
}

interface Props {
  result: TechnicalSEOResultData;
  showFindAgencyButton?: boolean;
}

export default function TechnicalSEOResults({ result, showFindAgencyButton = true }: Props) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Needs Work';
    return 'Critical Issues';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'from-green-500 to-green-600';
    if (score >= 70) return 'from-blue-500 to-blue-600';
    if (score >= 50) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Overall Scores */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            AI Searchability Diagnostic
          </h2>
          <p className="text-sm text-slate-500">{result.url}</p>
        </div>

        {/* Score Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Overall Score */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200">
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-600 mb-2">Overall Score</p>
              <div className={`text-5xl font-black ${getScoreColor(result.overallScore)} mb-2`}>
                {result.overallScore}
              </div>
              <p className={`text-sm font-bold ${getScoreColor(result.overallScore)}`}>
                {getScoreLabel(result.overallScore)}
              </p>
            </div>
          </div>

          {/* AI Searchability Score */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-600 mb-2">AI Searchability</p>
              <div className={`text-5xl font-black ${getScoreColor(result.aiSearchabilityScore)} mb-2`}>
                {result.aiSearchabilityScore}
              </div>
              <p className={`text-sm font-bold ${getScoreColor(result.aiSearchabilityScore)}`}>
                {getScoreLabel(result.aiSearchabilityScore)}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                ChatGPT, Perplexity visibility
              </p>
            </div>
          </div>

          {/* Technical SEO Score */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-600 mb-2">Technical SEO</p>
              <div className={`text-5xl font-black ${getScoreColor(result.technicalSeoScore)} mb-2`}>
                {result.technicalSeoScore}
              </div>
              <p className={`text-sm font-bold ${getScoreColor(result.technicalSeoScore)}`}>
                {getScoreLabel(result.technicalSeoScore)}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Structure, speed, markup
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Agency Can Fix Section */}
      {result.agencyCanFix.count > 0 && (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">
                💰 Agency Can Fix ({result.agencyCanFix.count} issues)
              </h3>
              <p className="text-sm text-slate-600">
                Billable technical fixes that can be implemented by a certified agency
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 mb-1">Estimated Cost</p>
              <p className="text-2xl font-black text-green-600">
                {result.agencyCanFix.estimatedCost}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {result.agencyCanFix.issues.map((issue, idx) => (
              <div
                key={idx}
                className="border border-slate-200 rounded-lg p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getSeverityColor(issue.severity)}`}>
                      {issue.severity.toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getDifficultyColor(issue.difficulty)}`}>
                      {issue.difficulty}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Cost Estimate</p>
                    <p className="text-lg font-bold text-slate-900">{issue.estimatedCost}</p>
                  </div>
                </div>

                <h4 className="font-bold text-slate-900 mb-2 text-lg">
                  {issue.category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </h4>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-semibold text-slate-700">Issue:</span>{' '}
                    <span className="text-slate-600">{issue.issue}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Impact:</span>{' '}
                    <span className="text-slate-600">{issue.impact}</span>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-3">
                    <span className="font-semibold text-blue-900">How to Fix:</span>{' '}
                    <span className="text-blue-800">{issue.fix}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-200 text-xs text-slate-500">
                  <span>⏱️ Time: {issue.timeToFix}</span>
                  <span>•</span>
                  <span>💼 Difficulty: {issue.difficulty}</span>
                </div>
              </div>
            ))}
          </div>

          {showFindAgencyButton && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-lg p-6">
                <h4 className="font-bold text-slate-900 mb-2">Need Help Fixing These Issues?</h4>
                <p className="text-sm text-slate-700 mb-4">
                  Get matched with certified agencies who specialize in AI searchability fixes.
                  Average project value: <strong>{result.agencyCanFix.estimatedCost}</strong>
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/apply-as-agency"
                    className="flex-1 text-center rounded-lg bg-gradient-to-r from-sunset-orange to-orange-600 px-6 py-3 font-bold text-white shadow-md hover:shadow-lg transition-all hover:scale-105"
                  >
                    I'm an Agency - Get Certified
                  </Link>
                  <a
                    href="mailto:support@aiso.studio?subject=Find%20Agency%20for%20AI%20Searchability%20Fixes"
                    className="flex-1 text-center rounded-lg border-2 border-orange-600 bg-white px-6 py-3 font-bold text-orange-600 hover:bg-orange-50 transition-all"
                  >
                    I Need an Agency
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Owner Must Change Section */}
      {result.ownerMustChange.count > 0 && (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-900 mb-1">
              ⚠️ Owner Must Change ({result.ownerMustChange.count} issues)
            </h3>
            <p className="text-sm text-slate-600">
              Business decisions or platform-level changes that require owner action
            </p>
          </div>

          <div className="space-y-4">
            {result.ownerMustChange.issues.map((issue, idx) => (
              <div
                key={idx}
                className="border border-yellow-200 bg-yellow-50 rounded-lg p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getSeverityColor(issue.severity)}`}>
                    {issue.severity.toUpperCase()}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                    {issue.difficulty}
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 mb-2 text-lg">
                  {issue.category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </h4>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-semibold text-slate-700">Issue:</span>{' '}
                    <span className="text-slate-600">{issue.issue}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Impact:</span>{' '}
                    <span className="text-slate-600">{issue.impact}</span>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded p-3 mt-3">
                    <span className="font-semibold text-purple-900">Recommendation:</span>{' '}
                    <span className="text-purple-800">{issue.recommendation}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded p-3">
                    <span className="font-semibold text-slate-900">Required Action:</span>{' '}
                    <span className="text-slate-700">{issue.ownerAction}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prioritized Recommendations */}
      {result.recommendations && result.recommendations.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <h3 className="text-xl font-bold text-slate-900 mb-4">
            📋 Prioritized Action Plan
          </h3>
          <p className="text-sm text-slate-600 mb-6">
            Recommended fixes ordered by impact and urgency
          </p>

          <div className="space-y-3">
            {result.recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center">
                  {rec.priority}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 mb-1">{rec.action}</h4>
                  <p className="text-sm text-slate-600 mb-2">{rec.benefit}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>💰 {rec.cost}</span>
                    <span>•</span>
                    <span>⏱️ {rec.timeframe}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary CTA */}
      {result.agencyCanFix.count === 0 && result.ownerMustChange.count === 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-8 text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">
            Excellent! No Critical Issues Found
          </h3>
          <p className="text-slate-700">
            Your site is properly configured for AI search visibility. ChatGPT, Perplexity,
            and other AI search engines should be able to access your content.
          </p>
        </div>
      )}
    </div>
  );
}
