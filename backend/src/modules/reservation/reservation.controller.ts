import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';

import { db } from '@foodmart/database';
import { createReservationSchema, updateReservationStatusSchema } from '@foodmart/shared';
import { authMiddleware } from '../../middleware/auth';
import { rbacMiddleware } from '../../middleware/rbac';
import { publish } from '../../lib/sse';

const router = new Hono();

// All reservation endpoints require authentication
router.use('*', authMiddleware());

// ─────────────────────────────────────────────
// POST /reservations (Customer creates reservation)
// ─────────────────────────────────────────────
router.post('/', zValidator('json', createReservationSchema), async (c) => {
  const user = c.get('user');
  const { branchId, partySize, date, timeSlot, notes } = c.req.valid('json');

  // Verify branch exists and restaurant is active
  const branch = await db.branch.findUnique({
    where: { id: branchId },
    include: { restaurant: true },
  });

  if (!branch || !branch.isActive) {
    c.status(404);
    return c.json({ success: false, message: 'Branch not found or inactive' });
  }

  if (branch.restaurant.status === 'SUSPENDED' || branch.restaurant.status === 'EXPIRED') {
    c.status(403);
    return c.json({ success: false, message: 'Restaurant is currently not accepting reservations' });
  }

  if (!branch.restaurant.allowReservations) {
    c.status(400);
    return c.json({ success: false, message: 'Reservations are not supported by this restaurant' });
  }

  // Parse the date string to a Date object
  const reservationDate = new Date(date);
  if (isNaN(reservationDate.getTime())) {
    c.status(400);
    return c.json({ success: false, message: 'Invalid date format. Use ISO format (YYYY-MM-DD)' });
  }

  // Ensure reservation is not in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (reservationDate < today) {
    c.status(400);
    return c.json({ success: false, message: 'Cannot create a reservation in the past' });
  }

  const reservation = await db.reservation.create({
    data: {
      branchId,
      customerId: user.userId,
      partySize,
      date: reservationDate,
      timeSlot,
      status: 'PENDING',
      notes,
    },
    include: {
      branch: true,
      customer: {
        select: { id: true, name: true, phone: true, email: true },
      },
    },
  });

  // Publish SSE event to restaurant
  publish(`restaurant:${branch.restaurantId}`, 'NEW_RESERVATION', {
    reservationId: reservation.id,
    customerName: reservation.customer.name,
    customerPhone: reservation.customer.phone,
    partySize: reservation.partySize,
    date: reservation.date,
    timeSlot: reservation.timeSlot,
    branchName: reservation.branch.name,
  });

  return c.json({
    success: true,
    message: 'Reservation created successfully. Awaiting confirmation.',
    data: reservation,
  });
});

// ─────────────────────────────────────────────
// GET /reservations/:branchId (Manager views reservations)
// ─────────────────────────────────────────────
router.get('/:branchId', rbacMiddleware(['OWNER', 'MANAGER']), async (c) => {
  const user = c.get('user');
  const branchId = c.req.param('branchId');
  const dateFilter = c.req.query('date'); // Optional: "2026-07-01"

  // Verify branch belongs to staff's restaurant
  const staff = await db.staff.findUnique({
    where: { id: user.userId },
  });

  if (!staff || !staff.isActive) {
    c.status(403);
    return c.json({ success: false, message: 'Forbidden' });
  }

  const branch = await db.branch.findUnique({
    where: { id: branchId },
  });

  if (!branch || branch.restaurantId !== staff.restaurantId) {
    c.status(403);
    return c.json({ success: false, message: 'Forbidden: Branch does not belong to your restaurant' });
  }

  // Build date filter if provided
  const whereClause: any = { branchId };
  if (dateFilter) {
    const filterDate = new Date(dateFilter);
    if (!isNaN(filterDate.getTime())) {
      const nextDay = new Date(filterDate);
      nextDay.setDate(nextDay.getDate() + 1);
      whereClause.date = {
        gte: filterDate,
        lt: nextDay,
      };
    }
  }

  const reservations = await db.reservation.findMany({
    where: whereClause,
    include: {
      customer: {
        select: { id: true, name: true, phone: true, email: true },
      },
    },
    orderBy: [
      { date: 'asc' },
      { timeSlot: 'asc' },
    ],
  });

  return c.json({
    success: true,
    data: reservations,
  });
});

// ─────────────────────────────────────────────
// GET /reservations/customer/my (Customer views their own reservations)
// ─────────────────────────────────────────────
router.get('/customer/my', async (c) => {
  const user = c.get('user');

  const reservations = await db.reservation.findMany({
    where: { customerId: user.userId },
    include: {
      branch: {
        include: {
          restaurant: {
            select: { id: true, name: true, logoUrl: true },
          },
        },
      },
    },
    orderBy: { date: 'desc' },
  });

  return c.json({
    success: true,
    data: reservations,
  });
});

// ─────────────────────────────────────────────
// PATCH /reservations/:id/status (Manager updates status)
// ─────────────────────────────────────────────
router.patch('/:id/status', rbacMiddleware(['OWNER', 'MANAGER']), zValidator('json', updateReservationStatusSchema), async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const { status } = c.req.valid('json');

  const reservation = await db.reservation.findUnique({
    where: { id },
    include: { branch: true },
  });

  if (!reservation) {
    c.status(404);
    return c.json({ success: false, message: 'Reservation not found' });
  }

  // Verify staff ownership
  const staff = await db.staff.findUnique({
    where: { id: user.userId },
  });

  if (!staff || !staff.isActive || staff.restaurantId !== reservation.branch.restaurantId) {
    c.status(403);
    return c.json({ success: false, message: 'Forbidden' });
  }

  const updated = await db.reservation.update({
    where: { id },
    data: { status },
    include: {
      customer: {
        select: { id: true, name: true, phone: true, email: true },
      },
      branch: true,
    },
  });

  // Publish SSE event
  publish(`restaurant:${reservation.branch.restaurantId}`, 'RESERVATION_STATUS_CHANGED', {
    reservationId: updated.id,
    status: updated.status,
    customerName: updated.customer.name,
  });

  return c.json({
    success: true,
    message: `Reservation status updated to ${status}`,
    data: updated,
  });
});

export const reservationRouter = router;
