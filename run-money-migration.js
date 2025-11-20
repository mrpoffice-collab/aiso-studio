require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

async function runMigration() {
  const sql = neon(process.env.DATABASE_URL);

  try {
    console.log('🚀 Running Money Pages migration...\n');

    // Create money_pages table
    console.log('Creating money_pages table...');
    await sql`
      CREATE TABLE IF NOT EXISTS money_pages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        strategy_id UUID NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
        url TEXT NOT NULL,
        title TEXT NOT NULL,
        page_type TEXT NOT NULL CHECK (page_type IN ('product', 'service', 'signup', 'contact', 'pricing', 'other')),
        description TEXT,
        priority INTEGER DEFAULT 2 CHECK (priority BETWEEN 1 AND 3),
        target_keywords TEXT[],
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(strategy_id, url)
      )
    `;
    console.log('✅ money_pages table created\n');

    // Create topic_clusters table
    console.log('Creating topic_clusters table...');
    await sql`
      CREATE TABLE IF NOT EXISTS topic_clusters (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        strategy_id UUID NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        description TEXT,
        primary_money_page_id UUID REFERENCES money_pages(id) ON DELETE SET NULL,
        secondary_money_page_ids UUID[],
        funnel_stage TEXT CHECK (funnel_stage IN ('awareness', 'consideration', 'decision')),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(strategy_id, name)
      )
    `;
    console.log('✅ topic_clusters table created\n');

    // Add columns to topics table
    console.log('Adding columns to topics table...');
    await sql`
      ALTER TABLE topics
      ADD COLUMN IF NOT EXISTS cluster_id UUID REFERENCES topic_clusters(id) ON DELETE SET NULL
    `;
    await sql`
      ALTER TABLE topics
      ADD COLUMN IF NOT EXISTS primary_link_url TEXT
    `;
    await sql`
      ALTER TABLE topics
      ADD COLUMN IF NOT EXISTS primary_link_anchor TEXT
    `;
    await sql`
      ALTER TABLE topics
      ADD COLUMN IF NOT EXISTS cta_type TEXT
    `;
    await sql`
      ALTER TABLE topics
      ADD COLUMN IF NOT EXISTS link_placement_hint TEXT
    `;
    console.log('✅ topics columns added\n');

    // Create indexes
    console.log('Creating indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_money_pages_strategy ON money_pages(strategy_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_money_pages_priority ON money_pages(strategy_id, priority)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_topic_clusters_strategy ON topic_clusters(strategy_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_topics_cluster ON topics(cluster_id)`;
    console.log('✅ Indexes created\n');

    // Verify
    console.log('🔍 Verifying...');
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('money_pages', 'topic_clusters')
    `;
    console.log('Tables:', tables.map(t => t.table_name).join(', '));

    const columns = await sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'topics'
      AND column_name IN ('cluster_id', 'primary_link_url', 'primary_link_anchor', 'cta_type', 'link_placement_hint')
    `;
    console.log('New columns:', columns.map(c => c.column_name).join(', '));

    console.log('\n🎉 Migration complete!\n');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
