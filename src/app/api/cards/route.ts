import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data } = await supabase.from('cards').select('*');
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch cards' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, due_date, column_id, board_id, position } =
      body;

    const { data: newCard, error } = await supabase
      .from('cards')
      .insert([
        {
          title,
          description,
          due_date,
          column_id,
          board_id,
          position: position || 0,
        },
      ] as any)
      .select()
      .single();

    if (error) throw error;

    // Log history
    await supabase.from('card_history').insert([
      {
        card_id: (newCard as any).id,
        user_id: user.id,
        user_email: user.email || '',
        action: 'created',
        to_column_id: column_id,
      },
    ] as any);

    return NextResponse.json(newCard);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create card' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { id, column_id, from_column_id, title, description, due_date, position } = body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (due_date !== undefined) updateData.due_date = due_date;
    if (position !== undefined) updateData.position = position;
    if (column_id !== undefined) updateData.column_id = column_id;

    const { data: updatedCard, error } = (await (supabase
      .from('cards') as any)
      .update(updateData)
      .eq('id', id)
      .select()
      .single()) as any;

    if (error) throw error;

    // Log history if column changed
    if (column_id && from_column_id !== column_id) {
      await supabase.from('card_history').insert([
        {
          card_id: id,
          user_id: user.id,
          user_email: user.email || '',
          action: 'moved',
          from_column_id,
          to_column_id: column_id,
        },
      ] as any);
    }

    return NextResponse.json(updatedCard as any);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update card' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get('id');

    if (!cardId) {
      return NextResponse.json(
        { error: 'Card ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase.from('cards').delete().eq('id', cardId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete card' },
      { status: 500 }
    );
  }
}
