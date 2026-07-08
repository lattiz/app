import { Link } from '@tanstack/react-router';
import { LayoutGridIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { relativeTime } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { DashboardState, SiteStatus } from '@/types/dashboard.types';

interface SiteCardProps {
  state: DashboardState;
  site: SiteStatus | null;
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

export function SiteCard({ state, site }: SiteCardProps) {
  if (state === 'no-template') {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-6 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <LayoutGridIcon className="size-6 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="font-medium">Tu sitio no tiene plantilla</p>
            <p className="text-sm text-muted-foreground">
              Elige una plantilla para configurar el diseño y comenzar a editar.
            </p>
          </div>
          <Button size="sm" render={<Link to="/dashboard/templates" />}>
            Ir a plantillas
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!site) return null;

  const dotClass = site.dnsError
    ? 'bg-red-500'
    : site.deployInProgress
      ? 'bg-yellow-500'
      : site.isOnline
        ? 'bg-green-500'
        : 'bg-muted-foreground';

  const domainBadge = site.dnsError
    ? { text: 'DNS error', className: 'bg-destructive/10 text-destructive' }
    : site.dnsPropagating
      ? {
          text: 'propagando',
          className: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
        }
      : {
          text: 'conectado',
          className: 'bg-green-500/10 text-green-700 dark:text-green-400',
        };

  return (
    <Card>
      <CardContent className="flex flex-col divide-y divide-border">
        <Row
          label={
            <span className="flex items-center gap-2">
              <span className={cn('size-2 rounded-full', dotClass)} />
              {site.domain ?? 'Sin dominio'}
            </span>
          }
        >
          <Badge variant="secondary" className={domainBadge.className}>
            {domainBadge.text}
          </Badge>
        </Row>
        <Row label="Última publicación">
          {relativeTime(site.lastPublished)}
        </Row>
        <Row label="Plantilla">{site.templateName ?? '—'}</Row>
        <Row label="SSL">
          <Badge
            variant="secondary"
            className={
              site.sslActive
                ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                : 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400'
            }
          >
            {site.sslActive ? 'activo' : 'pendiente'}
          </Badge>
        </Row>
      </CardContent>
    </Card>
  );
}
