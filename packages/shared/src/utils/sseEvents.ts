// Type-safe SSE event names matching docs/appflow.md lines 539-564.
// These are the exact event names the backend publishes via sse.controller.ts.

// ─── Table Session Stream (Customer Side) ─────
// Endpoint: GET /sse/table/:sessionId
export const TABLE_EVENTS = {
  CONNECTED:            'CONNECTED',
  ORDER_RECEIVED:       'ORDER_RECEIVED',
  ORDER_PREPARING:      'ORDER_PREPARING',
  ORDER_READY:          'ORDER_READY',
  ORDER_SERVED:         'ORDER_SERVED',
  ORDER_DELIVERED:      'ORDER_DELIVERED',
  ORDER_STATUS_UPDATED: 'ORDER_STATUS_UPDATED',
  BILL_GENERATED:       'BILL_GENERATED',
  PAYMENT_CONFIRMED:    'PAYMENT_CONFIRMED',
  SESSION_CLOSED:       'SESSION_CLOSED',
} as const;

// ─── Restaurant Stream (Staff Side) ───────────
// Endpoint: GET /sse/restaurant/:restaurantId
export const RESTAURANT_EVENTS = {
  CONNECTED:            'CONNECTED',
  TABLE_VERIFIED:       'TABLE_VERIFIED',
  TABLE_STATE_CHANGED:  'TABLE_STATE_CHANGED',
  NEW_ORDER:            'NEW_ORDER',
  ORDER_STATUS_UPDATED: 'ORDER_STATUS_UPDATED',
  BILL_REQUESTED:       'BILL_REQUESTED',
  PAYMENT_RECEIVED:     'PAYMENT_RECEIVED',
  TABLE_CLOSED:         'TABLE_CLOSED',
  NEW_RESERVATION:      'NEW_RESERVATION',
  QUEUE_UPDATED:        'QUEUE_UPDATED',
} as const;

// ─── Takeaway Stream (Customer Side) ──────────
// Endpoint: GET /sse/takeaway/:orderId
export const TAKEAWAY_EVENTS = {
  CONNECTED:            'CONNECTED',
  ORDER_STATUS_UPDATED: 'ORDER_STATUS_UPDATED',
  ORDER_CONFIRMED:      'ORDER_CONFIRMED',
  ORDER_CANCELLED:      'ORDER_CANCELLED',
  ORDER_COMPLETE:       'ORDER_COMPLETE',
} as const;

export type TableEvent      = typeof TABLE_EVENTS[keyof typeof TABLE_EVENTS];
export type RestaurantEvent = typeof RESTAURANT_EVENTS[keyof typeof RESTAURANT_EVENTS];
export type TakeawayEvent   = typeof TAKEAWAY_EVENTS[keyof typeof TAKEAWAY_EVENTS];
