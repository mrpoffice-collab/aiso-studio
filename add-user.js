const postgres = require('postgres');
const { randomUUID } = require('crypto');
require('dotenv').config({ path: '.env.local' });

async function addUser() {
  const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

  try {
    console.log('\n👤 Adding new user...\n');

    // User details - customize these
    const email = process.argv[2] || 'newuser@example.com';
    const name = process.argv[3] || 'New User';
    const tier = process.argv[4] || 'agency'; // trial, starter, professional, agency, enterprise

    // Set limits based on tier
    const tierLimits = {
      trial: { articles: 10, strategies: 1, seats: 1 },
      starter: { articles: 25, strategies: -1, seats: 1 },
      professional: { articles: 75, strategies: -1, seats: 3 },
      agency: { articles: 250, strategies: -1, seats: 10 },
      enterprise: { articles: 1000, strategies: -1, seats: -1 }
    };

    const limits = tierLimits[tier] || tierLimits.agency;

    // Generate IDs
    const userId = randomUUID();
    const clerkId = `manual_${randomUUID().slice(0, 8)}`;

    // Calculate trial end date (7 days from now)
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 7);

    // Insert user
    const user = await sql`
      INSERT INTO users (
        id,
        clerk_id,
        email,
        name,
        subscription_tier,
        subscription_status,
        trial_ends_at,
        subscription_started_at,
        billing_cycle_start,
        billing_cycle_end,
        article_limit,
        articles_used_this_month,
        strategies_limit,
        strategies_used,
        seats_limit,
        seats_used,
        timezone,
        created_at,
        updated_at
      ) VALUES (
        ${userId},
        ${clerkId},
        ${email},
        ${name},
        ${tier},
        ${tier === 'trial' ? 'trialing' : 'active'},
        ${trialEndsAt.toISOString()},
        NOW(),
        NOW(),
        NOW() + INTERVAL '1 month',
        ${limits.articles},
        0,
        ${limits.strategies},
        0,
        ${limits.seats},
        1,
        'UTC',
        NOW(),
        NOW()
      )
      RETURNING id, email, name, subscription_tier, article_limit, seats_limit
    `;

    console.log('✅ User created successfully!');
    console.log('\n📊 User details:');
    console.log(`  ID: ${user[0].id}`);
    console.log(`  Email: ${user[0].email}`);
    console.log(`  Name: ${user[0].name}`);
    console.log(`  Tier: ${user[0].subscription_tier}`);
    console.log(`  Articles: ${user[0].article_limit}/month`);
    console.log(`  Seats: ${user[0].seats_limit}`);
    console.log(`  Trial ends: ${trialEndsAt.toLocaleDateString()}`);
    console.log('\n⚠️  Note: This user was created manually and does not have Clerk authentication.');
    console.log('   They will need to sign up through Clerk to access the app.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sql.end();
  }
}

// Usage: node add-user.js email@example.com "User Name" agency
addUser();
