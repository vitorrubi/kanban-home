import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is member of organization
    const { data: member, error: memberError } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', orgId)
      .eq('user_id', user.id)
      .single();

    if (memberError || !member) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { title } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Board title is required' },
        { status: 400 }
      );
    }

    // Create board
    const { data: board, error: boardError } = await supabase
      .from('boards')
      .insert([
        {
          organization_id: orgId,
          title,
        },
      ])
      .select()
      .single();

    if (boardError) throw boardError;

    // Create default columns: To Do, Doing, Done
    const columns = [
      { board_id: board.id, title: 'To Do', position: 0 },
      { board_id: board.id, title: 'Doing', position: 1 },
      { board_id: board.id, title: 'Done', position: 2 },
    ];

    const { error: columnsError } = await supabase
      .from('columns')
      .insert(columns);

    if (columnsError) throw columnsError;

    return NextResponse.json(board);
  } catch (error) {
    console.error('Error creating board:', error);
    return NextResponse.json(
      { error: 'Failed to create board' },
      { status: 500 }
    );
  }
}
