import { create } from 'zustand';
import '../api/openapi-config';
import { AuthService } from '../api/generated';
import type { UserDto as User } from '../api/generated';

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

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isDemo: localStorage.getItem('isDemo') === 'true',

  login: async (email, password) => {
    const res = await AuthService.postApiAuthLogin({ requestBody: { email, password } });
    localStorage.setItem('token', res.token!);
    localStorage.removeItem('isDemo');
    set({ token: res.token!, user: res.user ?? null, isDemo: false });
  },

  register: async (email, displayName, password) => {
    const res = await AuthService.postApiAuthRegister({ requestBody: { email, displayName, password } });
    localStorage.setItem('token', res.token!);
    localStorage.removeItem('isDemo');
    set({ token: res.token!, user: res.user ?? null, isDemo: false });
  },

  demoLogin: async () => {
    const res = await AuthService.postApiAuthDemo();
    localStorage.setItem('token', res.token!);
    localStorage.setItem('isDemo', 'true');
    set({ token: res.token!, user: res.user ?? null, isDemo: true });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isDemo');
    set({ token: null, user: null, isDemo: false });
  },

  loadUser: async () => {
    try {
      const user = await AuthService.getApiAuthMe();
      set({ user });
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('isDemo');
      set({ token: null, user: null, isDemo: false });
    }
  },
}));
