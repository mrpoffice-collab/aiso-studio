# 📋 Run Database Schema in Neon

## Quick Steps:

1. **Go to Neon Console**: https://console.neon.tech
2. **Select your project**: `content-command-studio` (or whatever you named it)
3. **Click "SQL Editor"** in the left sidebar
4. **Copy the contents** of `neon-schema.sql` file (open it in your code editor)
5. **Paste** into the SQL Editor
6. **Click "Run"** button
7. **Wait** for success message (should take 2-3 seconds)

## ✅ What This Creates:

After running, you'll have these 6 tables:
- `users` - User accounts (synced with Clerk)
- `strategies` - Content strategies for clients
- `topics` - Individual blog topics
- `posts` - Generated blog posts
- `fact_checks` - Fact-checking results
- `usage_logs` - API usage tracking

## 🧪 Verify It Worked:

In the SQL Editor, run this query:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see all 6 tables listed!

## ⚠️ Note:

Only run the schema **once**. If you need to reset the database, you can:

1. Drop all tables first:
```sql
DROP TABLE IF EXISTS usage_logs, fact_checks, posts, topics, strategies, users CASCADE;
```

2. Then run the full schema again

---

Once you've run the schema in Neon, come back and let me know - then we can test the app!
