import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@foodmart/shared';
import { useRealtimeStore } from '../stores/realtimeStore';
import { useEffect } from 'react';

export function useQueue(branchId: string | null) {
  const queryClient = useQueryClient();
  const lastQueueUpdate = useRealtimeStore((s) => s.lastQueueUpdate);

  const query = useQuery({
    queryKey: ['queue', branchId],
    queryFn: async () => {
      const res: any = await api.get(`/queue/${branchId}`);
      return res.success ? res.data : [];
    },
    enabled: !!branchId,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (lastQueueUpdate && branchId) {
      queryClient.invalidateQueries({ queryKey: ['queue', branchId] });
    }
  }, [lastQueueUpdate, branchId, queryClient]);

  return query;
}
