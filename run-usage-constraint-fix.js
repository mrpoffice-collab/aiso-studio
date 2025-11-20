// Fix usage_logs constraint migration
require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

async function runMigration() {
  const sql = neon(process.env.DATABASE_URL);

  console.log('🔧 Fixing usage_logs constraint to allow content_improvement...');

  try {
    // Check what operation types exist
    const existingTypes = await sql`
      SELECT DISTINCT operation_type FROM usage_logs
    `;
    console.log('📊 Existing operation types:', existingTypes.map(r => r.operation_type));

    // Drop old constraint
    await sql`
      ALTER TABLE usage_logs DROP CONSTRAINT IF EXISTS usage_logs_operation_type_check
    `;
    console.log('✅ Dropped old constraint');

    // Update any invalid operation_type values to content_rewrite
    const updated = await sql`
      UPDATE usage_logs
      SET operation_type = 'content_rewrite'
      WHERE operation_type NOT IN (
        'strategy_generation',
        'content_generation',
        'fact_checking',
        'image_search',
        'mou_generation',
        'content_audit',
        'content_rewrite'
      )
    `;
    console.log(`✅ Updated ${updated.length} invalid rows`);

    // Add new constraint with content_improvement
    await sql`
      ALTER TABLE usage_logs ADD CONSTRAINT usage_logs_operation_type_check
      CHECK (operation_type IN (
        'strategy_generation',
        'content_generation',
        'fact_checking',
        'image_search',
        'mou_generation',
        'content_audit',
        'content_rewrite',
        'content_improvement'
      ))
    `;
    console.log('✅ Added new constraint with content_improvement');

    console.log('\n✨ Migration complete! You can now use selective improvements.');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
