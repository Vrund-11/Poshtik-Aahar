import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@foodmart/shared';
import { useRealtimeStore } from '../stores/realtimeStore';
import { useEffect } from 'react';

export function useKitchenOrders(restaurantId: string | null) {
  const queryClient = useQueryClient();
  const lastOrderUpdate = useRealtimeStore((s) => s.lastOrderUpdate);

  const query = useQuery({
    queryKey: ['kitchen-orders', restaurantId],
    queryFn: async () => {
      const res: any = await api.get(`/orders/restaurant/${restaurantId}`);
      return res.success ? res.data : [];
    },
    enabled: !!restaurantId,
    staleTime: Infinity,
  });

  // Sync cache with SSE notifications
  useEffect(() => {
    if (lastOrderUpdate && restaurantId) {
      queryClient.invalidateQueries({ queryKey: ['kitchen-orders', restaurantId] });
    }
  }, [lastOrderUpdate, restaurantId, queryClient]);

  return query;
}
