import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { relativeTime } from '@/lib/format';
import type { SiteStatus } from '@/types/dashboard.types';

interface SiteHistoryCardProps {
  site: SiteStatus;
}

function Row({
  label,
  children,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="flex items-center gap-2 font-medium">{children}</span>
    </div>
  );
}

export function SiteHistoryCard({ site }: SiteHistoryCardProps) {
  const statusBadge = site.deployInProgress
    ? {
        text: 'publicando…',
        className: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
      }
    : site.isOnline
      ? {
          text: 'publicado',
          className: 'bg-green-500/10 text-green-700 dark:text-green-400',
        }
      : { text: 'sin publicar', className: 'bg-muted text-muted-foreground' };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col divide-y divide-border">
        <Row label="Última actualización">
          {relativeTime(site.lastPublished)}
        </Row>
        <Row label="Estado de publicación">
          <Badge variant="secondary" className={statusBadge.className}>
            {statusBadge.text}
          </Badge>
        </Row>
        <Row label="Visitas este mes">
          {site.visits != null ? site.visits.toLocaleString('es-MX') : '—'}
        </Row>
      </CardContent>
    </Card>
  );
}
