require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function setTarget() {
  try {
    const strategyId = 'd633444f-10e8-48ce-ba9e-792143b62821';
    const targetFlesch = 58; // 10th grade for grieving adults

    console.log('\n🔧 Setting target Flesch score for Firefly Grove...\n');

    await sql`
      UPDATE strategies
      SET target_flesch_score = ${targetFlesch}
      WHERE id = ${strategyId}
    `;

    console.log(`✅ Updated strategy ${strategyId}`);
    console.log(`   Target Flesch Score: ${targetFlesch} (10th grade - educated adults)`);
    console.log('\n📖 Reasoning:');
    console.log('   - Emotional topic (grief, memorials, loss)');
    console.log('   - Older demographic (40-70)');
    console.log('   - Need clarity during difficult times');
    console.log('\n🎯 Refresh your strategy page to see the Reading Level Target panel!');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

setTarget();
