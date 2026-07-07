import { useEffect } from 'react';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import {
  getMockSite,
  getMockSubscription,
  SIMULATE_STATE,
} from '@/lib/simulate-dashboard-state';
import { useDashboardStore } from '@/stores/dashboard.store';
import { DashboardStateContent } from './DashboardStateContent';

export function DashboardHomePage() {
  const { state, setState, setSite, setSubscription } = useDashboardStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      const simulatedState = SIMULATE_STATE;
      const mockSite = getMockSite(simulatedState);
      const mockSub = getMockSubscription(simulatedState);

      setState(simulatedState);
      if (mockSite) setSite(mockSite);
      if (mockSub) setSubscription(mockSub);
    }, 1500);

    return () => clearTimeout(timer);
  }, [setState, setSite, setSubscription]);

  if (state === 'loading') return <DashboardSkeleton />;

  // State-specific content is a future task — placeholder for now.
  return (
    <div className="flex flex-col gap-6">
      <DashboardStateContent state={state} />
    </div>
  );
}
