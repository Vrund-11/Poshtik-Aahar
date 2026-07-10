import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';

import { db } from '@foodmart/database';
import { placeTakeawayOrderSchema, paymentMethodSchema } from '@foodmart/shared';
import { authMiddleware } from '../../middleware/auth';
import { rbacMiddleware } from '../../middleware/rbac';
import { publish } from '../../lib/sse';

const router = new Hono();

// All takeaway endpoints require authentication
router.use('*', authMiddleware());

// Helper to generate takeaway token number
function generateTokenNumber(): string {
  const timestamp = Date.now().toString();
  return `TK-${timestamp.slice(-4)}`;
}

// Helper to sanitize order decimals
function sanitizeOrder(order: any) {
  return {
    ...order,
    subtotal: Number(order.subtotal),
    taxAmount: Number(order.taxAmount),
    totalAmount: Number(order.totalAmount),
    items: order.items?.map((item: any) => ({
      ...item,
      unitPrice: Number(item.unitPrice),
      totalPrice: Number(item.totalPrice),
      selectedModifiers: typeof item.selectedModifiers === 'string'
        ? JSON.parse(item.selectedModifiers)
        : item.selectedModifiers,
    })) || [],
  };
}

// Helper to verify staff for restaurant
async function verifyStaffForRestaurant(userId: string, restaurantId: string): Promise<boolean> {
  const staff = await db.staff.findUnique({
    where: { id: userId },
  });
  return !!staff && staff.restaurantId === restaurantId && staff.isActive;
}

// ─────────────────────────────────────────────
// POST /takeaway (Customer places takeaway order)
// ─────────────────────────────────────────────
router.post('/', zValidator('json', placeTakeawayOrderSchema), async (c) => {
  const user = c.get('user');
  const { restaurantId, items, notes } = c.req.valid('json');

  // Verify restaurant is active
  const restaurant = await db.restaurant.findUnique({
    where: { id: restaurantId },
  });

  if (!restaurant || !['ACTIVE', 'TRIAL'].includes(restaurant.status)) {
    c.status(400);
    return c.json({ success: false, message: 'Restaurant not found or inactive' });
  }

  if (!restaurant.allowTakeaway) {
    c.status(400);
    return c.json({ success: false, message: 'Takeaway ordering is not supported by this restaurant' });
  }

  // Fetch menu items from DB to prevent client-side price tampering
  const menuItemIds = items.map((i) => i.menuItemId);
  const dbMenuItems = await db.menuItem.findMany({
    where: {
      id: { in: menuItemIds },
      category: {
        menu: { restaurantId },
      },
      isAvailable: true,
    },
  });

  if (dbMenuItems.length !== new Set(menuItemIds).size) {
    c.status(400);
    return c.json({
      success: false,
      message: 'One or more menu items are invalid or currently unavailable',
    });
  }

  const menuItemsMap = new Map(dbMenuItems.map((item) => [item.id, item]));

  // Calculate subtotal using actual DB prices
  let subtotal = 0;
  const orderItemsData = items.map((item) => {
    const dbItem = menuItemsMap.get(item.menuItemId)!;
    const unitPrice = Number(dbItem.price);
    const totalPrice = unitPrice * item.quantity;
    subtotal += totalPrice;

    return {
      menuItemId: item.menuItemId,
      name: dbItem.name,
      quantity: item.quantity,
      unitPrice,
      totalPrice,
      notes: item.notes,
      selectedModifiers: item.selectedModifiers ? JSON.stringify(item.selectedModifiers) : '[]',
    };
  });

  // Retrieve Tax configuration
  const taxConfig = await db.taxConfig.findUnique({
    where: { restaurantId },
  });
  const gstPercent = taxConfig && taxConfig.isActive ? Number(taxConfig.gstPercent) : 5.0;
  const taxAmount = Math.round((subtotal * gstPercent) / 100 * 100) / 100;
  const totalAmount = Math.round((subtotal + taxAmount) * 100) / 100;

  const tokenNumber = generateTokenNumber();

  // Create takeaway order
  const order = await db.order.create({
    data: {
      customerId: user.userId,
      restaurantId,
      type: 'TAKEAWAY',
      status: 'RECEIVED', // Pending manager acceptance
      subtotal,
      taxAmount,
      totalAmount,
      tokenNumber,
      notes,
      items: {
        create: orderItemsData,
      },
    },
    include: {
      items: true,
    },
  });

  const sanitized = sanitizeOrder(order);

  // Publish SSE events
  publish(`restaurant:${restaurantId}`, 'NEW_TAKEAWAY', {
    orderId: order.id,
    tokenNumber,
    customerName: user.email, // We use email as identifier
    totalAmount: sanitized.totalAmount,
    items: sanitized.items,
  });

  return c.json({
    success: true,
    message: 'Takeaway order placed successfully. Awaiting restaurant confirmation.',
    data: sanitized,
  });
});

