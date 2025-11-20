require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');

async function runMigration() {
  const sql = neon(process.env.DATABASE_URL);

  try {
    console.log('🚀 Starting Money Pages + Topic Clusters migration...\n');

    // Read the migration file
    const migrationSQL = fs.readFileSync('./migrations/add-money-pages-clean.sql', 'utf8');

    // Split by semicolons and filter out comments and empty statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // Skip comment blocks
      if (statement.startsWith('/*') || statement.includes('Example data')) {
        continue;
      }

      try {
        console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
        // Use raw SQL execution for DDL statements
        await sql.unsafe(statement + ';');
        console.log(`✅ Statement ${i + 1} executed successfully\n`);
      } catch (error) {
        // Check if error is about already existing objects
        if (error.message.includes('already exists')) {
          console.log(`⚠️  Statement ${i + 1} skipped (object already exists)\n`);
        } else {
          throw error;
        }
      }
    }

    // Verify tables were created
    console.log('🔍 Verifying tables...\n');

    const moneyPagesCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'money_pages'
      );
    `;

    const topicClustersCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'topic_clusters'
      );
    `;

    const topicsColumnsCheck = await sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'topics'
      AND column_name IN ('cluster_id', 'primary_link_url', 'primary_link_anchor', 'cta_type', 'link_placement_hint');
    `;

    console.log('✅ money_pages table:', moneyPagesCheck[0].exists ? 'EXISTS' : 'MISSING');
    console.log('✅ topic_clusters table:', topicClustersCheck[0].exists ? 'EXISTS' : 'MISSING');
    console.log('✅ topics table new columns:', topicsColumnsCheck.length, 'columns added');
    console.log('   Columns:', topicsColumnsCheck.map(c => c.column_name).join(', '));

    console.log('\n🎉 Migration completed successfully!\n');
    console.log('Next steps:');
    console.log('1. Build Money Pages UI');
    console.log('2. Build Topic Clusters UI');
    console.log('3. Update topic generation to use clusters');
    console.log('4. Add link validation to content generation\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('\nError details:', error.message);
    process.exit(1);
  }
}

runMigration();
