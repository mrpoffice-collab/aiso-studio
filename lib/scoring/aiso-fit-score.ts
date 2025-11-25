/**
 * AISO Fit Scoring Algorithm
 *
 * Calculates how good a fit a business is for AISO.studio based on:
 * - Content marketing need (25%)
 * - Accessibility/WCAG compliance (25%)
 * - Searchability/SEO performance (25%)
 * - Content quality (15%)
 * - Industry fit (10%)
 */

export interface BusinessData {
  domain: string;
  businessName: string;
  industry: string;
  city?: string;
  state?: string;
  overallScore: number;
  contentScore: number;
  seoScore: number;
  hasBlog: boolean;
  blogPostCount: number;

  // Accessibility metrics (from scanAccessibilityFull)
  accessibilityScore?: number;
  wcagViolations?: {
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
    total: number;
  };

  // Searchability metrics
  searchVisibility?: {
    rankingKeywords: number;
    avgPosition: number;
    organicTraffic: number;
  };
}

export interface RecommendedService {
  id: string;
  name: string;
  reason: string;
  type: 'monthly' | 'one-time';
  defaultPrice: number;
}

export interface AISOFitScore {
  aisoScore: number; // 0-100: How good a fit for AISO
  estimatedValue: number; // Monthly recurring revenue potential
  timeToClose: string; // 'immediate' | 'short' | 'medium' | 'long'
  primaryPainPoint: string;
  secondaryPainPoints: string[];
  recommendedPitch: string;
  recommendedServices: RecommendedService[]; // Services to offer based on detected problems
}

// Default pricing (lower market rates for realistic pipeline value)
export const DEFAULT_SERVICE_PRICING = {
  content_marketing: { name: 'Content Marketing', price: 400, type: 'monthly' as const },
  accessibility: { name: 'Accessibility Remediation', price: 1500, type: 'one-time' as const },
  seo_package: { name: 'SEO Package', price: 500, type: 'monthly' as const },
  content_refresh: { name: 'Content Optimization', price: 300, type: 'one-time' as const },
};

interface PainPoint {
  score: number;
  text: string;
}

/**
 * Score a business for AISO fit and recommend services
 */