// ─────────────────────────────────────────────
// PATCH /takeaway/:id/accept (Manager accepts)
// ─────────────────────────────────────────────
router.patch('/:id/accept', rbacMiddleware(['OWNER', 'MANAGER']), async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  const order = await db.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order || order.type !== 'TAKEAWAY') {
    c.status(404);
    return c.json({ success: false, message: 'Takeaway order not found' });
  }

  const isStaff = await verifyStaffForRestaurant(user.userId, order.restaurantId);
  if (!isStaff) {
    c.status(403);
    return c.json({ success: false, message: 'Forbidden' });
  }

  if (order.status !== 'RECEIVED') {
    c.status(400);
    return c.json({ success: false, message: `Cannot accept order with status: ${order.status}` });
  }

  const updated = await db.order.update({
    where: { id },
    data: { status: 'PREPARING' },
    include: { items: true },
  });

  const sanitized = sanitizeOrder(updated);

  // Publish to restaurant (KDS) and customer takeaway stream
  publish(`restaurant:${order.restaurantId}`, 'ORDER_STATUS_UPDATED', sanitized);
  publish(`takeaway:${order.id}`, 'ORDER_CONFIRMED', {
    orderId: order.id,
    status: 'PREPARING',
    tokenNumber: order.tokenNumber,
  });

  return c.json({
    success: true,
    message: 'Takeaway order accepted and sent to kitchen',
    data: sanitized,
  });
});

// ─────────────────────────────────────────────
// PATCH /takeaway/:id/reject (Manager rejects)
// ─────────────────────────────────────────────
router.patch('/:id/reject', rbacMiddleware(['OWNER', 'MANAGER']), async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  const order = await db.order.findUnique({ where: { id } });

  if (!order || order.type !== 'TAKEAWAY') {
    c.status(404);
    return c.json({ success: false, message: 'Takeaway order not found' });
  }

  const isStaff = await verifyStaffForRestaurant(user.userId, order.restaurantId);
  if (!isStaff) {
    c.status(403);
    return c.json({ success: false, message: 'Forbidden' });
  }

  if (order.status !== 'RECEIVED') {
    c.status(400);
    return c.json({ success: false, message: `Cannot reject order with status: ${order.status}` });
  }

  const updated = await db.order.update({
    where: { id },
    data: { status: 'CANCELLED' },
  });

  publish(`restaurant:${order.restaurantId}`, 'ORDER_STATUS_UPDATED', { orderId: id, status: 'CANCELLED' });
  publish(`takeaway:${order.id}`, 'ORDER_CANCELLED', {
    orderId: order.id,
    status: 'CANCELLED',
    tokenNumber: order.tokenNumber,
  });

  return c.json({
    success: true,
    message: 'Takeaway order rejected',
    data: updated,
  });
});

// ─────────────────────────────────────────────
// PATCH /takeaway/:id/ready (Chef/Manager marks READY)
// ─────────────────────────────────────────────
router.patch('/:id/ready', rbacMiddleware(['OWNER', 'MANAGER', 'CHEF']), async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  const order = await db.order.findUnique({ where: { id } });

  if (!order || order.type !== 'TAKEAWAY') {
    c.status(404);
    return c.json({ success: false, message: 'Takeaway order not found' });
  }

  const isStaff = await verifyStaffForRestaurant(user.userId, order.restaurantId);
  if (!isStaff) {
    c.status(403);
    return c.json({ success: false, message: 'Forbidden' });
  }

  if (order.status !== 'PREPARING') {
    c.status(400);
    return c.json({ success: false, message: `Cannot mark ready for order with status: ${order.status}` });
  }

  const updated = await db.order.update({
    where: { id },
    data: { status: 'READY' },
  });

  publish(`restaurant:${order.restaurantId}`, 'ORDER_STATUS_UPDATED', { orderId: id, status: 'READY' });
  publish(`takeaway:${order.id}`, 'ORDER_READY', {
    orderId: order.id,
    status: 'READY',
    tokenNumber: order.tokenNumber,
  });

  return c.json({
    success: true,
    message: 'Takeaway order marked as READY for pickup',
    data: updated,
  });
});

