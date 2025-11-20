# Brave Search API Setup

## Why Brave Search?

The enhanced content generation now uses **Brave Search API** to research topics in real-time before writing. This makes your content:

- **More Original**: Grounded in current, specific data rather than generic AI knowledge
- **More Accurate**: Includes real statistics, case studies, and examples
- **More Current**: Incorporates latest trends and information from 2025
- **More Unique**: Each piece has specific, verifiable details that set it apart

## How It Works

When you generate content, the system automatically:

1. **Searches for Statistics**: Finds recent data and percentages related to your topic
2. **Finds Case Studies**: Discovers real company examples and success stories
3. **Identifies Trends**: Pulls current trends and emerging developments
4. **Generates Content**: Weaves all this research naturally into your blog post

## Getting Your Brave Search API Key

1. Go to [Brave Search API](https://brave.com/search/api/)
2. Click "Get Started" or "Sign Up"
3. Choose a plan:
   - **Free Tier**: 2,000 queries/month (perfect for testing)
   - **Paid Plans**: More queries as needed
4. Create an account and verify your email
5. Navigate to your API dashboard
6. Copy your API key

## Adding to Your Project

1. Open your `.env.local` file
2. Add your Brave Search API key:
   ```
   BRAVE_SEARCH_API_KEY=your_api_key_here
   ```
3. Restart your development server

## What If I Don't Add It?

The system will still work! If `BRAVE_SEARCH_API_KEY` is not set:
- Content generation continues normally
- You'll see a console warning: "BRAVE_SEARCH_API_KEY not set, skipping research"
- Content will be generated with the enhanced prompts (still better than before!)
- But you won't get the real-time research data

## Testing It

1. Set up your Brave API key
2. Generate a blog post from any topic
3. Check the console logs - you'll see:
   ```
   Researching topic: [Your Topic]
   Research completed: { statistics: 5, caseStudies: 3, trends: 4 }
   ```
4. Review the generated content - it should include specific stats, real examples, and current trends

## Cost Considerations

- **Free tier**: 2,000 queries/month
- **Each content generation uses**: ~3 queries (statistics, case studies, trends)
- **You can generate**: ~650 pieces of content/month on free tier
- **This is very generous** for most use cases

## Benefits You'll See

Your content will:
- Include specific percentages and data points
- Reference real companies and examples
- Mention current 2025 trends
- Avoid generic "many studies show" statements
- Stand out from other AI-generated content
- Rank better for being more informative and specific
