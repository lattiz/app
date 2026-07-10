import { Card, CardContent } from '@/components/ui/card';
import { relativeTime } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { SiteStatus } from '@/types/dashboard.types';

interface SiteMetricsProps {
  site: SiteStatus;
}

type PillVariant = 'success' | 'warning' | 'muted';

const pillClasses: Record<PillVariant, string> = {
  success: 'bg-green-500/10 text-green-700 dark:text-green-400',
  warning: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
  muted: 'bg-muted text-muted-foreground',
};

interface Metric {
  label: string;
  value: string;
  pill: { text: string; variant: PillVariant };
}

function buildMetrics(site: SiteStatus): Metric[] {
  return [
    {
      label: 'Estado del sitio',
      value: site.isOnline ? 'En línea' : 'Sin publicar',
      pill: site.isOnline
        ? { text: 'publicado', variant: 'success' }
        : { text: 'borrador', variant: 'muted' },
    },
    {
      label: 'Última publicación',
      value: site.lastPublished ? relativeTime(site.lastPublished) : '—',
      pill: site.lastPublished
        ? { text: 'al día', variant: 'success' }
        : { text: 'sin publicar', variant: 'muted' },
    },
    {
      label: 'Plantilla activa',
      value: site.templateName ?? '—',
      pill: site.templateId
        ? { text: site.templateId, variant: 'muted' }
        : { text: 'sin plantilla', variant: 'warning' },
    },
  ];
}

export function SiteMetrics({ site }: SiteMetricsProps) {
  const metrics = buildMetrics(site);

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
