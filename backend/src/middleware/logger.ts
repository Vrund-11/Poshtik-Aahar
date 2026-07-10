import { MiddlewareHandler } from 'hono';

export const loggerMiddleware = (): MiddlewareHandler => {
  return async (c, next) => {
    const start = Date.now();
    const { method, url } = c.req;
    
    console.log(`--> ${method} ${url}`);
    
    await next();
    
    const duration = Date.now() - start;
    console.log(`<-- ${method} ${url} [${c.res.status}] (${duration}ms)`);
  };
};
