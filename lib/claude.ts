import Anthropic from '@anthropic-ai/sdk';

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function generateStrategy({
  clientName,
  industry,
  goals,
  targetAudience,
  brandVoice,
  frequency,
  contentLength,
  keywords,
}: {
  clientName: string;
  industry: string;
  goals: string[];
  targetAudience: string;
  brandVoice: string;
  frequency: string;
  contentLength: string;
  keywords: string[];
}) {
  const prompt = `You are a content strategy expert. Create a 12-topic content calendar for a client with the following details:

Client Name: ${clientName}
Industry: ${industry}
Primary Goals: ${goals.join(', ')}
Target Audience: ${targetAudience}
Brand Voice: ${brandVoice}
Posting Frequency: ${frequency}
Content Length: ${contentLength}
Keywords/Topics of Interest: ${keywords.join(', ')}

Generate 12 blog post topics that:
1. Align with the client's goals and target audience
2. Are SEO-friendly and keyword-optimized
3. Provide value to the target audience
4. Cover a diverse range of subtopics within the industry
5. Follow a logical content progression

For each topic, provide:
- A compelling title
- Target keyword/phrase
- Brief outline (3-5 H2 headings)
- SEO intent (informational, commercial, or transactional)
- Estimated word count

Format your response as a JSON array of topics. Each topic should have this structure:
{
  "title": "string",
  "keyword": "string",
  "outline": ["string", "string", "string"],
  "seoIntent": "informational|commercial|transactional",
  "wordCount": number
}

Return ONLY the JSON array, no additional text.`;

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4000,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  const tokensUsed = message.usage.input_tokens + message.usage.output_tokens;

  // Parse the JSON response
  const jsonMatch = content.text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('Could not parse topics from Claude response');
  }

  const topics = JSON.parse(jsonMatch[0]);
  return { topics, tokensUsed };
}

export interface FactCheck {
  claim: string;
  status: 'verified' | 'uncertain' | 'unverified';
  confidence: number;
  sources: string[];
}

export async function factCheckContent(
  content: string,
  searchResults: Array<{ url: string; snippet: string }>
): Promise<FactCheck[]> {
  const prompt = `You are a fact-checking expert. Analyze the following blog post content and identify factual claims that should be verified.

Content:
${content}

Available search results for verification:
${searchResults.map((r, i) => `${i + 1}. ${r.snippet}\nSource: ${r.url}`).join('\n\n')}

For each factual claim you identify:
1. Extract the specific claim
2. Determine if it can be verified using the search results
3. Assign a status: "verified" (found in 2+ sources), "uncertain" (found in 1 source or conflicting info), or "unverified" (no sources found)
4. Provide a confidence score (0-100)
5. List the source URLs that support or refute the claim

Focus on objective facts like statistics, dates, quotes, research findings, and technical specifications.
Ignore subjective opinions or general statements.

Return ONLY a JSON array with this structure:
[
  {
    "claim": "string",
    "status": "verified|uncertain|unverified",
    "confidence": number,
    "sources": ["url1", "url2"]
  }
]`;

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 3000,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const responseContent = message.content[0];
  if (responseContent.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  const tokensUsed = message.usage.input_tokens + message.usage.output_tokens;

  // Parse the JSON response
  const jsonMatch = responseContent.text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    return [];
  }

  const factChecks: FactCheck[] = JSON.parse(jsonMatch[0]);
  return factChecks;
}
