import { Link } from '@tanstack/react-router';
import { LayoutGridIcon } from 'lucide-react';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { NoSubscriptionGate } from '@/components/dashboard/home/NoSubscriptionGate';
import { SiteDomainCard } from '@/components/dashboard/site/SiteDomainCard';
import { SiteHistoryCard } from '@/components/dashboard/site/SiteHistoryCard';
import { SiteMetrics } from '@/components/dashboard/site/SiteMetrics';
import { SitePreviewCard } from '@/components/dashboard/site/SitePreviewCard';
import { Button } from '@/components/ui/button';
import { useDashboardStore } from '@/stores/dashboard.store';

export function SitePage() {
  const state = useDashboardStore((s) => s.state);
  const site = useDashboardStore((s) => s.site);

  if (state === 'loading') return <DashboardSkeleton />;
  if (state === 'no-subscription') return <NoSubscriptionGate />;

  if (state === 'no-template') {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <LayoutGridIcon className="size-6 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">
            Aún no has elegido una plantilla
          </h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Elige el diseño base de tu sitio para empezar a personalizarlo.
          </p>
        </div>
        <Button size="sm" render={<Link to="/dashboard/customization" />}>
          Elegir plantilla
        </Button>
      </div>
    );
  }

  if (!site) return null;

  return (
    <div className="flex flex-col gap-4">
      <SiteMetrics site={site} />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <SiteDomainCard site={site} />
        <SiteHistoryCard site={site} />
      </div>

      <SitePreviewCard site={site} />
    </div>
  );
}
