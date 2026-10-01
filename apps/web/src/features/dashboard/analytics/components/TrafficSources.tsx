import type { AnalyticsChannelDto } from '@lattiz/api-client';
import { Bar, BarChart, LabelList, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';

const chartConfig = {
  sessions: { label: 'Visitas', color: 'var(--chart-4)' },
} satisfies ChartConfig;

export function TrafficSources({ channels }: { channels: AnalyticsChannelDto[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>De dónde vienen tus visitas</CardTitle>
        <CardDescription>Fuentes principales en los últimos 28 días</CardDescription>
      </CardHeader>
      <CardContent>
        {channels.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin fuentes registradas todavía.</p>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto w-full"
            style={{ height: `${channels.length * 44 + 8}px` }}
          >
            <BarChart
              accessibilityLayer
              data={channels}
              layout="vertical"
              margin={{ left: 0, right: 48 }}
            >
              <XAxis type="number" dataKey="sessions" hide />
              <YAxis
                type="category"
                dataKey="label"
                tickLine={false}
                axisLine={false}
                width={128}
                tickMargin={4}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel={false} labelKey="label" />}
              />
              <Bar dataKey="sessions" fill="var(--color-sessions)" radius={4} barSize={24}>
                <LabelList
                  dataKey="sharePct"
                  position="right"
                  offset={8}
                  className="fill-foreground"
                  fontSize={12}
                  formatter={(value) => `${String(value)}%`}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
