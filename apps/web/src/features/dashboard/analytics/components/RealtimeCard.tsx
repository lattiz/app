import type { AnalyticsRealtimeDto, AnalyticsRealtimeMinuteDto } from '@lattiz/api-client';
import { ExternalLinkIcon } from 'lucide-react';
import { Bar, BarChart, XAxis } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber } from '../lib/format';

const chartConfig = {
  activeUsers: { label: 'Activos', color: 'var(--chart-2)' },
} satisfies ChartConfig;

interface RealtimeCardProps {
  data: AnalyticsRealtimeDto | undefined;
  isLoading: boolean;
  isError: boolean;
  /** Published site URL; null hides the "Abrir mi sitio" button. */
  siteUrl: string | null;
}

export function RealtimeCard({ data, isLoading, isError, siteUrl }: RealtimeCardProps) {
  const realtime = data?.realtime ?? null;
  const isLive = !!realtime && !data?.unavailable;

  return (
    <Card>
      <CardHeader>
        <CardTitle>En tiempo real</CardTitle>
        {isLive && (
          <CardAction>
            <Badge variant="secondary">
              <span className="relative flex size-2" aria-hidden="true">
                <span className="absolute inline-flex size-full rounded-full bg-chart-2 opacity-75 motion-safe:animate-ping" />
                <span className="relative inline-flex size-2 rounded-full bg-chart-2" />
              </span>
              En vivo
            </Badge>
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-24 rounded-lg" aria-label="Cargando tiempo real" />
        ) : !isLive || isError ? (
          <p className="text-sm text-muted-foreground">Tiempo real no disponible por ahora</p>
        ) : (
          <LiveContent
            activeUsers={realtime.activeUsers}
            perMinute={realtime.perMinute}
            siteUrl={siteUrl}
          />
        )}
      </CardContent>
    </Card>
  );
}

function LiveContent({
  activeUsers,
  perMinute,
  siteUrl,
}: {
  activeUsers: number;
  perMinute: AnalyticsRealtimeMinuteDto[];
  siteUrl: string | null;
}) {
  if (activeUsers === 0) {
    return (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {siteUrl && (
          <Button
            variant="outline"
            className="shrink-0"
            nativeButton={false}
            render={<a href={siteUrl} target="_blank" rel="noreferrer" />}
          >
            Abrir mi sitio
            <ExternalLinkIcon />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <div className="flex shrink-0 flex-col" role="status" aria-live="polite">
        <span className="text-4xl font-semibold tabular-nums">{formatNumber(activeUsers)}</span>
        <span className="text-xs text-muted-foreground">Activos en los últimos 30 min</span>
      </div>
      {perMinute.length > 0 && (
        <ChartContainer config={chartConfig} className="aspect-auto h-20 w-full min-w-0 flex-1">
          <BarChart accessibilityLayer data={perMinute} margin={{ left: 0, right: 0, top: 4 }}>
            <XAxis dataKey="minutesAgo" hide />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(_, payload) => {
                    const point = payload[0]?.payload as AnalyticsRealtimeMinuteDto | undefined;
                    if (!point) return '';
                    return point.minutesAgo === 0 ? 'ahora' : `hace ${point.minutesAgo} min`;
                  }}
                />
              }
            />
            <Bar dataKey="activeUsers" fill="var(--color-activeUsers)" radius={2} />
          </BarChart>
        </ChartContainer>
      )}
    </div>
  );
}
