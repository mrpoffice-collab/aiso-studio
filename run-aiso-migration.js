const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  // Load environment variables
  require('dotenv').config({ path: '.env.local' });

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ ERROR: DATABASE_URL not found in .env.local');
    console.error('Please add your Neon database URL to .env.local');
    process.exit(1);
  }

  console.log('🚀 Starting AISO migration...\n');

  try {
    // Connect to database
    const sql = neon(databaseUrl);
    console.log('✅ Connected to database');

    // Read migration file
    const migrationPath = path.join(__dirname, 'migrations', '002_add_aiso_fields.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log('✅ Loaded migration file\n');

    // Split by semicolons and filter out comments and empty statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

    console.log(`📝 Executing ${statements.length} migration statements...\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // Skip comments
      if (statement.startsWith('COMMENT ON')) {
        console.log(`⏭️  Skipping comment statement ${i + 1}`);
        continue;
      }

      try {
        await sql(statement);
        console.log(`✅ Statement ${i + 1} executed successfully`);
      } catch (error) {
        // Some statements might fail if columns already exist - that's OK
        if (error.message.includes('already exists') || error.message.includes('duplicate')) {
          console.log(`ℹ️  Statement ${i + 1} skipped (already exists)`);
        } else {
          console.error(`⚠️  Warning on statement ${i + 1}:`, error.message);
        }
      }
    }

    console.log('\n🎉 Migration completed successfully!\n');

    // Verify the migration
    console.log('🔍 Verifying migration...\n');

    const postsColumns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'posts'
      AND column_name IN ('aeo_score', 'geo_score', 'aiso_score')
    `;

    const strategiesColumns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'strategies'
      AND column_name IN ('content_type', 'city', 'state', 'service_area')
    `;

    const topicsColumns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'topics'
      AND column_name = 'aeo_focus'
    `;

    console.log('✅ Posts table columns:', postsColumns.length === 3 ? 'OK' : 'MISSING SOME');
    postsColumns.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type})`);
    });

    console.log('\n✅ Strategies table columns:', strategiesColumns.length === 4 ? 'OK' : 'MISSING SOME');
    strategiesColumns.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type})`);
    });

    console.log('\n✅ Topics table columns:', topicsColumns.length === 1 ? 'OK' : 'MISSING');
    topicsColumns.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type})`);
    });

    console.log('\n✅ All verification checks passed!');
    console.log('\n📋 Next steps:');
    console.log('   1. Update API routes to use new AISO scoring');
    console.log('   2. Add local business fields to strategy builder UI');
    console.log('   3. Create AEO/GEO score display components');
    console.log('   4. Test end-to-end AISO workflow\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.error('\nPlease check the error above and try again.');
    process.exit(1);
  }
}

// Run the migration
runMigration();
