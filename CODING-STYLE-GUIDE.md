# Content Command Studio - Coding Style Guide

This document captures the coding patterns and conventions used throughout the codebase.

---

## Project Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.0
- **Database**: PostgreSQL (Neon) via `postgres` package
- **Auth**: Clerk
- **AI**: Anthropic Claude Sonnet 4, OpenAI GPT-4
- **Search**: Brave Search API
- **Deployment**: Vercel

---

## File Structure Conventions

### App Router Structure
```
app/
├── api/                          # API routes
│   ├── strategies/
│   │   ├── generate/
│   │   │   └── route.ts         # POST /api/strategies/generate
│   │   └── [id]/
│   │       ├── topics/
│   │       │   └── route.ts     # GET /api/strategies/[id]/topics
│   │       └── mou/
│   │           └── route.ts     # POST /api/strategies/[id]/mou
│   └── topics/[id]/generate/
│       └── route.ts              # POST /api/topics/[id]/generate
├── dashboard/
│   ├── page.tsx                  # /dashboard (Server Component)
│   ├── strategies/
│   │   ├── page.tsx              # /dashboard/strategies
│   │   ├── new/
│   │   │   └── page.tsx          # 'use client' (Form)
│   │   └── [id]/
│   │       ├── page.tsx          # Strategy detail
│   │       └── edit/
│   │           └── page.tsx      # Edit strategy
│   └── posts/
│       ├── page.tsx              # /dashboard/posts
│       └── [id]/
│           └── page.tsx          # 'use client' (Editor)
└── page.tsx                       # Landing page
```

### Library Structure
```
lib/
├── db.ts                 # Database operations (postgres client)
├── claude.ts             # Anthropic AI integrations
├── openai.ts             # OpenAI integrations
├── content.ts            # Blog content generation
├── fact-check.ts         # Brave Search + fact-checking
├── mou.ts                # MOU/proposal generation
├── user.ts               # User sync utilities
└── utils.ts              # Shared utilities
```

---

## TypeScript Conventions

### Server Components (Default)
```typescript
// app/dashboard/page.tsx
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect('/sign-in');
  }

  // Fetch data directly in component
  const user = await db.getUserByClerkId(clerkUser.id);

  return <div>...</div>;
}
```

### Client Components (When Needed)
```typescript
// app/dashboard/strategies/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewStrategyPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // ... form logic
    router.push(`/dashboard/strategies/${data.strategyId}`);
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### API Routes
```typescript
// app/api/topics/[id]/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ... business logic

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed' },
      { status: 500 }
    );
  }
}
```

### Interfaces
```typescript
// Define interfaces for complex types
export interface FactCheck {
  claim: string;
  status: 'verified' | 'uncertain' | 'unverified';
  confidence: number;
  reasoning: string;
  sources: string[];
}

export interface ContentGenerationInput {
  title: string;
  keyword: string;
  outline: string[];
  targetAudience: string;
  brandVoice: string;
  wordCount: number;
  seoIntent: string;
}
```

### Type Safety Notes
- ✅ Use interfaces for complex objects
- ✅ Use string unions for status enums (`'draft' | 'approved' | 'published'`)
- ⚠️ Avoid `any` when possible (currently used in some DB responses - acceptable for MVP)
- ✅ Use optional chaining: `topic?.outline || []`

---

## Database Patterns

### Query Execution
```typescript
// lib/db.ts

// Option 1: Using postgres package tagged templates (preferred for JSONB)
const result = await sql`
  INSERT INTO strategies (
    user_id, client_name, goals, keywords
  ) VALUES (
    ${data.user_id},
    ${data.client_name},
    ${sql.json(data.goals)},        // JSONB
    ${sql.array(keywordsArray)}     // Array
  ) RETURNING *
`;

