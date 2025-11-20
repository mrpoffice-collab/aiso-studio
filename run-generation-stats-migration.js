const postgres = require('postgres');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL);

async function runMigration() {
  try {
    console.log('🚀 Running generation stats migration...\n');

    const migrationSQL = fs.readFileSync('./migrations/add-generation-stats.sql', 'utf8');

    await sql.unsafe(migrationSQL);

    console.log('✅ Migration completed successfully!');
    console.log('\nAdded columns:');
    console.log('  - generation_iterations (integer)');
    console.log('  - generation_cost_cents (integer)');
    console.log('  - generation_time_seconds (integer)');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
