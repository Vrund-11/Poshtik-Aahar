import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import crypto from 'crypto';

import { db } from '@foodmart/database';
import {
  branchSchema,
  floorSchema,
  tableSchema,
  menuCategorySchema,
  menuItemSchema,
  createStaffSchema,
  updateStaffSchema,
  taxConfigSchema,
  loyaltyConfigSchema,
  updateRestaurantProfileSchema
} from '@foodmart/shared';
import { authMiddleware } from '../../middleware/auth';
import { rbacMiddleware } from '../../middleware/rbac';
import { hashPassword } from '../../lib/password';
import { env } from '../../config/env';
import { redis } from '../../config/redis';
import { uploadToR2, deleteFromR2, validateImageMagicBytes } from '../../lib/r2';

const router = new Hono();

// Global protection for owners
router.use('*', authMiddleware());
router.use('*', rbacMiddleware(['OWNER']));

// Context middleware to get restaurantId
router.use('*', async (c, next) => {
  const user = c.get('user');
  
  const staff = await db.staff.findUnique({
    where: { id: user.userId },
  });

  if (!staff || staff.role !== 'OWNER' || !staff.isActive) {
    c.status(403);
    return c.json({ success: false, message: 'Forbidden: Owner account is inactive or not found' });
  }

  c.set('restaurantId' as any, staff.restaurantId);
  await next();
});

// Helper to get active menu ID for cache invalidation
async function getMenuId(restaurantId: string): Promise<string> {
  let menu = await db.menu.findFirst({
    where: { restaurantId, isActive: true },
  });
  if (!menu) {
    menu = await db.menu.create({
      data: { restaurantId, name: 'Main Menu', isActive: true },
    });
  }
  return menu.id;
}

// Helper to invalidate menu cache
async function invalidateMenuCache(restaurantId: string) {
  try {
    await redis.del(`menu:${restaurantId}`);
    console.log(`[Cache] Invalidated menu cache for restaurant: ${restaurantId}`);
  } catch (err) {
    console.error('Failed to invalidate menu cache:', err);
  }
}

// ─────────────────────────────────────────────
// BRANCH ENDPOINTS
// ─────────────────────────────────────────────

router.get('/branches', async (c) => {
  const restaurantId = c.get('restaurantId' as any);
  const branches = await db.branch.findMany({
    where: { restaurantId },
    orderBy: { createdAt: 'desc' },
  });
  return c.json({ success: true, data: branches });
});

router.post('/branches', zValidator('json', branchSchema), async (c) => {
  const restaurantId = c.get('restaurantId' as any);
  const body = c.req.valid('json');

  const branch = await db.branch.create({
    data: {
      restaurantId,
      name: body.name,
      address: body.address,
      phone: body.phone,
      isActive: body.isActive,
    },
  });

  return c.json({ success: true, message: 'Branch created successfully', data: branch });
});

router.patch('/branches/:id', zValidator('json', branchSchema.partial()), async (c) => {
  const restaurantId = c.get('restaurantId' as any);
  const id = c.req.param('id');
  const body = c.req.valid('json');

  const branch = await db.branch.findFirst({
    where: { id, restaurantId },
  });

  if (!branch) {
    c.status(404);
    return c.json({ success: false, message: 'Branch not found or unauthorized' });
  }

  const updated = await db.branch.update({
    where: { id },
    data: body,
  });

  return c.json({ success: true, message: 'Branch updated successfully', data: updated });
});

router.delete('/branches/:id', async (c) => {
  const restaurantId = c.get('restaurantId' as any);
  const id = c.req.param('id');

  const branch = await db.branch.findFirst({
    where: { id, restaurantId },
  });

  if (!branch) {
    c.status(404);
    return c.json({ success: false, message: 'Branch not found or unauthorized' });
  }

  // Deactivate instead of deleting
  const updated = await db.branch.update({
    where: { id },
    data: { isActive: false },
  });

  return c.json({ success: true, message: 'Branch deactivated successfully', data: updated });
});

// ─────────────────────────────────────────────
// FLOOR ENDPOINTS
// ─────────────────────────────────────────────