export function scoreBusinessForAISO(business: BusinessData): AISOFitScore {
  let aisoScore = 0;
  const painPoints: PainPoint[] = [];
  const recommendedServices: RecommendedService[] = [];

  // ============================================
  // CONTENT MARKETING (25% weight)
  // Triggered: No blog OR blog posts < 10
  // ============================================
  const needsContentMarketing = !business.hasBlog || business.blogPostCount < 10;

  if (!business.hasBlog) {
    aisoScore += 20;
    painPoints.push({ score: 30, text: 'No content marketing strategy' });
  } else if (business.blogPostCount < 10) {
    aisoScore += 12;
    painPoints.push({ score: 20, text: 'Inconsistent content publishing' });
  } else if (business.blogPostCount < 25) {
    aisoScore += 5;
    painPoints.push({ score: 10, text: 'Limited content library' });
  }

  if (needsContentMarketing) {
    recommendedServices.push({
      id: 'content_marketing',
      name: DEFAULT_SERVICE_PRICING.content_marketing.name,
      reason: !business.hasBlog ? 'No blog detected' : `Only ${business.blogPostCount} blog posts`,
      type: 'monthly',
      defaultPrice: DEFAULT_SERVICE_PRICING.content_marketing.price,
    });
  }

  // ============================================
  // ACCESSIBILITY (25% weight)
  // Triggered: Score < 70 OR critical violations > 0
  // ============================================
  const needsAccessibility =
    (business.accessibilityScore !== undefined && business.accessibilityScore < 70) ||
    (business.wcagViolations?.critical && business.wcagViolations.critical > 0);

  if (business.accessibilityScore !== undefined) {
    if (business.accessibilityScore < 50) {
      aisoScore += 20;
      painPoints.push({
        score: 35,
        text: `Accessibility score ${business.accessibilityScore}/100 (critical)`
      });
    } else if (business.accessibilityScore < 70) {
      aisoScore += 15;
      painPoints.push({
        score: 25,
        text: `Accessibility score ${business.accessibilityScore}/100 (needs work)`
      });
    } else if (business.accessibilityScore < 85) {
      aisoScore += 8;
      painPoints.push({ score: 15, text: 'Minor accessibility improvements needed' });
    }

    if (business.wcagViolations?.critical && business.wcagViolations.critical > 0) {
      aisoScore += 10;
      painPoints.push({
        score: 40,
        text: `${business.wcagViolations.critical} critical WCAG violations (legal risk)`
      });
    }
  }

  if (needsAccessibility) {
    const reason = business.wcagViolations?.critical
      ? `${business.wcagViolations.critical} critical WCAG violations`
      : `Accessibility score ${business.accessibilityScore}/100`;
    recommendedServices.push({
      id: 'accessibility',
      name: DEFAULT_SERVICE_PRICING.accessibility.name,
      reason,
      type: 'one-time',
      defaultPrice: DEFAULT_SERVICE_PRICING.accessibility.price,
    });
  }

  // ============================================
  // SEO PACKAGE (25% weight)
  // Triggered: SEO score < 70 OR keywords < 20 OR position > 20
  // ============================================
  const needsSEO =
    business.seoScore < 70 ||
    (business.searchVisibility?.rankingKeywords !== undefined && business.searchVisibility.rankingKeywords < 20) ||
    (business.searchVisibility?.avgPosition !== undefined && business.searchVisibility.avgPosition > 20);

  if (business.seoScore < 50) {
    aisoScore += 18;
    painPoints.push({ score: 30, text: 'Poor search engine visibility' });
  } else if (business.seoScore < 70) {
    aisoScore += 12;
    painPoints.push({ score: 20, text: 'Mediocre SEO performance' });
  } else if (business.seoScore < 85) {
    aisoScore += 6;
    painPoints.push({ score: 10, text: 'Room for SEO improvement' });
  }

  if (business.searchVisibility) {
    if (business.searchVisibility.rankingKeywords < 20) {
      aisoScore += 10;
      painPoints.push({
        score: 25,
        text: `Only ranking for ${business.searchVisibility.rankingKeywords} keywords`
      });
    }
    if (business.searchVisibility.avgPosition > 20) {
      aisoScore += 8;
      painPoints.push({ score: 20, text: 'Low search rankings (page 2-3)' });
    }
  }

  if (needsSEO) {
    let reason = `SEO score ${business.seoScore}/100`;
    if (business.searchVisibility?.rankingKeywords !== undefined && business.searchVisibility.rankingKeywords < 20) {
      reason = `Only ${business.searchVisibility.rankingKeywords} ranking keywords`;
    }
    recommendedServices.push({
      id: 'seo_package',
      name: DEFAULT_SERVICE_PRICING.seo_package.name,
      reason,
      type: 'monthly',
      defaultPrice: DEFAULT_SERVICE_PRICING.seo_package.price,
    });
  }

  // ============================================
  // CONTENT OPTIMIZATION (15% weight)
  // Triggered: Content score < 70 AND has existing blog
  // ============================================
  const needsContentRefresh = business.contentScore < 70 && business.hasBlog && business.blogPostCount >= 10;

  if (business.contentScore < 60) {
    aisoScore += 12;
    painPoints.push({ score: 25, text: 'Low-quality content' });
  } else if (business.contentScore < 75) {
    aisoScore += 8;
    painPoints.push({ score: 15, text: 'Content quality needs improvement' });
  } else if (business.contentScore < 85) {
    aisoScore += 4;
    painPoints.push({ score: 8, text: 'Good content, could be optimized' });
  }

  if (needsContentRefresh) {
    recommendedServices.push({
      id: 'content_refresh',
      name: DEFAULT_SERVICE_PRICING.content_refresh.name,
      reason: `Content quality score ${business.contentScore}/100`,
      type: 'one-time',
      defaultPrice: DEFAULT_SERVICE_PRICING.content_refresh.price,
    });
  }

  // ============================================
  // INDUSTRY BONUS (10% weight)
  // ============================================
  const highValueIndustries = [
    'dentist', 'dental', 'lawyer', 'attorney', 'law firm',
    'accountant', 'cpa', 'real estate', 'realtor',
    'medical', 'doctor', 'physician', 'healthcare',
    'financial advisor', 'wealth management', 'insurance',
    'contractor', 'construction', 'hvac', 'plumbing', 'electrical',
    'veterinary', 'vet', 'chiropractor', 'therapy', 'counseling'
  ];

  const industryLower = business.industry.toLowerCase();
  const isHighValue = highValueIndustries.some(ind => industryLower.includes(ind));

  if (isHighValue) {
    aisoScore += 10;
  } else {
    aisoScore += 4;
  }

  // ============================================
  // CALCULATE ESTIMATED VALUE FROM SERVICES
  // Monthly services: use price directly
  // One-time services: amortize over 12 months
  // ============================================
  let estimatedValue = 0;
  for (const service of recommendedServices) {
    if (service.type === 'monthly') {
      estimatedValue += service.defaultPrice;
    } else {
      // Amortize one-time over 12 months for pipeline value
      estimatedValue += Math.round(service.defaultPrice / 12);
    }
  }

  // Minimum value if any services recommended
  if (recommendedServices.length > 0 && estimatedValue === 0) {
    estimatedValue = 200;
  }

  // ============================================
  // TIME TO CLOSE
  // ============================================
  let timeToClose: string;
  if (aisoScore >= 70) {
    timeToClose = 'immediate';
  } else if (aisoScore >= 50) {
    timeToClose = 'short';
  } else if (aisoScore >= 30) {
    timeToClose = 'medium';
  } else {
    timeToClose = 'long';
  }

  // Sort pain points by severity
  const sortedPainPoints = painPoints.sort((a, b) => b.score - a.score);
  const primaryPainPoint = sortedPainPoints[0]?.text || 'Content marketing opportunity';
  const secondaryPainPoints = sortedPainPoints.slice(1, 3).map(p => p.text);

  // Generate recommended pitch
  const recommendedPitch = generateAISOPitch(
    business,
    primaryPainPoint,
    secondaryPainPoints,
    aisoScore
  );

  return {
    aisoScore: Math.min(aisoScore, 100),
    estimatedValue,
    timeToClose,
    primaryPainPoint,
    secondaryPainPoints,
    recommendedPitch,
    recommendedServices,
  };
}

