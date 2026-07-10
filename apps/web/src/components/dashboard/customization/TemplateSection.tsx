import { Link } from '@tanstack/react-router';
import { LayoutGridIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { relativeTime } from '@/lib/format';
import type { SiteStatus } from '@/types/dashboard.types';

interface TemplateSectionProps {
  site: SiteStatus;
}

export function TemplateSection({ site }: TemplateSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Plantilla actual</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <LayoutGridIcon className="size-5" />
          </span>
          <div>
            <p className="text-sm font-medium">
              {site.templateName ?? 'Sin plantilla'}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {site.templateId && (
                <Badge variant="secondary" className="bg-muted text-muted-foreground">
                  {site.templateId}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                Última edición: {relativeTime(site.lastPublished)}
              </span>
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="w-fit"
          render={<Link to="/dashboard/templates" />}
        >
          Cambiar plantilla
        </Button>
      </CardContent>
    </Card>
  );
}
