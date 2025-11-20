// Run the topic flesch override migration
const postgres = require('postgres');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL, {
  ssl: 'require',
  max: 10,
});

async function runMigration() {
  try {
    console.log('🔄 Running topic flesch override migration...\n');

    const migration = fs.readFileSync('migrations/add-topic-flesch-override.sql', 'utf8');
    await sql.unsafe(migration);

    console.log('✅ Migration completed successfully!\n');
    console.log('Topics can now have individual target_flesch_score overrides.\n');

    await sql.end();
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
