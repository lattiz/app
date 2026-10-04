import { ExternalLinkIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { displayHost } from '@/lib/site-address';
import { cn } from '@/lib/utils';
import type { SiteStatus } from '@/types/dashboard.types';

interface SiteDomainCardProps {
  site: SiteStatus;
}

export function SiteDomainCard({ site }: SiteDomainCardProps) {
  const dotClass = site.dnsError
    ? 'bg-red-500'
    : site.domainConnected
      ? 'bg-green-500'
      : 'bg-muted-foreground';

  const dnsBadge = site.dnsError
    ? { text: 'error DNS', className: 'bg-destructive/10 text-destructive' }
    : site.dnsPropagating
      ? {
          text: 'propagando',
          className: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
        }
      : site.domainConnected
        ? {
            text: 'conectado',
            className: 'bg-green-500/10 text-green-700 dark:text-green-400',
          }
        : { text: 'sin configurar', className: 'bg-muted text-muted-foreground' };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dominio</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className={cn('size-2 shrink-0 rounded-full', dotClass)} />
          {site.domain ?? 'Sin dominio configurado'}
        </div>

        {site.previewUrl && (
          <p className="text-sm text-muted-foreground">
            Dirección gratuita: {displayHost(site.previewUrl)}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className={dnsBadge.className}>
            DNS: {dnsBadge.text}
          </Badge>
          <Badge
            variant="secondary"
            className={
              site.sslActive
                ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                : 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400'
            }
          >
            SSL {site.sslActive ? 'activo' : 'pendiente'}
          </Badge>
        </div>

        {site.isOnline && site.liveUrl && (
          <Button
            variant="outline"
            size="sm"
            className="w-fit"
            render={
              <a
                href={site.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            Ver sitio <ExternalLinkIcon />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
