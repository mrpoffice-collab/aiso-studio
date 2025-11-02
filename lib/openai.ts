import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function generateContent({
  title,
  outline,
  brandVoice,
  targetAudience,
  wordCount,
  keyword,
}: {
  title: string;
  outline: string[];
  brandVoice: string;
  targetAudience: string;
  wordCount: number;
  keyword: string;
}) {
  const prompt = `You are a professional content writer. Generate a complete blog post with the following specifications:

Title: ${title}
Target Keyword: ${keyword}
Word Count: ${wordCount} words (±10%)
Brand Voice: ${brandVoice}
Target Audience: ${targetAudience}

Outline (use these as H2 headings):
${outline.map((item, i) => `${i + 1}. ${item}`).join('\n')}

Requirements:
- Write in markdown format
- Include H1 (title), H2, and H3 headings as appropriate
- Use the target keyword naturally throughout (1-2% density)
- Write engaging, informative content
- Include a compelling introduction and conclusion
- Match the specified brand voice
- Target the specified audience

Generate the complete blog post now:`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: 'You are an expert content writer specializing in SEO-optimized blog posts.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 4000,
  });

  const content = completion.choices[0]?.message?.content || '';
  const tokensUsed = completion.usage?.total_tokens || 0;

  return { content, tokensUsed };
}

export async function generateMetaDescription(content: string, title: string): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: 'You are an SEO expert. Generate compelling meta descriptions that are 150-160 characters.',
      },
      {
        role: 'user',
        content: `Generate a meta description for this blog post titled "${title}":\n\n${content.slice(0, 500)}`,
      },
    ],
    temperature: 0.7,
    max_tokens: 100,
  });

  return completion.choices[0]?.message?.content?.trim() || '';
}
