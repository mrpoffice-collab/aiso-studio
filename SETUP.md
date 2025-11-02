# Setup Guide - Content Command Studio

This guide will walk you through setting up Content Command Studio from scratch.

## Step 1: Get Your API Keys

### Neon Database (PostgreSQL)
**You likely already have this!** Check your existing Vercel environment variables.

If you need to set it up:
1. Find your Neon connection string (check Vercel project settings)
2. OR go to https://console.neon.tech
3. Copy your `DATABASE_URL` connection string
4. See `NEON-SETUP.md` for detailed instructions

### Clerk (Authentication)
1. Go to https://clerk.com
2. Click "Sign Up" or "Sign In"
3. Click "Create Application"
4. Name: Content Command Studio
5. Choose sign-in options (Email + Google recommended)
6. Click "Create Application"
7. You'll see your API keys immediately:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
8. Go to "Paths" in the sidebar
9. Set these paths:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in URL: `/dashboard`
   - After sign-up URL: `/dashboard`

### OpenAI (Content Generation)
1. Go to https://platform.openai.com
2. Sign in or create account
3. Go to https://platform.openai.com/api-keys
4. Click "Create new secret key"
5. Name: Content Command Studio
6. Copy the key (you won't see it again!)
7. Save as `OPENAI_API_KEY`
8. Add payment method at https://platform.openai.com/account/billing (required for API access)

### Anthropic Claude (Strategy & Fact-Checking)
1. Go to https://console.anthropic.com
2. Sign in or create account
3. Go to API Keys section
4. Click "Create Key"
5. Name: Content Command Studio
6. Copy the key
7. Save as `ANTHROPIC_API_KEY`
8. Add payment method if required

### Brave Search API (Optional - for fact-checking)
1. Go to https://brave.com/search/api/
2. Click "Get Started"
3. Sign up for free tier (2,000 queries/month free)
4. Go to your dashboard
5. Create new API key
6. Save as `BRAVE_SEARCH_API_KEY`

### Pexels (Optional - for images)
1. Go to https://www.pexels.com/api/
2. Click "Get Started"
3. Sign in or create account
4. Accept terms
5. Your API key will be shown
6. Save as `PEXELS_API_KEY`

## Step 2: Configure Environment Variables

1. Open `.env.local` in your code editor
2. Fill in all the API keys you just obtained:

```bash
# Database (from Neon - you probably already have this!)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Auth (from Clerk - need to get)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# AI APIs (copy from your existing Vercel environment variables!)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Images (you already have this!)
PEXELS_API_KEY=...

# Storage (you already have this!)
BLOB_READ_WRITE_TOKEN=...

# Optional for MVP
BRAVE_SEARCH_API_KEY=...
STRIPE_SECRET_KEY=...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Save the file

## Step 3: Install Dependencies and Run

1. Open terminal in the project directory
2. Install packages:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to http://localhost:3000

## Step 4: Test the Setup

1. You should see the landing page
2. Click "Get Started" or "Sign Up"
3. Create an account using email or Google
4. You should be redirected to the dashboard
5. If you see the dashboard with "Welcome back" message, setup is complete!

## Troubleshooting

### "Invalid Publishable Key" error
- Double-check your Clerk keys in `.env.local`
- Make sure you're using the publishable key (starts with `pk_`)
- Restart the dev server after changing env variables

### "Database connection failed"
- Verify your Supabase URL and keys
- Make sure you ran the SQL schema
- Check if your Supabase project is active

### "Unauthorized" errors
- Make sure you've set up Row Level Security policies
- The schema includes RLS policies - make sure you ran the entire SQL file

### Clerk redirect issues
- Go to Clerk dashboard > Paths
- Ensure all paths are set correctly
- Make sure env variables match the paths

### Module not found errors
```bash
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

After successful setup:

1. **Create Your First Strategy**
   - Click "Create New Strategy" on the dashboard
   - Fill in client details
   - Let AI generate your content calendar

2. **Generate Content**
   - Select a topic from your strategy
   - Click "Generate Content"
   - Review the AI-generated post

3. **Review & Export**
   - Edit the content as needed
   - Review fact-checks
   - Export to markdown or HTML

## Development Tips

- The dev server auto-reloads on file changes
- Check the browser console for errors
- API routes are in `app/api/`
- Database types are in `types/index.ts`

## Need Help?

If you encounter issues:
1. Check this setup guide carefully
2. Review the error messages in the terminal
3. Check the browser console for client-side errors
4. Verify all environment variables are set correctly

## Production Deployment

When ready to deploy to Vercel:

1. Push code to GitHub
2. Go to https://vercel.com
3. Click "Import Project"
4. Select your GitHub repo
5. Add all environment variables (same as `.env.local`)
6. Deploy!

Make sure to:
- Update `NEXT_PUBLIC_APP_URL` to your production domain
- Set up production API keys (not test keys)
- Configure Clerk for production domain
