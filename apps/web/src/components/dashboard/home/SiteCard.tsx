import { Link } from '@tanstack/react-router';
import { LayoutGridIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { relativeTime } from '@/lib/format';
import { displayHost } from '@/lib/site-address';
import { trialBadgeLabel } from '@/lib/trial-copy';
import { cn } from '@/lib/utils';
import type {
  DashboardState,
  PreviewState,
  SiteStatus,
} from '@/types/dashboard.types';

interface SiteCardProps {
  state: DashboardState;
  site: SiteStatus | null;
  previewState?: PreviewState | null;
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

function isPreviewTrial(
  previewState: PreviewState | null | undefined,
): boolean {
  return (
    previewState === 'trial_unstarted' ||
    previewState === 'trial_active' ||
    previewState === 'trial_expired'
  );
}

export function SiteCard({ state, site, previewState = null }: SiteCardProps) {
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

  const inTrial = isPreviewTrial(previewState);
  const trialAddress = inTrial ? site.previewUrl : null;
  const statusBadge =
    previewState === 'trial_expired'
      ? {
          text: trialBadgeLabel.ended,
          className: 'bg-destructive/10 text-destructive',
        }
      : inTrial
        ? {
            text: trialBadgeLabel.active,
            className: 'bg-primary/10 text-primary',
          }
        : domainBadge;
  const headline =
    trialAddress != null ? displayHost(trialAddress) : (site.domain ?? 'Sin dominio');
  const webUrl = trialAddress ?? site.liveUrl;

  return (
    <Card>
      <CardContent className="flex flex-col divide-y divide-border">
        <Row
          label={
            <span className="flex items-center gap-2">
              <span className={cn('size-2 rounded-full', dotClass)} />
              {headline}
            </span>
          }
        >
          <Badge variant="secondary" className={statusBadge.className}>
            {statusBadge.text}
          </Badge>
        </Row>
        {webUrl && (
          <Row label="Dirección web">
            {site.isOnline ? (
              <a
                href={webUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate underline-offset-4 hover:underline"
              >
                {displayHost(webUrl)}
              </a>
            ) : (
              <span className="truncate text-muted-foreground">
                {displayHost(webUrl)}
              </span>
            )}
          </Row>
        )}
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