router.get('/branches/:branchId/floors', async (c) => {
  const restaurantId = c.get('restaurantId' as any);
  const branchId = c.req.param('branchId');

  const branch = await db.branch.findFirst({
    where: { id: branchId, restaurantId },
  });

  if (!branch) {
    c.status(404);
    return c.json({ success: false, message: 'Branch not found or unauthorized' });
  }

  const floors = await db.floor.findMany({
    where: { branchId },
    orderBy: { sortOrder: 'asc' },
  });

  return c.json({ success: true, data: floors });
});

router.post('/branches/:branchId/floors', zValidator('json', floorSchema), async (c) => {
  const restaurantId = c.get('restaurantId' as any);
  const branchId = c.req.param('branchId');
  const body = c.req.valid('json');

  const branch = await db.branch.findFirst({
    where: { id: branchId, restaurantId },
  });

  if (!branch) {
    c.status(404);
    return c.json({ success: false, message: 'Branch not found or unauthorized' });
  }

  const floor = await db.floor.create({
    data: {
      branchId,
      name: body.name,
      sortOrder: body.sortOrder,
    },
  });

  return c.json({ success: true, message: 'Floor created successfully', data: floor });
});

router.patch('/floors/:id', zValidator('json', floorSchema.partial()), async (c) => {
  const restaurantId = c.get('restaurantId' as any);
  const id = c.req.param('id');
  const body = c.req.valid('json');

  const floor = await db.floor.findFirst({
    where: {
      id,
      branch: { restaurantId },
    },
  });

  if (!floor) {
    c.status(404);
    return c.json({ success: false, message: 'Floor not found or unauthorized' });
  }

  const updated = await db.floor.update({
    where: { id },
    data: body,
  });

  return c.json({ success: true, message: 'Floor updated successfully', data: updated });
});

router.delete('/floors/:id', async (c) => {
  const restaurantId = c.get('restaurantId' as any);
  const id = c.req.param('id');

  const floor = await db.floor.findFirst({
    where: {
      id,
      branch: { restaurantId },
    },
  });

  if (!floor) {
    c.status(404);
    return c.json({ success: false, message: 'Floor not found or unauthorized' });
  }

  await db.floor.delete({
    where: { id },
  });

  return c.json({ success: true, message: 'Floor deleted successfully' });
});

// ─────────────────────────────────────────────
// TABLE ENDPOINTS
// ─────────────────────────────────────────────

router.get('/floors/:floorId/tables', async (c) => {
  const restaurantId = c.get('restaurantId' as any);
  const floorId = c.req.param('floorId');

  const floor = await db.floor.findFirst({
    where: {
      id: floorId,
      branch: { restaurantId },
    },
  });

  if (!floor) {
    c.status(404);
    return c.json({ success: false, message: 'Floor not found or unauthorized' });
  }

  const tables = await db.table.findMany({
    where: { floorId },
    orderBy: { number: 'asc' },
  });

  return c.json({ success: true, data: tables });
});

router.post('/floors/:floorId/tables', zValidator('json', tableSchema), async (c) => {
  const restaurantId = c.get('restaurantId' as any);
  const floorId = c.req.param('floorId');
  const body = c.req.valid('json');

  const floor = await db.floor.findFirst({
    where: {
      id: floorId,
      branch: { restaurantId },
    },
  });

  if (!floor) {
    c.status(404);
    return c.json({ success: false, message: 'Floor not found or unauthorized' });
  }

  // Check unique table number on floor
  const existingTable = await db.table.findUnique({
    where: {
      floorId_number: {
        floorId,
        number: body.number,
      },
    },
  });

  if (existingTable) {
    c.status(400);
    return c.json({ success: false, message: `Table number ${body.number} already exists on this floor` });
  }

  const table = await db.table.create({
    data: {
      floorId,
      number: body.number,
      capacity: body.capacity,
      isActive: body.isActive,
      // unique qr token generated by default cuid
    },
  });

  return c.json({ success: true, message: 'Table created successfully', data: table });
});

