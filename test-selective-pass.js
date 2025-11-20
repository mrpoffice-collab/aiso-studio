// Test script for selective pass system
// Run this to test individual pass improvements

const POST_ID = '35271de9-9778-41f1-802e-52900af8ae3c'; // Update with your post ID
const API_URL = 'http://localhost:3000';

async function testPass(passType) {
  console.log(`\n🧪 Testing ${passType} pass...`);

  try {
    const response = await fetch(`${API_URL}/api/posts/${POST_ID}/improve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ passType }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`✅ ${passType} pass successful!`);
      console.log(`   Score: ${data.scoreBefore} → ${data.scoreAfter} (${data.improvement > 0 ? '+' : ''}${data.improvement})`);
      console.log(`   Readability: ${data.categoryScores.before.readability} → ${data.categoryScores.after.readability}`);
      console.log(`   AEO: ${data.categoryScores.before.aeo} → ${data.categoryScores.after.aeo}`);
      console.log(`   SEO: ${data.categoryScores.before.seo} → ${data.categoryScores.after.seo}`);
      console.log(`   Engagement: ${data.categoryScores.before.engagement} → ${data.categoryScores.after.engagement}`);
      return data;
    } else {
      console.error(`❌ ${passType} pass failed:`, data.error);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error testing ${passType}:`, error.message);
    return null;
  }
}

async function main() {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║  SELECTIVE PASS SYSTEM TEST              ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log(`\nPost ID: ${POST_ID}`);

  // Test readability pass
  const readabilityResult = await testPass('readability');

  if (!readabilityResult) {
    console.log('\n⚠️  Readability test failed. Check the server logs.');
    console.log('   Make sure:');
    console.log('   1. Server is running (npm run dev)');
    console.log('   2. POST_ID is correct');
    console.log('   3. You are authenticated');
    return;
  }

  console.log('\n✨ Test complete!');
  console.log('\nNext steps:');
  console.log('1. Check the server console logs for detailed output');
  console.log('2. Verify the readability score actually improved');
  console.log('3. Try other passes: "seo", "aeo", "engagement"');
}

// Run the test
main().catch(console.error);
