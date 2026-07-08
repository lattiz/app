import { Card, CardContent } from '@/components/ui/card';
import { capitalize } from '@/lib/format';
import { cn } from '@/lib/utils';
import type {
  DashboardState,
  SiteStatus,
  SubscriptionStatus,
} from '@/types/dashboard.types';

interface HomeMetricsProps {
  state: DashboardState;
  site: SiteStatus | null;
  subscription: SubscriptionStatus | null;
}

type PillVariant = 'success' | 'warning' | 'destructive' | 'muted';

const pillClasses: Record<PillVariant, string> = {
  success: 'bg-green-500/10 text-green-700 dark:text-green-400',
  warning: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
  destructive: 'bg-destructive/10 text-destructive',
  muted: 'bg-muted text-muted-foreground',
};

interface Metric {
  label: string;
  value: string;
  pill: { text: string; variant: PillVariant };
}

function buildMetrics(
  site: SiteStatus | null,
  subscription: SubscriptionStatus | null,
): Metric[] {
  const siteValue = site?.isOnline
    ? 'En línea'
    : site?.deployInProgress
      ? 'Actualizando'
      : 'Sin publicar';

  const sitePill = site?.isOnline
    ? { text: 'publicado', variant: 'success' as const }
    : site?.deployInProgress
      ? { text: 'en proceso', variant: 'warning' as const }
      : { text: 'sin publicar', variant: 'muted' as const };

  const visitsValue =
    site?.visits != null ? site.visits.toLocaleString('es-MX') : '–';

  const visitsPill =
    site?.visitsDelta != null
      ? {
          text: `${site.visitsDelta > 0 ? '+' : ''}${site.visitsDelta}% vs anterior`,
          variant:
            site.visitsDelta >= 0
              ? ('success' as const)
              : ('warning' as const),
        }
      : { text: 'disponible al publicar', variant: 'muted' as const };

  const subValue = subscription?.plan
    ? capitalize(subscription.plan)
    : 'Sin plan';

  const subPill =
    subscription?.status === 'active'
      ? { text: 'activa', variant: 'success' as const }
      : subscription?.status === 'trialing'
        ? { text: 'trial', variant: 'warning' as const }
        : subscription?.status === 'past_due'
          ? { text: 'pago fallido', variant: 'destructive' as const }
          : { text: 'inactiva', variant: 'muted' as const };

  return [
    { label: 'Estado del sitio', value: siteValue, pill: sitePill },
    { label: 'Visitas este mes', value: visitsValue, pill: visitsPill },
    { label: 'Suscripción', value: subValue, pill: subPill },
  ];
}

export function HomeMetrics({ site, subscription }: HomeMetricsProps) {
  const metrics = buildMetrics(site, subscription);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {metrics.map((metric) => (
        <Card key={metric.label} size="sm">
          <CardContent className="flex flex-col gap-2">
            <span className="text-xs text-muted-foreground">
              {metric.label}
            </span>
            <span className="text-2xl font-semibold">{metric.value}</span>
            <span
              className={cn(
                'w-fit rounded-full px-2 py-0.5 text-xs font-medium',
                pillClasses[metric.pill.variant],
              )}
            >
              {metric.pill.text}
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
