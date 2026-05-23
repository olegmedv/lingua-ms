import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import '../api/openapi-config';
import { AuthService } from '../api/generated';
import type { UserDto as User } from '../api/generated';

interface AuthState {
  user: User | null;
  token: string | null;
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

      login: async (email, password) => {
        const res = await AuthService.postApiAuthLogin({ requestBody: { email, password } });
        set({ token: res.token!, user: res.user ?? null });
      },

      register: async (email, displayName, password) => {
        const res = await AuthService.postApiAuthRegister({ requestBody: { email, displayName, password } });
        set({ token: res.token!, user: res.user ?? null });
      },

      demoLogin: async () => {
        const res = await AuthService.postApiAuthDemo();
        set({ token: res.token!, user: res.user ?? null });
      },

      logout: () => {
        set({ token: null, user: null });
      },

      loadUser: async () => {
        try {
          const user = await AuthService.getApiAuthMe();
          set({ user });
        } catch {
          set({ token: null, user: null });
        }
      },
    }),
    {
      name: 'auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
    },
  ),
);
