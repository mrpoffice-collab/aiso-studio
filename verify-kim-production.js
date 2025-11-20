const postgres = require('postgres');

const PRODUCTION_DB_URL = 'postgresql://neondb_owner:npg_HTNoEMZhR3n4@ep-still-credit-a4y8w43n-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function verifyKim() {
  const sql = postgres(PRODUCTION_DB_URL, { ssl: 'require', prepare: false });

  try {
    console.log('\n🔍 Checking Kim\'s invitation in PRODUCTION database...\n');

    const users = await sql.unsafe(
      `SELECT
        email, name, subscription_tier,
        invitation_token,
        invitation_expires_at,
        invitation_expires_at > NOW() as is_valid
      FROM users
      WHERE email = $1`,
      ['kim@aliidesign.com']
    );

    if (users.length === 0) {
      console.log('❌ No user found for kim@aliidesign.com');
      return;
    }

    const user = users[0];
    console.log('📊 Kim\'s Record:');
    console.log(`  Email: ${user.email}`);
    console.log(`  Name: ${user.name}`);
    console.log(`  Plan: ${user.subscription_tier}`);
    console.log(`  Has Token: ${user.invitation_token ? 'Yes' : 'No'}`);
    if (user.invitation_token) {
      console.log(`  Token: ${user.invitation_token.slice(0, 20)}...`);
      console.log(`  Expires: ${user.invitation_expires_at}`);
      console.log(`  Valid: ${user.is_valid ? '✅ Yes' : '❌ Expired'}`);
      console.log(`\n🔗 Link: https://aiso.studio/invite/${user.invitation_token}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sql.end();
  }
}

verifyKim();
