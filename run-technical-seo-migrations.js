require('dotenv').config({ path: '.env.local' });
const postgres = require('postgres');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  console.log('📦 Using database:', process.env.DATABASE_URL.split('@')[1]?.split('/')[0] || 'unknown');

  const sql = postgres(process.env.DATABASE_URL, {
    ssl: 'require'
  });

  try {
    console.log('🔗 Connecting to database...');
    // Test connection
    await sql`SELECT 1`;
    console.log('✅ Connected to database');

    // Read migration files
    const technicalSeoMigration = fs.readFileSync(
      path.join(__dirname, 'migrations', 'add-technical-seo-audits.sql'),
      'utf8'
    );

    const agencyMarketplaceMigration = fs.readFileSync(
      path.join(__dirname, 'migrations', 'add-agency-marketplace.sql'),
      'utf8'
    );

    console.log('\n📋 Running migration: add-technical-seo-audits.sql');
    await sql.unsafe(technicalSeoMigration);
    console.log('✅ Technical SEO audits migration completed');

    console.log('\n📋 Running migration: add-agency-marketplace.sql');
    await sql.unsafe(agencyMarketplaceMigration);
    console.log('✅ Agency marketplace migration completed');

    // Verify tables were created
    console.log('\n🔍 Verifying tables...');
    const result = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('technical_seo_audits', 'agencies', 'agency_lead_referrals')
      ORDER BY table_name
    `;

    console.log('\n✅ Tables created:');
    result.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });

    // Check column counts
    const columnCounts = await sql`
      SELECT
        table_name,
        COUNT(*)::int as column_count
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name IN ('technical_seo_audits', 'agencies', 'agency_lead_referrals')
      GROUP BY table_name
      ORDER BY table_name
    `;

    console.log('\n📊 Table details:');
    columnCounts.forEach(row => {
      console.log(`   - ${row.table_name}: ${row.column_count} columns`);
    });

    await sql.end();

    console.log('\n🎉 All migrations completed successfully!\n');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

runMigrations();
