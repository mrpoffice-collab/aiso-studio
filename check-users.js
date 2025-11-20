// Quick script to check users in the database
require('dotenv').config({ path: '.env.local' });
const postgres = require('postgres');

const sql = postgres(process.env.DATABASE_URL, {
  ssl: 'require',
  max: 1,
});

async function checkUsers() {
  try {
    console.log('🔍 Checking users in database...\n');

    const users = await sql`SELECT * FROM users ORDER BY created_at DESC`;

    if (users.length === 0) {
      console.log('❌ No users found in database');
      console.log('\nThis means user sync might not be working.');
      console.log('Check if you have webhook configured in Clerk or if the sync happens on sign-in.');
    } else {
      console.log(`✅ Found ${users.length} user(s):\n`);
      users.forEach((user, index) => {
        console.log(`User ${index + 1}:`);
        console.log(`  ID: ${user.id}`);
        console.log(`  Clerk ID: ${user.clerk_id}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Name: ${user.name || '(not set)'}`);
        console.log(`  Created: ${user.created_at}`);
        console.log('');
      });
    }

    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking database:', error.message);
    process.exit(1);
  }
}

checkUsers();
