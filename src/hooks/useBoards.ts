import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useBoards() {
  return useQuery({
    queryKey: ['boards'],
    queryFn: async () => {
      const { data } = await supabase.from('boards').select('*');
      return data || [];
    },
  });
}