router.patch('/tables/:id', zValidator('json', tableSchema.partial()), async (c) => {
  const restaurantId = c.get('restaurantId' as any);
  const id = c.req.param('id');
  const body = c.req.valid('json');

  const table = await db.table.findFirst({
    where: {
      id,
      floor: {
        branch: { restaurantId },
      },
    },
  });

  if (!table) {
    c.status(404);
    return c.json({ success: false, message: 'Table not found or unauthorized' });
  }

  // If changing table number, verify uniqueness on that floor
  if (body.number && body.number !== table.number) {
    const existingTable = await db.table.findUnique({
      where: {
        floorId_number: {
          floorId: table.floorId,
          number: body.number,
        },
      },
    });

    if (existingTable) {
      c.status(400);
      return c.json({ success: false, message: `Table number ${body.number} already exists on this floor` });
    }
  }

  const updated = await db.$transaction(async (tx) => {
    const tbl = await tx.table.update({
      where: { id },
      data: body,
    });

    if (body.status === 'AVAILABLE') {
      await tx.tableSession.updateMany({
        where: {
          tableId: id,
          status: {
            not: 'CLOSED',
          },
        },
        data: {
          status: 'CLOSED',
          closedAt: new Date(),
        },
      });
    }

    return tbl;
  });

  return c.json({ success: true, message: 'Table updated successfully', data: updated });
});

router.delete('/tables/:id', async (c) => {
  const restaurantId = c.get('restaurantId' as any);
  const id = c.req.param('id');

  const table = await db.table.findFirst({
    where: {
      id,
      floor: {
        branch: { restaurantId },
      },
    },
  });

  if (!table) {
    c.status(404);
    return c.json({ success: false, message: 'Table not found or unauthorized' });
  }

  // Deactivate instead of deleting
  const updated = await db.table.update({
    where: { id },
    data: { isActive: false },
  });

  return c.json({ success: true, message: 'Table deactivated successfully', data: updated });
});

// GET QR Code Deep Link
router.post('/tables/:id/qr', async (c) => {
  const restaurantId = c.get('restaurantId' as any);
  const id = c.req.param('id');

  const table = await db.table.findFirst({
    where: {
      id,
      floor: {
        branch: { restaurantId },
      },
    },
  });

  if (!table) {
    c.status(404);
    return c.json({ success: false, message: 'Table not found or unauthorized' });
  }

  const customerAppUrl = env.CUSTOMER_APP_URL || 'http://localhost:3000';
  const qrUrl = `${customerAppUrl}/t/${table.qrCode}`;

  return c.json({
    success: true,
    data: {
      qrCode: table.qrCode,
      qrUrl,
    },
  });
});

// ─────────────────────────────────────────────
// MENU MANAGEMENT ENDPOINTS
// ─────────────────────────────────────────────

router.get('/menus/categories', async (c) => {
  const restaurantId = c.get('restaurantId' as any);
  const menuId = await getMenuId(restaurantId);

  const categories = await db.menuCategory.findMany({
    where: { menuId },
    include: {
      items: {
        orderBy: { sortOrder: 'asc' },
      },
    },
    orderBy: { sortOrder: 'asc' },
  });

  return c.json({ success: true, data: categories });
});

router.post('/menus/categories', zValidator('json', menuCategorySchema), async (c) => {
  const restaurantId = c.get('restaurantId' as any);
  const menuId = await getMenuId(restaurantId);
  const body = c.req.valid('json');

  const category = await db.menuCategory.create({
    data: {
      menuId,
      name: body.name,
      sortOrder: body.sortOrder,
      isActive: body.isActive,
    },
  });

  await invalidateMenuCache(restaurantId);

  return c.json({ success: true, message: 'Category created successfully', data: category });
});

router.patch('/menus/categories/:id', zValidator('json', menuCategorySchema.partial()), async (c) => {
  const restaurantId = c.get('restaurantId' as any);
  const id = c.req.param('id');
  const body = c.req.valid('json');

  const category = await db.menuCategory.findFirst({
    where: {
      id,
      menu: { restaurantId },
    },
  });

  if (!category) {
    c.status(404);
    return c.json({ success: false, message: 'Category not found or unauthorized' });
  }

  const updated = await db.menuCategory.update({
    where: { id },
    data: body,
  });

  await invalidateMenuCache(restaurantId);

  return c.json({ success: true, message: 'Category updated successfully', data: updated });
});

