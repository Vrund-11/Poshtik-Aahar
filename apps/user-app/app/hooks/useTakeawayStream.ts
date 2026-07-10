import { useEffect } from 'react';
import { useRealtimeStore } from '../stores/realtimeStore';
import { TAKEAWAY_EVENTS, getCookie } from '@foodmart/shared';

const SSE_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Opens an SSE connection to /sse/takeaway/:orderId.
 * Feeds status updates into Zustand realtimeStore.
 */
export function useTakeawayStream(orderId: string | null) {
  const updateOrderStatus = useRealtimeStore((s) => s.updateOrderStatus);

  useEffect(() => {
    if (!orderId) return;

    const token = getCookie('foodmood_token');
    const url = `${SSE_BASE}/sse/takeaway/${orderId}?token=${token || ''}`;
    const es = new EventSource(url);

    es.addEventListener(TAKEAWAY_EVENTS.ORDER_STATUS_UPDATED, (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        if (data.status) {
          updateOrderStatus(orderId, data.status);
        }
      } catch { /* skip malformed */ }
    });

    es.addEventListener(TAKEAWAY_EVENTS.ORDER_CONFIRMED, () => {
      updateOrderStatus(orderId, 'CONFIRMED');
    });

    es.addEventListener(TAKEAWAY_EVENTS.ORDER_CANCELLED, () => {
      updateOrderStatus(orderId, 'CANCELLED');
    });

    es.addEventListener(TAKEAWAY_EVENTS.ORDER_COMPLETE, () => {
      updateOrderStatus(orderId, 'PICKED_UP');
      es.close();
    });

    es.onerror = () => {
      console.warn('[SSE] Takeaway stream error — will auto-reconnect');
    };

    return () => {
      es.close();
    };
  }, [orderId, updateOrderStatus]);
}
