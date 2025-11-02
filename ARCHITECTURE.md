# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
│  (Next.js Frontend - React Components + Tailwind CSS)           │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NEXT.JS APP ROUTER                            │
│                  (Server Components & API Routes)                │
├─────────────────────────────────────────────────────────────────┤
│  Pages:                   │  API Routes:                         │
│  • Landing (/)            │  • /api/strategy/generate           │
│  • Dashboard              │  • /api/content/generate            │
│  • Sign In/Up             │  • /api/posts/[id]                  │
│  • Strategies List/Detail │  • /api/images/search               │
│  • Posts List/Editor      │  • /api/posts/[id]/export           │
└──────┬──────────┬─────────┴─────────┬─────────┬────────────────┘
       │          │                   │         │
       ▼          ▼                   ▼         ▼
┌──────────┐ ┌────────────┐  ┌──────────┐ ┌──────────┐
│  Clerk   │ │  Supabase  │  │  OpenAI  │ │  Claude  │
│  (Auth)  │ │ (Database) │  │   API    │ │   API    │
└──────────┘ └────────────┘  └──────────┘ └──────────┘
                                               │
                                               ▼
                                         ┌──────────┐
                                         │  Brave   │
                                         │  Search  │
                                         └──────────┘
```

## Data Flow

### 1. Strategy Generation Flow

```
User Fills Form
     ↓
Submit to /api/strategy/generate
     ↓
┌────────────────────────────────┐
│ 1. Get current user (Clerk)   │
│ 2. Sync user to Supabase       │
│ 3. Call Claude API             │
│ 4. Parse 12 topics response    │
│ 5. Save strategy to DB         │
│ 6. Save topics to DB           │
│ 7. Log usage                   │
└────────────────────────────────┘
     ↓
Return strategy + topics
     ↓
Redirect to strategy detail page
```

### 2. Content Generation Flow

```
User Clicks "Generate Content"
     ↓
Submit to /api/content/generate
     ↓
┌────────────────────────────────┐
│ 1. Fetch topic from DB         │
│ 2. Fetch strategy context      │
│ 3. Call OpenAI API             │
│ 4. Generate content            │
│ 5. Extract factual claims      │
│ 6. Search web for sources      │
│ 7. Call Claude for fact-check  │
│ 8. Generate meta description   │
│ 9. Save post to DB             │
│ 10. Save fact-checks to DB     │
│ 11. Log usage                  │
└────────────────────────────────┘
     ↓
Return post with fact-checks
     ↓
Redirect to post editor
```

### 3. Authentication Flow

```
User Signs Up/In
     ↓
Clerk handles authentication
     ↓
Creates session
     ↓
Middleware protects routes
     ↓
On first access to protected route:
     ↓
┌────────────────────────────────┐
│ 1. Get Clerk user ID           │
│ 2. Check if user exists in DB  │
│ 3. If not, create user record  │
│ 4. Return user data            │
└────────────────────────────────┘
     ↓
User can access dashboard
```

## Database Schema

```
┌──────────────┐
│    users     │
├──────────────┤
│ id (PK)      │──┐
│ clerk_id     │  │
│ email        │  │
│ name         │  │
│ agency_name  │  │
└──────────────┘  │
                  │
       ┌──────────┴─────────────┐
       │                        │
       ▼                        ▼
┌──────────────┐         ┌──────────────┐
│  strategies  │         │ usage_logs   │
├──────────────┤         ├──────────────┤
│ id (PK)      │──┐      │ id (PK)      │
│ user_id (FK) │  │      │ user_id (FK) │
│ client_name  │  │      │ operation    │
│ industry     │  │      │ cost_usd     │
│ goals        │  │      │ tokens_used  │
│ ...          │  │      └──────────────┘
└──────────────┘  │
                  │
                  │
                  ▼
           ┌──────────────┐
           │    topics    │
           ├──────────────┤
           │ id (PK)      │──┐
           │ strategy_id  │  │
           │ title        │  │
           │ keyword      │  │
           │ outline      │  │
           │ status       │  │
           └──────────────┘  │
                             │
                             ▼
                      ┌──────────────┐
                      │    posts     │
                      ├──────────────┤
                      │ id (PK)      │──┐
                      │ topic_id     │  │
                      │ user_id      │  │
                      │ title        │  │
                      │ content      │  │
                      │ status       │  │
                      │ ...          │  │
                      └──────────────┘  │
                                        │
                                        ▼
                                 ┌──────────────┐
                                 │ fact_checks  │
                                 ├──────────────┤
                                 │ id (PK)      │
                                 │ post_id (FK) │
                                 │ claim        │
                                 │ status       │
                                 │ confidence   │
                                 │ sources      │
                                 └──────────────┘