/**
 * Generate a personalized pitch based on business pain points
 */
function generateAISOPitch(
  business: BusinessData,
  primaryPainPoint: string,
  secondaryPainPoints: string[],
  score: number
): string {
  const hasAccessibilityIssue = primaryPainPoint.includes('accessibility') ||
                                 secondaryPainPoints.some(p => p.includes('accessibility'));
  const hasSearchabilityIssue = primaryPainPoint.includes('visibility') ||
                                 primaryPainPoint.includes('keywords') ||
                                 primaryPainPoint.includes('SEO');

  // Calculate time to close based on score
  let timeToClose: string;
  if (score >= 70) {
    timeToClose = 'immediate';
  } else if (score >= 50) {
    timeToClose = 'short';
  } else if (score >= 30) {
    timeToClose = 'medium';
  } else {
    timeToClose = 'long';
  }

  // Accessibility-focused pitches (high urgency due to legal + SEO)
  if (hasAccessibilityIssue && business.wcagViolations?.critical && business.wcagViolations.critical > 0) {
    return `"${business.businessName} - I ran an accessibility audit and found ${business.wcagViolations.critical} critical WCAG violations. This affects SEO rankings AND opens you to ADA lawsuits. AISO's content automatically meets WCAG 2.1 AA standards. Can I send you the full report?"`;
  }

  if (hasAccessibilityIssue && business.accessibilityScore && business.accessibilityScore < 50) {
    return `"${business.businessName} - Your site scored ${business.accessibilityScore}/100 on accessibility. Google prioritizes accessible sites in search rankings. AISO ensures all content meets WCAG standards. Want to see how competitors compare?"`;
  }

  // Searchability-focused pitches
  if (hasSearchabilityIssue && business.searchVisibility?.rankingKeywords && business.searchVisibility.rankingKeywords < 20) {
    return `"${business.businessName} - You're only ranking for ${business.searchVisibility.rankingKeywords} keywords. Your competitors are ranking for 100+. AISO publishes 12 SEO-optimized articles/month to capture more searches. 7-day free trial?"`;
  }

  // Combined angle pitches (accessibility + content)
  if (score >= 70) {
    const issues = [primaryPainPoint, ...secondaryPainPoints.slice(0, 1)]
      .map(p => p.toLowerCase())
      .join(' + ');
    return `"${business.businessName} - I noticed ${issues}. AISO solves both: SEO-optimized content that meets WCAG standards automatically. Can we do a 15-min demo?"`;
  }

  // Standard pitches by urgency
  const location = business.city && business.state ? `${business.city}, ${business.state}` : business.city || '';

  const pitches = {
    immediate: `"${business.businessName} - ${primaryPainPoint}. AISO publishes 12 SEO-optimized, WCAG-compliant articles/month automatically. 7-day free trial - no credit card needed."`,
    short: `"Hi ${business.businessName}, your content score is ${business.contentScore}/100${business.accessibilityScore ? ` and accessibility is ${business.accessibilityScore}/100` : ''}. AISO's AI creates content that ranks AND meets compliance standards. Want a free audit?"`,
    medium: `"${business.businessName} - Most ${business.industry} businesses struggle with ${primaryPainPoint.toLowerCase()}. AISO automates content + ensures accessibility compliance. Can I send you our ROI calculator?"`,
    long: `"${business.businessName} - We help ${business.industry} businesses increase organic traffic through automated, accessible content.${location ? ` Would love to share case studies from ${location}.` : ' Can I send some case studies?'}"`,
  };

  return pitches[timeToClose as keyof typeof pitches] || pitches.medium;
}

/**
 * Calculate opportunity rating for simple categorization
 */
export function calculateAISOOpportunity(aisoScore: number): 'hot' | 'warm' | 'cold' {
  if (aisoScore >= 70) return 'hot';
  if (aisoScore >= 40) return 'warm';
  return 'cold';
}
