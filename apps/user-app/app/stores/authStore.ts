import { create } from 'zustand';
import { api, getCookie, setCookie, removeCookie } from '@foodmart/shared';

// ─── Types ────────────────────────────────────
export interface CustomerUser {
  userId: string;
  email: string;
  name: string;
  phone?: string;
}

interface AuthState {
  user: CustomerUser | null;
  token: string | null;
  loading: boolean;
}

interface AuthActions {
  hydrate: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, phone: string, password: string) => Promise<void>;
  logout: () => void;
}

// ─── JWT Decode ───────────────────────────────
function decodeJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

// ─── Store ────────────────────────────────────
export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  user: null,
  token: null,
  loading: true,

  hydrate: () => {
    const savedToken = getCookie('foodmood_token');
    if (savedToken) {
      const decoded = decodeJwt(savedToken);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        set({
          token: savedToken,
          user: {
            userId: decoded.userId,
            email: decoded.email,
            name: decoded.name || 'Customer',
            phone: decoded.phone,
          },
          loading: false,
        });
        return;
      }
      removeCookie('foodmood_token');
    }
    set({ loading: false });
  },

  login: async (email, password) => {
    const res: any = await api.post('/auth/customer/login', { email, password });
    if (res.success && res.accessToken) {
      setCookie('foodmood_token', res.accessToken);
      const decoded = decodeJwt(res.accessToken);
      set({
        token: res.accessToken,
        user: {
          userId: decoded.userId,
          email: decoded.email,
          name: decoded.name || 'Customer',
        },
      });
    } else {
      throw new Error(res.message || 'Login failed');
    }
  },

  register: async (name, email, phone, password) => {
    const res: any = await api.post('/auth/customer/register', { name, email, phone, password });
    if (res.success && res.accessToken) {
      setCookie('foodmood_token', res.accessToken);
      const decoded = decodeJwt(res.accessToken);
      set({
        token: res.accessToken,
        user: {
          userId: decoded.userId,
          email: decoded.email,
          name: decoded.name || name,
        },
      });
    } else {
      throw new Error(res.message || 'Registration failed');
    }
  },

  logout: () => {
    removeCookie('foodmood_token');
    set({ user: null, token: null });
  },
}));
