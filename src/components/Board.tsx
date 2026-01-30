'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Column } from './Column';
import type { Column as ColumnType, Card } from '@/lib/types';

export function Board() {
  const [boardId, setBoardId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Get board ID
  useEffect(() => {
    const fetchBoard = async () => {
      const { data } = await supabase.from('boards').select('id').limit(1);
      if (data && (data as any).length > 0) {
        setBoardId((data as any)[0].id);
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

  // Subscribe to real-time updates
  useEffect(() => {
    if (!boardId) return;

    const subscription = supabase
      .channel('cards_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cards' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['cards', boardId] });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [boardId, queryClient]);

  if (isLoading) {
    return <div>Loading board...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {(columns as ColumnType[]).map((column) => (
        <Column
          key={column.id}
          column={column}
          cards={(cards as Card[]).filter((c) => c.column_id === column.id)}
        />
      ))}
    </div>
  );
}
