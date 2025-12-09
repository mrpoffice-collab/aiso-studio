// Run this to add audit tracking columns to the database
const postgres = require('postgres');

const sql = postgres(process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_HTNoEMZhR3n4@ep-still-credit-a4y8w43n-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require', {
  ssl: 'require',
});

async function runMigration() {
  console.log('Adding audit tracking columns...');

  try {
    // Add columns
    await sql`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS audit_limit INTEGER DEFAULT 10,
      ADD COLUMN IF NOT EXISTS audits_used_this_month INTEGER DEFAULT 0
    `;
    console.log('✅ Added audit_limit and audits_used_this_month columns');

    // Update existing trial users
    const trialResult = await sql`
      UPDATE users
      SET audit_limit = 10, audits_used_this_month = 0
      WHERE subscription_tier = 'trial' AND (audit_limit IS NULL OR audits_used_this_month IS NULL)
      RETURNING id, email
    `;
    console.log(`✅ Updated ${trialResult.length} trial users`);

    // Check current user state
    const users = await sql`
      SELECT id, email, subscription_tier, audit_limit, audits_used_this_month
      FROM users
      ORDER BY created_at DESC
      LIMIT 5
    `;
    console.log('\nCurrent user state:');
    users.forEach(u => {
      console.log(`  ${u.email}: tier=${u.subscription_tier}, audits=${u.audits_used_this_month || 0}/${u.audit_limit || 10}`);
    });

    console.log('\n✅ Migration complete!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await sql.end();
  }
}

runMigration();
