import type { AnalyticsDailyPointDto } from '@lattiz/api-client';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { formatLongDay, formatNumber, formatShortDay } from '../lib/format';

const chartConfig = {
  sessions: { label: 'Visitas', color: 'var(--chart-3)' },
} satisfies ChartConfig;

export function VisitsChart({ daily }: { daily: AnalyticsDailyPointDto[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Visitas por día</CardTitle>
        <CardDescription>Últimos 28 días</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-56 w-full sm:h-64">
          <AreaChart accessibilityLayer data={daily} margin={{ left: 0, right: 8, top: 8 }}>
            <defs>
              <linearGradient id="fillSessions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-sessions)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--color-sessions)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={24}
              tickFormatter={(value: string) => formatShortDay(value)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={36}
              allowDecimals={false}
              tickFormatter={(value: number) => formatNumber(value)}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="line"
                  labelFormatter={(_, payload) => {
                    const date = (payload[0]?.payload as AnalyticsDailyPointDto | undefined)?.date;
                    return date ? formatLongDay(date) : '';
                  }}
                />
              }
            />
            <Area
              dataKey="sessions"
              type="monotone"
              fill="url(#fillSessions)"
              stroke="var(--color-sessions)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
