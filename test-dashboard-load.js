const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

async function testDashboard() {
  const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

  try {
    const userId = '129f63b8-dc7a-4568-8cab-67f77c5a3729'; // Your production user ID

    console.log('\n🧪 Testing dashboard data loading...\n');

    // Test 1: Get user
    console.log('1. Getting user...');
    const user = await sql`SELECT * FROM users WHERE id = ${userId}`;
    console.log(`   ✅ User found: ${user[0]?.email}`);

    // Test 2: Get strategies
    console.log('\n2. Getting strategies...');
    const strategies = await sql`SELECT * FROM strategies WHERE user_id = ${userId}`;
    console.log(`   ✅ Strategies: ${strategies.length}`);

    // Test 3: Get posts
    console.log('\n3. Getting posts...');
    const posts = await sql`SELECT * FROM posts WHERE user_id = ${userId}`;
    console.log(`   ✅ Posts: ${posts.length}`);

    // Test 4: Get subscription info
    console.log('\n4. Getting subscription info...');
    const subscription = await sql`
      SELECT subscription_tier, subscription_status, article_limit, articles_used_this_month
      FROM users WHERE id = ${userId}
    `;
    console.log(`   ✅ Subscription: ${subscription[0]?.subscription_tier} - ${subscription[0]?.subscription_status}`);
    console.log(`   ✅ Usage: ${subscription[0]?.articles_used_this_month}/${subscription[0]?.article_limit}`);

    console.log('\n✅ All dashboard queries successful!\n');

  } catch (error) {
    console.error('\n❌ Error:', error);
  } finally {
    await sql.end();
  }
}

testDashboard();
