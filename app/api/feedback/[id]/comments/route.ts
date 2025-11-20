import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const comments = await db.query(
      `SELECT fc.*, u.email as user_email
       FROM feedback_comments fc
       JOIN users u ON fc.user_id = u.id
       WHERE fc.item_id = $1
       ORDER BY fc.created_at ASC`,
      [params.id]
    );

    return NextResponse.json({ comments });
  } catch (error: any) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    const { comment } = body;

    if (!comment || !comment.trim()) {
      return NextResponse.json(
        { error: 'Comment is required' },
        { status: 400 }
      );
    }

    const result = await db.query(
      `INSERT INTO feedback_comments (item_id, user_id, comment)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [params.id, dbUser.id, comment]
    );

    return NextResponse.json({ comment: result[0] }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating comment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
