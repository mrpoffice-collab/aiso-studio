const postgres = require('postgres');

const sql = postgres(process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_HTNoEMZhR3n4@ep-still-credit-a4y8w43n-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require', {
  ssl: 'require',
});

async function checkLimits() {
  try {
    const users = await sql`
      SELECT email, subscription_tier, subscription_status,
             article_limit, articles_used_this_month,
             audit_limit, audits_used_this_month,
             strategies_limit, strategies_used,
             trial_ends_at
      FROM users
      WHERE email LIKE '%trial%' OR subscription_tier = 'trial'
      ORDER BY created_at DESC
    `;

    console.log('Trial users:');
    users.forEach(u => {
      console.log(`\n${u.email}:`);
      console.log(`  Tier: ${u.subscription_tier} (${u.subscription_status})`);
      console.log(`  Articles: ${u.articles_used_this_month || 0}/${u.article_limit || 10}`);
      console.log(`  Audits: ${u.audits_used_this_month || 0}/${u.audit_limit || 10}`);
      console.log(`  Strategies: ${u.strategies_used || 0}/${u.strategies_limit || 1}`);
      console.log(`  Trial ends: ${u.trial_ends_at}`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sql.end();
  }
}

checkLimits();