router.delete('/menus/categories/:id', async (c) => {
  const restaurantId = c.get('restaurantId' as any);
  const id = c.req.param('id');

  const category = await db.menuCategory.findFirst({
    where: {
      id,
      menu: { restaurantId },
    },
  });

  if (!category) {
    c.status(404);
    return c.json({ success: false, message: 'Category not found or unauthorized' });
  }

  await db.menuCategory.delete({
    where: { id },
  });

  await invalidateMenuCache(restaurantId);

  return c.json({ success: true, message: 'Category deleted successfully' });
});

router.post('/menus/items', zValidator('json', menuItemSchema.extend({ categoryId: z.string().min(1) })), async (c) => {
  const restaurantId = c.get('restaurantId' as any);
  const { categoryId, ...body } = c.req.valid('json');

  // Verify category belongs to owner's restaurant
  const category = await db.menuCategory.findFirst({
    where: {
      id: categoryId,
      menu: { restaurantId },
    },
  });

  if (!category) {
    c.status(400);
    return c.json({ success: false, message: 'Invalid categoryId or unauthorized' });
  }

  const item = await db.menuItem.create({
    data: {
      categoryId,
      name: body.name,
      description: body.description,
      price: body.price,
      imageUrl: body.imageUrl,
      isVeg: body.isVeg,
      isAvailable: body.isAvailable,
      sortOrder: body.sortOrder,
      modifiers: body.modifiers ? JSON.stringify(body.modifiers) : '[]',
    },
  });

  await invalidateMenuCache(restaurantId);

  return c.json({ success: true, message: 'Menu item created successfully', data: item });
});

router.patch('/menus/items/:id', zValidator('json', menuItemSchema.partial()), async (c) => {
  const restaurantId = c.get('restaurantId' as any);
  const id = c.req.param('id');
  const body = c.req.valid('json');

  const item = await db.menuItem.findFirst({
    where: {
      id,
      category: {
        menu: { restaurantId },
      },
    },
  });

  if (!item) {
    c.status(404);
    return c.json({ success: false, message: 'Menu item not found or unauthorized' });
  }

  const updateData: any = { ...body };
  if (body.modifiers) {
    updateData.modifiers = JSON.stringify(body.modifiers);
  }

  const updated = await db.menuItem.update({
    where: { id },
    data: updateData,
  });

  await invalidateMenuCache(restaurantId);

  return c.json({ success: true, message: 'Menu item updated successfully', data: updated });
});

router.delete('/menus/items/:id', async (c) => {
  const restaurantId = c.get('restaurantId' as any);
  const id = c.req.param('id');

  const item = await db.menuItem.findFirst({
    where: {
      id,
      category: {
        menu: { restaurantId },
      },
    },
  });

  if (!item) {
    c.status(404);
    return c.json({ success: false, message: 'Menu item not found or unauthorized' });
  }

  await db.menuItem.delete({
    where: { id },
  });

  await invalidateMenuCache(restaurantId);

  return c.json({ success: true, message: 'Menu item deleted successfully' });
});

router.patch('/menus/items/:id/availability', async (c) => {
  const restaurantId = c.get('restaurantId' as any);
  const id = c.req.param('id');

  const item = await db.menuItem.findFirst({
    where: {
      id,
      category: {
        menu: { restaurantId },
      },
    },
  });

  if (!item) {
    c.status(404);
    return c.json({ success: false, message: 'Menu item not found or unauthorized' });
  }

  const updated = await db.menuItem.update({
    where: { id },
    data: {
      isAvailable: !item.isAvailable,
    },
  });

  await invalidateMenuCache(restaurantId);

  return c.json({
    success: true,
    message: `Availability toggled to ${updated.isAvailable ? 'Available' : 'Unavailable'}`,
    data: updated,
  });
});

// ─────────────────────────────────────────────
// STAFF MANAGEMENT ENDPOINTS
// ─────────────────────────────────────────────

