import { AEODetails } from '@/lib/content-scoring';

interface AEOScoreCardProps {
  score: number;
  details: AEODetails;
}

/**
 * AEO (Answer Engine Optimization) Score Card Component
 *
 * Displays comprehensive breakdown of how well content is optimized
 * for AI answer engines like ChatGPT Search, Perplexity, Google SGE, Bing Copilot
 *
 * Score Breakdown (0-100):
 * - Answer Quality: 30 points
 * - Citation-Worthiness: 25 points
 * - Structured Data: 20 points
 * - AI-Friendly Formatting: 15 points
 * - Topical Authority: 10 points
 */
export default function AEOScoreCard({ score, details }: AEOScoreCardProps) {
  // Ensure all details have default values to prevent NaN
  const safeDetails: AEODetails = {
    hasDirectAnswer: details?.hasDirectAnswer ?? false,
    answerInFirstParagraph: details?.answerInFirstParagraph ?? false,
    hasFAQSection: details?.hasFAQSection ?? false,
    faqCount: details?.faqCount ?? 0,
    hasHowToSteps: details?.hasHowToSteps ?? false,
    hasDataTables: details?.hasDataTables ?? false,
    hasStatistics: details?.hasStatistics ?? false,
    hasDefinitions: details?.hasDefinitions ?? false,
    quotableStatementsCount: details?.quotableStatementsCount ?? 0,
    topicalDepth: details?.topicalDepth ?? 0,
    internalLinksCount: details?.internalLinksCount ?? 0,
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-700 bg-green-50 border-green-200';
    if (score >= 75) return 'text-blue-700 bg-blue-50 border-blue-200';
    if (score >= 60) return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    return 'text-red-700 bg-red-50 border-red-200';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 85) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Improvement';
  };

  // Calculate component scores using safe defaults
  const answerQualityScore = Math.round(
    (safeDetails.hasDirectAnswer ? 15 : 0) +
    (safeDetails.answerInFirstParagraph ? 15 : 0)
  );

  const citationWorthinessScore = Math.round(
    (safeDetails.hasStatistics ? 10 : 0) +
    (safeDetails.quotableStatementsCount >= 3 ? 10 : safeDetails.quotableStatementsCount * 3) +
    (safeDetails.hasDefinitions ? 5 : 0)
  );

  const structuredDataScore = Math.round(
    (safeDetails.hasFAQSection ? 10 : 0) +
    (safeDetails.hasHowToSteps ? 5 : 0) +
    (safeDetails.hasDataTables ? 5 : 0)
  );

  const aiFriendlyFormattingScore = Math.round(
    (safeDetails.faqCount >= 5 ? 10 : safeDetails.faqCount * 2) +
    (safeDetails.hasHowToSteps ? 5 : 0)
  );

  const topicalAuthorityScore = Math.round(
    (safeDetails.topicalDepth >= 3 ? 5 : safeDetails.topicalDepth * 1.5) +
    (safeDetails.internalLinksCount >= 3 ? 5 : safeDetails.internalLinksCount * 1.5)
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            AEO Score
          </h3>
          <div className={`inline-flex items-center gap-3 px-5 py-3 rounded-xl border-2 ${getScoreColor(score)}`}>
            <div className="text-4xl font-black">{score}</div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider">/ 100</div>
              <div className="text-sm font-bold">{getScoreLabel(score)}</div>
            </div>
          </div>
        </div>
        <p className="text-sm text-slate-600">
          Answer Engine Optimization - How quotable your content is by AI (ChatGPT, Perplexity, Google SGE, Bing Copilot)
        </p>
      </div>

      {/* Key Indicators */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className={`p-3 rounded-lg border ${safeDetails.hasDirectAnswer ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
          <div className="flex items-center gap-2">
            {safeDetails.hasDirectAnswer ? (
              <span className="text-green-600 text-xl">✓</span>
            ) : (
              <span className="text-slate-400 text-xl">○</span>
            )}
            <span className="text-xs font-bold text-slate-900">Direct Answer</span>
          </div>
        </div>
        <div className={`p-3 rounded-lg border ${safeDetails.hasFAQSection ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
          <div className="flex items-center gap-2">
            {safeDetails.hasFAQSection ? (
              <span className="text-green-600 text-xl">✓</span>
            ) : (
              <span className="text-slate-400 text-xl">○</span>
            )}
            <span className="text-xs font-bold text-slate-900">FAQ Section</span>
          </div>
        </div>
        <div className={`p-3 rounded-lg border ${safeDetails.hasDefinitions ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
          <div className="flex items-center gap-2">
            {safeDetails.hasDefinitions ? (
              <span className="text-green-600 text-xl">✓</span>
            ) : (
              <span className="text-slate-400 text-xl">○</span>
            )}
            <span className="text-xs font-bold text-slate-900">Definitions</span>
          </div>
        </div>
      </div>

      {/* Component Breakdown */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Score Breakdown</h4>

        {/* Answer Quality - 30 points */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-bold text-slate-900">Answer Quality</span>
              <span className="text-sm font-black text-slate-900">{answerQualityScore}/30</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                style={{ width: `${(answerQualityScore / 30) * 100}%` }}
              />
            </div>
            <div className="flex gap-2 mt-1">
              {safeDetails.hasDirectAnswer && (
                <span className="text-xs text-green-600">✓ Direct answer</span>
              )}
              {safeDetails.answerInFirstParagraph && (
                <span className="text-xs text-green-600">✓ Answer-first structure</span>
              )}
            </div>
          </div>
        </div>

        {/* Citation-Worthiness - 25 points */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-bold text-slate-900">Citation-Worthiness</span>
              <span className="text-sm font-black text-slate-900">{citationWorthinessScore}/25</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all"
                style={{ width: `${(citationWorthinessScore / 25) * 100}%` }}
              />
            </div>
            <div className="flex gap-2 mt-1">
              {safeDetails.hasStatistics && (
                <span className="text-xs text-green-600">✓ Statistics</span>
              )}
              {safeDetails.quotableStatementsCount > 0 && (
                <span className="text-xs text-green-600">✓ {safeDetails.quotableStatementsCount} quotable insights</span>
              )}
              {safeDetails.hasDefinitions && (
                <span className="text-xs text-green-600">✓ Definitions</span>
              )}
            </div>
          </div>
        </div>

        {/* Structured Data - 20 points */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-bold text-slate-900">Structured Data</span>
              <span className="text-sm font-black text-slate-900">{structuredDataScore}/20</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                style={{ width: `${(structuredDataScore / 20) * 100}%` }}
              />
            </div>
            <div className="flex gap-2 mt-1">
              {safeDetails.hasFAQSection && (
                <span className="text-xs text-green-600">✓ FAQ schema</span>
              )}
              {safeDetails.hasHowToSteps && (
                <span className="text-xs text-green-600">✓ HowTo steps</span>
              )}
              {safeDetails.hasDataTables && (
                <span className="text-xs text-green-600">✓ Data tables</span>
              )}
            </div>
          </div>
        </div>

        {/* AI-Friendly Formatting - 15 points */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-bold text-slate-900">AI-Friendly Formatting</span>
              <span className="text-sm font-black text-slate-900">{aiFriendlyFormattingScore}/15</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all"
                style={{ width: `${(aiFriendlyFormattingScore / 15) * 100}%` }}
              />
            </div>
            <div className="flex gap-2 mt-1">
              {safeDetails.faqCount > 0 && (
                <span className="text-xs text-green-600">✓ {safeDetails.faqCount} FAQ items</span>
              )}
              {safeDetails.hasHowToSteps && (
                <span className="text-xs text-green-600">✓ Step-by-step</span>
              )}
            </div>
          </div>
        </div>

        {/* Topical Authority - 10 points */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-bold text-slate-900">Topical Authority</span>
              <span className="text-sm font-black text-slate-900">{topicalAuthorityScore}/10</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                style={{ width: `${(topicalAuthorityScore / 10) * 100}%` }}
              />
            </div>
            <div className="flex gap-2 mt-1">
              {safeDetails.topicalDepth > 0 && (
                <span className="text-xs text-green-600">✓ Depth: {safeDetails.topicalDepth}</span>
              )}
              {safeDetails.internalLinksCount > 0 && (
                <span className="text-xs text-green-600">✓ {safeDetails.internalLinksCount} internal links</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {score < 85 && (
        <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
          <h4 className="text-sm font-bold text-slate-900 mb-2">💡 Recommendations to Improve AEO</h4>
          <ul className="space-y-1 text-sm text-slate-700">
            {!safeDetails.hasDirectAnswer && (
              <li>• Add a clear, direct answer in the first paragraph</li>
            )}
            {!safeDetails.hasFAQSection && (
              <li>• Include an FAQ section with 5-8 common questions</li>
            )}
            {safeDetails.quotableStatementsCount < 3 && (
              <li>• Add more quotable insights and key takeaways</li>
            )}
            {!safeDetails.hasStatistics && (
              <li>• Include data, statistics, or research findings</li>
            )}
            {!safeDetails.hasDefinitions && (
              <li>• Define key terms for better AI understanding</li>
            )}
            {safeDetails.faqCount < 5 && (
              <li>• Expand FAQ section to at least 5 questions</li>
            )}
          </ul>
        </div>
      )}

      {score >= 85 && (
        <div className="mt-6 p-4 rounded-lg bg-green-50 border border-green-200">
          <p className="text-green-800 font-bold text-sm">
            ✅ Excellent AEO! This content is highly quotable by AI answer engines.
          </p>
        </div>
      )}
    </div>
  );
}
