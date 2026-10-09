import { create } from 'zustand';
import type {
  DashboardState,
  SiteAccess,
  SiteStatus,
  SubscriptionStatus,
} from '@/types/dashboard.types';

interface DashboardStore {
  state: DashboardState;
  site: SiteStatus | null;
  subscription: SubscriptionStatus | null;
  access: SiteAccess | null;
  setState: (s: DashboardState) => void;
  setSite: (site: SiteStatus) => void;
  setSubscription: (sub: SubscriptionStatus) => void;
  setAccess: (access: SiteAccess | null) => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  state: 'loading',
  site: null,
  subscription: null,
  access: null,
  setState: (state) => set({ state }),
  setSite: (site) => set({ site }),
  setSubscription: (subscription) => set({ subscription }),
  setAccess: (access) => set({ access }),
}));
