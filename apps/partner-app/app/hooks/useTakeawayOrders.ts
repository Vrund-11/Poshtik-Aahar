import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@foodmart/shared';
import { useRealtimeStore } from '../stores/realtimeStore';
import { useEffect } from 'react';

export function useTakeawayOrders(restaurantId: string | null) {
  const queryClient = useQueryClient();
  const lastOrderUpdate = useRealtimeStore((s) => s.lastOrderUpdate);

  const query = useQuery({
    queryKey: ['takeaway-orders', restaurantId],
    queryFn: async () => {
      const res: any = await api.get(`/takeaway/restaurant/${restaurantId}`);
      return res.success ? res.data : [];
    },
    enabled: !!restaurantId,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (lastOrderUpdate && restaurantId) {
      queryClient.invalidateQueries({ queryKey: ['takeaway-orders', restaurantId] });
    }
  }, [lastOrderUpdate, restaurantId, queryClient]);

  return query;
}
