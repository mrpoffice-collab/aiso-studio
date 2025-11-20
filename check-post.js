require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function checkPost() {
  try {
    const postId = '1c21fe90-8c43-4449-84ac-0f8e4e6386ea';

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
    console.log('\n📝 Post Details:\n');
    console.log(`Title: ${post.title}`);
    console.log(`\nAISO Scores:`);
    console.log(`  AISO Score: ${post.aiso_score}`);
    console.log(`  AEO Score: ${post.aeo_score}`);
    console.log(`  GEO Score: ${post.geo_score || 'N/A'}`);
    console.log(`\nReadability Details:`);
    console.log(`  Target Flesch: ${post.target_flesch_score || 'NOT SET'}`);
    console.log(`  Actual Flesch: ${post.actual_flesch_score || 'NOT SET'}`);
    console.log(`  Gap: ${post.readability_gap !== null ? post.readability_gap + ' pts' : 'NOT SET'}`);
    console.log(`  Readability Score: ${post.readability_score || 'NOT SET'}/100`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkPost();
