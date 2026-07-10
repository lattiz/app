import { GlobeIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SiteStatus } from '@/types/dashboard.types';

interface SitePreviewCardProps {
  site: SiteStatus;
}

export function SitePreviewCard({ site }: SitePreviewCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vista previa</CardTitle>
      </CardHeader>
      <CardContent>
        {site.isOnline && site.domain ? (
          <div className="overflow-hidden rounded-2xl border border-border">
            <div className="flex items-center gap-1.5 border-b border-border bg-muted px-3 py-2">
              <span className="size-2 rounded-full bg-red-400" />
              <span className="size-2 rounded-full bg-yellow-400" />
              <span className="size-2 rounded-full bg-green-400" />
              <span className="ml-2 truncate rounded-full bg-background px-2 py-0.5 text-xs text-muted-foreground">
                {site.domain}
              </span>
            </div>
            <div className="flex h-40 items-center justify-center bg-muted/40 text-sm text-muted-foreground">
              Tu sitio está en línea en {site.domain}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed py-10 text-center">
            <GlobeIcon className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Publica tu sitio para ver la vista previa
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
