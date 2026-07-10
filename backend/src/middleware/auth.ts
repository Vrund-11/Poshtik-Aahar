import { MiddlewareHandler } from 'hono';
import { verifyAccessToken, TokenPayload } from '../lib/jwt';

declare module 'hono' {
  interface ContextVariableMap {
    user: TokenPayload;
  }
}

export const authMiddleware = (): MiddlewareHandler => {
  return async (c, next) => {
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      c.status(401);
      return c.json({ success: false, message: 'Unauthorized: Missing or invalid token' });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      const payload = verifyAccessToken(token);
      c.set('user', payload);
      await next();
    } catch (e) {
      c.status(401);
      return c.json({ success: false, message: 'Unauthorized: Token is invalid or expired' });
    }
  };
};
