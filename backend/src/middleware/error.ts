import { Context } from 'hono';

export const errorHandler = (err: Error, c: Context) => {
  console.error(`[Error] ${c.req.method} ${c.req.url} - `, err);
  
  c.status(500);
  return c.json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};
