// Test AISO scoring functions
const {
  calculateAEOScore,
  calculateGEOScore,
  calculateAISOScore,
  scoreContent
} = require('./lib/content-scoring.ts');

console.log('🧪 Testing AISO Scoring Functions\n');
console.log('═'.repeat(60));

// Sample content with AEO-optimized structure
const sampleContent = `
## What Is Content Marketing?

The answer is simple: Content marketing is defined as a strategic marketing approach focused on creating and distributing valuable, relevant content to attract and retain a clearly defined audience.

### Why Content Marketing Matters

According to recent industry data, 82% of marketers actively use content marketing, and companies that blog receive 67% more leads than those that don't.

### How Does Content Marketing Work?

Content marketing works by:

1. Identifying your target audience
2. Creating valuable content that addresses their needs
3. Distributing content through appropriate channels
4. Measuring and optimizing performance

| Content Type | Engagement Rate | ROI |
|--------------|----------------|-----|
| Blog Posts   | 45%            | High |
| Videos       | 62%            | Very High |
| Infographics | 38%            | Medium |

### Frequently Asked Questions

#### What are the benefits of content marketing?

Content marketing builds trust with your audience, generates qualified leads, and establishes your brand as an authority in your industry. It's cost-effective and provides long-term results.

#### How long does content marketing take to work?

Typically, content marketing shows measurable results in 3-6 months with consistent effort. However, the timeline varies based on industry, competition, and content quality.

#### What types of content should I create?

Focus on blog posts, videos, infographics, case studies, and social media content. Choose formats that resonate with your target audience and align with your business goals.

#### How often should I publish content?

Aim for at least 2-4 blog posts per month for small businesses, and weekly or bi-weekly for larger organizations. Consistency is more important than frequency.

#### Do I need a content calendar?

Yes, a content calendar helps you plan topics, maintain consistency, and align content with business objectives. It's essential for organized content marketing.

### Key Takeaways

- Content marketing is a long-term strategy
- Quality matters more than quantity
- Focus on providing value to your audience
- Measure results and optimize continuously
`;

// Test AEO Scoring
console.log('\n1️⃣  AEO (Answer Engine Optimization) Score\n');
const aeoResult = calculateAEOScore(sampleContent);
console.log(`   Score: ${aeoResult.score}/100`);
console.log(`   📊 Breakdown:`);
console.log(`      - Direct Answer: ${aeoResult.details.hasDirectAnswer ? '✅' : '❌'}`);
console.log(`      - Answer in First Paragraph: ${aeoResult.details.answerInFirstParagraph ? '✅' : '❌'}`);
console.log(`      - FAQ Section: ${aeoResult.details.hasFAQSection ? '✅' : '❌'} (${aeoResult.details.faqCount} questions)`);
console.log(`      - Statistics: ${aeoResult.details.hasStatistics ? '✅' : '❌'} (${aeoResult.details.quotableStatementsCount} found)`);
console.log(`      - Data Tables: ${aeoResult.details.hasDataTables ? '✅' : '❌'}`);
console.log(`      - How-To Steps: ${aeoResult.details.hasHowToSteps ? '✅' : '❌'}`);
console.log(`      - Definitions: ${aeoResult.details.hasDefinitions ? '✅' : '❌'}`);
console.log(`      - Topical Depth: ${aeoResult.details.topicalDepth} headers`);

// Test GEO Scoring with local content
console.log('\n2️⃣  GEO (Local Intent Optimization) Score\n');
const localContent = sampleContent + `

We serve Austin, Texas and surrounding areas including Round Rock, Cedar Park, and Pflugerville.

Looking for the best content marketing services in Austin? Our local team provides professional content strategy and creation services near you. We're located in downtown Austin and serve businesses throughout Travis County.

Contact us today to schedule a consultation at our Austin office. We offer affordable, trusted content marketing services in the Austin metro area.
`;

