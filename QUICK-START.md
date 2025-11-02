# Quick Start Guide

## What You Already Have ✅

Based on your existing Vercel environment variables, you already have:

- ✅ `OPENAI_API_KEY` - For content generation
- ✅ `ANTHROPIC_API_KEY` - For Claude (strategy + fact-checking)
- ✅ `PEXELS_API_KEY` - For images
- ✅ `BLOB_READ_WRITE_TOKEN` - For file storage
- ✅ Neon Database (`DATABASE_URL`) - Likely already set up

## What You Still Need 🔑

**Only 1 thing: Clerk Authentication**

Go to https://clerk.com and create a free account:
1. Create a new application
2. Get your API keys:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
3. Takes about 5 minutes!

## Setup Steps

### 1. Copy Your Existing API Keys

Open your Vercel project's environment variables and copy these to `.env.local`:

```bash
# From your existing Vercel env vars
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
PEXELS_API_KEY=...
BLOB_READ_WRITE_TOKEN=...
DATABASE_URL=postgresql://...
```

### 2. Add Clerk Keys

After creating your Clerk app:

```bash
# New - from Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### 3. Set Up Database Tables

1. Go to https://console.neon.tech
2. Open your project
3. Click "SQL Editor"
4. Copy contents of `neon-schema.sql`
5. Paste and click "Run"

This creates 6 tables: users, strategies, topics, posts, fact_checks, usage_logs

### 4. Install and Run

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Your Complete `.env.local` File

```bash
# Database (from Neon)
DATABASE_URL=postgresql://[copy from Vercel]

# Auth (from Clerk - NEW)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# AI APIs (from Vercel)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# Images (from Vercel)
PEXELS_API_KEY=

# Storage (from Vercel)
BLOB_READ_WRITE_TOKEN=

# Optional
BRAVE_SEARCH_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Testing

1. Visit http://localhost:3000
2. Click "Get Started"
3. Sign up with email or Google
4. You should see the dashboard!

## What's Built So Far

- ✅ Landing page
- ✅ Authentication (Clerk)
- ✅ Dashboard with navigation
- ✅ Database schema ready
- ✅ AI integration libraries (OpenAI + Claude)
- ✅ All utility functions

## What to Build Next

1. **Strategy Builder Form** - Let users create content strategies
2. **Content Generator** - Generate blog posts from topics
3. **Post Editor** - Edit and review generated content
4. **Export Features** - Export to markdown/HTML

See `NEXT-STEPS.md` for detailed build instructions!

## Troubleshooting

### "Module not found @neondatabase/serverless"
```bash
npm install
```

### "DATABASE_URL is not defined"
- Check `.env.local` has `DATABASE_URL`
- Restart dev server after adding env vars

### "Clerk keys invalid"
- Make sure you copied the full key (no spaces)
- Check you're using test keys (start with `pk_test_` and `sk_test_`)

### "Table does not exist"
- Run the `neon-schema.sql` in Neon SQL Editor
- Verify tables exist: `SELECT * FROM users LIMIT 1;`

## Need More Help?

- **Database Setup**: See `NEON-SETUP.md`
- **Full Setup Guide**: See `SETUP.md`
- **Architecture**: See `ARCHITECTURE.md`
- **Development Status**: See `DEVELOPMENT-STATUS.md`

## Time to First Working App

- **If you already have most API keys**: 15-20 minutes
- **Starting from scratch**: 30-40 minutes

Most of your time will be:
1. Creating Clerk account (5 min)
2. Setting up database schema (5 min)
3. Copying env vars (5 min)
4. Testing (5 min)

You're very close! 🚀
