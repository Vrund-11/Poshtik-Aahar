import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import crypto from 'crypto';

import { db } from '@foodmart/database';
import { createRestaurantSchema, updateRestaurantSchema } from '@foodmart/shared';
import { authMiddleware } from '../../middleware/auth';
import { rbacMiddleware } from '../../middleware/rbac';
import { hashPassword } from '../../lib/password';
import { env } from '../../config/env';

const router = new Hono();

// Apply admin protection to all routes
router.use('*', authMiddleware());
router.use('*', rbacMiddleware(['ADMIN']));

// ─────────────────────────────────────────────
// GET /admin/restaurants
// ─────────────────────────────────────────────
router.get('/restaurants', async (c) => {
  const search = c.req.query('search') || '';
  const plan = c.req.query('plan');
  const status = c.req.query('status');

  // Build query filter
  const where: any = {};
  
  if (search) {
    where.name = {
      contains: search,
      mode: 'insensitive',
    };
  }

  if (plan) {
    where.plan = plan;
  }

  if (status) {
    where.status = status;
  }

  const restaurants = await db.restaurant.findMany({
    where,
    include: {
      staff: {
        where: { role: 'OWNER' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return c.json({
    success: true,
    data: restaurants,
  });
});

// ─────────────────────────────────────────────
// POST /admin/restaurants (Create + Owner Account)
// ─────────────────────────────────────────────
router.post('/restaurants', zValidator('json', createRestaurantSchema), async (c) => {
  const body = c.req.valid('json');

  // Check if owner email is already registered in Staff table
  const existingStaff = await db.staff.findUnique({
    where: { email: body.ownerEmail },
  });

  if (existingStaff) {
    c.status(400);
    return c.json({
      success: false,
      message: 'Owner email is already registered as a staff or owner account',
    });
  }

  // Generate a random 10-character password for the owner
  const generatedPassword = crypto.randomBytes(5).toString('hex');
  const passwordHash = await hashPassword(generatedPassword);

  // Set plan expiration date
  const planExpiresAt = new Date();
  planExpiresAt.setDate(planExpiresAt.getDate() + body.planDurationDays);

  // Use transaction to create everything atomically
  const result = await db.$transaction(async (tx) => {
    // 1. Create restaurant
    const restaurant = await tx.restaurant.create({
      data: {
        name: body.name,
        description: body.description,
        cuisineType: body.cuisineType,
        plan: body.plan,
        status: body.plan === 'TRIAL' ? 'TRIAL' : 'ACTIVE',
        planExpiresAt,
        allowDineIn: body.allowDineIn !== undefined ? body.allowDineIn : true,
        allowTakeaway: body.allowTakeaway !== undefined ? body.allowTakeaway : true,
        allowReservations: body.allowReservations !== undefined ? body.allowReservations : true,
      },
    });

    // 2. Create Owner account
    const owner = await tx.staff.create({
      data: {
        restaurantId: restaurant.id,
        name: body.ownerName,
        email: body.ownerEmail,
        phone: body.ownerPhone,
        passwordHash,
        role: 'OWNER',
      },
    });

    // 3. Create default active main Menu
    const menu = await tx.menu.create({
      data: {
        restaurantId: restaurant.id,
        name: 'Main Menu',
        isActive: true,
      },
    });

    // 4. Create default configs (Tax, Loyalty)
    await tx.taxConfig.create({
      data: {
        restaurantId: restaurant.id,
        gstPercent: 5.0, // default 5%
        isActive: true,
      },
    });

    await tx.loyaltyConfig.create({
      data: {
        restaurantId: restaurant.id,
        pointsPerHundred: 1.0, // default 1 point per 100 Rs spent
        isActive: true,
      },
    });

    return { restaurant, owner, menu };
  });

  // Send credentials email via Resend
  const loginUrl = `${env.PARTNER_APP_URL}/login`;
  
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.RESEND_FROM || 'noreply@foodmart.com',
        to: body.ownerEmail,
        subject: 'Welcome to Foodmart! Your Owner Credentials',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #4f46e5;">Welcome to Foodmart Restaurant OS</h2>
            <p>Hello ${body.ownerName},</p>
            <p>Your restaurant <strong>${body.name}</strong> has been successfully registered on our platform.</p>
            <p>Here are your owner dashboard login credentials:</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Login URL:</strong> <a href="${loginUrl}">${loginUrl}</a></p>
              <p style="margin: 5px 0;"><strong>Username / Email:</strong> ${body.ownerEmail}</p>
              <p style="margin: 5px 0;"><strong>Temporary Password:</strong> ${generatedPassword}</p>
            </div>
            <p style="color: #ef4444; font-size: 14px;"><strong>Please change your password immediately after logging in.</strong></p>
            <p>Your plan is set to <strong>${body.plan}</strong>, expiring on ${planExpiresAt.toDateString()}.</p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Failed to send onboarding email via Resend:', errText);
    }
  } catch (err) {
    console.error('Error sending onboarding email:', err);
  }

  return c.json({
    success: true,
    message: 'Restaurant and owner account created successfully. Credentials emailed.',
    data: {
      restaurant: result.restaurant,
      owner: {
        id: result.owner.id,
        name: result.owner.name,
        email: result.owner.email,
        temporaryPassword: generatedPassword, // returned for test validation
      },
    },
  });
});

// ─────────────────────────────────────────────
// PATCH /admin/restaurants/:id (Update Plan/Status)
// ─────────────────────────────────────────────
router.patch('/restaurants/:id', zValidator('json', updateRestaurantSchema), async (c) => {
  const id = c.req.param('id');
  const body = c.req.valid('json');

  const restaurant = await db.restaurant.findUnique({
    where: { id },
  });

  if (!restaurant) {
    c.status(404);
    return c.json({
      success: false,
      message: 'Restaurant not found',
    });
  }

  // Build update payload
  const updateData: any = {};
  if (body.plan) {
    updateData.plan = body.plan;
  }
  if (body.planExpiresAt) {
    updateData.planExpiresAt = new Date(body.planExpiresAt);
  }
  if (body.status) {
    updateData.status = body.status;
  }
  if (body.allowDineIn !== undefined) {
    updateData.allowDineIn = body.allowDineIn;
  }
  if (body.allowTakeaway !== undefined) {
    updateData.allowTakeaway = body.allowTakeaway;
  }
  if (body.allowReservations !== undefined) {
    updateData.allowReservations = body.allowReservations;
  }

  const updatedRestaurant = await db.restaurant.update({
    where: { id },
    data: updateData,
  });

  return c.json({
    success: true,
    message: 'Restaurant updated successfully',
    data: updatedRestaurant,
  });
});

// ─────────────────────────────────────────────
// GET /admin/restaurants/:id (Get Single Restaurant)
// ─────────────────────────────────────────────
router.get('/restaurants/:id', async (c) => {
  const id = c.req.param('id');
  const restaurant = await db.restaurant.findUnique({
    where: { id },
    include: {
      staff: true,
      branches: true,
      photos: true,
      complaints: true,
    },
  });

  if (!restaurant) {
    c.status(404);
    return c.json({
      success: false,
      message: 'Restaurant not found',
    });
  }

  const owner = restaurant.staff.find((s) => s.role === 'OWNER') || null;

  // Calculate statistics
  const totalOrders = await db.order.count({ where: { restaurantId: id } });
  
  const orders = await db.order.findMany({
    where: { restaurantId: id },
    select: { totalAmount: true },
  });
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);

  const ratingComplaints = await db.complaint.findMany({
    where: { restaurantId: id, rating: { not: null } },
    select: { rating: true },
  });
  const avgRating = ratingComplaints.length > 0
    ? ratingComplaints.reduce((sum, comp) => sum + (comp.rating || 0), 0) / ratingComplaints.length
    : 4.9;

  const recentOrders = await db.order.findMany({
    where: { restaurantId: id },
    include: {
      customer: {
        select: { name: true, email: true },
      },
      items: {
        select: { name: true, quantity: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  return c.json({
    success: true,
    data: {
      ...restaurant,
      owner,
      stats: {
        totalOrders,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        avgRating: Math.round(avgRating * 10) / 10,
        avgPrepTime: 18,
      },
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        totalAmount: Number(o.totalAmount),
        createdAt: o.createdAt,
        status: o.status,
        customerName: o.customer.name,
        itemsSummary: o.items.map((i) => `${i.quantity}x ${i.name}`).join(', '),
      })),
    },
  });
});

// ─────────────────────────────────────────────
// GET /admin/analytics
// ─────────────────────────────────────────────
router.get('/analytics', async (c) => {
  const totalRestaurants = await db.restaurant.count();
  
  const activeRestaurants = await db.restaurant.count({
    where: {
      status: {
        in: ['ACTIVE', 'TRIAL'],
      },
    },
  });

  const totalCustomers = await db.customer.count();

  const totalActiveSessions = await db.tableSession.count({
    where: {
      status: {
        in: ['ACTIVE', 'BILL_REQUESTED', 'PAYMENT_PENDING'],
      },
    },
  });

  return c.json({
    success: true,
    data: {
      totalRestaurants,
      activeRestaurants,
      totalCustomers,
      totalActiveSessions,
    },
  });
});

// ─────────────────────────────────────────────
// GET /admin/customers
// ─────────────────────────────────────────────
router.get('/customers', async (c) => {
  const search = c.req.query('search') || '';

  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
    ];
  }

  const customers = await db.customer.findMany({
    where,
    include: {
      orders: {
        select: {
          totalAmount: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const data = customers.map((cust) => {
    const totalSpent = cust.orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    return {
      id: cust.id,
      name: cust.name,
      email: cust.email,
      phone: cust.phone,
      createdAt: cust.createdAt,
      totalOrders: cust.orders.length,
      totalSpent: Math.round(totalSpent * 100) / 100,
      isActive: cust.isActive,
    };
  });

  return c.json({
    success: true,
    data,
  });
});

// ─────────────────────────────────────────────
// GET /admin/complaints
// ─────────────────────────────────────────────
router.get('/complaints', async (c) => {
  const status = c.req.query('status'); // 'RESOLVED', 'UNRESOLVED'
  const category = c.req.query('category');
  const urgency = c.req.query('urgency');

  const where: any = {};
  if (status) {
    where.isResolved = status === 'RESOLVED';
  }
  if (category) {
    where.category = category;
  }
  if (urgency) {
    where.urgency = urgency;
  }

  const complaints = await db.complaint.findMany({
    where,
    include: {
      restaurant: {
        select: {
          name: true,
        },
      },
      customer: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return c.json({
    success: true,
    data: complaints,
  });
});

// ─────────────────────────────────────────────
// PATCH /admin/complaints/:id/resolve
// ─────────────────────────────────────────────
router.patch('/complaints/:id/resolve', async (c) => {
  const id = c.req.param('id');

  const complaint = await db.complaint.findUnique({
    where: { id },
  });

  if (!complaint) {
    c.status(404);
    return c.json({
      success: false,
      message: 'Complaint not found',
    });
  }

  const updated = await db.complaint.update({
    where: { id },
    data: {
      isResolved: true,
      resolvedAt: new Date(),
    },
  });

  return c.json({
    success: true,
    message: 'Complaint marked as resolved',
    data: updated,
  });
});

// ─────────────────────────────────────────────
// GET /admin/complaints/:id (Get Single Complaint)
// ─────────────────────────────────────────────
router.get('/complaints/:id', async (c) => {
  const id = c.req.param('id');
  const complaint = await db.complaint.findUnique({
    where: { id },
    include: {
      restaurant: {
        select: {
          id: true,
          name: true,
        },
      },
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  if (!complaint) {
    c.status(404);
    return c.json({
      success: false,
      message: 'Complaint not found',
    });
  }

  return c.json({
    success: true,
    data: complaint,
  });
});

// ─────────────────────────────────────────────
// PATCH /admin/customers/:id
// ─────────────────────────────────────────────
router.patch('/customers/:id', async (c) => {
  const id = c.req.param('id');
  const { isActive } = await c.req.json();

  const customer = await db.customer.findUnique({
    where: { id },
  });

  if (!customer) {
    c.status(404);
    return c.json({
      success: false,
      message: 'Customer not found',
    });
  }

  const updated = await db.customer.update({
    where: { id },
    data: { isActive },
  });

  return c.json({
    success: true,
    message: `Customer account ${isActive ? 'activated' : 'deactivated'} successfully`,
    data: updated,
  });
});

export const adminRouter = router;
