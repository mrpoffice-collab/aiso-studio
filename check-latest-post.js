require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function checkPost() {
  try {
    const postId = '94562485-44f6-4153-87f5-478c00d3009a';

    const result = await sql`
      SELECT
        id, title,
        aiso_score, aeo_score, geo_score,
        actual_flesch_score, target_flesch_score,
        readability_gap, readability_score
      FROM posts
      WHERE id = ${postId}
    `;

    if (result.length === 0) {
      console.log('❌ Post not found');
      return;
    }

    const post = result[0];
    console.log('\n📝 Latest Post Readability Check:\n');
    console.log(`Title: ${post.title}`);
    console.log(`\n🎯 Target Flesch: ${post.target_flesch_score}`);
    console.log(`📊 Actual Flesch: ${post.actual_flesch_score}`);
    console.log(`📏 Gap: ${post.readability_gap} points`);
    console.log(`⭐ Readability Score: ${post.readability_score}/100`);

    // Calculate what the score SHOULD be based on gap
    const gap = post.readability_gap;
    let expectedScore;
    if (gap <= 5) expectedScore = '95-100';
    else if (gap <= 10) expectedScore = '85-94';
    else if (gap <= 15) expectedScore = '70-84';
    else if (gap <= 20) expectedScore = '55-69';
    else if (gap <= 30) expectedScore = '35-54';
    else expectedScore = '10-34';

    console.log(`\n✅ Expected score range for ${gap}pt gap: ${expectedScore}`);
    console.log(`${post.readability_score >= 95 ? '✅' : '⚠️'} Actual score: ${post.readability_score}/100`);

    console.log(`\n📈 AISO Breakdown:`);
    console.log(`  Overall AISO: ${post.aiso_score}/100`);
    console.log(`  AEO: ${post.aeo_score}/100`);
    console.log(`  GEO: ${post.geo_score || 'N/A'}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkPost();
