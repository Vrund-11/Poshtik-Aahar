import { useQuery } from '@tanstack/react-query';
import { queryKeys, api } from '@foodmart/shared';

/**
 * Fetches all active restaurants. Cached aggressively (6 hours).
 */
export function useRestaurants() {
  return useQuery({
    queryKey: queryKeys.restaurants(),
    queryFn: async () => {
      const res: any = await api.get('/restaurants');
      if (res.success && res.data) {
        return res.data;
      }
      return [];
    },
    staleTime: 6 * 60 * 60 * 1000, // 6 hours
  });
}

/**
 * Fetches details of a specific restaurant. Cached for 1 hour.
 */
export function useRestaurant(restaurantId: string | null) {
  return useQuery({
    queryKey: queryKeys.restaurant(restaurantId || ''),
    queryFn: async () => {
      const res: any = await api.get(`/restaurants/${restaurantId}`);
      if (res.success && res.data) {
        return res.data;
      }
      return null;
    },
    enabled: !!restaurantId,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}
