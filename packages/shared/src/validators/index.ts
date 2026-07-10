import { z } from 'zod';

export const registerCustomerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginCustomerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginStaffSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const createRestaurantSchema = z.object({
  name: z.string().min(2, 'Restaurant name must be at least 2 characters'),
  description: z.string().optional(),
  cuisineType: z.string().optional(),
  plan: z.enum(['TRIAL', 'BASIC', 'GROWTH', 'SUSPENDED']).default('TRIAL'),
  planDurationDays: z.coerce.number().optional().default(30),
  ownerName: z.string().min(2, 'Owner name must be at least 2 characters'),
  ownerEmail: z.string().email('Invalid owner email address'),
  ownerPhone: z.string().min(10, 'Owner phone must be at least 10 digits'),
  allowDineIn: z.boolean().optional().default(true),
  allowTakeaway: z.boolean().optional().default(true),
  allowReservations: z.boolean().optional().default(true),
});

export const updateRestaurantSchema = z.object({
  plan: z.enum(['TRIAL', 'BASIC', 'GROWTH', 'SUSPENDED']).optional(),
  planExpiresAt: z.string().datetime().optional(),
  status: z.enum(['ACTIVE', 'TRIAL', 'EXPIRED', 'SUSPENDED']).optional(),
  allowDineIn: z.boolean().optional(),
  allowTakeaway: z.boolean().optional(),
  allowReservations: z.boolean().optional(),
});

export const updateRestaurantProfileSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  cuisineType: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal('')),
});

export const branchSchema = z.object({
  name: z.string().min(2, 'Branch name must be at least 2 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  phone: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});

export const floorSchema = z.object({
  name: z.string().min(1, 'Floor name is required'),
  sortOrder: z.coerce.number().optional().default(0),
});

export const tableSchema = z.object({
  number: z.coerce.number().int().positive('Table number must be positive'),
  capacity: z.coerce.number().int().positive('Table capacity must be positive'),
  isActive: z.boolean().optional().default(true),
  status: z.enum(['AVAILABLE', 'SEATED', 'ORDER_PENDING', 'PREPARING', 'READY', 'SERVED', 'BILL_REQUESTED', 'PAYMENT_PENDING', 'COMPLETED']).optional(),
});

export const menuCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  sortOrder: z.coerce.number().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export const menuItemSchema = z.object({
  name: z.string().min(2, 'Item name must be at least 2 characters'),
  description: z.string().optional(),
  price: z.coerce.number().positive('Price must be positive'),
  imageUrl: z.string().url().optional().or(z.literal('')),
  isVeg: z.boolean().optional().default(true),
  isAvailable: z.boolean().optional().default(true),
  sortOrder: z.coerce.number().optional().default(0),
  modifiers: z.array(z.any()).optional().default([]),
});

export const createStaffSchema = z.object({
  name: z.string().min(2, 'Staff name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  role: z.enum(['MANAGER', 'CHEF']),
});

export const updateStaffSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  role: z.enum(['MANAGER', 'CHEF']).optional(),
  isActive: z.boolean().optional(),
});

export const taxConfigSchema = z.object({
  gstPercent: z.coerce.number().min(0).max(100),
  isActive: z.boolean().optional().default(true),
});

export const loyaltyConfigSchema = z.object({
  pointsPerHundred: z.coerce.number().min(0),
  isActive: z.boolean().optional().default(true),
});

export const initiateSessionSchema = z.object({
  qrCode: z.string().min(1, 'QR code is required'),
});

export const verifySessionSchema = z.object({
  sessionId: z.string().min(1),
  verifyCode: z.string().length(2, 'Verification code must be 2 digits'),
});

export const orderItemSchema = z.object({
  menuItemId: z.string().min(1),
  quantity: z.coerce.number().int().positive(),
  notes: z.string().optional(),
  selectedModifiers: z.array(z.any()).optional().default([]),
});

export const placeOrderSchema = z.object({
  sessionId: z.string().min(1),
  items: z.array(orderItemSchema).min(1, 'Order must contain at least one item'),
  notes: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['RECEIVED', 'PREPARING', 'READY', 'SERVED', 'DELIVERED', 'CANCELLED']),
});

// ─── Phase 4: Queue ───
export const addToQueueSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  partySize: z.coerce.number().int().positive('Party size must be positive'),
  notes: z.string().optional(),
});

// ─── Phase 4: Reservations ───
export const createReservationSchema = z.object({
  branchId: z.string().min(1, 'Branch ID is required'),
  partySize: z.coerce.number().int().positive('Party size must be positive'),
  date: z.string().min(1, 'Date is required'), // ISO date string "2026-07-01"
  timeSlot: z.string().min(1, 'Time slot is required'), // "19:00", "19:30"
  notes: z.string().optional(),
});

export const updateReservationStatusSchema = z.object({
  status: z.enum(['CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW']),
});

// ─── Phase 4: Takeaway ───
export const placeTakeawayOrderSchema = z.object({
  restaurantId: z.string().min(1, 'Restaurant ID is required'),
  items: z.array(orderItemSchema).min(1, 'Order must contain at least one item'),
  notes: z.string().optional(),
});

export const paymentMethodSchema = z.object({
  method: z.enum(['CASH', 'UPI']),
});

// ─── Phase 5: Complaints ───
export const submitComplaintSchema = z.object({
  restaurantId: z.string().min(1, 'Restaurant ID is required'),
  orderId: z.string().optional(),
  rawText: z.string().min(5, 'Complaint text must be at least 5 characters'),
  rating: z.coerce.number().int().min(1).max(5).optional(),
});

// ─── Phase 6: Upsell ───
export const upsellConfigSchema = z.object({
  triggerPhase: z.string().min(1, 'Trigger phase is required'), // "AFTER_STARTER" | "AFTER_MAIN"
  promptText: z.string().min(5, 'Prompt text must be at least 5 characters'),
  menuItemId: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});

