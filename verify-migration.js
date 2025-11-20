const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

async function verifyMigration() {
  const sql = postgres(process.env.DATABASE_URL);

  try {
    console.log('🔍 Checking database columns...\n');

    // Check posts table
    const postsColumns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'posts'
      AND column_name IN ('aeo_score', 'geo_score', 'aiso_score')
      ORDER BY column_name
    `;

    console.log('📊 Posts table:');
    if (postsColumns.length === 0) {
      console.log('   ❌ No AISO columns found');
    } else {
      postsColumns.forEach(col => {
        console.log(`   ✅ ${col.column_name} (${col.data_type})`);
      });
    }

    // Check strategies table
    const strategiesColumns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'strategies'
      AND column_name IN ('content_type', 'city', 'state', 'service_area')
      ORDER BY column_name
    `;

    console.log('\n🎯 Strategies table:');
    if (strategiesColumns.length === 0) {
      console.log('   ❌ No local context columns found');
    } else {
      strategiesColumns.forEach(col => {
        console.log(`   ✅ ${col.column_name} (${col.data_type})`);
      });
    }

    // Check topics table
    const topicsColumns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'topics'
      AND column_name = 'aeo_focus'
    `;

    console.log('\n📝 Topics table:');
    if (topicsColumns.length === 0) {
      console.log('   ❌ aeo_focus column not found');
    } else {
      topicsColumns.forEach(col => {
        console.log(`   ✅ ${col.column_name} (${col.data_type})`);
      });
    }

    console.log('\n');

    const totalColumns = postsColumns.length + strategiesColumns.length + topicsColumns.length;

    if (totalColumns === 8) {
      console.log('✅ All 8 columns created successfully!');
      console.log('✅ Migration is complete and verified.');
    } else {
      console.log(`⚠️  Only ${totalColumns}/8 columns found.`);
      console.log('   Migration may need to be run manually.');
    }

    await sql.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await sql.end();
    process.exit(1);
  }
}

verifyMigration();