// Option 2: Using query helper (for simple queries)
const result = await query(
  'SELECT * FROM users WHERE clerk_id = $1',
  [clerkId]
);
```

### Database Helper Pattern
```typescript
export const db = {
  async getUserByClerkId(clerkId: string) {
    const result = await query(
      'SELECT * FROM users WHERE clerk_id = $1',
      [clerkId]
    );
    return result[0] || null;
  },

  async createStrategy(data: any) {
    const result = await sql`
      INSERT INTO strategies (...) VALUES (...)
      RETURNING *
    `;
    return result[0];
  },
};
```

### Usage Logging Pattern
```typescript
await db.logUsage({
  user_id: user.id,
  operation_type: 'content_generation',
  cost_usd: estimatedCost,
  tokens_used: estimatedTokens,
  metadata: {
    topic_id: topicId,
    post_id: post.id,
    word_count: generatedContent.wordCount,
  },
});
```

---

## AI Integration Patterns

### Claude API Pattern
```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function generateStrategy(input: StrategyInput) {
  const prompt = `You are an expert...

  **Input:**
  ${JSON.stringify(input, null, 2)}

  **Instructions:**
  1. Do X
  2. Do Y

  **Output Format:**
  Return ONLY a JSON array:
  [...]
  `;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    temperature: 0.3,  // Lower for factual, higher for creative
    messages: [{ role: 'user', content: prompt }],
  });

  const response = message.content[0];
  if (response.type !== 'text') {
    throw new Error('Unexpected response type');
  }

  // Parse JSON from response
  const jsonMatch = response.text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('Could not parse JSON');
  }

  const result = JSON.parse(jsonMatch[0]);
  return result;
}
```

### Temperature Guidelines
- **0.3**: Fact-checking, data extraction (deterministic)
- **0.7**: Content generation (creative but consistent)
- **1.0**: Brainstorming, highly creative tasks

### JSON Parsing Pattern
```typescript
// Always use regex to extract JSON (handles extra text)
const jsonMatch = response.text.match(/\{[\s\S]*\}/);  // Object
const arrayMatch = response.text.match(/\[[\s\S]*\]/); // Array

if (!jsonMatch) {
  throw new Error('Could not parse JSON from response');
}

const data = JSON.parse(jsonMatch[0]);
```

---

## Styling with Tailwind

### Color Palette
```typescript
// Brand colors defined in app/globals.css
--color-sunset-orange: #F36E21
--color-deep-indigo: #2E3A8C
--color-warm-white: #FFF4EC

// Usage in JSX:
className="bg-sunset-orange"
className="text-deep-indigo"
className="bg-warm-white"
```

### Common Patterns

#### Card Component
```tsx
<div className="rounded-2xl border border-slate-200/60 bg-white p-8 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-blue-300/30 transition-all duration-300 hover:-translate-y-1">
  {/* Content */}
</div>
```

#### Button (Primary)
```tsx
<button className="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-sunset-orange to-orange-600 text-white font-bold text-lg shadow-2xl shadow-orange-300/50 hover:shadow-orange-400/60 hover:scale-105 transition-all duration-200">
  <span className="relative z-10 flex items-center gap-3">
    {/* Icon */}
    Button Text
  </span>
</button>
```

#### Button (Secondary)
```tsx
<button className="px-8 py-4 rounded-xl border-2 border-deep-indigo bg-white text-deep-indigo font-bold hover:bg-deep-indigo hover:text-white transition-all">
  Button Text
</button>
```

#### Form Input
```tsx
<input
  type="text"
  className="w-full rounded-xl border-2 border-slate-200 px-5 py-3.5 text-slate-900 font-medium focus:border-sunset-orange focus:outline-none focus:ring-4 focus:ring-sunset-orange/10 transition-all bg-slate-50/50"
/>
```

#### Gradient Text
```tsx
<h1 className="text-5xl font-black bg-gradient-to-r from-deep-indigo via-blue-600 to-deep-indigo bg-clip-text text-transparent">
  Title Text
</h1>
```

#### Status Badge
```tsx
<span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase ${
  status === 'approved' ? 'bg-green-100 text-green-700 border border-green-200' :
  status === 'draft' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
  'bg-slate-100 text-slate-700 border border-slate-200'
}`}>
  {status}
</span>
```

### Layout Patterns

#### Dashboard Header (Repeated Pattern - Should Extract)
```tsx
<header className="border-b border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-sm sticky top-0 z-50">
  <div className="container mx-auto flex h-20 items-center justify-between px-6">
    <div className="flex items-center gap-12">
      <Link href="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-sunset-orange to-orange-600 bg-clip-text text-transparent">
        Content Command Studio
      </Link>
      <nav className="flex gap-8">
        {/* Navigation links */}
      </nav>
    </div>
    <UserButton afterSignOutUrl="/" />
  </div>
</header>
```

#### Grid Layout
```tsx
<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
  {items.map(item => (
    <div key={item.id}>...</div>
  ))}
</div>
```

---

## Error Handling

### API Routes
```typescript
export async function POST(request: NextRequest) {
  try {
    // Business logic
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Operation error:', error);
    return NextResponse.json(
      { error: error.message || 'Operation failed' },
      { status: 500 }
    );
  }
}
```

### Client Components
```typescript
const [error, setError] = useState('');

try {
  const response = await fetch('/api/endpoint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Request failed');
  }

  const data = await response.json();
  // Success handling
} catch (err: any) {
  setError(err.message);
  setIsLoading(false);
}
```

