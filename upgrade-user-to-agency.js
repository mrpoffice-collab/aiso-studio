require('dotenv').config({ path: '.env.local' });
const postgres = require('postgres');

async function upgradeToAgency(email) {
  const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

  try {
    console.log(`🔍 Finding user: ${email}\n`);

    // Find user
    const users = await sql`
      SELECT id, email, name, subscription_tier
      FROM users
      WHERE LOWER(email) = ${email.toLowerCase()}
    `;

    if (users.length === 0) {
      console.log('❌ User not found\n');
      await sql.end();
      return;
    }

    const user = users[0];
    console.log(`✅ Found user: ${user.name || user.email}`);
    console.log(`📊 Current tier: ${user.subscription_tier}\n`);

    // Upgrade to agency
    await sql`
      UPDATE users
      SET
        subscription_tier = 'agency',
        subscription_status = 'active',
        updated_at = NOW()
      WHERE id = ${user.id}
    `;

    console.log('✅ User upgraded to Agency tier!');
    console.log('📧 Subscription status set to: active\n');

    // Verify
    const updated = await sql`
      SELECT subscription_tier, subscription_status
      FROM users
      WHERE id = ${user.id}
    `;

    console.log('✅ Verification:');
    console.log(`   Tier: ${updated[0].subscription_tier}`);
    console.log(`   Status: ${updated[0].subscription_status}\n`);

    await sql.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await sql.end();
    process.exit(1);
  }
}

const email = process.argv[2] || 'kim@aliidesign.com';
upgradeToAgency(email);
