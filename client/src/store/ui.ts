import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface UiState {
  adminDemoBannerDismissed: boolean;
  dismissAdminDemoBanner: () => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      adminDemoBannerDismissed: false,
      dismissAdminDemoBanner: () => set({ adminDemoBannerDismissed: true }),
    }),
    {
      name: 'ui',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ adminDemoBannerDismissed: state.adminDemoBannerDismissed }),
    },
  ),
);
