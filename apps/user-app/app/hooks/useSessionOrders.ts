import { useQuery } from '@tanstack/react-query';
import { queryKeys, api } from '@foodmart/shared';

/**
 * Fetches orders for the active dine-in session.
 * staleTime: 0 — always fresh, invalidated by usePlaceOrder mutation.
 */
export function useSessionOrders(sessionId: string | null) {
  return useQuery({
    queryKey: queryKeys.sessionOrders(sessionId || ''),
    queryFn: async () => {
      const res: any = await api.get(`/sessions/${sessionId}`);
      if (res.success && res.data && res.data.orders) {
        return res.data.orders;
      }
      return [];
    },
    enabled: !!sessionId,
    staleTime: 0, // always refetch when invalidated
  });
}
