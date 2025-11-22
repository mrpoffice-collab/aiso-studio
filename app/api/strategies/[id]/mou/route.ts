import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { generateMOU, calculatePricing, getDeliveryTimeframe } from '@/lib/mou';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: strategyId } = await params;

    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await db.getUserByClerkId(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get strategy
    const strategy = await db.getStrategyById(strategyId);
    if (!strategy) {
      return NextResponse.json({ error: 'Strategy not found' }, { status: 404 });
    }

    // Verify ownership
    if (strategy.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse request body for selected topics and pricing
    const body = await request.json();
    const { selectedTopicIds, pricePerWord } = body;

    if (!selectedTopicIds || !Array.isArray(selectedTopicIds)) {
      return NextResponse.json(
        { error: 'selectedTopicIds array is required' },
        { status: 400 }
      );
    }

    // Get all topics for this strategy
    const allTopics = await db.getTopicsByStrategyId(strategyId);

    // Filter to only selected topics
    const selectedTopics = allTopics.filter((topic: any) =>
      selectedTopicIds.includes(topic.id)
    );

    if (selectedTopics.length === 0) {
      return NextResponse.json(
        { error: 'No valid topics selected' },
        { status: 400 }
      );
    }

    // Calculate pricing
    const pricing = calculatePricing(
      selectedTopics.map((t: any) => ({ wordCount: t.word_count })),
      pricePerWord || 0.10
    );

    // Get delivery timeframe
    const deliveryTimeframe = getDeliveryTimeframe(
      selectedTopics.length,
      strategy.frequency
    );

    // Get user branding for MOU
    const agencyBranding = await db.getUserBranding(user.id);

    // Generate MOU
    const mouContent = await generateMOU({
      clientName: strategy.client_name,
      industry: strategy.industry,
      targetAudience: strategy.target_audience,
      brandVoice: strategy.brand_voice,
      frequency: strategy.frequency,
      contentLength: strategy.content_length,
      selectedTopics: selectedTopics.map((t: any) => ({
        title: t.title,
        keyword: t.keyword,
        wordCount: t.word_count,
      })),
      totalWordCount: pricing.totalWordCount,
      pricePerWord: pricing.pricePerWord,
      totalPrice: pricing.totalPrice,
      deliveryTimeframe,
      agencyBranding: agencyBranding || undefined,
    });

    // Log MOU generation usage
    await db.logUsage({
      user_id: user.id,
      operation_type: 'mou_generation',
      cost_usd: 0.01, // Approximate cost for MOU generation
      tokens_used: 2000, // Estimated tokens
      metadata: {
        strategy_id: strategyId,
        topics_count: selectedTopics.length,
        total_word_count: pricing.totalWordCount,
        total_price: pricing.totalPrice,
      },
    });

    return NextResponse.json({
      success: true,
      mou: mouContent,
      pricing: {
        totalWordCount: pricing.totalWordCount,
        totalPrice: pricing.totalPrice,
        pricePerWord: pricing.pricePerWord,
      },
      deliveryTimeframe,
      topicsCount: selectedTopics.length,
      branding: agencyBranding, // Include branding in response for UI styling
    });
  } catch (error: any) {
    console.error('MOU generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate MOU' },
      { status: 500 }
    );
  }
}
