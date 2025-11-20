const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

async function fixUser() {
  const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

  try {
    console.log('\n🔧 Fixing all users with missing subscription data...\n');

    // Update all users that don't have subscription_tier set
    const result = await sql`
      UPDATE users
      SET
        subscription_tier = 'trial',
        subscription_status = 'trialing',
        article_limit = 10,
        articles_used_this_month = 0,
        strategies_limit = 1,
        strategies_used = 0,
        seats_limit = 1,
        seats_used = 1,
        trial_ends_at = CURRENT_TIMESTAMP + INTERVAL '7 days',
        billing_cycle_start = CURRENT_TIMESTAMP,
        billing_cycle_end = CURRENT_TIMESTAMP + INTERVAL '1 month'
      WHERE subscription_tier IS NULL
      RETURNING id, email, subscription_tier;
    `;

    if (result.length > 0) {
      console.log(`✅ Fixed ${result.length} user(s):\n`);
      result.forEach(user => {
        console.log(`   - ${user.email} (ID: ${user.id}) → ${user.subscription_tier}`);
      });
    } else {
      console.log('✅ All users already have subscription data!');
    }

    console.log('\n✅ Done! Try refreshing the dashboard now.\n');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sql.end();
  }
}

fixUser();