router.get('/staff', async (c) => {
  const restaurantId = c.get('restaurantId' as any);
  
  const staffList = await db.staff.findMany({
    where: {
      restaurantId,
      role: { in: ['MANAGER', 'CHEF'] },
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return c.json({ success: true, data: staffList });
});

router.post('/staff', zValidator('json', createStaffSchema), async (c) => {
  const restaurantId = c.get('restaurantId' as any);
  const body = c.req.valid('json');

  // Verify uniqueness of email
  const existing = await db.staff.findUnique({
    where: { email: body.email },
  });

  if (existing) {
    c.status(400);
    return c.json({ success: false, message: 'Email is already registered' });
  }

  // Generate temporary password
  const tempPassword = crypto.randomBytes(5).toString('hex');
  const passwordHash = await hashPassword(tempPassword);

  const staff = await db.staff.create({
    data: {
      restaurantId,
      name: body.name,
      email: body.email,
      phone: body.phone,
      role: body.role,
      passwordHash,
      isActive: true,
    },
  });

  // Send onboarding email via Resend
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
        to: body.email,
        subject: `Your Staff Credentials - Foodmart Restaurant OS`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #4f46e5;">Foodmart Restaurant OS</h2>
            <p>Hello ${body.name},</p>
            <p>You have been registered as a <strong>${body.role}</strong> on our platform.</p>
            <p>Here are your login credentials:</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Login URL:</strong> <a href="${loginUrl}">${loginUrl}</a></p>
              <p style="margin: 5px 0;"><strong>Username / Email:</strong> ${body.email}</p>
              <p style="margin: 5px 0;"><strong>Temporary Password:</strong> ${tempPassword}</p>
            </div>
            <p style="color: #ef4444; font-size: 14px;"><strong>Please update your password after logging in.</strong></p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Failed to send staff onboarding email:', errText);
    }
  } catch (err) {
    console.error('Error sending staff email:', err);
  }

  return c.json({
    success: true,
    message: 'Staff account created successfully. Credentials emailed.',
    data: {
      id: staff.id,
      name: staff.name,
      email: staff.email,
      role: staff.role,
      temporaryPassword: tempPassword, // returned for verification in tests
    },
  });
});

router.patch('/staff/:id', zValidator('json', updateStaffSchema), async (c) => {
  const restaurantId = c.get('restaurantId' as any);
  const id = c.req.param('id');
  const body = c.req.valid('json');

  const staff = await db.staff.findFirst({
    where: { id, restaurantId, role: { in: ['MANAGER', 'CHEF'] } },
  });

  if (!staff) {
    c.status(404);
    return c.json({ success: false, message: 'Staff member not found or unauthorized' });
  }

  // Verify email uniqueness if being updated
  if (body.email && body.email !== staff.email) {
    const existing = await db.staff.findUnique({
      where: { email: body.email },
    });

    if (existing) {
      c.status(400);
      return c.json({ success: false, message: 'Email is already taken' });
    }
  }

  const updated = await db.staff.update({
    where: { id },
    data: body,
  });

  return c.json({ success: true, message: 'Staff member updated successfully', data: updated });
});

router.delete('/staff/:id', async (c) => {
  const restaurantId = c.get('restaurantId' as any);
  const id = c.req.param('id');

  const staff = await db.staff.findFirst({
    where: { id, restaurantId, role: { in: ['MANAGER', 'CHEF'] } },
  });

  if (!staff) {
    c.status(404);
    return c.json({ success: false, message: 'Staff member not found or unauthorized' });
  }

  // Deactivate instead of deleting
  const updated = await db.staff.update({
    where: { id },
    data: { isActive: false },
  });

  // Revoke active sessions
  await db.staffSession.deleteMany({
    where: { staffId: id },
  });

  return c.json({ success: true, message: 'Staff member deactivated successfully', data: updated });
});

// ─────────────────────────────────────────────
// SETTINGS (TAX + LOYALTY)
// ─────────────────────────────────────────────

router.get('/tax', async (c) => {
  const restaurantId = c.get('restaurantId' as any);
  let tax = await db.taxConfig.findUnique({
    where: { restaurantId },
  });

  if (!tax) {
    tax = await db.taxConfig.create({
      data: { restaurantId, gstPercent: 5.0, isActive: true },
    });
  }

  return c.json({ success: true, data: tax });
});

router.patch('/tax', zValidator('json', taxConfigSchema), async (c) => {
  const restaurantId = c.get('restaurantId' as any);
  const body = c.req.valid('json');

  const tax = await db.taxConfig.upsert({
    where: { restaurantId },
    update: body,
    create: { restaurantId, ...body },
  });

  return c.json({ success: true, message: 'Tax configuration updated successfully', data: tax });
});

router.get('/loyalty', async (c) => {
  const restaurantId = c.get('restaurantId' as any);
  let loyalty = await db.loyaltyConfig.findUnique({
    where: { restaurantId },
  });

  if (!loyalty) {
    loyalty = await db.loyaltyConfig.create({
      data: { restaurantId, pointsPerHundred: 1.0, isActive: true },
    });
  }

  return c.json({ success: true, data: loyalty });
});

router.patch('/loyalty', zValidator('json', loyaltyConfigSchema), async (c) => {
  const restaurantId = c.get('restaurantId' as any);
  const body = c.req.valid('json');

  const loyalty = await db.loyaltyConfig.upsert({
    where: { restaurantId },
    update: body,
    create: { restaurantId, ...body },
  });

  return c.json({ success: true, message: 'Loyalty configuration updated successfully', data: loyalty });
});

// ─────────────────────────────────────────────
// RESTAURANT PROFILE & PHOTO ENDPOINTS
// ─────────────────────────────────────────────

// PATCH /owner/profile (Update details)
router.patch('/profile', zValidator('json', updateRestaurantProfileSchema), async (c) => {
  const restaurantId = c.get('restaurantId' as any);
  const body = c.req.valid('json');

  const updatedRestaurant = await db.restaurant.update({
    where: { id: restaurantId },
    data: body,
  });

  return c.json({
    success: true,
    message: 'Profile updated successfully',
    data: updatedRestaurant,
  });
});

// POST /owner/photos (Upload photo to R2)
router.post('/photos', async (c) => {
  const restaurantId = c.get('restaurantId' as any);

  // Check if owner already has 5 photos
  const photoCount = await db.restaurantPhoto.count({
    where: { restaurantId },
  });

  if (photoCount >= 5) {
    c.status(400);
    return c.json({
      success: false,
      message: 'Maximum of 5 photos allowed per restaurant',
    });
  }

  // Parse body for file
  const form = await c.req.parseBody();
  const file = form.file || form.image;

  if (!file || !(file instanceof File)) {
    c.status(400);
    return c.json({
      success: false,
      message: 'No image file uploaded (form field "file" or "image")',
    });
  }

  // Size limit validation (2MB)
  const MAX_SIZE = 2 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    c.status(400);
    return c.json({
      success: false,
      message: 'Image size exceeds maximum limit of 2MB',
    });
  }

  // Validate magic bytes
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const isValidType = validateImageMagicBytes(buffer);

  if (!isValidType) {
    c.status(400);
    return c.json({
      success: false,
      message: 'Invalid image format. Only JPEG, PNG, and WebP are allowed.',
    });
  }

  // Upload to R2
  let imageUrl = '';
  try {
    imageUrl = await uploadToR2(buffer, file.name, file.type);
  } catch (err) {
    console.error('R2 upload failed:', err);
    c.status(500);
    return c.json({
      success: false,
      message: 'Failed to upload photo to storage',
    });
  }

  // Save to DB
  const photo = await db.restaurantPhoto.create({
    data: {
      restaurantId,
      url: imageUrl,
      sortOrder: photoCount, // append to end
    },
  });

  return c.json({
    success: true,
    message: 'Photo uploaded successfully',
    data: photo,
  });
});

