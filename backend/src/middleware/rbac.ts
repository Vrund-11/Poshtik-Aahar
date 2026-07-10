import { MiddlewareHandler } from 'hono';

export const rbacMiddleware = (allowedRoles: string[]): MiddlewareHandler => {
  return async (c, next) => {
    const user = c.get('user');
    
    if (!user) {
      c.status(401);
      return c.json({ success: false, message: 'Unauthorized: User session not found' });
    }
    
    if (!user.role || !allowedRoles.includes(user.role)) {
      c.status(403);
      return c.json({ success: false, message: 'Forbidden: Insufficient privileges' });
    }
    
    await next();
  };
};
