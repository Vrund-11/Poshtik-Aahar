import { useQuery } from '@tanstack/react-query';
import { queryKeys, api } from '@foodmart/shared';

export function useOrderHistory(customerId: string | null) {
  return useQuery({
    queryKey: queryKeys.orderHistory(customerId || ''),
    queryFn: async () => {
      const res: any = await api.get('/orders/history');
      if (res.success && res.data) {
        return res.data;
      }
      return [];
    },
    enabled: !!customerId,
    staleTime: 60000, // 1 minute
  });
}
