import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  testWordPressConnection,
  fetchWordPressCategories,
  fetchWordPressAuthors,
} from '@/lib/wordpress-client';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { url, username, appPassword, mockMode } = body;

    if (!url || !username || !appPassword) {
      return NextResponse.json(
        { error: 'Missing required fields: url, username, appPassword' },
        { status: 400 }
      );
    }

    // Test the connection
    const connectionResult = await testWordPressConnection({
      url,
      username,
      appPassword,
      mockMode: mockMode ?? false,
    });

    if (!connectionResult.success) {
      return NextResponse.json({
        success: false,
        error: connectionResult.error,
        mockMode: connectionResult.mockMode,
      });
    }

    // If connection successful, also fetch categories and authors
    const [categories, authors] = await Promise.all([
      fetchWordPressCategories({ url, username, appPassword, mockMode }),
      fetchWordPressAuthors({ url, username, appPassword, mockMode }),
    ]);

    return NextResponse.json({
      success: true,
      siteTitle: connectionResult.siteTitle,
      siteUrl: connectionResult.siteUrl,
      userName: connectionResult.userName,
      categories,
      authors,
      mockMode: connectionResult.mockMode,
    });
  } catch (error: any) {
    console.error('WordPress connection test error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
