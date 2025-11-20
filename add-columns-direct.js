require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function addColumns() {
  try {
    console.log('\n🔧 Adding readability columns directly...\n');

    // Add each column individually
    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS actual_flesch_score INTEGER`;
    console.log('✅ Added actual_flesch_score');

    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS target_flesch_score INTEGER`;
    console.log('✅ Added target_flesch_score');

    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS readability_gap INTEGER`;
    console.log('✅ Added readability_gap');

    await sql`ALTER TABLE posts ADD COLUMN IF NOT EXISTS readability_score INTEGER`;
    console.log('✅ Added readability_score');

    // Verify columns were added
    const result = await sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'posts'
      AND column_name IN ('actual_flesch_score', 'target_flesch_score', 'readability_gap', 'readability_score')
    `;

    console.log('\n📊 Verification:');
    if (result.length === 4) {
      console.log('✅ All 4 columns added successfully!');
      result.forEach(col => {
        console.log(`  - ${col.column_name}`);
      });
    } else {
      console.log(`❌ Only ${result.length}/4 columns found`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

addColumns();
