// Simple script to set up the database schema
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  console.log('🗄️  Setting up AISO Studio database...\n');

  // Load environment variables
  require('dotenv').config({ path: '.env.local' });

  if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  // Read the schema file
  const schemaPath = path.join(__dirname, 'neon-schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');

  try {
    console.log('📝 Running SQL schema...');

    // Execute the schema
    await sql(schema);

    console.log('\n✅ Database setup complete!');
    console.log('\n📊 Created tables:');
    console.log('   - users');
    console.log('   - strategies');
    console.log('   - topics');
    console.log('   - posts');
    console.log('   - fact_checks');
    console.log('   - usage_logs');
    console.log('\n🎉 You\'re ready to start developing!\n');

  } catch (error) {
    console.error('\n❌ Error setting up database:', error.message);
    process.exit(1);
  }
}

setupDatabase();