### Error Display
```tsx
{error && (
  <div className="mb-8 rounded-xl bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 p-5 text-red-700 font-semibold flex items-start gap-3">
    <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    {error}
  </div>
)}
```

---

## Loading States

### Spinner Component Pattern
```tsx
{isLoading && (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-sunset-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-lg font-semibold text-slate-600">Loading...</p>
    </div>
  </div>
)}
```

### Button Loading State
```tsx
<button disabled={isLoading}>
  {isLoading ? (
    <>
      <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      Generating...
    </>
  ) : (
    <>Generate Strategy</>
  )}
</button>
```

---

## Navigation & Routing

### Client-Side Navigation
```typescript
import { useRouter } from 'next/navigation';

const router = useRouter();

// After successful form submission:
router.push(`/dashboard/strategies/${data.strategyId}`);
```

### Server-Side Redirects
```typescript
import { redirect } from 'next/navigation';

if (!userId) {
  redirect('/sign-in');
}
```

### Link Component
```tsx
import Link from 'next/link';

<Link href="/dashboard/strategies" className="...">
  View Strategies
</Link>
```

---

## Authentication Pattern

### Server Component
```typescript
import { currentUser } from '@clerk/nextjs/server';

const clerkUser = await currentUser();

if (!clerkUser) {
  redirect('/sign-in');
}

// Sync to database
const user = await db.getUserByClerkId(clerkUser.id);
```

### API Route
```typescript
import { auth } from '@clerk/nextjs/server';

const { userId } = await auth();

if (!userId) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### Ownership Verification
```typescript
// Always verify resource ownership
const strategy = await db.getStrategyById(strategyId);
if (strategy.user_id !== user.id) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

---

## Code Organization Rules

### ✅ Do:
- Use server components by default
- Mark forms and interactive UIs with `'use client'`
- Handle auth at the top of every route
- Log all AI operations for cost tracking
- Use try-catch in all async operations
- Return proper HTTP status codes
- Use Tailwind utility classes inline
- Extract reusable logic to `lib/` functions
- Use TypeScript interfaces for complex types

### ❌ Don't:
- Don't use CSS modules or styled-components
- Don't skip authentication checks
- Don't create components prematurely (YAGNI)
- Don't use `any` type when avoidable
- Don't hardcode API keys
- Don't skip error handling
- Don't create client components unnecessarily

---

## Testing Approach (When Implemented)

### Unit Tests
```typescript
// lib/content.test.ts
import { generateBlogPost } from './content';

describe('generateBlogPost', () => {
  it('should generate content with proper word count', async () => {
    const result = await generateBlogPost({
      title: 'Test Title',
      keyword: 'test keyword',
      // ... other params
    });

    expect(result.wordCount).toBeGreaterThan(0);
    expect(result.content).toContain(title);
  });
});
```

### Integration Tests
```typescript
// app/api/strategies/generate/route.test.ts
describe('POST /api/strategies/generate', () => {
  it('should require authentication', async () => {
    const response = await fetch('/api/strategies/generate', {
      method: 'POST',
    });

    expect(response.status).toBe(401);
  });
});
```

---

## Performance Considerations

### Rate Limiting
```typescript
// Add delays between API calls to external services
await new Promise(resolve => setTimeout(resolve, 200));
```

### Caching
```typescript
// Use Next.js revalidation for data fetching
export const revalidate = 3600; // Revalidate every hour
```

### Database Indexes
```sql
-- Always index foreign keys and frequently queried fields
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_status ON posts(status);
```

---

## Environment Variables

### Required Variables
```bash
# Database
DATABASE_URL=postgresql://...

# Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# AI APIs
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# Search
BRAVE_SEARCH_API_KEY=...
```

### Usage in Code
```typescript
// Always use environment variables for secrets
const apiKey = process.env.BRAVE_SEARCH_API_KEY;

if (!apiKey) {
  console.warn('API key not configured');
  return fallbackValue;
}
```

---

## Git Commit Messages

Based on recent commits:
```
feat: Add Brave Search fact-checking integration
fix: Update database schema for MOU generation
docs: Add comprehensive implementation summary
refactor: Extract fact-checking to separate module
```

**Format**: `type: Brief description`

**Types**: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

---

## Future Refactoring Opportunities

1. **Extract DashboardHeader Component** (used in 6+ files)
2. **Create Form Input Components** (reduce duplication)
3. **Add Status Constants** (replace string literals)
4. **Type Database Responses** (replace `any` types)
5. **Create Error Boundary** (graceful error handling)
6. **Add React Testing Library** (component tests)

---

Last Updated: 2025-11-03
