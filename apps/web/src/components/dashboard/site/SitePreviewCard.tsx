import { useEffect, useState } from 'react';
import { GlobeIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SiteStatus } from '@/types/dashboard.types';

interface SitePreviewCardProps {
  site: SiteStatus;
}

function buildPreviewUrl(domain: string | null): string | null {
  if (!domain) return null;

  const trimmedDomain = domain.trim();
  if (!trimmedDomain) return null;

  if (/^https?:\/\//i.test(trimmedDomain)) {
    return trimmedDomain.replace(/\/+$/, '');
  }

  const normalizedDomain = trimmedDomain.replace(/\/+$/, '');
  const isLocalhost = /^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i.test(normalizedDomain);
  const protocol = isLocalhost ? 'http' : 'https';

  return `${protocol}://${normalizedDomain}`;
}

export function SitePreviewCard({ site }: SitePreviewCardProps) {
  const [previewError, setPreviewError] = useState(false);
  const previewUrl = buildPreviewUrl(site.domain);
  const canPreview = site.isOnline && !!previewUrl && !previewError;

  useEffect(() => {
    setPreviewError(false);
  }, [site.domain, site.isOnline]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vista previa</CardTitle>
      </CardHeader>
      <CardContent>
        {canPreview ? (
          <div className="overflow-hidden rounded-2xl border border-border bg-background">
            <div className="flex items-center gap-1.5 border-b border-border bg-muted px-3 py-2">
              <span className="size-2 rounded-full bg-red-400" />
              <span className="size-2 rounded-full bg-yellow-400" />
              <span className="size-2 rounded-full bg-green-400" />
              <span className="ml-2 truncate rounded-full bg-background px-2 py-0.5 text-xs text-muted-foreground">
                {site.domain}
              </span>
            </div>

            <iframe
              src={previewUrl}
              title={`Vista previa de ${site.domain}`}
              loading="lazy"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              onError={() => setPreviewError(true)}
              className="h-[420px] w-full border-0 bg-background"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed py-10 text-center">
            <GlobeIcon className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {site.isOnline && site.domain
                ? 'No se pudo cargar la vista previa en este momento'
                : 'Publica tu sitio para ver la vista previa'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}