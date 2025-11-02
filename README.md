# Content Command Studio

A B2B SaaS platform for marketing agencies to automate content strategy creation and blog post generation with AI-powered fact-checking.

## Features

- **Strategy Builder**: Generate 12-topic content calendars tailored to client needs
- **Content Generator**: AI-powered blog post creation using OpenAI GPT-4
- **Fact-Checking**: Automated fact verification using Claude AI
- **Content Editor**: Markdown-based editor with live preview
- **Image Sourcing**: Integrated Pexels API for royalty-free images
- **Export Options**: Markdown, HTML, and clipboard export

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Node.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Clerk
- **AI APIs**: OpenAI (content generation), Claude (strategy & fact-checking)
- **Deployment**: Vercel
- **Payments**: Stripe (post-MVP)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Clerk account and application
- OpenAI API key
- Anthropic (Claude) API key
- Brave Search API key (optional, for fact-checking)
- Pexels API key (optional, for images)

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up Supabase**
   - Create a new Supabase project at https://supabase.com
   - Go to Project Settings > API to get your URL and keys
   - Go to SQL Editor and run the schema from `supabase-schema.sql`

3. **Set up Clerk**
   - Create a new application at https://clerk.com
   - Go to API Keys to get your publishable and secret keys
   - Configure your redirect URLs in the Clerk dashboard

4. **Configure environment variables**
   - Copy `.env.local.example` to `.env.local`
   - Fill in all required environment variables with your API keys

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to http://localhost:3000

## Project Structure

```
content-command-studio/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   ├── dashboard/            # Dashboard pages
│   ├── sign-in/              # Auth pages
│   └── layout.tsx
├── components/               # React components
├── lib/                      # Utility functions
│   ├── supabase.ts          # Database client
│   ├── openai.ts            # OpenAI integration
│   ├── claude.ts            # Claude integration
│   └── utils.ts
├── types/                    # TypeScript types
└── supabase-schema.sql      # Database schema
```

## Rate Limits (MVP)

- 10 strategy generations per day per user
- 25 content generations per day per user

## Cost Estimates

Per operation:
- Strategy generation: ~$0.10
- Content generation: ~$0.30
- Fact-checking: ~$0.10
- Total per post: ~$0.40

## Deploy on Vercel

The easiest way to deploy is to use the [Vercel Platform](https://vercel.com/new) from the creators of Next.js.
