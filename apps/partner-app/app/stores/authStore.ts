import { create } from 'zustand';
import { api, getCookie, setCookie, removeCookie } from '@foodmart/shared';

// ─── Types ────────────────────────────────────
export interface PartnerUser {
  id: string;
  name: string;
  email: string;
  role: 'OWNER' | 'MANAGER' | 'CHEF' | 'ADMIN';
  restaurantId?: string;
}

interface AuthState {
  user: PartnerUser | null;
  token: string | null;
  loading: boolean;
}

interface AuthActions {
  hydrate: () => void;
  login: (email: string, password: string) => Promise<void>;
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
    const savedToken = getCookie('staff_token');
    if (savedToken) {
      const decoded = decodeJwt(savedToken);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        set({
          token: savedToken,
          user: {
            id: decoded.userId || decoded.id,
            name: decoded.name || 'Staff User',
            email: decoded.email,
            role: decoded.role,
            restaurantId: decoded.restaurantId,
          },
          loading: false,
        });
        return;
      }
      removeCookie('staff_token');
    }
    set({ loading: false });
  },

  login: async (email, password) => {
    const res: any = await api.post('/auth/staff/login', { email, password });
    if (res.success && res.accessToken && res.user) {
      setCookie('staff_token', res.accessToken);
      set({
        token: res.accessToken,
        user: {
          id: res.user.id,
          name: res.user.name,
          email: res.user.email,
          role: res.user.role,
          restaurantId: res.user.restaurantId,
        },
        loading: false,
      });
    } else {
      throw new Error(res.message || 'Login failed');
    }
  },

  logout: () => {
    removeCookie('staff_token');
    set({ user: null, token: null });
  },
}));
