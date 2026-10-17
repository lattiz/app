import { adminMetricsControllerFunnelOptions } from '@lattiz/api-client';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCount, formatPercent } from '@/lib/format';
import { QueryAlert } from './query-alert';
import { funnelBarWidth, medianPayPhrase, toFunnelSteps } from './series';

const RANGES = [30, 90, 365] as const;
type FunnelDays = (typeof RANGES)[number];

export function FunnelCard() {
  const [days, setDays] = useState<FunnelDays>(30);
  const query = useQuery({
    ...adminMetricsControllerFunnelOptions({ query: { days } }),
    placeholderData: keepPreviousData,
  });
  const funnel = query.data;
  const steps = funnel ? toFunnelSteps(funnel) : [];
  const max = steps.reduce((highest, step) => Math.max(highest, step.count), 0);
  const phrase = funnel ? medianPayPhrase(funnel.medianHoursToPay) : null;
  const empty = funnel != null && funnel.signups === 0 && max === 0;

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Del registro al pago</CardTitle>
        <CardDescription>
          El porcentaje compara cada paso con el anterior.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-1" role="group" aria-label="Periodo">
          {RANGES.map((range) => (
            <Button
              key={range}
              type="button"
              size="sm"
              variant={days === range ? 'default' : 'outline'}
              aria-pressed={days === range}
              onClick={() => setDays(range)}
            >
              {range} días
            </Button>
          ))}
        </div>
        {query.isPending ? <Skeleton className="h-48" /> : null}
        {query.isError ? (
          <QueryAlert
            error={query.error}
            pending={query.isFetching}
            onRetry={() => void query.refetch()}
          />
        ) : null}
        {funnel && !query.isError && empty ? (
          <p className="text-sm text-muted-foreground">
            Nadie se registró en estos días.
          </p>
        ) : null}
        {funnel && !query.isError && !empty ? (
          <ol className="flex flex-col gap-3">
            {steps.map((step) => (
              <li key={step.id} className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span>{step.label}</span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {formatCount(step.count)}
                    {step.rate != null ? ` · ${formatPercent(step.rate)}` : ''}
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-chart-1"
                    style={{ width: `${funnelBarWidth(step.count, max)}%` }}
                  />
                </div>
              </li>
            ))}
          </ol>
        ) : null}
        {phrase && !query.isError ? <p className="text-sm">{phrase}</p> : null}
      </CardContent>
    </Card>
  );
}
