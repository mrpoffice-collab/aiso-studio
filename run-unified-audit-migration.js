// Run the unified audit scores migration
require('dotenv').config({ path: '.env.local' });
const postgres = require('postgres');

async function runMigration() {
  const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

  console.log('Running unified audit scores migration...');

  try {
    // Add AISO content score columns
    await sql`ALTER TABLE accessibility_audits ADD COLUMN IF NOT EXISTS aiso_score INTEGER DEFAULT 0`;
    console.log('  Added aiso_score column');

    await sql`ALTER TABLE accessibility_audits ADD COLUMN IF NOT EXISTS aeo_score INTEGER DEFAULT 0`;
    console.log('  Added aeo_score column');

    await sql`ALTER TABLE accessibility_audits ADD COLUMN IF NOT EXISTS seo_score INTEGER DEFAULT 0`;
    console.log('  Added seo_score column');

    await sql`ALTER TABLE accessibility_audits ADD COLUMN IF NOT EXISTS readability_score INTEGER DEFAULT 0`;
    console.log('  Added readability_score column');

    await sql`ALTER TABLE accessibility_audits ADD COLUMN IF NOT EXISTS engagement_score INTEGER DEFAULT 0`;
    console.log('  Added engagement_score column');

    await sql`ALTER TABLE accessibility_audits ADD COLUMN IF NOT EXISTS fact_check_score INTEGER DEFAULT 0`;
    console.log('  Added fact_check_score column');

    // Add detailed breakdown columns as JSONB
    await sql`ALTER TABLE accessibility_audits ADD COLUMN IF NOT EXISTS seo_details JSONB DEFAULT '{}'`;
    console.log('  Added seo_details column');

    await sql`ALTER TABLE accessibility_audits ADD COLUMN IF NOT EXISTS readability_details JSONB DEFAULT '{}'`;
    console.log('  Added readability_details column');

    await sql`ALTER TABLE accessibility_audits ADD COLUMN IF NOT EXISTS engagement_details JSONB DEFAULT '{}'`;
    console.log('  Added engagement_details column');

    await sql`ALTER TABLE accessibility_audits ADD COLUMN IF NOT EXISTS aeo_details JSONB DEFAULT '{}'`;
    console.log('  Added aeo_details column');

    await sql`ALTER TABLE accessibility_audits ADD COLUMN IF NOT EXISTS fact_checks JSONB DEFAULT '[]'`;
    console.log('  Added fact_checks column');

    // Add vault asset reference
    await sql`ALTER TABLE accessibility_audits ADD COLUMN IF NOT EXISTS vault_asset_id UUID`;
    console.log('  Added vault_asset_id column');

    await sql`ALTER TABLE accessibility_audits ADD COLUMN IF NOT EXISTS pdf_url TEXT`;
    console.log('  Added pdf_url column');

    console.log('\nMigration completed successfully!');

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runMigration();
