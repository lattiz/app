import { adminMetricsControllerOverviewOptions } from '@lattiz/api-client';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCount, formatMoneyWhole } from '@/lib/format';
import { cn } from '@/lib/utils';
import { QueryAlert } from '@/components/query-alert';

export function DomainsCard() {
  const query = useQuery(adminMetricsControllerOverviewOptions());
  const product = query.data?.product;

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Dominios</CardTitle>
        <CardDescription>
          Comprados por Lattiz y los que el cliente conectó por su cuenta.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {query.isPending ? <Skeleton className="h-40" /> : null}
        {query.isError ? (
          <QueryAlert
            error={query.error}
            pending={query.isFetching}
            onRetry={() => void query.refetch()}
          />
        ) : null}
        {product && !query.isError ? (
          <dl className="grid grid-cols-2 gap-4">
            <Stat
              label="Comprados"
              value={formatCount(product.domainsPurchased)}
            />
            <Stat
              label="Conectados"
              value={formatCount(product.domainsConnected)}
            />
            <Stat
              label="Próximos 30 días"
              value={renewalCountLabel(product.renewalsNext30Days.count)}
              detail={`Ingreso esperado ${formatMoneyWhole(
                product.renewalsNext30Days.expectedRevenueCents,
                product.renewalsNext30Days.currency,
              )}`}
            />
            <Stat
              label="Vencidas"
              value={formatCount(product.renewalsOverdue)}
              danger={product.renewalsOverdue > 0}
            />
          </dl>
        ) : null}
      </CardContent>
    </Card>
  );
}

function renewalCountLabel(count: number): string {
  if (count === 1) return '1 renovación';
  return `${formatCount(count)} renovaciones`;
}

function Stat({
  label,
  value,
  detail,
  danger = false,
}: {
  label: string;
  value: string;
  detail?: string;
  danger?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          'text-2xl font-semibold tracking-tight tabular-nums',
          danger && 'text-destructive',
        )}
      >
        {value}
      </dd>
      {detail ? (
        <p className="text-xs text-balance text-muted-foreground">{detail}</p>
      ) : null}
    </div>
  );
}
