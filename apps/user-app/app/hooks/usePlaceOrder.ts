import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, api } from '@foodmart/shared';
import { useCartStore } from '../stores/cartStore';

export function usePlaceOrder(sessionId: string | null) {
  const queryClient = useQueryClient();
  const clearCart = useCartStore((s) => s.clearCart);

  return useMutation({
    mutationFn: (orderData: {
      sessionId: string;
      items: Array<{
        menuItemId: string;
        quantity: number;
        notes?: string;
        selectedModifiers: any[];
      }>;
      notes?: string;
    }) => api.post<any>('/orders', orderData),
    onSuccess: () => {
      if (sessionId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.sessionOrders(sessionId),
        });
      }
      clearCart();
    },
  });
}
