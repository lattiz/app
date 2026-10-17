import { adminMetricsControllerRevenueOptions } from '@lattiz/api-client';
import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { formatMoney } from '@/lib/format';
import { QueryAlert } from '@/components/query-alert';
import {
  mixedCurrency,
  seriesCurrency,
  toRevenueSeries,
  type RevenueChartPoint,
} from './series';

const chartConfig = {
  netCents: { label: 'Neto', color: 'var(--chart-1)' },
} satisfies ChartConfig;

export function RevenueChart() {
  const query = useQuery(
    adminMetricsControllerRevenueOptions({ query: { months: 12 } }),
  );
  const series = query.data ? toRevenueSeries(query.data.items) : [];
  const currency = seriesCurrency(series);

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Ingresos cobrados</CardTitle>
        <CardDescription>
          {mixedCurrency(series)
            ? 'Neto de los últimos 12 meses. Hay meses en monedas distintas; cada barra usa la suya.'
            : 'Neto de los últimos 12 meses, ya descontadas comisiones y reembolsos.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="min-w-0">
        {query.isPending ? <Skeleton className="h-56" /> : null}
        {query.isError ? (
          <QueryAlert
            error={query.error}
            pending={query.isFetching}
            onRetry={() => void query.refetch()}
          />
        ) : null}
        {query.data && !query.isError && series.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Todavía no hay cobros en estos meses.
          </p>
        ) : null}
        {query.data && !query.isError && series.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-56 w-full min-w-0"
          >
            <BarChart
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
                minTickGap={16}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={84}
                tickFormatter={(value: number) => formatMoney(value, currency)}
              />
              <ChartTooltip cursor={false} content={<RevenueTooltip />} />
              <Bar
                dataKey="netCents"
                fill="var(--color-netCents)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        ) : null}
      </CardContent>
    </Card>
  );
}

function RevenueTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: RevenueChartPoint }>;
}) {
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;
  const currency = point.currency;
  return (
    <div className="grid min-w-40 gap-1 rounded-xl bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-lg ring-1 ring-foreground/5">
      <p className="font-medium">{point.monthLabel}</p>
      <TooltipLine label="Neto" value={formatMoney(point.netCents, currency)} />
      <TooltipLine
        label="Bruto"
        value={formatMoney(point.grossCents, currency)}
      />
      <TooltipLine
        label="Comisiones"
        value={formatMoney(point.feeCents, currency)}
      />
      <TooltipLine
        label="Reembolsos"
        value={formatMoney(point.refundCents, currency)}
      />
    </div>
  );
}

function TooltipLine({ label, value }: { label: string; value: string }) {
  return (
    <p className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </p>
  );
}
