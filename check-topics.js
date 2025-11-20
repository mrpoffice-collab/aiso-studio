require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function checkTopics() {
  try {
    const topics = await sql`
      SELECT t.id, t.title, t.created_at, s.target_flesch_score, s.client_name
      FROM topics t
      JOIN strategies s ON t.strategy_id = s.id
      ORDER BY t.created_at DESC
      LIMIT 5
    `;

    console.log('\n📋 Recent Topics:\n');
    topics.forEach(t => {
      const targetInfo = t.target_flesch_score
        ? `Target Flesch: ${t.target_flesch_score} ✅`
        : '❌ NO TARGET SET (old topic)';
      console.log(`${t.title}`);
      console.log(`  ${targetInfo}`);
      console.log(`  Client: ${t.client_name} | Created: ${new Date(t.created_at).toLocaleDateString()}\n`);
    });

    const hasTarget = topics.some(t => t.target_flesch_score);

    if (hasTarget) {
      console.log('✅ You have topics with target reading levels - you can use these!\n');
    } else {
      console.log('❌ Your topics were created BEFORE we added target reading levels.\n');
      console.log('🔄 Recommendation: Generate NEW topics so they are designed for the right reading level from the start.\n');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkTopics();
