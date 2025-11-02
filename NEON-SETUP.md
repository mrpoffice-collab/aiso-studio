# Neon Database Setup

## Step 1: Get Your Neon Connection String

You likely already have a Neon database! Find your connection string:

### Option A: From Vercel Dashboard
1. Go to your Vercel project
2. Settings > Environment Variables
3. Look for `DATABASE_URL` or `POSTGRES_URL`
4. Copy that value

### Option B: From Neon Console
1. Go to https://console.neon.tech
2. Select your project
3. Click "Connection Details"
4. Copy the connection string
5. Format: `postgresql://[user]:[password]@[host]/[database]?sslmode=require`

## Step 2: Add to Environment Variables

Paste your Neon connection string into `.env.local`:

```bash
DATABASE_URL=postgresql://your-connection-string-here
```

## Step 3: Run the Database Schema

1. Go to Neon Console: https://console.neon.tech
2. Select your project
3. Click "SQL Editor" in the sidebar
4. Copy the contents of `neon-schema.sql`
5. Paste into the SQL Editor
6. Click "Run" to execute

This will create all the necessary tables:
- `users` - User accounts (synced with Clerk)
- `strategies` - Content strategies for clients
- `topics` - Individual blog topics in strategies
- `posts` - Generated blog posts
- `fact_checks` - Fact-checking results
- `usage_logs` - API usage tracking

## Step 4: Verify Setup

Run this query in Neon SQL Editor to verify:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see all 6 tables listed.

## Connection Details

The app uses `@neondatabase/serverless` which is optimized for:
- Edge functions (Vercel)
- Low latency
- Serverless environments
- No connection pooling needed

## Security

- All database queries use parameterized statements (SQL injection protection)
- Authorization is handled at the application layer via Clerk
- Users can only access their own data through API route checks
- Connection string is never exposed to the client

## Troubleshooting

### "Connection refused"
- Check your `DATABASE_URL` is correct
- Ensure it includes `?sslmode=require` at the end

### "Relation does not exist"
- You haven't run the schema yet
- Go to Neon SQL Editor and run `neon-schema.sql`

### "Permission denied"
- Make sure you're using the correct database user
- Check your connection string has the right credentials

## Next Steps

Once the database is set up:
1. Make sure `DATABASE_URL` is in `.env.local`
2. Run `npm run dev` to start the app
3. Sign up to test user creation
4. Users will automatically be synced to your database
