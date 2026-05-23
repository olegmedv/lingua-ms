import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isDemo: false,

      login: async (email, password) => {
        const res = await AuthService.postApiAuthLogin({ requestBody: { email, password } });
        set({ token: res.token!, user: res.user ?? null, isDemo: false });
      },

      register: async (email, displayName, password) => {
        const res = await AuthService.postApiAuthRegister({ requestBody: { email, displayName, password } });
        set({ token: res.token!, user: res.user ?? null, isDemo: false });
      },

      demoLogin: async () => {
        const res = await AuthService.postApiAuthDemo();
        set({ token: res.token!, user: res.user ?? null, isDemo: true });
      },

      logout: () => {
        set({ token: null, user: null, isDemo: false });
      },

      loadUser: async () => {
        try {
          const user = await AuthService.getApiAuthMe();
          set({ user });
        } catch {
          set({ token: null, user: null, isDemo: false });
        }
      },
    }),
    {
      name: 'auth',
      partialize: (state) => ({ token: state.token, isDemo: state.isDemo }),
    },
  ),
);
