import { create } from 'zustand';
import { api } from '../api/client';

interface User {
  id: string;
  email: string;
  displayName: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, displayName: string, password: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),

  login: async (email, password) => {
    const res = await api.post<{ token: string; user: User }>('/api/auth/login', { email, password });
    localStorage.setItem('token', res.token);
    set({ token: res.token, user: res.user });
  },

  register: async (email, displayName, password) => {
    const res = await api.post<{ token: string; user: User }>('/api/auth/register', { email, displayName, password });
    localStorage.setItem('token', res.token);
    set({ token: res.token, user: res.user });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null });
  },

  loadUser: async () => {
    try {
      const user = await api.get<User>('/api/auth/me');
      set({ user });
    } catch {
      localStorage.removeItem('token');
      set({ token: null, user: null });
    }
  },
}));
