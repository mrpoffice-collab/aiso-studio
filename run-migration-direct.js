const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

async function runMigration() {
  const sql = postgres(process.env.DATABASE_URL);

  try {
    console.log('🚀 Starting AISO migration...\n');

    // Posts table columns
    console.log('📊 Adding columns to posts table...');
    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS aeo_score INTEGER`;
    console.log('   ✅ aeo_score added');

    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS geo_score INTEGER`;
    console.log('   ✅ geo_score added');

    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS aiso_score INTEGER`;
    console.log('   ✅ aiso_score added');

    // Strategies table columns
    console.log('\n🎯 Adding columns to strategies table...');
    await sql`ALTER TABLE strategies ADD COLUMN IF NOT EXISTS content_type VARCHAR(20) DEFAULT 'national'`;
    console.log('   ✅ content_type added');

    await sql`ALTER TABLE strategies ADD COLUMN IF NOT EXISTS city VARCHAR(100)`;
    console.log('   ✅ city added');

    await sql`ALTER TABLE strategies ADD COLUMN IF NOT EXISTS state VARCHAR(50)`;
    console.log('   ✅ state added');

    await sql`ALTER TABLE strategies ADD COLUMN IF NOT EXISTS service_area TEXT`;
    console.log('   ✅ service_area added');

    // Topics table column
    console.log('\n📝 Adding column to topics table...');
    await sql`ALTER TABLE topics ADD COLUMN IF NOT EXISTS aeo_focus VARCHAR(20)`;
    console.log('   ✅ aeo_focus added');

    // Add constraints
    console.log('\n🔒 Adding constraints...');
    await sql`ALTER TABLE strategies DROP CONSTRAINT IF EXISTS strategies_content_type_check`;
    await sql`ALTER TABLE strategies ADD CONSTRAINT strategies_content_type_check CHECK (content_type IN ('national', 'local', 'hybrid'))`;
    console.log('   ✅ content_type constraint added');

    await sql`ALTER TABLE topics DROP CONSTRAINT IF EXISTS topics_aeo_focus_check`;
    await sql`ALTER TABLE topics ADD CONSTRAINT topics_aeo_focus_check CHECK (aeo_focus IN ('definition', 'how-to', 'comparison', 'guide', 'faq', 'list', 'tutorial'))`;
    console.log('   ✅ aeo_focus constraint added');

    // Add indexes
    console.log('\n📇 Creating indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_strategies_content_type ON strategies(content_type)`;
    console.log('   ✅ idx_strategies_content_type created');

    await sql`CREATE INDEX IF NOT EXISTS idx_strategies_city_state ON strategies(city, state) WHERE content_type IN ('local', 'hybrid')`;
    console.log('   ✅ idx_strategies_city_state created');

    console.log('\n🎉 Migration completed successfully!\n');

    // Verify
    console.log('🔍 Verifying migration...\n');

    const postsColumns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'posts'
      AND column_name IN ('aeo_score', 'geo_score', 'aiso_score')
      ORDER BY column_name
    `;

    const strategiesColumns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'strategies'
      AND column_name IN ('content_type', 'city', 'state', 'service_area')
      ORDER BY column_name
    `;

    const topicsColumns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'topics'
      AND column_name = 'aeo_focus'
    `;

    console.log('📊 Posts table columns:');
    postsColumns.forEach(col => {
      console.log(`   ✅ ${col.column_name} (${col.data_type})`);
    });

    console.log('\n🎯 Strategies table columns:');
    strategiesColumns.forEach(col => {
      console.log(`   ✅ ${col.column_name} (${col.data_type})`);
    });

    console.log('\n📝 Topics table columns:');
    topicsColumns.forEach(col => {
      console.log(`   ✅ ${col.column_name} (${col.data_type})`);
    });

    const totalColumns = postsColumns.length + strategiesColumns.length + topicsColumns.length;

    console.log(`\n✅ ${totalColumns}/8 columns verified!\n`);

    if (totalColumns === 8) {
      console.log('🎉 All AISO fields successfully added to database!');
      console.log('\n📋 Next steps:');
      console.log('   1. Test AISO scoring functions');
      console.log('   2. Update API routes to use calculateAISOScore()');
      console.log('   3. Create UI components for score display');
      console.log('   4. Add local fields to strategy builder\n');
    }

    await sql.end();
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    await sql.end();
    process.exit(1);
  }
}

runMigration();
