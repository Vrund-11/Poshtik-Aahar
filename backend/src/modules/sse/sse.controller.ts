import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import { db } from '@foodmart/database';
import { verifyAccessToken } from '../../lib/jwt';
import { addConnection, removeConnection } from '../../lib/sse';

const router = new Hono();

// Helper to authenticate user from headers or query token (very important for EventSource browser compatibility)
function authenticate(c: any) {
  const authHeader = c.req.header('Authorization');
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else {
    token = c.req.query('token') || '';
  }

  if (!token) return null;

  try {
    return verifyAccessToken(token);
  } catch (err) {
    return null;
  }
}

// ─────────────────────────────────────────────
// GET /sse/table/:sessionId (Customer stream)
// ─────────────────────────────────────────────
router.get('/table/:sessionId', async (c) => {
  const sessionId = c.req.param('sessionId');
  const payload = authenticate(c);

  if (!payload) {
    c.status(401);
    return c.json({ success: false, message: 'Unauthorized: Invalid token' });
  }

  // Verify that the table session exists and belongs to the customer
  const session = await db.tableSession.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    c.status(404);
    return c.json({ success: false, message: 'Table session not found' });
  }

  if (session.customerId !== payload.userId) {
    c.status(403);
    return c.json({ success: false, message: 'Forbidden: You do not own this session stream' });
  }

  return streamSSE(c, async (stream) => {
    const connectionKey = `table:${sessionId}`;
    addConnection(connectionKey, stream);

    // Send initial connected message
    await stream.writeSSE({
      event: 'CONNECTED',
      data: JSON.stringify({ sessionId, status: session.status }),
    });

    // Send keepalive ping every 30 seconds
    const pingInterval = setInterval(async () => {
      try {
        await stream.writeSSE({ event: 'PING', data: '{}' });
      } catch (err) {
        console.error(`[SSE] Ping failed on table:${sessionId}`, err);
      }
    }, 30000);

    stream.onAbort(() => {
      clearInterval(pingInterval);
      removeConnection(connectionKey, stream);
      console.log(`[SSE] Customer client disconnected from table:${sessionId}`);
    });

    // Keep loop running to prevent stream closure
    while (true) {
      await new Promise((resolve) => setTimeout(resolve, 60000));
    }
  });
});

// ─────────────────────────────────────────────
// GET /sse/restaurant/:restaurantId (Staff KDS/Manager stream)
// ─────────────────────────────────────────────
router.get('/restaurant/:restaurantId', async (c) => {
  const restaurantId = c.req.param('restaurantId');
  const payload = authenticate(c);

  if (!payload) {
    c.status(401);
    return c.json({ success: false, message: 'Unauthorized: Invalid token' });
  }

  // Verify that user is staff at this restaurant
  const staff = await db.staff.findUnique({
    where: { id: payload.userId },
  });

  if (!staff || staff.restaurantId !== restaurantId || !staff.isActive) {
    c.status(403);
    return c.json({ success: false, message: 'Forbidden: Unauthorized staff stream access' });
  }

  return streamSSE(c, async (stream) => {
    const connectionKey = `restaurant:${restaurantId}`;
    addConnection(connectionKey, stream);

    // Send initial connected message
    await stream.writeSSE({
      event: 'CONNECTED',
      data: JSON.stringify({ restaurantId, role: staff.role }),
    });

    // Send keepalive ping every 30 seconds
    const pingInterval = setInterval(async () => {
      try {
        await stream.writeSSE({ event: 'PING', data: '{}' });
      } catch (err) {
        console.error(`[SSE] Ping failed on restaurant:${restaurantId}`, err);
      }
    }, 30000);

    stream.onAbort(() => {
      clearInterval(pingInterval);
      removeConnection(connectionKey, stream);
      console.log(`[SSE] Staff client disconnected from restaurant:${restaurantId}`);
    });

    // Keep loop running to prevent stream closure
    while (true) {
      await new Promise((resolve) => setTimeout(resolve, 60000));
    }
  });
});

// ─────────────────────────────────────────────
// GET /sse/takeaway/:orderId (Customer takeaway stream)
// ─────────────────────────────────────────────
router.get('/takeaway/:orderId', async (c) => {
  const orderId = c.req.param('orderId');
  const payload = authenticate(c);

  if (!payload) {
    c.status(401);
    return c.json({ success: false, message: 'Unauthorized: Invalid token' });
  }

  // Verify that the order exists and belongs to the customer
  const order = await db.order.findUnique({
    where: { id: orderId },
  });

  if (!order || order.type !== 'TAKEAWAY') {
    c.status(404);
    return c.json({ success: false, message: 'Takeaway order not found' });
  }

  if (order.customerId !== payload.userId) {
    c.status(403);
    return c.json({ success: false, message: 'Forbidden: You do not own this takeaway order' });
  }

  return streamSSE(c, async (stream) => {
    const connectionKey = `takeaway:${orderId}`;
    addConnection(connectionKey, stream);

    // Send initial connected message
    await stream.writeSSE({
      event: 'CONNECTED',
      data: JSON.stringify({ orderId, status: order.status, tokenNumber: order.tokenNumber }),
    });

    // Send keepalive ping every 30 seconds
    const pingInterval = setInterval(async () => {
      try {
        await stream.writeSSE({ event: 'PING', data: '{}' });
      } catch (err) {
        console.error(`[SSE] Ping failed on takeaway:${orderId}`, err);
      }
    }, 30000);

    stream.onAbort(() => {
      clearInterval(pingInterval);
      removeConnection(connectionKey, stream);
      console.log(`[SSE] Customer client disconnected from takeaway:${orderId}`);
    });

    // Keep loop running to prevent stream closure
    while (true) {
      await new Promise((resolve) => setTimeout(resolve, 60000));
    }
  });
});

export const sseRouter = router;
