import { create } from 'zustand';

// ─── Types ────────────────────────────────────
// SSE events write here. Components read from here.
// React Query is NOT involved in real-time updates.

interface RealtimeState {
  orderStatuses: Record<string, string>;  // orderId → latest status
  sessionStatus: string | null;
}

interface RealtimeActions {
  updateOrderStatus: (orderId: string, status: string) => void;
  setSessionStatus: (status: string) => void;
  reset: () => void;
}

// ─── Store ────────────────────────────────────
export const useRealtimeStore = create<RealtimeState & RealtimeActions>((set) => ({
  orderStatuses: {},
  sessionStatus: null,

  updateOrderStatus: (orderId, status) =>
    set((state) => ({
      orderStatuses: { ...state.orderStatuses, [orderId]: status },
    })),

  setSessionStatus: (status) => set({ sessionStatus: status }),

  reset: () => set({ orderStatuses: {}, sessionStatus: null }),
}));
