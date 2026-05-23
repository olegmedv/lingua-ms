import { useAuthStore } from '../store/auth';

export function useIsDemoUser(): boolean {
  return useAuthStore(state => state.user?.role === 'Demo');
}
