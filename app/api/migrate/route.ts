import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import * as fs from 'fs';
import * as path from 'path';

/**
 * GET /api/migrate
 * Runs pending database migrations
 *
 * Usage: Visit https://aiso.studio/api/migrate?secret=YOUR_SECRET_KEY
 */
export async function GET(request: NextRequest) {
  try {
    // Security check - require a secret key
    const secret = request.nextUrl.searchParams.get('secret');
    const expectedSecret = process.env.MIGRATION_SECRET || 'your-secret-key-change-this';

    if (secret !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create migrations tracking table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // Get list of executed migrations
    const executedMigrations = await sql`
      SELECT filename FROM migrations
    `;
    const executedFiles = new Set(executedMigrations.map((m: any) => m.filename));

    // Read migration files from migrations directory
    const migrationsDir = path.join(process.cwd(), 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort(); // Run in alphabetical order

    const results = [];
    let newMigrationsRun = 0;

    for (const file of files) {
      // Skip if already executed
      if (executedFiles.has(file)) {
        results.push({ file, status: 'already_executed', skipped: true });
        continue;
      }

      try {
        // Read and execute migration
        const filePath = path.join(migrationsDir, file);
        const migrationSQL = fs.readFileSync(filePath, 'utf-8');

        // Execute the migration
        await sql.unsafe(migrationSQL);

        // Record as executed
        await sql`
          INSERT INTO migrations (filename)
          VALUES (${file})
        `;

        results.push({ file, status: 'success', executed: true });
        newMigrationsRun++;
      } catch (error: any) {
        results.push({
          file,
          status: 'error',
          error: error.message,
          executed: false
        });
        console.error(`Migration ${file} failed:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Migrations complete! ${newMigrationsRun} new migrations executed.`,
      totalMigrations: files.length,
      newMigrationsRun,
      alreadyExecuted: executedFiles.size,
      results,
    });

  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to run migrations' },
      { status: 500 }
    );
  }
}
