// Check existing strategies and analyze readability alignment
require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

async function checkStrategies() {
  const sql = neon(process.env.DATABASE_URL);

  console.log('📊 Fetching existing strategies...\n');

  const strategies = await sql`
    SELECT
      id,
      client_name,
      industry,
      target_audience,
      keywords,
      content_type,
      city,
      state
    FROM strategies
    LIMIT 5
  `;

  strategies.forEach((strategy, index) => {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`Strategy ${index + 1}: ${strategy.client_name}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`\n🏢 Industry: ${strategy.industry}`);
    console.log(`\n👥 Target Audience:`);
    console.log(`   ${strategy.target_audience}`);
    console.log(`\n🔑 Keywords (${strategy.keywords?.length || 0} total):`);
    if (strategy.keywords && strategy.keywords.length > 0) {
      strategy.keywords.slice(0, 10).forEach(kw => console.log(`   - ${kw}`));
      if (strategy.keywords.length > 10) {
        console.log(`   ... and ${strategy.keywords.length - 10} more`);
      }
    } else {
      console.log(`   (No keywords set)`);
    }
    console.log(`\n📍 Content Type: ${strategy.content_type || 'national'}`);
    if (strategy.city || strategy.state) {
      console.log(`   Location: ${strategy.city ? strategy.city + ', ' : ''}${strategy.state || ''}`);
    }

    // Analyze keyword complexity
    if (strategy.keywords && strategy.keywords.length > 0) {
      const technicalTerms = ['API', 'REST', 'PHP', 'development', 'implementation', 'optimization',
        'configuration', 'integration', 'authentication', 'migration', 'deployment', 'framework',
        'architecture', 'infrastructure', 'database', 'server', 'cloud', 'DevOps'];

      const professionalTerms = ['business', 'strategy', 'professional', 'services', 'consulting',
        'management', 'planning', 'analysis', 'marketing', 'sales', 'revenue', 'ROI'];

      const consumerTerms = ['how to', 'guide', 'tips', 'easy', 'simple', 'beginner',
        'home', 'family', 'personal', 'DIY', 'tutorial', 'basic'];

      let technicalCount = 0;
      let professionalCount = 0;
      let consumerCount = 0;

      strategy.keywords.forEach(keyword => {
        const lower = keyword.toLowerCase();
        if (technicalTerms.some(term => lower.includes(term.toLowerCase()))) technicalCount++;
        if (professionalTerms.some(term => lower.includes(term.toLowerCase()))) professionalCount++;
        if (consumerTerms.some(term => lower.includes(term.toLowerCase()))) consumerCount++;
      });

      console.log(`\n🤖 Keyword Analysis:`);
      console.log(`   Technical terms: ${technicalCount}/${strategy.keywords.length}`);
      console.log(`   Professional terms: ${professionalCount}/${strategy.keywords.length}`);
      console.log(`   Consumer terms: ${consumerCount}/${strategy.keywords.length}`);

      let suggestedFlesch = 55;
      let reasoning = 'Mixed - defaulting to educated general audience';

      if (technicalCount > strategy.keywords.length * 0.3) {
        suggestedFlesch = 35;
        reasoning = 'High technical content - developer/expert audience';
      } else if (professionalCount > strategy.keywords.length * 0.3) {
        suggestedFlesch = 50;
        reasoning = 'Professional/business audience';
      } else if (consumerCount > strategy.keywords.length * 0.3) {
        suggestedFlesch = 70;
        reasoning = 'General consumer audience';
      }

      console.log(`\n💡 Suggested Target Flesch Score: ${suggestedFlesch}`);
      console.log(`   Reasoning: ${reasoning}`);
    }
  });

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  console.log(`Total strategies: ${strategies.length}\n`);
}

checkStrategies().catch(console.error);
