import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useHistory(cardId?: string) {
  return useQuery({
    queryKey: ['history', cardId],
    queryFn: async () => {
      if (!cardId) return [];
      const { data } = await supabase
        .from('card_history')
        .select('*')
        .eq('card_id', cardId)
        .order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!cardId,
  });
}
