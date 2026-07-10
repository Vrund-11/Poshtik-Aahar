import { useQuery } from '@tanstack/react-query';
import { queryKeys, api } from '@foodmart/shared';

/**
 * Fetches restaurant menu. Cached for 1 hour — menu rarely changes during a session.
 */
export function useMenu(restaurantId: string | null) {
  return useQuery({
    queryKey: queryKeys.menu(restaurantId || ''),
    queryFn: () => api.get<any>(`/menus/${restaurantId}/menu`),
    enabled: !!restaurantId,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}
