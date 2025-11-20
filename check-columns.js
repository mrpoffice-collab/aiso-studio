require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function checkColumns() {
  try {
    console.log('\n🔍 Checking posts table columns...\n');

    const result = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'posts'
      ORDER BY ordinal_position;
    `;

    console.log('Posts table columns:');
    result.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    // Check specifically for readability columns
    const readabilityColumns = result.filter(col =>
      col.column_name.includes('flesch') ||
      col.column_name.includes('readability')
    );

    console.log('\n📊 Readability-related columns:');
    if (readabilityColumns.length === 0) {
      console.log('  ❌ NO READABILITY COLUMNS FOUND!');
    } else {
      readabilityColumns.forEach(col => {
        console.log(`  ✅ ${col.column_name}`);
      });
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkColumns();
