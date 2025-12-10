const postgres = require('postgres');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function runMigration() {
  const sql = postgres(process.env.DATABASE_URL, {
    ssl: 'require',
  });

  try {
    console.log('Running bulk_jobs migration...');

    const migrationPath = path.join(__dirname, 'migrations', 'add-bulk-jobs-table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    await sql.unsafe(migrationSQL);

    console.log('✅ Migration completed successfully!');

    // Verify table exists
    const result = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_name = 'bulk_jobs'
    `;

    if (result.length > 0) {
      console.log('✅ bulk_jobs table created');
    } else {
      console.log('⚠️  Table may not have been created');
    }

    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    await sql.end();
    process.exit(1);
  }
}

runMigration();
