import { adminMetricsControllerHistoryOptions } from '@lattiz/api-client';
import { useQuery } from '@tanstack/react-query';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  type ChartConfig,
} from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCount, formatMoney } from '@/lib/format';
import { QueryAlert } from '@/components/query-alert';
import {
  toTrendSeries,
  trendCurrency,
  trendReady,
  type TrendChartPoint,
} from './series';

const chartConfig = {
  mrrCents: { label: 'Ingreso mensual', color: 'var(--chart-1)' },
  payingTenants: { label: 'Clientes que pagan', color: 'var(--chart-2)' },
} satisfies ChartConfig;

const EARLY_HISTORY =
  'El historial empieza a guardarse desde hoy; vuelve en unos días.';

export function TrendChart() {
  const query = useQuery(
    adminMetricsControllerHistoryOptions({ query: { days: 90 } }),
  );
  const series = query.data ? toTrendSeries(query.data.items) : [];
  const ready = trendReady(series);
  const currency = trendCurrency(series);

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Tendencia</CardTitle>
        <CardDescription>
          Ingreso mensual y clientes que pagan, día a día.
        </CardDescription>
      </CardHeader>
      <CardContent className="min-w-0">
        {query.isPending ? <Skeleton className="h-64" /> : null}
        {query.isError ? (
          <QueryAlert
            error={query.error}
            pending={query.isFetching}
            onRetry={() => void query.refetch()}
          />
        ) : null}
        {query.data && !query.isError && !ready ? (
          <p className="text-sm text-muted-foreground">{EARLY_HISTORY}</p>
        ) : null}
        {query.data && !query.isError && ready ? (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-64 w-full min-w-0"
          >
            <LineChart
              accessibilityLayer
              data={series}
              margin={{ left: 0, right: 8, top: 8 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={24}
              />
              <YAxis
                yAxisId="mrr"
                tickLine={false}
                axisLine={false}
                width={84}
                tickFormatter={(value: number) => formatMoney(value, currency)}
              />
              <YAxis
                yAxisId="paying"
                orientation="right"
                tickLine={false}
                axisLine={false}
                width={36}
                allowDecimals={false}
                tickFormatter={(value: number) => formatCount(value)}
              />
              <ChartTooltip content={<TrendTooltip />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Line
                yAxisId="mrr"
                dataKey="mrrCents"
                type="monotone"
                stroke="var(--color-mrrCents)"
                strokeWidth={2}
                dot={false}
                connectNulls={false}
              />
              <Line
                yAxisId="paying"
                dataKey="payingTenants"
                type="monotone"
                stroke="var(--color-payingTenants)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        ) : null}
      </CardContent>
    </Card>
  );
}

function TrendTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: TrendChartPoint }>;
}) {
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;
  const currency = point.currency ?? 'mxn';
  return (
    <div className="grid min-w-44 gap-1 rounded-xl bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-lg ring-1 ring-foreground/5">
      <p className="font-medium">{point.label}</p>
      <p className="flex justify-between gap-4">
        <span className="text-muted-foreground">Ingreso mensual</span>
        <span className="font-medium tabular-nums">
          {point.mrrCents == null
            ? 'Sin dato'
            : formatMoney(point.mrrCents, currency)}
        </span>
      </p>
      <p className="flex justify-between gap-4">
        <span className="text-muted-foreground">Clientes que pagan</span>
        <span className="font-medium tabular-nums">
          {formatCount(point.payingTenants)}
        </span>
      </p>
    </div>
  );
}
