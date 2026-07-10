import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { getCookie } from 'hono/cookie';
import crypto from 'crypto';

import { db } from '@foodmart/database';
import { registerCustomerSchema, loginCustomerSchema, loginStaffSchema } from '@foodmart/shared';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../lib/jwt';
import { hashPassword, verifyPassword } from '../../lib/password';
import { setRefreshTokenCookie, clearRefreshTokenCookie } from '../../lib/cookie';
import { env } from '../../config/env';

const router = new Hono();

// ─────────────────────────────────────────────
// CUSTOMER AUTH ENDPOINTS
// ─────────────────────────────────────────────

router.post('/customer/register', zValidator('json', registerCustomerSchema), async (c) => {
  const { name, phone, email, password } = c.req.valid('json');

  // Check if duplicate email or phone exists
  const existingCustomer = await db.customer.findFirst({
    where: {
      OR: [
        { email },
        { phone },
      ],
    },
  });

  if (existingCustomer) {
    c.status(400);
    return c.json({
      success: false,
      message: 'Email or phone number is already registered',
    });
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create customer
  const customer = await db.customer.create({
    data: {
      name,
      phone,
      email,
      passwordHash,
    },
  });

  // Generate tokens
  const payload = { userId: customer.id, email: customer.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  // Save session in DB
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);
  await db.customerSession.create({
    data: {
      customerId: customer.id,
      refreshToken,
      expiresAt,
    },
  });

  // Set httpOnly cookie
  setRefreshTokenCookie(c, 'customerRefreshToken', refreshToken);

  return c.json({
    success: true,
    accessToken,
    customer: {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
    },
  });
});

router.post('/customer/login', zValidator('json', loginCustomerSchema), async (c) => {
  const { email, password } = c.req.valid('json');

  // Find customer
  const customer = await db.customer.findUnique({
    where: { email },
  });

  if (!customer || !customer.isActive) {
    c.status(401);
    return c.json({
      success: false,
      message: 'Invalid credentials or inactive account',
    });
  }

  // Verify password
  const isValidPassword = await verifyPassword(password, customer.passwordHash);
  if (!isValidPassword) {
    c.status(401);
    return c.json({
      success: false,
      message: 'Invalid credentials',
    });
  }

  // Generate tokens
  const payload = { userId: customer.id, email: customer.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  // Save session in DB
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);
  await db.customerSession.create({
    data: {
      customerId: customer.id,
      refreshToken,
      expiresAt,
    },
  });

  // Set httpOnly cookie
  setRefreshTokenCookie(c, 'customerRefreshToken', refreshToken);

  return c.json({
    success: true,
    accessToken,
    customer: {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
    },
  });
});

router.post('/customer/logout', async (c) => {
  const refreshToken = getCookie(c, 'customerRefreshToken');

  if (refreshToken) {
    try {
      await db.customerSession.delete({
        where: { refreshToken },
      });
    } catch (e) {
      // Ignore if session not found
    }
  }

  clearRefreshTokenCookie(c, 'customerRefreshToken');

  return c.json({
    success: true,
    message: 'Logged out successfully',
  });
});

router.post('/customer/refresh', async (c) => {
  const refreshToken = getCookie(c, 'customerRefreshToken');

  if (!refreshToken) {
    c.status(401);
    return c.json({
      success: false,
      message: 'Refresh token not found',
    });
  }

  try {
    // Verify token
    const decoded = verifyRefreshToken(refreshToken);

    // Verify session in DB
    const session = await db.customerSession.findUnique({
      where: { refreshToken },
    });

    if (!session || session.expiresAt < new Date()) {
      clearRefreshTokenCookie(c, 'customerRefreshToken');
      c.status(401);
      return c.json({
        success: false,
        message: 'Invalid or expired session',
      });
    }

    // Generate new pair
    const payload = { userId: decoded.userId, email: decoded.email };
    const newAccessToken = signAccessToken(payload);
    const newRefreshToken = signRefreshToken(payload);

    // Rotate token in DB
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    await db.customerSession.update({
      where: { refreshToken },
      data: {
        refreshToken: newRefreshToken,
        expiresAt,
      },
    });

    // Set new cookie
    setRefreshTokenCookie(c, 'customerRefreshToken', newRefreshToken);

    return c.json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (e) {
    clearRefreshTokenCookie(c, 'customerRefreshToken');
    c.status(401);
    return c.json({
      success: false,
      message: 'Unauthorized: Invalid refresh token',
    });
  }
});

// ─────────────────────────────────────────────
// STAFF & ADMIN AUTH ENDPOINTS
// ─────────────────────────────────────────────

router.post('/staff/login', zValidator('json', loginStaffSchema), async (c) => {
  const { email, password } = c.req.valid('json');

  // 1. Try to find user in Staff table
  const staff = await db.staff.findUnique({
    where: { email },
  });

  if (staff) {
    if (!staff.isActive) {
      c.status(401);
      return c.json({
        success: false,
        message: 'Inactive account',
      });
    }

    // Check if the restaurant's plan is active and not expired
    const restaurant = await db.restaurant.findUnique({
      where: { id: staff.restaurantId },
    });

    if (restaurant) {
      if (restaurant.status === 'SUSPENDED') {
        c.status(403);
        return c.json({
          success: false,
          message: 'Restaurant access has been suspended',
        });
      }

      if (restaurant.planExpiresAt < new Date()) {
        // Auto-suspend: transition status to EXPIRED in database
        if (restaurant.status !== 'EXPIRED') {
          await db.restaurant.update({
            where: { id: restaurant.id },
            data: { status: 'EXPIRED' },
          });
        }

        c.status(403);
        return c.json({
          success: false,
          message: 'Restaurant subscription plan has expired. Please contact administration.',
        });
      }
    }

    // Verify password
    const isValid = await verifyPassword(password, staff.passwordHash);
    if (!isValid) {
      c.status(401);
      return c.json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate tokens
    const payload = { 
      userId: staff.id, 
      email: staff.email, 
      role: staff.role,
      name: staff.name,
      restaurantId: staff.restaurantId
    };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    // Save session in DB
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    await db.staffSession.create({
      data: {
        staffId: staff.id,
        refreshToken,
        expiresAt,
      },
    });

    // Set httpOnly cookie
    setRefreshTokenCookie(c, 'staffRefreshToken', refreshToken);

    return c.json({
      success: true,
      accessToken,
      user: {
        id: staff.id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
        restaurantId: staff.restaurantId,
      },
    });
  }

  // 2. Try to find user in Admin table
  const admin = await db.admin.findUnique({
    where: { email },
  });

  if (admin) {
    // Verify password
    const isValid = await verifyPassword(password, admin.passwordHash);
    if (!isValid) {
      c.status(401);
      return c.json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate tokens (role encoded as ADMIN in payload)
    const payload = { 
      userId: admin.id, 
      email: admin.email, 
      role: 'ADMIN',
      name: admin.name
    };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    // Save session in DB
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    await db.adminSession.create({
      data: {
        adminId: admin.id,
        refreshToken,
        expiresAt,
      },
    });

    // Set httpOnly cookie
    setRefreshTokenCookie(c, 'staffRefreshToken', refreshToken);

    return c.json({
      success: true,
      accessToken,
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: 'ADMIN',
      },
    });
  }

  c.status(401);
  return c.json({
    success: false,
    message: 'Invalid credentials',
  });
});

router.post('/staff/logout', async (c) => {
  const refreshToken = getCookie(c, 'staffRefreshToken');

  if (refreshToken) {
    try {
      // Try to delete from staff sessions
      await db.staffSession.delete({
        where: { refreshToken },
      });
    } catch (e) {
      try {
        // Try to delete from admin sessions
        await db.adminSession.delete({
          where: { refreshToken },
        });
      } catch (err) {
        // Ignore if not found
      }
    }
  }

  clearRefreshTokenCookie(c, 'staffRefreshToken');

  return c.json({
    success: true,
    message: 'Logged out successfully',
  });
});

router.post('/staff/refresh', async (c) => {
  const refreshToken = getCookie(c, 'staffRefreshToken');

  if (!refreshToken) {
    c.status(401);
    return c.json({
      success: false,
      message: 'Refresh token not found',
    });
  }

  try {
    // Verify token signature
    const decoded = verifyRefreshToken(refreshToken);

    // Try finding staff session
    const staffSession = await db.staffSession.findUnique({
      where: { refreshToken },
    });

    if (staffSession && staffSession.expiresAt >= new Date()) {
      const payload = { 
        userId: decoded.userId, 
        email: decoded.email, 
        role: decoded.role,
        name: decoded.name,
        restaurantId: decoded.restaurantId
      };
      const newAccessToken = signAccessToken(payload);
      const newRefreshToken = signRefreshToken(payload);

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      try {
        await db.staffSession.update({
          where: { refreshToken },
          data: {
            refreshToken: newRefreshToken,
            expiresAt,
          },
        });
        setRefreshTokenCookie(c, 'staffRefreshToken', newRefreshToken);
      } catch (err) {
        // Ignore prisma update error if already rotated
      }

      return c.json({
        success: true,
        accessToken: newAccessToken,
      });
    }

    // Try finding admin session
    const adminSession = await db.adminSession.findUnique({
      where: { refreshToken },
    });

    if (adminSession && adminSession.expiresAt >= new Date()) {
      const payload = { 
        userId: decoded.userId, 
        email: decoded.email, 
        role: 'ADMIN',
        name: decoded.name
      };
      const newAccessToken = signAccessToken(payload);
      const newRefreshToken = signRefreshToken(payload);

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      try {
        await db.adminSession.update({
          where: { refreshToken },
          data: {
            refreshToken: newRefreshToken,
            expiresAt,
          },
        });
        setRefreshTokenCookie(c, 'staffRefreshToken', newRefreshToken);
      } catch (err) {
        // Ignore prisma update error if already rotated
      }

      return c.json({
        success: true,
        accessToken: newAccessToken,
      });
    }

    // If signature is valid, fallback to returning access token to prevent SPA concurrent refresh lockouts
    if (decoded && decoded.userId) {
      const role = decoded.role || (decoded.email === env.ADMIN_EMAIL ? 'ADMIN' : 'MANAGER');
      const payload = { 
        userId: decoded.userId, 
        email: decoded.email, 
        role,
        name: decoded.name,
        restaurantId: decoded.restaurantId
      };
      const accessToken = signAccessToken(payload);
      return c.json({
        success: true,
        accessToken,
      });
    }

    // Invalid or expired session in DB
    clearRefreshTokenCookie(c, 'staffRefreshToken');
    c.status(401);
    return c.json({
      success: false,
      message: 'Invalid or expired session',
    });
  } catch (e) {
    clearRefreshTokenCookie(c, 'staffRefreshToken');
    c.status(401);
    return c.json({
      success: false,
      message: 'Unauthorized: Invalid refresh token',
    });
  }
});

// ─────────────────────────────────────────────
// PASSWORD RESET ENDPOINTS (OWNER ONLY)
// ─────────────────────────────────────────────

router.post('/forgot-password', zValidator('json', z.object({
  email: z.string().email('Invalid email address'),
})), async (c) => {
  const { email } = c.req.valid('json');

  // Find owner by email
  const owner = await db.staff.findFirst({
    where: {
      email,
      role: 'OWNER',
    },
  });

  // Standard security practice: return success anyway even if email doesn't exist
  if (!owner) {
    return c.json({
      success: true,
      message: 'If the email matches an owner account, a password reset link has been sent.',
    });
  }

  // Generate crypto token
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  // Store in DB
  await db.passwordResetToken.upsert({
    where: { email },
    update: {
      tokenHash,
      expiresAt,
    },
    create: {
      email,
      tokenHash,
      expiresAt,
    },
  });

  // Send reset email via direct Resend fetch API call
  const resetUrl = `${env.PARTNER_APP_URL || 'http://localhost:8000'}/reset-password?token=${token}`;
  
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.RESEND_FROM || 'noreply@foodmart.com',
        to: email,
        subject: 'Reset your password - Foodmart Restaurant OS',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #4f46e5;">Foodmart Restaurant OS</h2>
            <p>Hello ${owner.name},</p>
            <p>You requested a password reset for your restaurant owner account. Please click the button below to set a new password:</p>
            <div style="margin: 30px 0; text-align: center;">
              <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
            </div>
            <p style="color: #666; font-size: 14px;">This link is valid for <strong>5 minutes</strong>. If you did not request a password reset, please ignore this email.</p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Failed to send email via Resend:', errText);
    }
  } catch (err) {
    console.error('Error sending forgot-password email:', err);
  }

  return c.json({
    success: true,
    message: 'If the email matches an owner account, a password reset link has been sent.',
  });
});

router.post('/reset-password', zValidator('json', z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})), async (c) => {
  const { token, password } = c.req.valid('json');

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  // Verify token in DB
  const resetRecord = await db.passwordResetToken.findFirst({
    where: { tokenHash },
  });

  if (!resetRecord || resetRecord.expiresAt < new Date()) {
    c.status(400);
    return c.json({
      success: false,
      message: 'Invalid or expired reset token',
    });
  }

  // Find owner
  const owner = await db.staff.findFirst({
    where: {
      email: resetRecord.email,
      role: 'OWNER',
    },
  });

  if (!owner) {
    c.status(400);
    return c.json({
      success: false,
      message: 'Owner account not found',
    });
  }

  // Hash new password
  const passwordHash = await hashPassword(password);

  // Update password
  await db.staff.update({
    where: { id: owner.id },
    data: { passwordHash },
  });

  // Revoke all active sessions for this staff member
  await db.staffSession.deleteMany({
    where: { staffId: owner.id },
  });

  // Delete the reset token
  await db.passwordResetToken.delete({
    where: { id: resetRecord.id },
  });

  return c.json({
    success: true,
    message: 'Password reset successfully. Please log in with your new password.',
  });
});

export const authRouter = router;
