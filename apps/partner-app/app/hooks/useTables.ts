import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@foodmart/shared';
import { useRealtimeStore } from '../stores/realtimeStore';
import { useEffect } from 'react';

export function useTables(floorId: string | null) {
  const queryClient = useQueryClient();
  const lastTableUpdate = useRealtimeStore((s) => s.lastTableUpdate);

  const query = useQuery({
    queryKey: ['tables-layout', floorId],
    queryFn: async () => {
      const res: any = await api.get(`/owner/floors/${floorId}/tables`);
      return res.success ? res.data : [];
    },
    enabled: !!floorId,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (lastTableUpdate && floorId) {
      queryClient.invalidateQueries({ queryKey: ['tables-layout', floorId] });
    }
  }, [lastTableUpdate, floorId, queryClient]);

  return query;
}
