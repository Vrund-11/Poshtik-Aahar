import { useEffect } from 'react';
import { useRealtimeStore } from '../stores/realtimeStore';
import { getCookie } from '@foodmart/shared';

const SSE_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export function useRestaurantStream(restaurantId: string | null) {
  const {
    notifyOrderUpdate,
    notifyTableUpdate,
    notifyReservationUpdate,
    notifyQueueUpdate,
  } = useRealtimeStore();

  useEffect(() => {
    if (!restaurantId) return;

    const token = getCookie('staff_token');
    const url = `${SSE_BASE}/sse/restaurant/${restaurantId}?token=${token || ''}`;
    const es = new EventSource(url);

    es.onopen = () => {
      console.log(`[SSE] Connected to restaurant stream: ${restaurantId}`);
    };

    // Live order updates
    es.addEventListener('NEW_ORDER', () => {
      console.log('[SSE] New order received');
      notifyOrderUpdate();
    });

    es.addEventListener('ORDER_STATUS_UPDATED', () => {
      console.log('[SSE] Order status updated');
      notifyOrderUpdate();
    });

    es.addEventListener('NEW_TAKEAWAY', () => {
      console.log('[SSE] New takeaway order received');
      notifyOrderUpdate();
    });

    // Live table updates
    es.addEventListener('TABLE_SEATED', () => {
      console.log('[SSE] Table seated event');
      notifyTableUpdate();
    });

    es.addEventListener('BILL_REQUESTED', () => {
      console.log('[SSE] Table bill requested');
      notifyTableUpdate();
    });

    es.addEventListener('PAYMENT_PENDING_CONFIRMATION', () => {
      console.log('[SSE] Table payment pending confirmation');
      notifyTableUpdate();
    });

    es.addEventListener('TABLE_COMPLETED', () => {
      console.log('[SSE] Table completed');
      notifyTableUpdate();
    });

    // Live reservation updates
    es.addEventListener('NEW_RESERVATION', () => {
      console.log('[SSE] New reservation received');
      notifyReservationUpdate();
    });

    es.addEventListener('RESERVATION_STATUS_CHANGED', () => {
      console.log('[SSE] Reservation status changed');
      notifyReservationUpdate();
    });

    // Live queue updates
    es.addEventListener('QUEUE_UPDATE', () => {
      console.log('[SSE] Queue update event');
      notifyQueueUpdate();
    });

    es.onerror = () => {
      console.warn('[SSE] Restaurant stream error — will auto-reconnect');
    };

    return () => {
      es.close();
    };
  }, [restaurantId, notifyOrderUpdate, notifyTableUpdate, notifyReservationUpdate, notifyQueueUpdate]);
}
