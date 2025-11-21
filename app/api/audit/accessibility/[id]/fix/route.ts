import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'nodejs';
export const maxDuration = 60;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface AccessibilityViolation {
  id: string;
  impact: string;
  description: string;
  help: string;
  helpUrl: string;
  nodes: {
    html: string;
    target: string[];
    failureSummary: string;
  }[];
}

// POST - Generate AI remediation suggestions
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const audit = await db.getAccessibilityAuditById(parseInt(id));

    if (!audit) {
      return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
    }

    const violations = audit.violations as AccessibilityViolation[];

    if (!violations || violations.length === 0) {
      return NextResponse.json({
        success: true,
        suggestions: [],
        message: 'No violations to fix',
      });
    }

    // Prepare violations summary for AI
    const violationsSummary = violations.slice(0, 20).map((v) => ({
      id: v.id,
      impact: v.impact,
      description: v.description,
      help: v.help,
      affectedElements: v.nodes.slice(0, 3).map((n) => ({
        html: n.html.substring(0, 200),
        issue: n.failureSummary,
      })),
    }));

    const prompt = `You are an expert web accessibility consultant. Analyze these WCAG violations and provide specific, actionable fixes.

URL: ${audit.url}
Page Title: ${audit.page_title}

Violations found:
${JSON.stringify(violationsSummary, null, 2)}

For each violation, provide:
1. A clear explanation of why this is an accessibility issue
2. The specific code fix needed (show before/after HTML)
3. Priority level (critical fixes first)

Format your response as a JSON array of fix objects:
[
  {
    "violationId": "rule-id",
    "priority": 1,
    "explanation": "Why this matters for users",
    "currentCode": "<the problematic HTML>",
    "fixedCode": "<the corrected HTML>",
    "additionalNotes": "Any extra context"
  }
]

Focus on the most impactful fixes first. Be specific with code examples.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    });

    // Parse AI response
    let suggestions: any[] = [];
    const content = response.content[0];
    if (content.type === 'text') {
      try {
        // Extract JSON from response
        const jsonMatch = content.text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          suggestions = JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error('Failed to parse AI suggestions:', parseError);
        suggestions = [{
          violationId: 'general',
          priority: 1,
          explanation: content.text,
          currentCode: '',
          fixedCode: '',
          additionalNotes: 'Raw AI response - manual review needed',
        }];
      }
    }

    // Save suggestions to database
    await db.updateAccessibilityAuditRemediation(parseInt(id), {
      ai_suggestions: suggestions,
      remediation_applied: false,
    });

    return NextResponse.json({
      success: true,
      suggestions,
      totalViolations: violations.length,
      fixesSuggested: suggestions.length,
    });
  } catch (error) {
    console.error('Error generating AI fixes:', error);
    return NextResponse.json(
      { error: 'Failed to generate accessibility fixes' },
      { status: 500 }
    );
  }
}
