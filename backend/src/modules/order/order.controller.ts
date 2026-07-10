import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';

import { placeOrderSchema, updateOrderStatusSchema } from '@foodmart/shared';
import { authMiddleware } from '../../middleware/auth';
import { TokenPayload } from '../../lib/jwt';
import { OrderService } from './order.service';

const router = new Hono();

// Apply auth middleware to all endpoints
router.use('*', authMiddleware());

// ─────────────────────────────────────────────
// POST /orders (Place an order - Customer only)
// ─────────────────────────────────────────────
router.post('/', zValidator('json', placeOrderSchema), async (c) => {
  const user = c.get('user') as TokenPayload;
  const body = c.req.valid('json');

  try {
    const data = await OrderService.placeOrder(user.userId, body);
    return c.json({
      success: true,
      message: 'Order placed successfully',
      data,
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

// ─────────────────────────────────────────────
// PATCH /orders/:id/status (Staff updates order status)
// ─────────────────────────────────────────────
router.patch('/:id/status', zValidator('json', updateOrderStatusSchema), async (c) => {
  const user = c.get('user') as TokenPayload;
  const id = c.req.param('id');
  const { status } = c.req.valid('json');

  try {
    const data = await OrderService.updateOrderStatus(user.userId, user.role || 'CUSTOMER', id, status);
    return c.json({
      success: true,
      message: `Order status updated to ${status}`,
      data,
    });
  } catch (err: any) {
    if (err.message.includes('Forbidden')) {
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
// GET /orders/restaurant/:restaurantId (Active staff KDS)
// ─────────────────────────────────────────────
router.get('/restaurant/:restaurantId', async (c) => {
  const user = c.get('user') as TokenPayload;
  const restaurantId = c.req.param('restaurantId');

  try {
    const data = await OrderService.getRestaurantActiveOrders(user.userId, user.role || 'CUSTOMER', restaurantId);
    return c.json({
      success: true,
      data,
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

// ─────────────────────────────────────────────
// GET /orders/history (Customer's past orders — paginated)
// ─────────────────────────────────────────────
router.get('/history', async (c) => {
  const user = c.get('user') as TokenPayload;
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');

  try {
    const { orders, pagination } = await OrderService.getCustomerOrderHistory(user.userId, page, limit);
    return c.json({
      success: true,
      data: orders,
      pagination,
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
// GET /orders/:id (Retrieve order details)
// ─────────────────────────────────────────────
router.get('/:id', async (c) => {
  const user = c.get('user') as TokenPayload;
  const id = c.req.param('id');

  try {
    const data = await OrderService.getOrderDetails(user.userId, user.role || 'CUSTOMER', id);
    return c.json({
      success: true,
      data,
    });
  } catch (err: any) {
    if (err.message.includes('Forbidden')) {
      c.status(403);
    } else {
      c.status(404);
    }
    return c.json({
      success: false,
      message: err.message,
    });
  }
});

// ─────────────────────────────────────────────
// GET /orders/:id/upsell (Customer gets upsell prompts)
// ─────────────────────────────────────────────
router.get('/:id/upsell', async (c) => {
  const user = c.get('user') as TokenPayload;
  const id = c.req.param('id');

  try {
    const data = await OrderService.getOrderUpsellPrompts(user.userId, id);
    return c.json({
      success: true,
      data,
    });
  } catch (err: any) {
    if (err.message.includes('Forbidden')) {
      c.status(403);
    } else {
      c.status(404);
    }
    return c.json({
      success: false,
      message: err.message,
    });
  }
});

export const orderRouter = router;
