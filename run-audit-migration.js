/**
 * Migration Script: Add content_audit and content_rewrite operation types
 * Run: node run-audit-migration.js
 */

require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not found in environment variables');
    process.exit(1);
  }

  const sql = neon(databaseUrl);

  console.log('🚀 Starting migration: Add audit operation types...\n');

  try {
    console.log('Step 1: Dropping existing constraint...');
    await sql`ALTER TABLE usage_logs DROP CONSTRAINT IF EXISTS usage_logs_operation_type_check`;
    console.log('✓ Constraint dropped');

    console.log('\nStep 2: Adding new constraint with all operation types...');
    await sql`
      ALTER TABLE usage_logs ADD CONSTRAINT usage_logs_operation_type_check
      CHECK (operation_type IN (
        'strategy_generation',
        'content_generation',
        'fact_checking',
        'image_search',
        'mou_generation',
        'content_audit',
        'content_rewrite'
      ))
    `;
    console.log('✓ New constraint added');

    console.log('\n✅ Migration completed successfully!');
    console.log('✅ Added operation types: content_audit, content_rewrite');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
