import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { db, query } from '@/lib/db';

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const items = await query(
      `SELECT
        fi.*,
        COUNT(fc.id) as comment_count
      FROM feedback_items fi
      LEFT JOIN feedback_comments fc ON fi.id = fc.item_id
      GROUP BY fi.id
      ORDER BY fi.created_at DESC`,
      []
    );

    return NextResponse.json({ items });
  } catch (error: any) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await db.getUserByClerkId(user.id);
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { title, description, type, priority, screenshots } = body;

    if (!title || !type) {
      return NextResponse.json(
        { error: 'Title and type are required' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO feedback_items (user_id, title, description, type, priority, screenshots)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        dbUser.id,
        title,
        description || null,
        type,
        priority || 'medium',
        JSON.stringify(screenshots || [])
      ]
    );

    return NextResponse.json({ item: result[0] }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating feedback:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
