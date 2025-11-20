require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function checkStrategy() {
  try {
    const strategies = await sql`
      SELECT id, client_name, target_flesch_score, keywords, target_audience
      FROM strategies
      ORDER BY created_at DESC
      LIMIT 3
    `;

    console.log('\n📋 Recent Strategies:\n');
    strategies.forEach(s => {
      console.log(`${s.client_name}`);
      console.log(`  ID: ${s.id}`);
      console.log(`  Target Flesch: ${s.target_flesch_score || '❌ NOT SET'}`);
      console.log(`  Keywords: ${Array.isArray(s.keywords) ? s.keywords.join(', ') : s.keywords}`);
      console.log(`  Audience: ${s.target_audience}`);
      console.log('');
    });

    const hasTarget = strategies.some(s => s.target_flesch_score);

    if (!hasTarget) {
      console.log('⚠️  No strategies have target_flesch_score set!');
      console.log('💡 You need to either:');
      console.log('   1. Create a NEW strategy (it will auto-set target)');
      console.log('   2. Edit existing strategy to set target');
      console.log('   3. Run a migration to analyze and set targets');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkStrategy();