// DELETE /owner/photos/:id
router.delete('/photos/:id', async (c) => {
  const restaurantId = c.get('restaurantId' as any);
  const photoId = c.req.param('id');

  // Retrieve photo
  const photo = await db.restaurantPhoto.findFirst({
    where: {
      id: photoId,
      restaurantId,
    },
  });

  if (!photo) {
    c.status(404);
    return c.json({
      success: false,
      message: 'Photo not found or does not belong to your restaurant',
    });
  }

  // Delete from storage
  await deleteFromR2(photo.url);

  // Delete from DB
  await db.restaurantPhoto.delete({
    where: { id: photoId },
  });

  return c.json({
    success: true,
    message: 'Photo deleted successfully',
  });
});

// ─────────────────────────────────────────────
// ANALYTICS ENDPOINTS
// ─────────────────────────────────────────────

router.get('/analytics', async (c) => {
  const restaurantId = c.get('restaurantId' as any);

  // Today boundaries
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  // Today's orders
  const todayOrders = await db.order.findMany({
    where: {
      restaurantId,
      createdAt: { gte: todayStart, lte: todayEnd },
      status: { notIn: ['CANCELLED'] },
    },
    include: { items: true },
  });

  const todayOrderCount = todayOrders.length;
  const todayRevenue = todayOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);

  // Total unique customers (all time)
  const uniqueCustomers = await db.order.findMany({
    where: { restaurantId, status: { notIn: ['CANCELLED'] } },
    distinct: ['customerId'],
    select: { customerId: true },
  });

  // Top 5 dishes (by order count, all time)
  const topDishesRaw = await db.orderItem.groupBy({
    by: ['menuItemId', 'name'],
    where: {
      order: { restaurantId, status: { notIn: ['CANCELLED'] } },
    },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: 'desc' } },
    take: 5,
  });

  const topDishes = topDishesRaw.map((d) => ({
    menuItemId: d.menuItemId,
    name: d.name,
    totalOrdered: d._sum.quantity || 0,
  }));

  // Orders by hour for today (24 slots)
  const ordersByHour: number[] = Array(24).fill(0);
  todayOrders.forEach((o) => {
    const hour = new Date(o.createdAt).getHours();
    ordersByHour[hour]++;
  });

  return c.json({
    success: true,
    data: {
      todayOrderCount,
      todayRevenue: Math.round(todayRevenue * 100) / 100,
      totalUniqueCustomers: uniqueCustomers.length,
      topDishes,
      ordersByHour,
    },
  });
});

