const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

async function checkUser() {
  const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

  try {
    console.log('\n🔍 Checking production users...\n');

    // Get all users
    const users = await sql`
      SELECT id, email, clerk_id, subscription_tier, subscription_status, article_limit
      FROM users
      ORDER BY created_at DESC
      LIMIT 5
    `;

    console.log(`Found ${users.length} users:\n`);
    users.forEach(user => {
      console.log(`- ${user.email}`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Clerk ID: ${user.clerk_id}`);
      console.log(`  Tier: ${user.subscription_tier}`);
      console.log(`  Status: ${user.subscription_status}`);
      console.log(`  Article Limit: ${user.article_limit}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sql.end();
  }
}

checkUser();
