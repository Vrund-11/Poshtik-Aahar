import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { env } from './config/env';
import { loggerMiddleware } from './middleware/logger';
import { errorHandler } from './middleware/error';

// Import modular routers
import { authRouter } from './modules/auth/auth.controller';
import { restaurantRouter } from './modules/restaurant/restaurant.controller';
import { menuRouter } from './modules/menu/menu.controller';
import { tableRouter } from './modules/table/table.controller';
import { orderRouter } from './modules/order/order.controller';
import { takeawayRouter } from './modules/takeaway/takeaway.controller';
import { queueRouter } from './modules/queue/queue.controller';
import { reservationRouter } from './modules/reservation/reservation.controller';
import { loyaltyRouter } from './modules/loyalty/loyalty.controller';
import { complaintRouter } from './modules/complaint/complaint.controller';
import { adminRouter } from './modules/admin/admin.controller';
import { ownerRouter } from './modules/owner/owner.controller';
import { sseRouter } from './modules/sse/sse.controller';

const app = new Hono();

// Global Middleware
app.use('*', loggerMiddleware());
app.use('*', cors({
  origin: ['http://localhost:3000', 'http://localhost:8000', 'http://localhost:7070'],
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Global Error Handler
app.onError(errorHandler);

// API Version 1 prefix Router
const apiV1 = new Hono();

// Health Check Endpoint
apiV1.get('/health', (c) => {
  return c.json({
    success: true,
    status: 'UP',
    timestamp: new Date().toISOString(),
    env: env.NODE_ENV,
  });
});

// Mount modular sub-routers
apiV1.route('/auth', authRouter);
apiV1.route('/restaurants', restaurantRouter);
apiV1.route('/menus', menuRouter);
apiV1.route('/sessions', tableRouter);
apiV1.route('/orders', orderRouter);
apiV1.route('/takeaway', takeawayRouter);
apiV1.route('/queue', queueRouter);
apiV1.route('/reservations', reservationRouter);
apiV1.route('/loyalty', loyaltyRouter);
apiV1.route('/complaints', complaintRouter);
apiV1.route('/admin', adminRouter);
apiV1.route('/owner', ownerRouter);

app.route('/api/v1', apiV1);
app.route('/sse', sseRouter);

// Start Hono Node.js Server
console.log(`Starting Hono API server on port ${env.PORT}...`);
serve({
  fetch: app.fetch,
  port: env.PORT,
});
export default app;
