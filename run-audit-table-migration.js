const postgres = require('postgres');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

async function runMigration() {
  const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

  try {
    console.log('Running content_audits migration...');

    const migrationSQL = fs.readFileSync('./migrations/add-content-audits.sql', 'utf8');
    await sql.unsafe(migrationSQL);

    console.log('✅ Migration completed successfully!');

    // Verify table was created
    const result = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'content_audits'
      ORDER BY ordinal_position
    `;

    console.log('\n📋 Table structure:');
    result.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runMigration();