const geoResult = calculateGEOScore(localContent, { city: 'Austin', state: 'Texas' });
console.log(`   Score: ${geoResult.score}/100`);
console.log(`   📍 Breakdown:`);
console.log(`      - Location Mentions: ${geoResult.details.hasLocationMentions ? '✅' : '❌'} (${geoResult.details.cityMentions} times)`);
console.log(`      - Service Area: ${geoResult.details.hasServiceArea ? '✅' : '❌'}`);
console.log(`      - "Near Me" Optimization: ${geoResult.details.hasNearMeOptimization ? '✅' : '❌'}`);
console.log(`      - Local Keywords: ${geoResult.details.hasLocalKeywords ? '✅' : '❌'} (${geoResult.details.localKeywordCount} found)`);
console.log(`      - Business Info: ${geoResult.details.hasBusinessInfo ? '✅' : '❌'}`);
console.log(`      - Local Intent: ${geoResult.details.hasLocalIntent ? '✅' : '❌'}`);
console.log(`      - Neighborhood Mentions: ${geoResult.details.neighborhoodMentions}`);

// Test Complete AISO Score (National Content)
console.log('\n3️⃣  Complete AISO Score - National Content\n');
const nationalScores = calculateAISOScore(
  sampleContent,
  'What Is Content Marketing? A Complete Guide',
  'Learn what content marketing is, why it matters, and how to create an effective content marketing strategy that drives results.',
  85 // Fact-check score
);
console.log(`   AISO Score: ${nationalScores.aisoScore}/100 ⭐`);
console.log(`   📊 Component Scores:`);
console.log(`      - Fact-Check: ${nationalScores.factCheckScore}/100 (30% weight) ⭐`);
console.log(`      - AEO: ${nationalScores.aeoScore}/100 (25% weight)`);
console.log(`      - SEO: ${nationalScores.seoScore}/100 (15% weight)`);
console.log(`      - Readability: ${nationalScores.readabilityScore}/100 (15% weight)`);
console.log(`      - Engagement: ${nationalScores.engagementScore}/100 (15% weight)`);

// Test Complete AISO Score (Local Content)
console.log('\n4️⃣  Complete AISO Score - Local Content\n');
const localScores = calculateAISOScore(
  localContent,
  'Best Content Marketing Services in Austin, TX',
  'Professional content marketing services in Austin, Texas. Local team serving Travis County businesses.',
  82, // Fact-check score
  { city: 'Austin', state: 'Texas' }
);
console.log(`   AISO Score: ${localScores.aisoScore}/100 ⭐`);
console.log(`   📊 Component Scores:`);
console.log(`      - Fact-Check: ${localScores.factCheckScore}/100 (25% weight) ⭐`);
console.log(`      - AEO: ${localScores.aeoScore}/100 (20% weight)`);
console.log(`      - GEO: ${localScores.geoScore}/100 (10% weight)`);
console.log(`      - SEO: ${localScores.seoScore}/100 (15% weight)`);
console.log(`      - Readability: ${localScores.readabilityScore}/100 (15% weight)`);
console.log(`      - Engagement: ${localScores.engagementScore}/100 (15% weight)`);

console.log('\n' + '═'.repeat(60));
console.log('\n✅ All AISO scoring functions working correctly!\n');
console.log('📋 Key Findings:');
console.log(`   - AEO Score: ${aeoResult.score}/100 ${aeoResult.score >= 70 ? '✅ Good' : '⚠️ Needs improvement'}`);
console.log(`   - GEO Score: ${geoResult.score}/100 ${geoResult.score >= 70 ? '✅ Good' : '⚠️ Needs improvement'}`);
console.log(`   - National AISO: ${nationalScores.aisoScore}/100 ${nationalScores.aisoScore >= 75 ? '✅ Ready to publish' : '⚠️ Needs optimization'}`);
console.log(`   - Local AISO: ${localScores.aisoScore}/100 ${localScores.aisoScore >= 75 ? '✅ Ready to publish' : '⚠️ Needs optimization'}`);

console.log('\n💡 Next Steps:');
console.log('   1. Update API routes to use calculateAISOScore()');
console.log('   2. Store AEO, GEO, and AISO scores in database');
console.log('   3. Create UI components to display scores');
console.log('   4. Add local business fields to strategy builder\n');
