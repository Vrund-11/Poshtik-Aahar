import { useEffect } from 'react';
import { useRealtimeStore } from '../stores/realtimeStore';
import { TABLE_EVENTS, getCookie } from '@foodmart/shared';

const SSE_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Opens an SSE connection to /sse/table/:sessionId.
 * Feeds all incoming events directly into Zustand realtimeStore.
 */
export function useTableStream(
  sessionId: string | null,
  onConnectionChange?: (connected: boolean) => void
) {
  const updateOrderStatus = useRealtimeStore((s) => s.updateOrderStatus);
  const setSessionStatus = useRealtimeStore((s) => s.setSessionStatus);

  useEffect(() => {
    if (!sessionId) return;

    const token = getCookie('foodmood_token');
    const url = `${SSE_BASE}/sse/table/${sessionId}?token=${token || ''}`;
    const es = new EventSource(url);

    es.onopen = () => {
      if (onConnectionChange) onConnectionChange(true);
    };

    // Order lifecycle events → update individual order status
    const orderEvents = [
      TABLE_EVENTS.ORDER_RECEIVED,
      TABLE_EVENTS.ORDER_PREPARING,
      TABLE_EVENTS.ORDER_READY,
      TABLE_EVENTS.ORDER_SERVED,
      TABLE_EVENTS.ORDER_DELIVERED,
      TABLE_EVENTS.ORDER_STATUS_UPDATED,
    ];

    orderEvents.forEach((eventName) => {
      es.addEventListener(eventName, (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          if (data.orderId && data.status) {
            updateOrderStatus(data.orderId, data.status);
          } else if (data.orderId) {
            const statusMap: Record<string, string> = {
              [TABLE_EVENTS.ORDER_RECEIVED]: 'RECEIVED',
              [TABLE_EVENTS.ORDER_PREPARING]: 'PREPARING',
              [TABLE_EVENTS.ORDER_READY]: 'READY',
              [TABLE_EVENTS.ORDER_SERVED]: 'SERVED',
              [TABLE_EVENTS.ORDER_DELIVERED]: 'DELIVERED',
            };
            if (statusMap[eventName]) {
              updateOrderStatus(data.orderId, statusMap[eventName]);
            }
          }
        } catch {
          // Malformed event data
        }
      });
    });

    // Session lifecycle events
    es.addEventListener(TABLE_EVENTS.BILL_GENERATED, () => {
      setSessionStatus('BILL_REQUESTED');
    });

    es.addEventListener(TABLE_EVENTS.PAYMENT_CONFIRMED, () => {
      setSessionStatus('CLOSED');
    });

    es.addEventListener(TABLE_EVENTS.SESSION_CLOSED, () => {
      setSessionStatus('CLOSED');
      es.close();
    });

    es.onerror = () => {
      if (onConnectionChange) onConnectionChange(false);
      console.warn('[SSE] Table stream error — will auto-reconnect');
    };

    return () => {
      es.close();
      if (onConnectionChange) onConnectionChange(false);
    };
  }, [sessionId, updateOrderStatus, setSessionStatus, onConnectionChange]);
}
