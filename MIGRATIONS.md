# Database Migrations

## Running Migrations in Production

Visit this URL to run all pending migrations:

```
https://aiso.studio/api/migrate?secret=YOUR_MIGRATION_SECRET
```

Replace `YOUR_MIGRATION_SECRET` with the value from your Vercel `MIGRATION_SECRET` environment variable.

## How It Works

- The `/api/migrate` endpoint automatically detects and runs any `.sql` files in the `migrations/` folder that haven't been executed yet
- Migrations are tracked in a `migrations` table to prevent re-running
- Migrations execute in alphabetical order
- Safe to run multiple times - already-executed migrations are skipped

## Adding New Migrations

1. Create a new `.sql` file in the `migrations/` folder
2. Name it with a descriptive prefix (e.g., `add-new-feature.sql`)
3. Write your SQL migration
4. Commit and push
5. Visit the migration URL above to execute it

## Response

You'll see a JSON response like:
```json
{
  "success": true,
  "message": "Migrations complete! 3 new migrations executed.",
  "totalMigrations": 20,
  "newMigrationsRun": 3,
  "alreadyExecuted": 17,
  "results": [...]
}
```

## Security

- The migration endpoint is protected by the `MIGRATION_SECRET` environment variable
- Only run migrations when you're ready to apply database changes
- Test migrations locally first if possible
