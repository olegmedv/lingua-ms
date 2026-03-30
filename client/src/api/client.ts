import { API_URL } from '../config';
import { toast } from 'sonner';

function isDemoMode() {
  return localStorage.getItem('isDemo') === 'true';
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const method = options?.method ?? 'GET';

  if (isDemoMode() && method !== 'GET' && !path.startsWith('/api/auth/')) {
    toast.info('Demo mode — changes are not saved');
    return {} as T;
  }

  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  upload: async (path: string, file: File) => {
    if (isDemoMode()) {
      toast.info('Demo mode — changes are not saved');
      return { url: '' };
    }
    const token = localStorage.getItem('token');
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    if (!res.ok) throw new Error(res.statusText);
    return res.json();
  },
};
