import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export type RepurposeFormat =
  | 'twitter_thread'
  | 'linkedin'
  | 'instagram'
  | 'facebook'
  | 'email'
  | 'video_script';

const FORMAT_PROMPTS: Record<RepurposeFormat, string> = {
  twitter_thread: `Convert this content into a Twitter/X thread (3-5 tweets).
- First tweet should be a hook that grabs attention
- Each tweet max 280 characters
- Use line breaks between tweets
- End with a call-to-action
- Include relevant hashtags on last tweet only
Format as:
Tweet 1:
[content]

Tweet 2:
[content]
...`,

  linkedin: `Convert this content into a LinkedIn post.
- Start with a hook (first line matters most)
- Use short paragraphs (1-2 sentences each)
- Include line breaks for readability
- Add 3-5 relevant hashtags at the end
- Professional but engaging tone
- End with a question or CTA to drive engagement
- Max 3000 characters`,

  instagram: `Convert this content into an Instagram caption.
- Start with a hook
- Use emojis sparingly but effectively
- Break into short paragraphs
- Include a clear CTA
- Add 5-10 relevant hashtags at the end
- Max 2200 characters`,

  facebook: `Convert this content into a Facebook post.
- Conversational and engaging tone
- Can be longer form than Twitter
- Include a question to drive comments
- Add relevant emojis
- End with a CTA`,

  email: `Convert this content into an email newsletter.
Format as:
SUBJECT LINE: [compelling subject under 50 chars]

PREVIEW TEXT: [preview text under 90 chars]

---

[Email body with:
- Personal greeting
- Hook/intro paragraph
- 2-3 key points from the content
- Clear CTA button text
- Sign off]`,

  video_script: `Convert this content into a video script.
Format as:
HOOK (0-10 sec):
[Attention-grabbing opener]

INTRO (10-30 sec):
[Brief context/problem statement]

MAIN POINTS:
1. [Point with speaking notes]
2. [Point with speaking notes]
3. [Point with speaking notes]

CTA (final 10-15 sec):
[Clear call-to-action]

SUGGESTED B-ROLL:
- [Visual suggestion 1]
- [Visual suggestion 2]
- [Visual suggestion 3]`,
};

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { content, format, title } = body as {
      content: string;
      format: RepurposeFormat;
      title?: string;
    };

    if (!content || !format) {
      return NextResponse.json(
        { error: 'Content and format are required' },
        { status: 400 }
      );
    }

    if (!FORMAT_PROMPTS[format]) {
      return NextResponse.json(
        { error: 'Invalid format' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an expert content repurposing specialist. Transform content while preserving the key message, value, and accuracy. Adapt tone and structure for each platform's best practices.`;

    const userPrompt = `${FORMAT_PROMPTS[format]}

${title ? `Original Title: ${title}\n\n` : ''}Original Content:
${content}`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      system: systemPrompt,
    });

    const repurposedContent = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    return NextResponse.json({
      success: true,
      format,
      content: repurposedContent,
    });
  } catch (error: any) {
    console.error('Repurpose error:', error);
    return NextResponse.json(
      { error: `Failed to repurpose content: ${error.message}` },
      { status: 500 }
    );
  }
}