```

## Technology Stack Layers

### Frontend Layer
```
┌─────────────────────────────────────┐
│         User Interface              │
│  • React Components                 │
│  • Tailwind CSS                     │
│  • shadcn/ui components             │
│  • Client-side form validation      │
└─────────────────────────────────────┘
```

### Application Layer
```
┌─────────────────────────────────────┐
│      Next.js App Router             │
│  • Server Components                │
│  • Server Actions                   │
│  • API Routes                       │
│  • Middleware (auth)                │
└─────────────────────────────────────┘
```

### Integration Layer
```
┌─────────────────────────────────────┐
│       Service Libraries             │
│  • lib/supabase.ts                  │
│  • lib/openai.ts                    │
│  • lib/claude.ts                    │
│  • lib/user.ts                      │
└─────────────────────────────────────┘
```

### Data Layer
```
┌─────────────────────────────────────┐
│     External Services               │
│  • Supabase (PostgreSQL)            │
│  • Clerk (Auth)                     │
│  • OpenAI (GPT-4)                   │
│  • Claude (Strategy & Fact-check)   │
│  • Brave Search (Optional)          │
│  • Pexels (Optional)                │
└─────────────────────────────────────┘
```

## Security Architecture

### Authentication
- Clerk manages user sessions
- JWT tokens for API authentication
- Automatic session refresh

### Authorization
- Middleware protects all `/dashboard` routes
- Row Level Security (RLS) in Supabase
- Users can only access their own data

### Data Protection
- Environment variables for secrets
- HTTPS only in production
- Input sanitization
- SQL injection prevention (parameterized queries)

## File Organization

```
content-command-studio/
├── app/                          # Next.js App Router
│   ├── api/                      # API endpoints
│   │   ├── strategy/
│   │   │   └── generate/
│   │   ├── content/
│   │   │   └── generate/
│   │   ├── posts/
│   │   │   └── [id]/
│   │   └── images/
│   │       └── search/
│   ├── dashboard/                # Protected pages
│   │   ├── page.tsx              # Dashboard home
│   │   ├── strategies/
│   │   │   ├── page.tsx          # List strategies
│   │   │   ├── new/
│   │   │   │   └── page.tsx      # Create strategy
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Strategy detail
│   │   └── posts/
│   │       ├── page.tsx          # List posts
│   │       └── [id]/
│   │           └── page.tsx      # Post editor
│   ├── sign-in/                  # Auth pages
│   ├── sign-up/
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles
├── components/                   # Reusable components
│   └── ui/                       # shadcn components
├── lib/                          # Utility functions
│   ├── supabase.ts               # Database client
│   ├── openai.ts                 # OpenAI integration
│   ├── claude.ts                 # Claude integration
│   ├── user.ts                   # User utilities
│   └── utils.ts                  # Helper functions
├── types/                        # TypeScript types
│   └── index.ts                  # All type definitions
├── middleware.ts                 # Auth middleware
└── supabase-schema.sql           # Database schema
```

## API Cost Optimization

```
Strategy Generation:
  Claude API: ~$0.10 per request
  ↓
  (Cache client context)

Content Generation:
  OpenAI API: ~$0.30 per post
  +
  Claude API: ~$0.10 for fact-checking
  ↓
  Total: ~$0.40 per post

Logging:
  All costs logged to usage_logs table
  ↓
  Dashboard shows total usage
```

## Performance Considerations

### Server-Side Rendering
- Landing page: Static
- Dashboard: Server-rendered with fresh data
- Strategy/Post pages: Server-rendered with caching

### API Response Times
- Target: <500ms for API routes
- Strategy generation: 20-30s (Claude processing)
- Content generation: 60-90s (OpenAI + fact-checking)

### Database Queries
- Indexed columns for fast lookups
- RLS policies for security
- Connection pooling via Supabase

## Deployment Architecture (Vercel)

```
GitHub Repository
     ↓
Vercel Build
     ↓
┌─────────────────────┐
│  Edge Network (CDN) │
│  • Static assets    │
│  • Next.js pages    │
└─────────────────────┘
     ↓
┌─────────────────────┐
│ Serverless Functions│
│  • API routes       │
│  • Server actions   │
└─────────────────────┘
     ↓
External Services
  • Supabase (Database)
  • Clerk (Auth)
  • OpenAI, Claude (AI)
```

---

This architecture is designed for:
- **Scalability**: Serverless functions scale automatically
- **Security**: Multiple layers of auth and authorization
- **Performance**: Edge caching and optimized queries
- **Maintainability**: Clear separation of concerns
- **Cost-effectiveness**: Pay-per-use for all services
