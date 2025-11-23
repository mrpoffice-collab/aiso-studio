// Run free audit conversion tracking migration
const postgres = require('postgres');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL, {
  ssl: 'require',
});

async function runMigration() {
  try {
    console.log('Running free audit conversion tracking migration...');

    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'migrations', 'add-free-audit-conversion-tracking.sql'),
      'utf8'
    );

    await sql.unsafe(migrationSQL);

    console.log('✅ Migration completed successfully!');
    console.log('\nAdded columns:');
    console.log('  - converted (BOOLEAN)');
    console.log('  - converted_user_id (INTEGER)');
    console.log('  - converted_at (TIMESTAMP)');
    console.log('  - is_domain_owner (BOOLEAN)');
    console.log('  - user_agent (TEXT)');
    console.log('  - referrer (TEXT)');
    console.log('\nCreated indexes for faster analytics queries.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
