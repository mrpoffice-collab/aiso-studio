const postgres = require('postgres');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

async function generateInviteLink() {
  const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

  try {
    const email = process.argv[2] || 'kim@aliidesign.com';

    console.log(`\n🔗 Generating invite link for ${email}...\n`);

    // Generate secure token
    const inviteToken = crypto.randomBytes(32).toString('hex');

    // First check if invitation_token column exists
    try {
      await sql`
        SELECT invitation_token FROM users LIMIT 1
      `;
    } catch (e) {
      // Column doesn't exist, add it
      console.log('📝 Adding invitation_token column...');
      await sql`
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS invitation_token TEXT,
        ADD COLUMN IF NOT EXISTS invitation_expires_at TIMESTAMP
      `;
      console.log('✅ Column added!');
    }

    // Update user with invitation token (expires in 7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const user = await sql`
      UPDATE users
      SET
        invitation_token = ${inviteToken},
        invitation_expires_at = ${expiresAt.toISOString()}
      WHERE email = ${email}
      RETURNING id, email, name, subscription_tier, invitation_token
    `;

    if (user.length === 0) {
      console.log('❌ User not found. Create the user first with add-user.js');
      return;
    }

    console.log('✅ Invitation link generated!\n');
    console.log('📧 Send this link to Kim Kelley:\n');
    console.log(`   https://aiso.studio/invite/${inviteToken}\n`);
    console.log('📊 Details:');
    console.log(`   Email: ${user[0].email}`);
    console.log(`   Name: ${user[0].name}`);
    console.log(`   Plan: ${user[0].subscription_tier}`);
    console.log(`   Expires: ${expiresAt.toLocaleDateString()}`);
    console.log('\n💡 When Kim clicks this link:');
    console.log('   1. She\'ll see a welcome page with her email');
    console.log('   2. She\'ll be redirected to sign up with Clerk');
    console.log('   3. Her account will automatically be set to Agency plan');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await sql.end();
  }
}

generateInviteLink();
