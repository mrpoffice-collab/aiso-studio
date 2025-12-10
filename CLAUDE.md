# CLAUDE.md - Project Instructions for Claude Code

## Project Overview
AISO Studio - AI Search Optimization platform for marketing agencies. Built with Next.js 16, TypeScript, Tailwind CSS, PostgreSQL (Neon), and Clerk authentication.

## Development Workflow

### IMPORTANT: Production-Only Testing
- **DO NOT run local dev server** - All testing happens in production
- After making changes, **commit and push to trigger Vercel deployment**
- User will test on the live production site
- This is the standard workflow for this project going forward

### Deployment Process
1. Make code changes
2. Run `npm run build` to verify no build errors
3. Commit changes with descriptive message
4. Push to main branch
5. Vercel auto-deploys from main
6. User tests on production URL

### Git Workflow
- Main branch: `main`
- Always commit with clear, descriptive messages
- Push immediately after commits for testing
- No feature branches needed for this project

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL via Neon
- **Auth**: Clerk
- **Hosting**: Vercel
- **AI**: Anthropic Claude API

## UI/Design Rules

### NO GRAY FONTS
- **Never use light gray text colors** for readable content
- Use `text-slate-900` for body text and feature lists
- Use `text-slate-700` minimum for secondary text
- Avoid: `text-slate-400`, `text-slate-500`, `text-gray-400`, `text-gray-500` for readable text
- Exception: Placeholder text in inputs can use lighter colors

## Database
- Connection: Neon PostgreSQL with SSL required
- Migrations stored in `/migrations` folder
- Run migrations via custom Node.js scripts
- Use `lib/db.ts` for all database operations

## Key Directories
- `/app` - Next.js app router pages and API routes
- `/components` - Reusable React components
- `/lib` - Utility functions, database client, API integrations
- `/migrations` - SQL migration files

## Testing Users
- Kim Kelley (kim@aliidesign.com) - Agency tier tester
- User ID: 0dc0c7c4-132b-4126-9009-c1e1bb9aeec6

## Current Features
- Content Strategy creation with topic generation
- AI content generation with AISO scoring
- Content audits (single URL, batch, accessibility)
- Lead discovery and sales pipeline
- WordPress integration (with mock mode for testing)
- Social media repurposing
- PDF report generation

## Mock Mode
Several features support mock mode for testing without external dependencies:
- WordPress publishing (`mockMode: true` parameter)
- Use mock mode when real integrations aren't available

## Feature Updates & Historical Data

When adding new features that depend on user data:

1. **Check if required data exists** before showing the feature UI
2. **Show clear, user-friendly message** if data is missing - NOT errors
   - Example: "Re-run audit to enable Adapt to Vertical"
   - NOT: "Error: content is undefined"
3. **Provide a path forward** - Tell user how to get the feature working
4. **Never break existing functionality** - Old data must still work for old features
5. **Consider backfill migrations** for critical features where re-running isn't practical

### Implementation Pattern
```typescript
// Good - graceful handling
if (!auditResult?.content) {
  return <Message>Re-run this audit to enable content adaptation.</Message>;
}

// Bad - cryptic error
if (!auditResult?.content) {
  throw new Error('Content required');
}
```

### When to Backfill
- Feature is critical to user workflow
- Re-running/re-creating data is impractical (e.g., months of posts)
- Data exists in another form that can be transformed
