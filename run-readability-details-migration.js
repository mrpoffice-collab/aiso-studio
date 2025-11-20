require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');

const sql = neon(process.env.DATABASE_URL);

async function runMigration() {
  try {
    console.log('\n🔧 Running readability details migration...\n');

    // Read and execute the migration SQL
    const migrationSQL = fs.readFileSync('./migrations/add-readability-details.sql', 'utf8');
    await sql.unsafe(migrationSQL);

    console.log('✅ Migration complete!');
    console.log('\nAdded columns to posts table:');
    console.log('  - actual_flesch_score: Actual Flesch Reading Ease (e.g., 55)');
    console.log('  - target_flesch_score: Target from strategy (e.g., 58)');
    console.log('  - readability_gap: Absolute difference (e.g., 3)');
    console.log('  - readability_score: Intent-based score (e.g., 98/100)');
    console.log('\n📊 Future posts will save these details for display!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  }
}

runMigration();
