type ApiOptions = RequestInit & {
  params?: Record<string, string>;
};

const BASE_URL = typeof process !== 'undefined' ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') : 'http://localhost:5000';

const request = async <T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> => {
  const { params, ...init } = options;

  let formattedEndpoint = endpoint;
  if (endpoint.startsWith('/') && !endpoint.startsWith('/api/v1') && !endpoint.startsWith('/sse')) {
    formattedEndpoint = `/api/v1${endpoint}`;
  }

  let url = `${BASE_URL}${formattedEndpoint}`;
  if (params) {
    url += '?' + new URLSearchParams(params).toString();
  }

  let token: string | null = null;
  if (typeof window !== 'undefined') {
    const getCookie = (name: string): string | null => {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]*)'));
      return match ? decodeURIComponent(match[2]) : null;
    };
    if (window.location.port === '7070') {
      token = getCookie('admin_token');
    } else if (window.location.port === '8000') {
      token = getCookie('staff_token');
    } else {
      token = getCookie('admin_token') || getCookie('staff_token') || getCookie('foodmood_token');
    }
  }

  const headers: any = {
    'Content-Type': 'application/json',
    ...(init.headers as any),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...init,
    headers,
    credentials: 'include', // sends cookies automatically
  });

  if (res.status === 401 && !formattedEndpoint.includes('/login')) {
    // Try refresh
    try {
      let refreshPath = '/api/v1/auth/customer/refresh';
      let loginRedirect = '/login';

      const isStaffOrAdminPath = 
        formattedEndpoint.startsWith('/api/v1/owner') || 
        formattedEndpoint.startsWith('/api/v1/admin') || 
        formattedEndpoint.startsWith('/api/v1/auth/staff');

      const isStaffOrAdminOrigin = 
        typeof window !== 'undefined' && 
        (window.location.port === '8000' || window.location.port === '7070');

      if (isStaffOrAdminPath || isStaffOrAdminOrigin) {
        refreshPath = '/api/v1/auth/staff/refresh';
      }

      const refreshed = await fetch(`${BASE_URL}${refreshPath}`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (refreshed.ok) {
        // Retry original request
        return request<T>(formattedEndpoint, options);
      }
    } catch (e) {
      console.error('Refresh token failed:', e);
    }
    
    // Refresh failed, redirect to login (if client side)
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('Session expired');
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || 'Request failed');
  }

  return res.json();
};

export const api = {
  get: <T>(url: string, options?: ApiOptions) =>
    request<T>(url, { ...options, method: 'GET' }),

  post: <T>(url: string, body?: unknown, options?: ApiOptions) =>
    request<T>(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    }),

  patch: <T>(url: string, body?: unknown, options?: ApiOptions) =>
    request<T>(url, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  delete: <T>(url: string, options?: ApiOptions) =>
    request<T>(url, { ...options, method: 'DELETE' }),
};
