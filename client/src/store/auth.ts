import { create } from 'zustand';
import { api } from '../api/client';
import { API } from '../api/endpoints';
import type { User, AuthResponse } from '../types/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isDemo: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, displayName: string, password: string) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isDemo: localStorage.getItem('isDemo') === 'true',

  login: async (email, password) => {
    const res = await api.post<AuthResponse>(API.auth.login, { email, password });
    localStorage.setItem('token', res.token);
    localStorage.removeItem('isDemo');
    set({ token: res.token, user: res.user, isDemo: false });
  },

  register: async (email, displayName, password) => {
    const res = await api.post<AuthResponse>(API.auth.register, { email, displayName, password });
    localStorage.setItem('token', res.token);
    localStorage.removeItem('isDemo');
    set({ token: res.token, user: res.user, isDemo: false });
  },

  demoLogin: async () => {
    const res = await api.post<AuthResponse>(API.auth.demo);
    localStorage.setItem('token', res.token);
    localStorage.setItem('isDemo', 'true');
    set({ token: res.token, user: res.user, isDemo: true });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isDemo');
    set({ token: null, user: null, isDemo: false });
  },

  loadUser: async () => {
    try {
      const user = await api.get<User>(API.auth.me);
      set({ user });
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('isDemo');
      set({ token: null, user: null, isDemo: false });
    }
  },
}));
