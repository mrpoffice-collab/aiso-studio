// Add target_flesch_score to strategies and populate existing strategy
require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

async function runMigration() {
  const sql = neon(process.env.DATABASE_URL);

  console.log('🎯 Adding target_flesch_score to strategies...\n');

  try {
    // Add column
    await sql`
      ALTER TABLE strategies
      ADD COLUMN IF NOT EXISTS target_flesch_score INTEGER
    `;
    console.log('✅ Added target_flesch_score column');

    // Analyze existing strategy and set appropriate target
    const strategies = await sql`
      SELECT id, target_audience, keywords
      FROM strategies
    `;

    console.log(`\n📊 Found ${strategies.length} existing strategy/strategies\n`);

    for (const strategy of strategies) {
      // Analyze Firefly Grove strategy
      const audience = strategy.target_audience.toLowerCase();
      const keywords = strategy.keywords || [];

      let targetFlesch = 55; // Default to professionals/educated general public

      // For Firefly Grove: emotional topic for adults 40-70
      // Should be accessible but not overly simple
      if (audience.includes('adults') || audience.includes('40') || audience.includes('grief') || audience.includes('memorial')) {
        targetFlesch = 58; // Upper end of professional range (easier to read)
      }

      // Check for technical keywords (would lower target)
      const technicalTerms = ['API', 'development', 'implementation', 'infrastructure', 'configuration'];
      const hasTechnical = keywords.some(kw =>
        technicalTerms.some(term => kw.toLowerCase().includes(term.toLowerCase()))
      );
      if (hasTechnical) {
        targetFlesch = 40; // More technical
      }

      // Check for consumer keywords (would raise target)
      const consumerTerms = ['how to', 'guide', 'tips', 'easy', 'beginner'];
      const hasConsumer = keywords.some(kw =>
        consumerTerms.some(term => kw.toLowerCase().includes(term.toLowerCase()))
      );
      if (hasConsumer) {
        targetFlesch = 70; // Very accessible
      }

      await sql`
        UPDATE strategies
        SET target_flesch_score = ${targetFlesch}
        WHERE id = ${strategy.id}
      `;

      console.log(`✅ Set target Flesch score to ${targetFlesch} for strategy`);
      console.log(`   Audience: ${strategy.target_audience.substring(0, 60)}...`);
      console.log(`   Reasoning: ${
        targetFlesch === 70 ? 'Consumer/beginner content' :
        targetFlesch === 58 ? 'Accessible for general adults on emotional topics' :
        targetFlesch === 55 ? 'Professional/educated audience' :
        targetFlesch === 40 ? 'Technical/professional content' :
        'Default professional level'
      }\n`);
    }

    console.log('✨ Migration complete!\n');
    console.log('📋 Summary:');
    console.log('   - Added target_flesch_score column to strategies');
    console.log('   - Analyzed and set targets for existing strategies');
    console.log('   - Content will now be scored against intended reading level\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
