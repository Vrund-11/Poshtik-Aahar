import { create } from 'zustand';

interface RealtimeState {
  lastOrderUpdate: number;
  lastTableUpdate: number;
  lastReservationUpdate: number;
  lastQueueUpdate: number;
}

interface RealtimeActions {
  notifyOrderUpdate: () => void;
  notifyTableUpdate: () => void;
  notifyReservationUpdate: () => void;
  notifyQueueUpdate: () => void;
  reset: () => void;
}

export const useRealtimeStore = create<RealtimeState & RealtimeActions>((set) => ({
  lastOrderUpdate: 0,
  lastTableUpdate: 0,
  lastReservationUpdate: 0,
  lastQueueUpdate: 0,

  notifyOrderUpdate: () => set({ lastOrderUpdate: Date.now() }),
  notifyTableUpdate: () => set({ lastTableUpdate: Date.now() }),
  notifyReservationUpdate: () => set({ lastReservationUpdate: Date.now() }),
  notifyQueueUpdate: () => set({ lastQueueUpdate: Date.now() }),

  reset: () => set({
    lastOrderUpdate: 0,
    lastTableUpdate: 0,
    lastReservationUpdate: 0,
    lastQueueUpdate: 0,
  }),
}));
