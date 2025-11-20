// Script to generate topics WITH VALIDATION for the new Firefly Grove App strategy
// This uses the same validation logic as creating a new strategy
// Run with: node generate-validated-topics.js

const fetch = require('node-fetch');

const STRATEGY_ID = '2714fd48-c301-4a1e-b93e-408c5527e808';

async function generateValidatedTopics() {
  console.log('🚀 Starting validated topic generation for Firefly Grove App...\n');
  console.log('This will use the iterative validation system to ensure all 15 topics');
  console.log('match the target reading level (Flesch 58 - 10th grade).\n');
  console.log('⏱️  This may take 30-60 seconds...\n');

  try {
    const response = await fetch(`http://localhost:3000/api/strategies/${STRATEGY_ID}/generate-validated-topics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Error:', error.error || response.statusText);
      process.exit(1);
    }

    const data = await response.json();

    console.log('\n✅ SUCCESS! Validated topic generation complete!\n');
    console.log('📊 Results:');
    console.log(`   - Topics generated: ${data.topicsCount || 15}`);
    console.log(`   - Validated topics: ${data.validatedTopics || 15}`);
    console.log(`   - Generation attempts: ${data.generationAttempts || 1}`);
    console.log(`\n🔗 View strategy: http://localhost:3000/dashboard/strategies/${STRATEGY_ID}`);

  } catch (error) {
    console.error('❌ Request failed:', error.message);
    console.log('\n💡 Make sure the dev server is running on port 3000');
    process.exit(1);
  }
}

generateValidatedTopics();
