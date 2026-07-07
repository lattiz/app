import { create } from 'zustand';
import type {
  DashboardState,
  SiteStatus,
  SubscriptionStatus,
} from '@/types/dashboard.types';

interface DashboardStore {
  state: DashboardState;
  site: SiteStatus | null;
  subscription: SubscriptionStatus | null;
  setState: (s: DashboardState) => void;
  setSite: (site: SiteStatus) => void;
  setSubscription: (sub: SubscriptionStatus) => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  state: 'loading',
  site: null,
  subscription: null,
  setState: (state) => set({ state }),
  setSite: (site) => set({ site }),
  setSubscription: (subscription) => set({ subscription }),
}));
