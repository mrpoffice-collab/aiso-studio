import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

// GET - List tasks
export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.getUserByClerkId(clerkId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('lead_id');
    const status = searchParams.get('status');
    const includeCompleted = searchParams.get('include_completed') === 'true';

    const tasks = await db.getTasksByUserId(user.id, {
      lead_id: leadId ? parseInt(leadId) : undefined,
      status: status || undefined,
      include_completed: includeCompleted,
    });

    const stats = await db.getTaskStats(user.id);

    return NextResponse.json({ tasks, stats });
  } catch (error: any) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// POST - Create task
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.getUserByClerkId(clerkId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { title, description, lead_id, status, priority, due_date, tags } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const task = await db.createTask({
      user_id: user.id,
      lead_id: lead_id || undefined,
      title,
      description,
      status: status || 'todo',
      priority: priority || 'medium',
      due_date: due_date ? new Date(due_date) : undefined,
      tags: tags || [],
      is_auto_generated: false,
      source_type: 'manual',
    });

    return NextResponse.json({ task });
  } catch (error: any) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
