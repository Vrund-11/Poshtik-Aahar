import { useQuery } from '@tanstack/react-query';
import { queryKeys, api } from '@foodmart/shared';

export function useLoyalty(customerId: string | null) {
  return useQuery({
    queryKey: queryKeys.loyalty(customerId || ''),
    queryFn: async () => {
      const balanceRes: any = await api.get('/loyalty/balance');
      const historyRes: any = await api.get('/loyalty/history');
      return {
        balance: balanceRes.success ? balanceRes.data?.totalPoints || 0 : 0,
        transactions: historyRes.success ? historyRes.data?.transactions || [] : [],
      };
    },
    enabled: !!customerId,
    staleTime: 30000, // 30 seconds
  });
}
