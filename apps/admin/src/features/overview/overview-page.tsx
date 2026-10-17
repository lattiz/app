import { adminMetricsControllerOverviewOptions } from '@lattiz/api-client';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/page-header';
import { formatDateTime } from '@/lib/format';
import { DomainsCard } from './domains-card';
import { FunnelCard } from './funnel-card';
import { KpiCards } from './kpi-cards';
import { RevenueChart } from './revenue-chart';
import { TemplateLists } from './template-lists';
import { TrendChart } from './trend-chart';

export function OverviewPage() {
  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <PageHeader
        title="Resumen"
        description="Ingresos, clientes y pruebas de un vistazo."
      />
      <KpiCards />
      <div className="grid min-w-0 gap-6 lg:grid-cols-2">
        <RevenueChart />
        <FunnelCard />
      </div>
      <TrendChart />
      <div className="grid min-w-0 gap-6 lg:grid-cols-2">
        <TemplateLists />
        <DomainsCard />
      </div>
      <UpdatedNote />
    </div>
  );
}

function UpdatedNote() {
  const query = useQuery(adminMetricsControllerOverviewOptions());
  if (!query.data) return null;
  return (
    <p className="text-xs text-muted-foreground">
      Actualizado {formatDateTime(query.data.generatedAt)}
    </p>
  );
}
