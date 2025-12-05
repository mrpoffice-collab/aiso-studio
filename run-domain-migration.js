require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function runMigration() {
  console.log('Running asset domain linking migration...\n');

  try {
    // Create asset_domains table
    console.log('Creating asset_domains table...');
    await sql`
      CREATE TABLE IF NOT EXISTS asset_domains (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
        domain VARCHAR(255) NOT NULL,
        link_type VARCHAR(50) DEFAULT 'primary',
        linked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        linked_by UUID,
        UNIQUE(asset_id, domain)
      )
    `;
    console.log('✓ asset_domains table created');

    // Create indexes for asset_domains
    console.log('Creating asset_domains indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_asset_domains_asset_id ON asset_domains(asset_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_asset_domains_domain ON asset_domains(domain)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_asset_domains_link_type ON asset_domains(link_type)`;
    console.log('✓ asset_domains indexes created');

    // Create site_audits table
    console.log('Creating site_audits table...');
    await sql`
      CREATE TABLE IF NOT EXISTS site_audits (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        domain VARCHAR(255) NOT NULL,
        lead_id INTEGER,
        client_id UUID,
        audit_type VARCHAR(50) NOT NULL DEFAULT 'full',
        overall_score INTEGER,
        content_score INTEGER,
        seo_score INTEGER,
        design_score INTEGER,
        speed_score INTEGER,
        accessibility_score INTEGER,
        wcag_critical_violations INTEGER DEFAULT 0,
        wcag_serious_violations INTEGER DEFAULT 0,
        wcag_moderate_violations INTEGER DEFAULT 0,
        wcag_minor_violations INTEGER DEFAULT 0,
        wcag_total_violations INTEGER DEFAULT 0,
        accessibility_details JSONB,
        ranking_keywords INTEGER,
        avg_search_position DECIMAL(5,2),
        estimated_organic_traffic INTEGER,
        top_keywords JSONB,
        search_details JSONB,
        has_blog BOOLEAN,
        blog_post_count INTEGER,
        content_gaps JSONB,
        aiso_opportunity_score INTEGER,
        primary_pain_point TEXT,
        secondary_pain_points TEXT[],
        recommended_services JSONB,
        estimated_monthly_value INTEGER,
        time_to_close VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log('✓ site_audits table created');

    // Create indexes for site_audits
    console.log('Creating site_audits indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_site_audits_user_id ON site_audits(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_site_audits_domain ON site_audits(domain)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_site_audits_lead_id ON site_audits(lead_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_site_audits_created_at ON site_audits(created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_site_audits_audit_type ON site_audits(audit_type)`;
    console.log('✓ site_audits indexes created');

    console.log('\n✅ Migration completed successfully!');

    // Verify tables exist
    const tables = await sql`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name IN ('asset_domains', 'site_audits')
    `;
    console.log('\nVerified tables:', tables.map(t => t.table_name).join(', '));

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
