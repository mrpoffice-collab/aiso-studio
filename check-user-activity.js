require('dotenv').config({ path: '.env.local' });
const postgres = require('postgres');

async function checkUserActivity(searchName) {
  const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

  try {
    console.log(`🔍 Searching for user: "${searchName}"\n`);

    // Find user
    const users = await sql`
      SELECT id, clerk_id, email, name, subscription_tier, created_at
      FROM users
      WHERE LOWER(name) LIKE ${`%${searchName.toLowerCase()}%`}
         OR LOWER(email) LIKE ${`%${searchName.toLowerCase()}%`}
      ORDER BY created_at DESC
    `;

    if (users.length === 0) {
      console.log('❌ No users found matching that name/email\n');
      await sql.end();
      return;
    }

    console.log(`✅ Found ${users.length} user(s):\n`);
    users.forEach(u => {
      console.log(`📧 Email: ${u.email}`);
      console.log(`👤 Name: ${u.name || 'N/A'}`);
      console.log(`🎫 Tier: ${u.subscription_tier}`);
      console.log(`📅 Signed up: ${u.created_at}`);
      console.log(`🆔 User ID: ${u.id}\n`);
    });

    // For each user, check their activity
    for (const user of users) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Activity for: ${user.email}`);
      console.log('='.repeat(60));

      // Content audits (skip if user_id is UUID - old table structure)
      try {
        const audits = await sql`
          SELECT id, url, original_score, improved_score, created_at
          FROM content_audits
          WHERE user_id::text = ${user.id.toString()}
          ORDER BY created_at DESC
          LIMIT 20
        `;

        console.log(`\n📊 Content Audits (${audits.length}):`);
        if (audits.length > 0) {
          audits.forEach(a => {
            const score = a.improved_score || a.original_score;
            console.log(`  - ${a.url} (Score: ${score}) - ${a.created_at}`);
          });
        } else {
          console.log('  No audits found');
        }
      } catch (e) {
        console.log('\n📊 Content Audits: N/A (table structure mismatch)');
      }

      // Strategies
      try {
        const strategies = await sql`
          SELECT id, client_name, created_at
          FROM strategies
          WHERE user_id = ${user.id}
          ORDER BY created_at DESC
          LIMIT 10
        `;

        console.log(`\n📋 Strategies (${strategies.length}):`);
        if (strategies.length > 0) {
          strategies.forEach(s => {
            console.log(`  - ${s.client_name} - ${s.created_at}`);
          });
        } else {
          console.log('  No strategies found');
        }
      } catch (e) {
        console.log('\n📋 Strategies: N/A');
      }

      // Posts
      try {
        const posts = await sql`
          SELECT id, title, status, created_at
          FROM posts
          WHERE user_id = ${user.id}
          ORDER BY created_at DESC
          LIMIT 10
        `;

        console.log(`\n📝 Posts (${posts.length}):`);
        if (posts.length > 0) {
          posts.forEach(p => {
            console.log(`  - ${p.title?.substring(0, 50)}... (${p.status}) - ${p.created_at}`);
          });
        } else {
          console.log('  No posts found');
        }
      } catch (e) {
        console.log('\n📝 Posts: N/A');
      }

      // Lead searches
      try {
        const leads = await sql`
          SELECT id, created_at
          FROM leads
          WHERE user_id = ${user.id}
          ORDER BY created_at DESC
          LIMIT 10
        `;

        console.log(`\n🎯 Lead Searches (${leads.length}):`);
        if (leads.length > 0) {
          leads.forEach(l => {
            console.log(`  - Lead search at ${l.created_at}`);
          });
        } else {
          console.log('  No lead searches found');
        }
      } catch (e) {
        console.log('\n🎯 Lead Searches: N/A');
      }

      // Free audit conversions
      try {
        const freeAudits = await sql`
          SELECT url, overall_score, converted_to_signup, created_at
          FROM free_audit_conversions
          WHERE email = ${user.email}
          ORDER BY created_at DESC
          LIMIT 10
        `;

        console.log(`\n🆓 Free Audits (${freeAudits.length}):`);
        if (freeAudits.length > 0) {
          freeAudits.forEach(a => {
            console.log(`  - ${a.url} (Score: ${a.overall_score}) - Converted: ${a.converted_to_signup} - ${a.created_at}`);
          });
        } else {
          console.log('  No free audits found');
        }
      } catch (e) {
        console.log('\n🆓 Free Audits: N/A');
      }
    }

    console.log('\n' + '='.repeat(60) + '\n');
    await sql.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await sql.end();
    process.exit(1);
  }
}

const searchName = process.argv[2] || 'kim kelley';
checkUserActivity(searchName);