// ─────────────────────────────────────────────
// UPSELL CONFIG ENDPOINTS
// ─────────────────────────────────────────────

router.get('/upsell-configs', async (c) => {
  const restaurantId = c.get('restaurantId' as any);

  const configs = await db.upsellConfig.findMany({
    where: { restaurantId },
    orderBy: { triggerPhase: 'asc' },
  });

  return c.json({
    success: true,
    data: configs,
  });
});

router.post('/upsell-configs', zValidator('json', z.object({
  triggerPhase: z.string().min(1),
  promptText: z.string().min(5),
  menuItemId: z.string().optional(),
  isActive: z.boolean().optional().default(true),
})), async (c) => {
  const restaurantId = c.get('restaurantId' as any);
  const { triggerPhase, promptText, menuItemId, isActive } = c.req.valid('json');

  const config = await db.upsellConfig.create({
    data: {
      restaurantId,
      triggerPhase,
      promptText,
      menuItemId: menuItemId || null,
      isActive,
    },
  });

  return c.json({
    success: true,
    message: 'Upsell config created',
    data: config,
  });
});

router.patch('/upsell-configs/:id', zValidator('json', z.object({
  triggerPhase: z.string().min(1).optional(),
  promptText: z.string().min(5).optional(),
  menuItemId: z.string().optional(),
  isActive: z.boolean().optional(),
})), async (c) => {
  const restaurantId = c.get('restaurantId' as any);
  const id = c.req.param('id');
  const body = c.req.valid('json');

  const existing = await db.upsellConfig.findUnique({ where: { id } });
  if (!existing || existing.restaurantId !== restaurantId) {
    c.status(404);
    return c.json({ success: false, message: 'Upsell config not found' });
  }

  const updated = await db.upsellConfig.update({
    where: { id },
    data: body,
  });

  return c.json({
    success: true,
    message: 'Upsell config updated',
    data: updated,
  });
});

router.delete('/upsell-configs/:id', async (c) => {
  const restaurantId = c.get('restaurantId' as any);
  const id = c.req.param('id');

  const existing = await db.upsellConfig.findUnique({ where: { id } });
  if (!existing || existing.restaurantId !== restaurantId) {
    c.status(404);
    return c.json({ success: false, message: 'Upsell config not found' });
  }

  await db.upsellConfig.update({
    where: { id },
    data: { isActive: false },
  });

  return c.json({
    success: true,
    message: 'Upsell config deactivated',
  });
});

export const ownerRouter = router;
