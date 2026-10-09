import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  tenantsControllerMeOptions,
  type AnalyticsOverviewDto,
  type AnalyticsReportDto,
} from '@lattiz/api-client';
import {
  ChartNoAxesColumnIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  CloudOffIcon,
  RotateCwIcon,
} from 'lucide-react';
import { UpgradeGate } from '@/components/dashboard/home/UpgradeGate';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { liveSiteUrl } from '@/lib/site-address';
import { AnalyticsEmptyState } from './components/AnalyticsEmptyState';
import { AnalyticsSkeleton } from './components/AnalyticsSkeleton';
import { AnalyticsUpsell } from './components/AnalyticsUpsell';
import { DataDelayNote } from './components/DataDelayNote';
import { MetricCard } from './components/MetricCard';
import { RealtimeCard } from './components/RealtimeCard';
import { TrafficSources } from './components/TrafficSources';
import { VisitsChart } from './components/VisitsChart';
import { useAnalyticsOverview } from './hooks/useAnalyticsOverview';
import { useAnalyticsRealtime } from './hooks/useAnalyticsRealtime';
import { useRetryAnalytics } from './hooks/useRetryAnalytics';
import { formatNumber, formatUpdatedAgo } from './lib/format';

const SLOW_PROVISIONING_MS = 2 * 60_000;

/** Re-renders every `intervalMs` so relative times and countdowns stay current. */
function useNow(intervalMs: number): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}

export function AnalyticsPage() {
  const tenant = useQuery(tenantsControllerMeOptions());
  const { data, isLoading, isError, refetch, isRefetching } = useAnalyticsOverview(
    tenant.data?.isEntitled === true,
  );

  if (tenant.isLoading) return <AnalyticsSkeleton />;
  if (tenant.data && !tenant.data.isEntitled) return <UpgradeGate reason="analytics" />;

  if (isLoading) return <AnalyticsSkeleton />;

  if (isError || !data) {
    return (
      <AnalyticsEmptyState
        icon={CloudOffIcon}
        title="No pudimos cargar tus analíticas"
        description="Ocurrió un problema al consultar los datos. Inténtalo de nuevo en unos minutos."
        action={
          <Button variant="outline" disabled={isRefetching} onClick={() => void refetch()}>
            {isRefetching ? <Spinner /> : <RotateCwIcon />}
            Reintentar
          </Button>
        }
      />
    );
  }

  switch (data.status) {
    case 'not_eligible':
      return <AnalyticsUpsell />;
    case 'unavailable':
      return (
        <AnalyticsEmptyState
          icon={CloudOffIcon}
          title="Las analíticas no están disponibles por ahora"
          description="Estamos trabajando en ello. Vuelve a intentarlo más tarde."
        />
      );
    case 'provisioning':
      return <ProvisioningState />;
    case 'failed':
      return <FailedState overview={data} />;
    case 'ready':
      return data.report ? (
        <ReadyState overview={data} report={data.report} />
      ) : (
        <AnalyticsSkeleton />
      );
  }
}

function ProvisioningState() {
  const [startedAt] = useState(() => Date.now());
  const now = useNow(5000);
  const isSlow = now - startedAt > SLOW_PROVISIONING_MS;

  return (
    <AnalyticsEmptyState
      icon={Spinner}
      iconClassName="size-6 text-muted-foreground"
      title="Estamos preparando tus analíticas…"
      description={
        <>
          <p>Esto suele tomar unos segundos. No necesitas hacer nada.</p>
          {isSlow && <p className="mt-2">Esto está tardando más de lo normal.</p>}
        </>
      }
    />
  );
}

function FailedState({ overview }: { overview: AnalyticsOverviewDto }) {
  const retry = useRetryAnalytics();
  const now = useNow(1000);
  const availableAt = overview.retryAvailableAt
    ? new Date(overview.retryAvailableAt).getTime()
    : 0;
  const waitSeconds = Math.max(0, Math.ceil((availableAt - now) / 1000));

  return (
    <AnalyticsEmptyState
      icon={CircleAlertIcon}
      iconClassName="size-6 text-destructive"
      title="No pudimos activar tus analíticas"
      description="Ocurrió un problema al configurarlas. Puedes reintentarlo; si el problema continúa, lo revisaremos por ti."
      action={
        <Button
          disabled={waitSeconds > 0 || retry.isPending}
          onClick={() => retry.mutate({})}
        >
          {retry.isPending ? <Spinner /> : <RotateCwIcon />}
          {waitSeconds > 0 ? `Reintentar en ${waitSeconds} s` : 'Reintentar'}
        </Button>
      }
    />
  );
}

function ConsentFootnote() {
  return (
    <p className="text-xs text-muted-foreground">
      Solo se cuentan los visitantes que aceptan las cookies de analítica, por lo
      que las cifras pueden ser menores al tráfico real.
    </p>
  );
}

function ReadyState({
  overview,
  report,
}: {
  overview: AnalyticsOverviewDto;
  report: AnalyticsReportDto;
}) {
  const now = useNow(30_000);
  const realtime = useAnalyticsRealtime(overview.status === 'ready');
  const { data: tenantMe } = useQuery(tenantsControllerMeOptions());
  const siteUrl =
    tenantMe?.site?.siteStatus === 'published' ? liveSiteUrl(tenantMe) : null;

  const realtimeCard = (
    <RealtimeCard
      data={realtime.data}
      isLoading={realtime.isLoading}
      isError={realtime.isError}
      siteUrl={siteUrl}
    />
  );

  const freshness = (
    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      {overview.fetchedAt && <span>{formatUpdatedAgo(overview.fetchedAt, now)}</span>}
      {overview.stale && <Badge variant="outline">datos en caché</Badge>}
    </div>
  );

  if (!report.hasData) {
    const hasLiveVisitors = (realtime.data?.realtime?.activeUsers ?? 0) > 0;
    return (
      <div className="flex flex-col gap-4">
        {realtimeCard}
        {hasLiveVisitors ? (
          <AnalyticsEmptyState
            icon={CircleCheckIcon}
            title="¡Tus analíticas funcionan!"
            description={
              <>
                <p>Ya estamos registrando la actividad de tu sitio.</p>
                <DataDelayNote variant="empty" />
              </>
            }
          />
        ) : (
          <AnalyticsEmptyState
            icon={ChartNoAxesColumnIcon}
            title="Aún no hay datos"
            description={<DataDelayNote variant="empty" />}
          />
        )}
        {freshness}
        <ConsentFootnote />
      </div>
    );
  }

  const top = report.topChannel;

  return (
    <div className="flex flex-col gap-4">
      {realtimeCard}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <MetricCard
          label="Visitas"
          value={formatNumber(report.sessions)}
          deltaPct={report.sessionsDeltaPct}
          hint="vs. 28 días anteriores"
        />
        <MetricCard
          label="Usuarios activos (28 días)"
          value={formatNumber(report.activeUsers)}
          deltaPct={report.activeUsersDeltaPct}
          hint="vs. 28 días anteriores"
        />
        <MetricCard
          label="Fuente principal"
          value={top ? `${top.label} · ${top.sharePct}%` : '—'}
          hint={top ? `${formatNumber(top.sessions)} visitas` : undefined}
        />
      </div>

      <VisitsChart daily={report.daily} note={<DataDelayNote variant="inline" />} />
      <TrafficSources channels={report.channels} />

      {freshness}
      <ConsentFootnote />
    </div>
  );
}
