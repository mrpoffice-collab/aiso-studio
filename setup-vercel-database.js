const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

// Vercel's database URL (the empty one)
const VERCEL_DB_URL = 'postgresql://neondb_owner:npg_HTNoEMZhR3n4@ep-still-credit-a4y8w43n-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function setupDatabase() {
  const sql = postgres(VERCEL_DB_URL, { ssl: 'require' });

  try {
    console.log('\n🔧 Setting up Vercel production database...\n');

    // Check if users table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'users'
      );
    `;

    if (tableCheck[0].exists) {
      console.log('✅ Database already has tables!');

      // Check user count
      const userCount = await sql`SELECT COUNT(*) FROM users`;
      console.log(`📊 Users in database: ${userCount[0].count}`);

      const strategyCount = await sql`SELECT COUNT(*) FROM strategies`;
      console.log(`📊 Strategies in database: ${strategyCount[0].count}`);

      const postCount = await sql`SELECT COUNT(*) FROM posts`;
      console.log(`📊 Posts in database: ${postCount[0].count}`);

      return;
    }

    console.log('⚠️  Database is empty. Creating tables...\n');

    // Read and execute the main schema file
    const fs = require('fs');
    const schemaSQL = fs.readFileSync('neon-schema.sql', 'utf8');

    console.log('📝 Creating tables from neon-schema.sql...');
    await sql.unsafe(schemaSQL);
    console.log('✅ Base tables created!');

    // Run important migrations
    const migrations = [
      'migrations/add-subscription-system.sql',
      'migrations/add-content-audits.sql',
      'migrations/add-site-audit-tables.sql',
    ];

    for (const migration of migrations) {
      if (fs.existsSync(migration)) {
        console.log(`\n📝 Running ${migration}...`);
        const migrationSQL = fs.readFileSync(migration, 'utf8');
        await sql.unsafe(migrationSQL);
        console.log(`✅ ${migration} complete!`);
      }
    }

    console.log('\n✅ Database setup complete!\n');
    console.log('Now your Vercel app can connect to this database.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sql.end();
  }
}

setupDatabase();
