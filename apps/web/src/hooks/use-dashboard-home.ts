import { useEffect } from 'react';
import {
  getMockSite,
  getMockSubscription,
  SIMULATE_STATE,
} from '@/lib/simulate-dashboard-state';
import { useDashboardStore } from '@/stores/dashboard.store';

export function useDashboardHome() {
  const state = useDashboardStore((s) => s.state);
  const site = useDashboardStore((s) => s.site);
  const subscription = useDashboardStore((s) => s.subscription);
  const setState = useDashboardStore((s) => s.setState);
  const setSite = useDashboardStore((s) => s.setSite);
  const setSubscription = useDashboardStore((s) => s.setSubscription);

  useEffect(() => {
    // ─── REPLACE THIS BLOCK with real API calls when ready ───────────────────
    // Promise.all([
    //   api.get('/api/sites/me'),
    //   api.get('/api/subscriptions/me'),
    // ]).then(([siteRes, subRes]) => {
    //   setSite(siteRes.data)
    //   setSubscription(subRes.data)
    //   setState(deriveState(siteRes.data, subRes.data))
    // })
    // ─────────────────────────────────────────────────────────────────────────
    const timer = setTimeout(() => {
      const s = SIMULATE_STATE;
      setState(s);
      const mockSite = getMockSite(s);
      const mockSub = getMockSubscription(s);
      if (mockSite) setSite(mockSite);
      if (mockSub) setSubscription(mockSub);
    }, 1500);

    return () => clearTimeout(timer);
  }, [setState, setSite, setSubscription]);

  return { state, site, subscription };
}
