import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';

import { initiateSessionSchema, verifySessionSchema } from '@foodmart/shared';
import { authMiddleware } from '../../middleware/auth';
import { TableService } from './table.service';

const router = new Hono();

// Apply auth to all session endpoints
router.use('*', authMiddleware());

// ─────────────────────────────────────────────
// GET /sessions/initiate (Manager resolves active session ID for a table)
// ─────────────────────────────────────────────
router.get('/initiate', async (c) => {
  const tableId = c.req.query('tableId');
  if (!tableId) {
    c.status(400);
    return c.json({
      success: false,
      message: 'Missing tableId query parameter',
    });
  }

  try {
    const session = await TableService.getActiveTableSession(tableId);
    return c.json({
      success: true,
      data: session,
    });
  } catch (err: any) {
    c.status(404);
    return c.json({
      success: false,
      message: err.message,
    });
  }
});

// ─────────────────────────────────────────────
// POST /sessions/initiate (QR Scan → Generate verification codes)
// ─────────────────────────────────────────────
router.post('/initiate', zValidator('json', initiateSessionSchema), async (c) => {
  const user = c.get('user');
  const { qrCode } = c.req.valid('json');

  try {
    const data = await TableService.initiateSession(qrCode, user.userId);
    return c.json({
      success: true,
      message: 'Table session initiated. Select the correct code shown on table.',
      data,
    });
  } catch (err: any) {
    if (err.message.includes('suspended') || err.message.includes('expired')) {
      c.status(403);
    } else if (err.message.includes('not found')) {
      c.status(404);
    } else {
      c.status(400);
    }
    return c.json({
      success: false,
      message: err.message,
    });
  }
});

// ─────────────────────────────────────────────
// POST /sessions/verify (Verify customer chosen code)
// ─────────────────────────────────────────────
router.post('/verify', zValidator('json', verifySessionSchema), async (c) => {
  const { sessionId, verifyCode } = c.req.valid('json');

  try {
    const updatedSession = await TableService.verifySession(sessionId, verifyCode);
    return c.json({
      success: true,
      message: 'Table session successfully verified and active',
      data: updatedSession,
    });
  } catch (err: any) {
    c.status(400);
    return c.json({
      success: false,
      message: err.message,
    });
  }
});

// ─────────────────────────────────────────────
// GET /sessions/:id (Get details with orders)
// ─────────────────────────────────────────────
router.get('/:id', async (c) => {
  const id = c.req.param('id');

  try {
    const data = await TableService.getSessionDetails(id);
    return c.json({
      success: true,
      data,
    });
  } catch (err: any) {
    c.status(404);
    return c.json({
      success: false,
      message: err.message,
    });
  }
});

// ─────────────────────────────────────────────
// POST /sessions/:id/request-bill
// ─────────────────────────────────────────────
router.post('/:id/request-bill', async (c) => {
  const id = c.req.param('id');

  try {
    const data = await TableService.requestBill(id);
    return c.json({
      success: true,
      message: 'Bill requested successfully',
      data,
    });
  } catch (err: any) {
    c.status(400);
    return c.json({
      success: false,
      message: err.message,
    });
  }
});

// ─────────────────────────────────────────────
// POST /sessions/:id/customer-paid (UPI/Cash claim)
// ─────────────────────────────────────────────
router.post('/:id/customer-paid', async (c) => {
  const id = c.req.param('id');

  try {
    await TableService.claimPayment(id);
    return c.json({
      success: true,
      message: 'Payment notification sent to staff',
    });
  } catch (err: any) {
    c.status(400);
    return c.json({
      success: false,
      message: err.message,
    });
  }
});

// ─────────────────────────────────────────────
// POST /sessions/:id/confirm-payment (Staff only)
// ─────────────────────────────────────────────
router.post('/:id/confirm-payment', async (c) => {
  const id = c.req.param('id');
  const user = c.get('user');

  try {
    await TableService.confirmPayment(id, user.userId);
    return c.json({
      success: true,
      message: 'Payment confirmed. Table session closed.',
    });
  } catch (err: any) {
    if (err.message.includes('Forbidden')) {
      c.status(403);
    } else {
      c.status(400);
    }
    return c.json({
      success: false,
      message: err.message,
    });
  }
});

export const tableRouter = router;
