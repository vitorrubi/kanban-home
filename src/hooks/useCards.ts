import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Card } from '@/lib/types';

export function useCards(boardId?: string) {
  return useQuery({
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
}

export function useMoveCard() {
  return useMutation({
    mutationFn: async ({
      cardId,
      newColumnId,
      oldColumnId,
    }: {
      cardId: string;
      newColumnId: string;
      oldColumnId: string;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('Not authenticated');

      const { error } = await (supabase.from('cards') as any)
        .update({ column_id: newColumnId } as any)
        .eq('id', cardId);

      if (error) throw error;

      await supabase.from('card_history').insert([
        {
          card_id: cardId,
          user_id: user.id,
          user_email: user.email || '',
          action: 'moved',
          from_column_id: oldColumnId,
          to_column_id: newColumnId,
        },
      ] as any);
    },
  });
}