// ─────────────────────────────────────────────
// PATCH /takeaway/:id/paid (Manager marks paid + picked up)
// ─────────────────────────────────────────────
router.patch('/:id/paid', rbacMiddleware(['OWNER', 'MANAGER']), zValidator('json', paymentMethodSchema), async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const { method } = c.req.valid('json');

  const order = await db.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order || order.type !== 'TAKEAWAY') {
    c.status(404);
    return c.json({ success: false, message: 'Takeaway order not found' });
  }

  const isStaff = await verifyStaffForRestaurant(user.userId, order.restaurantId);
  if (!isStaff) {
    c.status(403);
    return c.json({ success: false, message: 'Forbidden' });
  }

  if (order.status !== 'READY' && order.status !== 'PREPARING') {
    c.status(400);
    return c.json({ success: false, message: `Cannot mark paid for order with status: ${order.status}` });
  }

  // Transactionally: update order, create payment record, award loyalty points
  const result = await db.$transaction(async (tx) => {
    // Update order to DELIVERED
    const updatedOrder = await tx.order.update({
      where: { id },
      data: { status: 'DELIVERED' },
      include: { items: true },
    });

    // Create Payment record
    await tx.payment.create({
      data: {
        orderId: id,
        amount: order.totalAmount,
        method,
        status: 'CONFIRMED',
        confirmedAt: new Date(),
        confirmedBy: user.userId,
      },
    });

    // Award loyalty points
    const loyaltyConfig = await tx.loyaltyConfig.findUnique({
      where: { restaurantId: order.restaurantId },
    });

    if (loyaltyConfig && loyaltyConfig.isActive) {
      const pointsPerHundred = Number(loyaltyConfig.pointsPerHundred);
      const totalAmountNum = Number(order.totalAmount);
      const pointsEarned = (totalAmountNum / 100) * pointsPerHundred;

      if (pointsEarned > 0) {
        // Upsert loyalty account
        let account = await tx.loyaltyAccount.findUnique({
          where: { customerId: order.customerId },
        });

        if (!account) {
          account = await tx.loyaltyAccount.create({
            data: {
              customerId: order.customerId,
              totalPoints: 0,
            },
          });
        }

        await tx.loyaltyAccount.update({
          where: { id: account.id },
          data: {
            totalPoints: { increment: pointsEarned },
          },
        });

        await tx.loyaltyTransaction.create({
          data: {
            accountId: account.id,
            restaurantId: order.restaurantId,
            points: pointsEarned,
            type: 'EARNED',
            description: `Takeaway order ${order.tokenNumber}`,
            orderId: order.id,
          },
        });
      }
    }

    return updatedOrder;
  });

  const sanitized = sanitizeOrder(result);

  publish(`restaurant:${order.restaurantId}`, 'ORDER_STATUS_UPDATED', { orderId: id, status: 'DELIVERED' });
  publish(`takeaway:${order.id}`, 'ORDER_COMPLETE', {
    orderId: order.id,
    status: 'DELIVERED',
    tokenNumber: order.tokenNumber,
  });

  return c.json({
    success: true,
    message: 'Takeaway order paid and picked up. Loyalty points awarded.',
    data: sanitized,
  });
});

// ─────────────────────────────────────────────
// GET /takeaway/restaurant/:restaurantId (Manager views active takeaway orders)
// ─────────────────────────────────────────────
router.get('/restaurant/:restaurantId', rbacMiddleware(['OWNER', 'MANAGER', 'CHEF']), async (c) => {
  const user = c.get('user');
  const restaurantId = c.req.param('restaurantId');

  const isStaff = await verifyStaffForRestaurant(user.userId, restaurantId);
  if (!isStaff) {
    c.status(403);
    return c.json({ success: false, message: 'Forbidden' });
  }

  const orders = await db.order.findMany({
    where: {
      restaurantId,
      type: 'TAKEAWAY',
      status: { notIn: ['DELIVERED', 'CANCELLED'] },
    },
    include: {
      items: true,
      customer: {
        select: { id: true, name: true, phone: true, email: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  const sanitizedOrders = orders.map(sanitizeOrder);

  return c.json({
    success: true,
    data: sanitizedOrders,
  });
});

// ─────────────────────────────────────────────
// GET /takeaway/:id (Customer or staff views takeaway order)
// ─────────────────────────────────────────────
router.get('/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  const order = await db.order.findUnique({
    where: { id },
    include: {
      items: {
        include: { menuItem: true },
      },
      payment: true,
    },
  });

  if (!order || order.type !== 'TAKEAWAY') {
    c.status(404);
    return c.json({ success: false, message: 'Takeaway order not found' });
  }

  // Security: customer or staff
  const isStaff = await verifyStaffForRestaurant(user.userId, order.restaurantId);
  if (order.customerId !== user.userId && !isStaff && user.role !== 'ADMIN') {
    c.status(403);
    return c.json({ success: false, message: 'Forbidden' });
  }

  const sanitized = sanitizeOrder(order);

  return c.json({
    success: true,
    data: sanitized,
  });
});

export const takeawayRouter = router;
