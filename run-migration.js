// Run the database migration for duplicate content tracking
const fs = require('fs');
const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

async function runMigration() {
  console.log('🔄 Connecting to database...');

  const sql = postgres(process.env.DATABASE_URL, {
    ssl: 'require',
    max: 1,
  });

  try {
    // Read the migration file
    const migrationSQL = fs.readFileSync(
      './migrations/002_add_existing_content_tracking.sql',
      'utf8'
    );

    console.log('📝 Running migration...\n');
    console.log(migrationSQL);
    console.log('\n');

    // Execute the migration
    await sql.unsafe(migrationSQL);

    console.log('✅ Migration completed successfully!');
    console.log('\nNew database features:');
    console.log('  - strategies.existing_blog_urls column');
    console.log('  - existing_content table');
    console.log('  - posts.similarity_checked column');
    console.log('  - posts.similarity_score column');
    console.log('  - posts.duplicate_warnings column');
    console.log('\n✨ Duplicate content prevention is now ready to use!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runMigration();
