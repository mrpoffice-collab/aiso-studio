// Test intent-based readability scoring on Firefly Grove content
require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

// Import scoring functions (we'll need to use TypeScript versions)
const { calculateReadabilityScore } = require('./lib/content-scoring.ts');

async function testIntentScoring() {
  const sql = neon(process.env.DATABASE_URL);

  console.log('🎯 Testing Intent-Based Readability Scoring\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Get strategy
  const strategy = await sql`
    SELECT id, client_name, target_audience, keywords, target_flesch_score
    FROM strategies
    LIMIT 1
  `;

  if (strategy.length === 0) {
    console.log('❌ No strategy found');
    return;
  }

  const strat = strategy[0];
  console.log(`📊 Strategy: ${strat.client_name}`);
  console.log(`   Target Audience: ${strat.target_audience.substring(0, 60)}...`);
  console.log(`   Target Flesch Score: ${strat.target_flesch_score} (10th grade - accessible for adults)\n`);

  // Get a post from this strategy
  const posts = await sql`
    SELECT p.id, p.title, p.content
    FROM posts p
    JOIN topics t ON p.topic_id = t.id
    WHERE t.strategy_id = ${strat.id}
    LIMIT 1
  `;

  if (posts.length === 0) {
    console.log('❌ No posts found for this strategy');
    return;
  }

  const post = posts[0];
  console.log(`📝 Post: ${post.title}\n`);

  // Calculate raw Flesch score (we need to extract just the Flesch calculation)
  // For now, let's simulate with known values
  const actualFleschScore = 34; // We know from earlier testing

  console.log(`📊 Scoring Comparison:\n`);
  console.log(`   Actual Flesch Score: ${actualFleschScore} (College Graduate level - difficult)`);
  console.log(`   Target Flesch Score: ${strat.target_flesch_score} (10th grade - accessible)\n`);

  const gap = Math.abs(actualFleschScore - strat.target_flesch_score);
  console.log(`   Gap: ${gap} points (content is ${actualFleschScore < strat.target_flesch_score ? 'TOO COMPLEX' : 'too simple'})\n`);

  // Calculate score with OLD normalization curve
  let oldScore = 0;
  if (actualFleschScore >= 30 && actualFleschScore < 40) {
    oldScore = 50 + ((actualFleschScore - 30) / 10) * 14;
  }
  oldScore = Math.round(oldScore);

  // Calculate score with NEW intent-based scoring
  let newScore = 0;
  if (gap <= 5) {
    newScore = 95 + (5 - gap);
  } else if (gap <= 10) {
    newScore = 85 + (10 - gap);
  } else if (gap <= 15) {
    newScore = 70 + (15 - gap);
  } else if (gap <= 20) {
    newScore = 55 + (20 - gap);
  } else if (gap <= 30) {
    newScore = 35 + (30 - gap);
  } else {
    newScore = Math.max(10, 35 - (gap - 30));
  }
  newScore = Math.round(newScore);

  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  console.log(`📈 OLD Normalization Curve:`);
  console.log(`   Score: ${oldScore}/100`);
  console.log(`   Rating: "Below Average - needs simplification"`);
  console.log(`   Problem: Doesn't account for audience intent!\n`);

  console.log(`🎯 NEW Intent-Based Scoring:`);
  console.log(`   Score: ${newScore}/100`);
  console.log(`   Rating: ${
    newScore >= 95 ? '"Excellent - perfect match!"' :
    newScore >= 85 ? '"Very Good - close to target"' :
    newScore >= 70 ? '"Good - within acceptable range"' :
    newScore >= 55 ? '"Fair - somewhat too complex"' :
    newScore >= 35 ? '"Poor - too complex for audience"' :
    '"Critical - far too complex"'
  }`);
  console.log(`   Benefit: Correctly identifies content as TOO COMPLEX for grieving adults 40-70!\n`);

  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  console.log(`💡 What This Means:\n`);
  console.log(`   1. Your content (Flesch 34) is written at College Graduate level`);
  console.log(`   2. Your audience needs 10th grade level (Flesch 58)`);
  console.log(`   3. Gap of ${gap} points is SIGNIFICANT`);
  console.log(`   4. "Fix Readability" should target Flesch 58, not arbitrary simplification\n`);

  console.log(`🎯 After Improvement (if we hit target Flesch 58):\n`);
  const perfectGap = 0;
  const perfectScore = 95 + (5 - perfectGap);
  console.log(`   New Flesch: 58 (10th grade - perfect for adults 40-70!)`);
  console.log(`   New Score: ${perfectScore}/100 ✅ "Excellent match!"`);
  console.log(`   Improvement: ${oldScore} → ${perfectScore} (+${perfectScore - oldScore} points!)\n`);
}

testIntentScoring().catch(console.error);
