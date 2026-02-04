'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Column } from './Column';
import type { Column as ColumnType, Card } from '@/lib/types';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import { computeReorder } from '@/lib/reorder';

export function Board() {
  const router = useRouter();
  const [boardId, setBoardId] = useState<string | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Get board ID from URL or params
  useEffect(() => {
    const fetchBoard = async () => {
      // If we're in /dashboard/organizations/[orgId]/boards/[boardId]
      const pathParts = window.location.pathname.split('/');
      const boardIndex = pathParts.indexOf('boards');
      if (boardIndex > 0 && pathParts[boardIndex + 1]) {
        const bid = pathParts[boardIndex + 1];
        const oid = pathParts[pathParts.indexOf('organizations') + 1];
        setBoardId(bid);
        setOrgId(oid);
        return;
      }

      // Otherwise get default board for user
      const { data } = await supabase.from('boards').select('id').limit(1);
      if (data && data.length > 0) {
        setBoardId(data[0].id);
      }
    };
    fetchBoard();
  }, []);

  // Fetch columns and cards
  const { data: columns = [], isLoading } = useQuery({
    queryKey: ['columns', boardId],
    queryFn: async () => {
      if (!boardId) return [];
      const { data } = await supabase
        .from('columns')
        .select('*')
        .eq('board_id', boardId)
        .order('position', { ascending: true });
      return data || [];
    },
    enabled: !!boardId,
  });

  const { data: cards = [] } = useQuery({
    queryKey: ['cards', boardId],
    queryFn: async () => {
      if (!boardId) return [];
      const { data } = await supabase
        .from('cards')
        .select('*')
        .eq('board_id', boardId)
        .order('position', { ascending: true });
      return data || [];
    },
    enabled: !!boardId,
  });

  // Build container -> item mapping for dnd-kit
  const containers: Record<string, string[]> = {};
  (columns as ColumnType[]).forEach((col) => {
    containers[col.id] = (cards as Card[])
      .filter((c) => c.column_id === col.id)
      .map((c) => `card-${c.id}`);
  });

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    // derive active card id and destination column id
    const activeCardId = activeId.replace('card-', '');

    let destColumnId: string | null = null;
    if (overId.startsWith('card-')) {
      const overCardId = overId.replace('card-', '');
      const overCard = (cards as Card[]).find((c) => c.id === overCardId);
      destColumnId = overCard ? overCard.column_id : null;
    } else if (overId.startsWith('column-')) {
      destColumnId = overId.replace('column-', '');
    }

    if (!destColumnId) return;

    const activeCard = (cards as Card[]).find((c) => c.id === activeCardId);
    if (!activeCard) return;

    const srcColumnId = activeCard.column_id;
    // compute necessary updates for positions and columns
    console.log('[dnd] dragEnd active:', activeId, 'over:', overId);
    const updates = computeReorder(cards as Card[], activeCardId, overId);
    if (!updates || Object.keys(updates).length === 0) return;

    // optimistic update: apply set of updates locally
    queryClient.setQueryData(['cards', boardId], (old: any) => {
      if (!old) return old;
      const map = updates;
      return (old as Card[]).map((c) => {
        if (map[c.id]) {
          return { ...c, column_id: map[c.id].column_id, position: map[c.id].position };
        }
        return c;
      });
    });

    // persist all updates
    try {
      const promises: Promise<any>[] = [];
      for (const [cardId, change] of Object.entries(updates)) {
        // cast builder to Promise to satisfy TypeScript (builder is thenable at runtime)
        promises.push(
          (supabase.from('cards').update({ column_id: change.column_id, position: change.position }).eq('id', cardId) as unknown) as Promise<any>
        );
      }
      await Promise.all(promises);

      // add history entry for moved card if column changed, otherwise 'reordered'
      const movedTo = updates[activeCardId]?.column_id;
      const action = movedTo && movedTo !== srcColumnId ? 'moved' : 'reordered';
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('card_history').insert([
          {
            card_id: activeCardId,
            user_id: user.id,
            user_email: user.email || '',
            action,
            from_column_id: srcColumnId,
            to_column_id: updates[activeCardId]?.column_id || srcColumnId,
          },
        ]);
      }
    } catch (e) {
      queryClient.invalidateQueries({ queryKey: ['cards', boardId] });
    } finally {
      queryClient.invalidateQueries({ queryKey: ['cards', boardId] });
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const activeCardId = activeId.replace('card-', '');

    // compute tentative updates and apply locally for visual feedback
    console.log('[dnd] dragOver active:', activeId, 'over:', overId);
    const updates = computeReorder(cards as Card[], activeCardId, overId);
    if (!updates || Object.keys(updates).length === 0) return;

    queryClient.setQueryData(['cards', boardId], (old: any) => {
      if (!old) return old;
      const map = updates;
      return (old as Card[]).map((c) => {
        if (map[c.id]) {
          return { ...c, column_id: map[c.id].column_id, position: map[c.id].position };
        }
        return c;
      });
    });
  };

  if (isLoading) {
    return <div>Carregando quadro...</div>;
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} onDragOver={handleDragOver}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(columns as ColumnType[]).map((column) => (
          <Column
            key={column.id}
            column={column}
            cards={(cards as Card[]).filter((c) => c.column_id === column.id)}
          />
        ))}
      </div>
    </DndContext>
  );
}

  // Get board ID
  useEffect(() => {
    const fetchBoard = async () => {
      const { data } = await supabase.from('boards').select('id').limit(1);
      if (data && data.length > 0) {
        setBoardId(data[0].id);
      }
    };
    fetchBoard();
  }, []);

  // Fetch columns and cards
  const { data: columns = [], isLoading } = useQuery({
    queryKey: ['columns', boardId],
    queryFn: async () => {
      if (!boardId) return [];
      const { data } = await supabase
        .from('columns')
        .select('*')
        .eq('board_id', boardId)
        .order('position', { ascending: true });
      return data || [];
    },
    enabled: !!boardId,
  });

  const { data: cards = [] } = useQuery({
    queryKey: ['cards', boardId],
    queryFn: async () => {
      if (!boardId) return [];
      const { data } = await supabase
        .from('cards')
        .select('*')
        .eq('board_id', boardId)
        .order('position', { ascending: true });
      return data || [];
    },
    enabled: !!boardId,
  });

  // Build container -> item mapping for dnd-kit
  const containers: Record<string, string[]> = {};
  (columns as ColumnType[]).forEach((col) => {
    containers[col.id] = (cards as Card[])
      .filter((c) => c.column_id === col.id)
      .map((c) => `card-${c.id}`);
  });

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    // derive active card id and destination column id
    const activeCardId = activeId.replace('card-', '');

    let destColumnId: string | null = null;
    if (overId.startsWith('card-')) {
      const overCardId = overId.replace('card-', '');
      const overCard = (cards as Card[]).find((c) => c.id === overCardId);
      destColumnId = overCard ? overCard.column_id : null;
    } else if (overId.startsWith('column-')) {
      destColumnId = overId.replace('column-', '');
    }

    if (!destColumnId) return;

    const activeCard = (cards as Card[]).find((c) => c.id === activeCardId);
    if (!activeCard) return;

    const srcColumnId = activeCard.column_id;
    // compute necessary updates for positions and columns
    console.log('[dnd] dragEnd active:', activeId, 'over:', overId);
    const updates = computeReorder(cards as Card[], activeCardId, overId);
    if (!updates || Object.keys(updates).length === 0) return;

    // optimistic update: apply set of updates locally
    queryClient.setQueryData(['cards', boardId], (old: any) => {
      if (!old) return old;
      const map = updates;
      return (old as Card[]).map((c) => {
        if (map[c.id]) {
          return { ...c, column_id: map[c.id].column_id, position: map[c.id].position };
        }
        return c;
      });
    });

    // persist all updates
    try {
      const promises: Promise<any>[] = [];
      for (const [cardId, change] of Object.entries(updates)) {
        // cast builder to Promise to satisfy TypeScript (builder is thenable at runtime)
        promises.push(
          (supabase.from('cards').update({ column_id: change.column_id, position: change.position }).eq('id', cardId) as unknown) as Promise<any>
        );
      }
      await Promise.all(promises);

      // add history entry for moved card if column changed, otherwise 'reordered'
      const movedTo = updates[activeCardId]?.column_id;
      const action = movedTo && movedTo !== srcColumnId ? 'moved' : 'reordered';
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('card_history').insert([
          {
            card_id: activeCardId,
            user_id: user.id,
            user_email: user.email || '',
            action,
            from_column_id: srcColumnId,
            to_column_id: updates[activeCardId]?.column_id || srcColumnId,
          },
        ]);
      }
    } catch (e) {
      queryClient.invalidateQueries({ queryKey: ['cards', boardId] });
    } finally {
      queryClient.invalidateQueries({ queryKey: ['cards', boardId] });
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const activeCardId = activeId.replace('card-', '');

    // compute tentative updates and apply locally for visual feedback
    console.log('[dnd] dragOver active:', activeId, 'over:', overId);
    const updates = computeReorder(cards as Card[], activeCardId, overId);
    if (!updates || Object.keys(updates).length === 0) return;

    queryClient.setQueryData(['cards', boardId], (old: any) => {
      if (!old) return old;
      const map = updates;
      return (old as Card[]).map((c) => {
        if (map[c.id]) {
          return { ...c, column_id: map[c.id].column_id, position: map[c.id].position };
        }
        return c;
      });
    });
  };

  if (isLoading) {
    return <div>Loading board...</div>;
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} onDragOver={handleDragOver}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(columns as ColumnType[]).map((column) => (
          <Column
            key={column.id}
            column={column}
            cards={(cards as Card[]).filter((c) => c.column_id === column.id)}
          />
        ))}
      </div>
    </DndContext>
  );
}
