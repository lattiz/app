import { adminMetricsControllerOverviewOptions } from '@lattiz/api-client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCount, formatMoney } from '@/lib/format';
import { cn } from '@/lib/utils';
import { HelpTip } from './help-tip';
import { QueryAlert } from './query-alert';
import {
  expiringTrialsLabel,
  payingMovementLabel,
  planBreakdown,
  stripeRevenueFailed,
} from './series';

const CARDS = [
  {
    title: 'Ingreso mensual recurrente (MRR)',
    help: 'Lo que cobramos cada mes por suscripciones activas; las anuales cuentan como 1/12.',
  },
  {
    title: 'Clientes que pagan',
    help: 'Negocios con una suscripción activa en este momento.',
  },
  {
    title: 'Pruebas activas',
    help: 'Cuentas que están probando Lattiz y todavía no pagan.',
  },
  {
    title: 'En riesgo',
    help: 'Pagos fallidos o cancelaciones programadas.',
  },
] as const;

export function KpiCards() {
  const query = useQuery(adminMetricsControllerOverviewOptions());

  if (query.isPending) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {CARDS.map((card) => (
          <Skeleton key={card.title} className="h-36" />
        ))}
      </div>
    );
  }

  if (query.isError) {
    return (
      <QueryAlert
        error={query.error}
        pending={query.isFetching}
        onRetry={() => void query.refetch()}
      />
    );
  }

  const overview = query.data;
  const currency = overview.currency ?? 'mxn';
  const stripeDown = stripeRevenueFailed(overview.revenueError);
  const mrr =
    overview.mrrCents == null ? null : formatMoney(overview.mrrCents, currency);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        title={CARDS[0].title}
        help={CARDS[0].help}
        value={stripeDown ? 'No se pudo consultar Stripe' : (mrr ?? '—')}
        muted={stripeDown || mrr == null}
        detail={
          !stripeDown && mrr != null
            ? planBreakdown(overview.mrrByPlan, currency)
            : null
        }
      />
      <KpiCard
        title={CARDS[1].title}
        help={CARDS[1].help}
        value={formatCount(overview.customers.payingTenants)}
        detail={payingMovementLabel(
          overview.customers.newPayingThisMonth,
          overview.customers.cancellationsThisMonth,
        )}
      />
      <KpiCard
        title={CARDS[2].title}
        help={CARDS[2].help}
        value={formatCount(overview.trials.active)}
        detail={expiringTrialsLabel(overview.trials.expiringWithin48h)}
      />
      <KpiCard
        title={CARDS[3].title}
        help={CARDS[3].help}
        value={formatCount(overview.customers.atRisk)}
        danger={overview.customers.atRisk > 0}
      />
    </div>
  );
}

function KpiCard({
  title,
  help,
  value,
  detail,
  muted = false,
  danger = false,
}: {
  title: string;
  help: string;
  value: string;
  detail?: string | null;
  muted?: boolean;
  danger?: boolean;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-start gap-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <HelpTip text={help} />
        </div>
        <p
          className={cn(
            'font-semibold tracking-tight',
            muted
              ? 'text-base text-balance text-muted-foreground'
              : 'text-3xl tabular-nums',
            danger && !muted && 'text-destructive',
          )}
        >
          {value}
        </p>
        {detail ? (
          <p className="text-xs text-muted-foreground">{detail}</p>
        ) : (
          <span className="h-4" />
        )}
      </CardContent>
    </Card>
  );
}
