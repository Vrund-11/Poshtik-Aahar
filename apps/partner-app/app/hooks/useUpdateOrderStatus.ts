import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@foodmart/shared';

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const res: any = await api.patch(`/orders/${orderId}/status`, { status });
      if (!res.success) {
        throw new Error(res.message || 'Failed to update order status');
      }
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['kitchen-orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
    },
  });
}
