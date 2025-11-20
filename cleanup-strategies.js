// Script to remove strategies without "App" in the name
// Run with: node cleanup-strategies.js

const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL, {
  ssl: 'require',
  max: 10,
});

async function cleanupStrategies() {
  try {
    console.log('🔍 Finding strategies without "App" in the name...\n');

    // Get all strategies for the user
    const strategies = await sql`
      SELECT * FROM strategies
      WHERE client_name LIKE 'Firefly Grove%'
      ORDER BY created_at DESC
    `;

    console.log(`Found ${strategies.length} Firefly Grove strategies:\n`);

    const toDelete = [];
    const toKeep = [];

    strategies.forEach(s => {
      if (!s.client_name.includes('App')) {
        toDelete.push(s);
        console.log(`❌ TO DELETE: ${s.client_name} (ID: ${s.id})`);
      } else {
        toKeep.push(s);
        console.log(`✅ KEEP: ${s.client_name} (ID: ${s.id})`);
      }
    });

    if (toDelete.length === 0) {
      console.log('\n✅ No strategies to delete!');
      await sql.end();
      return;
    }

    console.log(`\n⚠️  About to delete ${toDelete.length} strategies...`);

    // Delete the strategies (cascade will delete topics too)
    for (const strategy of toDelete) {
      console.log(`   Deleting: ${strategy.client_name}...`);
      await sql`
        DELETE FROM strategies
        WHERE id = ${strategy.id}
      `;
    }

    console.log(`\n✅ Successfully deleted ${toDelete.length} strategies!`);
    console.log(`✅ Kept ${toKeep.length} strategy(ies) with "App" in the name`);

    await sql.end();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

cleanupStrategies();
