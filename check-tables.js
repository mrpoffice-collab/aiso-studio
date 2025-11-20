require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

async function checkTables() {
  const sql = neon(process.env.DATABASE_URL);

  try {
    console.log('Checking for money_pages table...');
    const result1 = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('money_pages', 'topic_clusters');
    `;
    console.log('Tables found:', result1);

    console.log('\nChecking topics columns...');
    const result2 = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'topics'
      AND column_name IN ('cluster_id', 'primary_link_url', 'primary_link_anchor', 'cta_type', 'link_placement_hint');
    `;
    console.log('New columns:', result2);

  } catch (error) {
    console.error('Error:', error);
  }
}

checkTables();
