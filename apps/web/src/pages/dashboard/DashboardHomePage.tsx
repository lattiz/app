import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { HomeBanners } from '@/components/dashboard/home/HomeBanners';
import { HomeMetrics } from '@/components/dashboard/home/HomeMetrics';
import { LaunchStepper } from '@/components/dashboard/home/LaunchStepper';
import { NoSubscriptionGate } from '@/components/dashboard/home/NoSubscriptionGate';
import { QuickActionsCard } from '@/components/dashboard/home/QuickActionsCard';
import { SiteCard } from '@/components/dashboard/home/SiteCard';
import { SubscriptionCard } from '@/components/dashboard/home/SubscriptionCard';
import { useDashboardHome } from '@/hooks/use-dashboard-home';

export function DashboardHomePage() {
  const { state, site, subscription } = useDashboardHome();

  if (state === 'loading') return <DashboardSkeleton />;

  if (state === 'no-subscription') {
    return (
      <div className="flex flex-col gap-4">
        <HomeBanners state={state} site={site} subscription={subscription} />
        <NoSubscriptionGate />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <HomeBanners state={state} site={site} subscription={subscription} />

      <HomeMetrics state={state} site={site} subscription={subscription} />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <SiteCard state={state} site={site} />
        <QuickActionsCard state={state} site={site} />
      </div>

      {state === 'no-template' && <LaunchStepper site={site} />}

      <SubscriptionCard subscription={subscription} />
    </div>
  );
}
