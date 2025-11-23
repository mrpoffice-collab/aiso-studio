require('dotenv').config({ path: '.env.local' });
const postgres = require('postgres');

async function verifyTables() {
  const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

  try {
    console.log('🔍 Checking production database tables...\n');

    // Check if tables exist
    const tables = await sql`
      SELECT table_name,
             (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public'
      AND table_name IN ('technical_seo_audits', 'agencies', 'agency_lead_referrals', 'users')
      ORDER BY table_name
    `;

    console.log('✅ Tables found:');
    tables.forEach(t => {
      console.log(`   ${t.table_name}: ${t.column_count} columns`);
    });

    // Check users table structure
    console.log('\n🔍 Checking users table structure...');
    const userColumns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'users'
      AND column_name IN ('id', 'clerk_id', 'email')
      ORDER BY column_name
    `;

    console.log('✅ Users table key columns:');
    userColumns.forEach(c => {
      console.log(`   ${c.column_name}: ${c.data_type}`);
    });

    // Check if there are any users
    const userCount = await sql`SELECT COUNT(*)::int as count FROM users`;
    console.log(`\n👥 Total users in database: ${userCount[0].count}`);

    await sql.end();
    console.log('\n✅ Production database verification complete!\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    await sql.end();
    process.exit(1);
  }
}

verifyTables();
