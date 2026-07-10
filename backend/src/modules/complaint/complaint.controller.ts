import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';

import { db } from '@foodmart/database';
import { submitComplaintSchema } from '@foodmart/shared';
import { authMiddleware } from '../../middleware/auth';
import { rbacMiddleware } from '../../middleware/rbac';
import { analyzeComplaint } from '../../jobs/analyzeComplaint';

const router = new Hono();

// All complaint endpoints require authentication
router.use('*', authMiddleware());

// ─────────────────────────────────────────────
// POST /complaints (Customer submits complaint)
// ─────────────────────────────────────────────
router.post('/', zValidator('json', submitComplaintSchema), async (c) => {
  const user = c.get('user');
  const { restaurantId, orderId, rawText, rating } = c.req.valid('json');

  // Verify restaurant exists
  const restaurant = await db.restaurant.findUnique({
    where: { id: restaurantId },
  });

  if (!restaurant) {
    c.status(404);
    return c.json({ success: false, message: 'Restaurant not found' });
  }

  // Save complaint immediately
  const complaint = await db.complaint.create({
    data: {
      restaurantId,
      customerId: user.userId,
      orderId: orderId || null,
      rawText,
      rating: rating || null,
      isAnalyzed: false,
      isResolved: false,
    },
  });

  // Trigger background Gemini analysis (fire-and-forget)
  // This runs asynchronously and does not block the response
  analyzeComplaint(complaint.id).catch((err) => {
    console.error(`[Complaint] Background analysis failed for ${complaint.id}:`, err);
  });

  c.status(201);
  return c.json({
    success: true,
    message: 'Complaint submitted successfully. It will be analyzed shortly.',
    data: {
      id: complaint.id,
      restaurantId: complaint.restaurantId,
      rawText: complaint.rawText,
      rating: complaint.rating,
      createdAt: complaint.createdAt,
    },
  });
});

// ─────────────────────────────────────────────
// GET /complaints/restaurant/:restaurantId (Owner views complaints)
// ─────────────────────────────────────────────
router.get('/restaurant/:restaurantId', rbacMiddleware(['OWNER']), async (c) => {
  const user = c.get('user');
  const restaurantId = c.req.param('restaurantId');

  // Verify owner belongs to this restaurant
  const staff = await db.staff.findUnique({
    where: { id: user.userId },
  });

  if (!staff || !staff.isActive || staff.restaurantId !== restaurantId) {
    c.status(403);
    return c.json({ success: false, message: 'Forbidden' });
  }

  // Build filters from query params
  const whereClause: any = { restaurantId };

  const categoryFilter = c.req.query('category');
  if (categoryFilter) {
    whereClause.category = categoryFilter;
  }

  const urgencyFilter = c.req.query('urgency');
  if (urgencyFilter) {
    whereClause.urgency = urgencyFilter;
  }

  const resolvedFilter = c.req.query('isResolved');
  if (resolvedFilter === 'true') {
    whereClause.isResolved = true;
  } else if (resolvedFilter === 'false') {
    whereClause.isResolved = false;
  }

  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const skip = (page - 1) * limit;

  const [complaints, total] = await Promise.all([
    db.complaint.findMany({
      where: whereClause,
      include: {
        customer: {
          select: { id: true, name: true, phone: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    db.complaint.count({
      where: whereClause,
    }),
  ]);

  return c.json({
    success: true,
    data: complaints,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// ─────────────────────────────────────────────
// PATCH /complaints/:id/resolve (Owner resolves complaint)
// ─────────────────────────────────────────────
router.patch('/:id/resolve', rbacMiddleware(['OWNER']), async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  const complaint = await db.complaint.findUnique({
    where: { id },
  });

  if (!complaint) {
    c.status(404);
    return c.json({ success: false, message: 'Complaint not found' });
  }

  // Verify owner
  const staff = await db.staff.findUnique({
    where: { id: user.userId },
  });

  if (!staff || !staff.isActive || staff.restaurantId !== complaint.restaurantId) {
    c.status(403);
    return c.json({ success: false, message: 'Forbidden' });
  }

  if (complaint.isResolved) {
    c.status(400);
    return c.json({ success: false, message: 'Complaint is already resolved' });
  }

  const updated = await db.complaint.update({
    where: { id },
    data: {
      isResolved: true,
      resolvedAt: new Date(),
      resolvedBy: user.userId,
    },
  });

  return c.json({
    success: true,
    message: 'Complaint marked as resolved',
    data: updated,
  });
});

export const complaintRouter = router;
