import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';

import { db } from '@foodmart/database';
import { addToQueueSchema } from '@foodmart/shared';
import { authMiddleware } from '../../middleware/auth';
import { rbacMiddleware } from '../../middleware/rbac';
import { publish } from '../../lib/sse';

const router = new Hono();

// All queue endpoints require auth + MANAGER/OWNER role
router.use('*', authMiddleware());
router.use('*', rbacMiddleware(['OWNER', 'MANAGER']));

// Helper to verify branch belongs to staff's restaurant
async function verifyBranchOwnership(userId: string, branchId: string): Promise<{ valid: boolean; restaurantId: string | null }> {
  const staff = await db.staff.findUnique({
    where: { id: userId },
  });

  if (!staff || !staff.isActive) {
    return { valid: false, restaurantId: null };
  }

  const branch = await db.branch.findUnique({
    where: { id: branchId },
  });

  if (!branch || branch.restaurantId !== staff.restaurantId) {
    return { valid: false, restaurantId: null };
  }

  return { valid: true, restaurantId: staff.restaurantId };
}

// ─────────────────────────────────────────────
// POST /queue/:branchId (Add customer to queue)
// ─────────────────────────────────────────────
router.post('/:branchId', zValidator('json', addToQueueSchema), async (c) => {
  const user = c.get('user');
  const branchId = c.req.param('branchId');
  const { name, phone, partySize, notes } = c.req.valid('json');

  const { valid, restaurantId } = await verifyBranchOwnership(user.userId, branchId);
  if (!valid) {
    c.status(403);
    return c.json({ success: false, message: 'Forbidden: Branch does not belong to your restaurant' });
  }

  // Calculate next position (max existing WAITING position + 1)
  const maxPosition = await db.queue.aggregate({
    where: {
      branchId,
      status: { in: ['WAITING', 'CALLED'] },
    },
    _max: { position: true },
  });

  const position = (maxPosition._max.position ?? 0) + 1;

  const entry = await db.queue.create({
    data: {
      branchId,
      name,
      phone,
      partySize,
      status: 'WAITING',
      position,
      notes,
    },
  });

  // Publish SSE event
  publish(`restaurant:${restaurantId}`, 'QUEUE_UPDATE', {
    action: 'ADDED',
    entry,
  });

  return c.json({
    success: true,
    message: 'Customer added to queue',
    data: entry,
  });
});

// ─────────────────────────────────────────────
// GET /queue/:branchId (List queue)
// ─────────────────────────────────────────────
router.get('/:branchId', async (c) => {
  const user = c.get('user');
  const branchId = c.req.param('branchId');

  const { valid } = await verifyBranchOwnership(user.userId, branchId);
  if (!valid) {
    c.status(403);
    return c.json({ success: false, message: 'Forbidden: Branch does not belong to your restaurant' });
  }

  const queue = await db.queue.findMany({
    where: {
      branchId,
      status: { in: ['WAITING', 'CALLED'] },
    },
    orderBy: { position: 'asc' },
  });

  return c.json({
    success: true,
    data: queue,
  });
});

// ─────────────────────────────────────────────
// PATCH /queue/:id/call (Mark as CALLED)
// ─────────────────────────────────────────────
router.patch('/:id/call', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  const entry = await db.queue.findUnique({ where: { id } });
  if (!entry) {
    c.status(404);
    return c.json({ success: false, message: 'Queue entry not found' });
  }

  const { valid, restaurantId } = await verifyBranchOwnership(user.userId, entry.branchId);
  if (!valid) {
    c.status(403);
    return c.json({ success: false, message: 'Forbidden' });
  }

  if (entry.status !== 'WAITING') {
    c.status(400);
    return c.json({ success: false, message: `Cannot call entry with status: ${entry.status}` });
  }

  const updated = await db.queue.update({
    where: { id },
    data: { status: 'CALLED' },
  });

  publish(`restaurant:${restaurantId}`, 'QUEUE_UPDATE', {
    action: 'CALLED',
    entry: updated,
  });

  return c.json({
    success: true,
    message: 'Queue entry marked as CALLED',
    data: updated,
  });
});

// ─────────────────────────────────────────────
// PATCH /queue/:id/seat (Mark as SEATED, remove from active queue)
// ─────────────────────────────────────────────
router.patch('/:id/seat', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  const entry = await db.queue.findUnique({ where: { id } });
  if (!entry) {
    c.status(404);
    return c.json({ success: false, message: 'Queue entry not found' });
  }

  const { valid, restaurantId } = await verifyBranchOwnership(user.userId, entry.branchId);
  if (!valid) {
    c.status(403);
    return c.json({ success: false, message: 'Forbidden' });
  }

  if (entry.status !== 'WAITING' && entry.status !== 'CALLED') {
    c.status(400);
    return c.json({ success: false, message: `Cannot seat entry with status: ${entry.status}` });
  }

  const removedPosition = entry.position;

  const updated = await db.$transaction(async (tx) => {
    const seated = await tx.queue.update({
      where: { id },
      data: { status: 'SEATED' },
    });

    // Recalculate positions for remaining active entries
    await tx.queue.updateMany({
      where: {
        branchId: entry.branchId,
        status: { in: ['WAITING', 'CALLED'] },
        position: { gt: removedPosition },
      },
      data: { position: { decrement: 1 } },
    });

    return seated;
  });

  publish(`restaurant:${restaurantId}`, 'QUEUE_UPDATE', {
    action: 'SEATED',
    entry: updated,
  });

  return c.json({
    success: true,
    message: 'Queue entry seated and removed from queue',
    data: updated,
  });
});

// ─────────────────────────────────────────────
// DELETE /queue/:id (Remove from queue)
// ─────────────────────────────────────────────
router.delete('/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  const entry = await db.queue.findUnique({ where: { id } });
  if (!entry) {
    c.status(404);
    return c.json({ success: false, message: 'Queue entry not found' });
  }

  const { valid, restaurantId } = await verifyBranchOwnership(user.userId, entry.branchId);
  if (!valid) {
    c.status(403);
    return c.json({ success: false, message: 'Forbidden' });
  }

  const removedPosition = entry.position;

  await db.$transaction(async (tx) => {
    await tx.queue.update({
      where: { id },
      data: { status: 'LEFT' },
    });

    // Recalculate positions for remaining active entries
    await tx.queue.updateMany({
      where: {
        branchId: entry.branchId,
        status: { in: ['WAITING', 'CALLED'] },
        position: { gt: removedPosition },
      },
      data: { position: { decrement: 1 } },
    });
  });

  publish(`restaurant:${restaurantId}`, 'QUEUE_UPDATE', {
    action: 'REMOVED',
    entryId: id,
  });

  return c.json({
    success: true,
    message: 'Queue entry removed',
  });
});

export const queueRouter = router;
