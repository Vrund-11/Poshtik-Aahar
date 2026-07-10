import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@foodmart/shared';

// ─── Types ────────────────────────────────────
export interface TableSession {
  id: string;
  tableId: string;
  tableNumber: number;
  restaurantId: string;
  restaurantName: string;
  verificationCodes: number[];
  status: string;
}

interface SessionState {
  activeSession: TableSession | null;
  loading: boolean;
}

interface SessionActions {
  hydrate: () => Promise<void>;
  initiateSession: (qrCode: string) => Promise<TableSession>;
  verifySession: (sessionId: string, code: number) => Promise<void>;
  requestBill: () => Promise<any>;
  claimPayment: (method: 'CASH' | 'UPI') => Promise<any>;
  clearSession: () => void;
  refreshSession: () => Promise<void>;
}

// ─── Store ────────────────────────────────────
export const useSessionStore = create<SessionState & SessionActions>()(
  persist(
    (set, get) => ({
      activeSession: null,
      loading: true,

      hydrate: async () => {
        const { activeSession } = get();
        if (activeSession) {
          try {
            const res: any = await api.get(`/sessions/${activeSession.id}`);
            if (res.success && res.data) {
              set({
                activeSession: {
                  id: res.data.id,
                  tableId: res.data.tableId,
                  tableNumber: res.data.table?.number ?? activeSession.tableNumber,
                  restaurantId: res.data.table?.floor?.branch?.restaurantId ?? activeSession.restaurantId,
                  restaurantName: res.data.table?.floor?.branch?.restaurant?.name ?? activeSession.restaurantName,
                  verificationCodes: activeSession.verificationCodes,
                  status: res.data.status,
                },
                loading: false,
              });
              return;
            }
          } catch {
            // Session gone or error — clear
          }
          set({ activeSession: null, loading: false });
        } else {
          set({ loading: false });
        }
      },

      initiateSession: async (qrCode) => {
        const res: any = await api.post('/sessions/initiate', { qrCode });
        if (res.success && res.data) {
          const session: TableSession = {
            id: res.data.session.id,
            tableId: res.data.session.tableId,
            tableNumber: res.data.tableNumber,
            restaurantId: res.data.restaurantId,
            restaurantName: res.data.restaurantName,
            verificationCodes: res.data.verificationCodes,
            status: res.data.session.status,
          };
          set({ activeSession: session });
          return session;
        }
        throw new Error(res.message || 'Failed to initiate table session');
      },

      verifySession: async (sessionId, code) => {
        const res: any = await api.post('/sessions/verify', { sessionId, verifyCode: String(code) });
        if (res.success) {
          const { activeSession } = get();
          if (activeSession) {
            set({ activeSession: { ...activeSession, status: 'ACTIVE' } });
          }
        } else {
          throw new Error(res.message || 'Verification failed');
        }
      },

      requestBill: async () => {
        const { activeSession } = get();
        if (!activeSession) throw new Error('No active dine-in session');
        const res: any = await api.post(`/sessions/${activeSession.id}/request-bill`);
        if (res.success) {
          set({ activeSession: { ...activeSession, status: 'BILL_REQUESTED' } });
          return res.data;
        }
        throw new Error(res.message || 'Failed to request bill');
      },

      claimPayment: async (method) => {
        const { activeSession } = get();
        if (!activeSession) throw new Error('No active dine-in session');
        const res: any = await api.post(`/sessions/${activeSession.id}/paid`, { method });
        if (res.success) {
          set({ activeSession: { ...activeSession, status: 'PAID' } });
          return res.data;
        }
        throw new Error(res.message || 'Failed to claim payment');
      },

      clearSession: () => set({ activeSession: null }),

      refreshSession: async () => {
        const { activeSession } = get();
        if (!activeSession) return;
        try {
          const res: any = await api.get(`/sessions/${activeSession.id}`);
          if (res.success && res.data) {
            set({ activeSession: { ...activeSession, status: res.data.status } });
          }
        } catch (err) {
          console.error('Failed to refresh session status', err);
        }
      },
    }),
    {
      name: 'foodmood_dinein_session',
      partialize: (state) => ({
        activeSession: state.activeSession,
      }),
    }
  )
);
