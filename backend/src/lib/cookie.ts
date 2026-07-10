import { setCookie, deleteCookie } from 'hono/cookie';
import { Context } from 'hono';

export const setRefreshTokenCookie = (c: Context, name: string, token: string) => {
  setCookie(c, name, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
};

export const clearRefreshTokenCookie = (c: Context, name: string) => {
  deleteCookie(c, name, {
    path: '/',
  });
};
