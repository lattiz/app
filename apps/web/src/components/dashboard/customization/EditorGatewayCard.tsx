import { Link } from '@tanstack/react-router';
import { useMutation } from '@tanstack/react-query';
import { ExternalLinkIcon, Loader2Icon, PencilIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { SiteStatus } from '@/types/dashboard.types';

interface EditorGatewayCardProps {
  tenantId: string;
  site: SiteStatus;
  canPublish?: boolean;
  /** The template is above the plan: the editor stays closed until they switch or upgrade. */
  templateLocked?: boolean;
}

// This gateway has no loaded GrapesJS project/exported HTML to send — that
// only exists inside a live editor session (see features/editor/api.ts
// publishSite). Simulated for now; wire to the real endpoint once this page
// can access the last-saved project payload.
function mockRepublish(): Promise<{ publishedAt: string }> {
  return new Promise((resolve) =>
    setTimeout(() => resolve({ publishedAt: new Date().toISOString() }), 1200),
  );
}

export function EditorGatewayCard({
  tenantId,
  site,
  canPublish = true,
  templateLocked = false,
}: EditorGatewayCardProps) {
  const republish = useMutation({ mutationFn: mockRepublish });
  const isFirstPublish = site.lastPublished === null;
  const siteUrl = site.liveUrl ?? site.previewUrl;
  const canViewSite = site.isOnline && Boolean(siteUrl);

  return (
    <Card data-tour="editor-gateway-card">
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            <PencilIcon className="size-5" />
          </span>
          <div className="space-y-1">
            <p className="font-medium">Editor de sitio</p>
            <p className="max-w-md text-sm text-muted-foreground">
              Personaliza tu sitio con arrastrar y soltar. Los cambios se
              guardan automáticamente cada 5 ediciones.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:w-48">
          {templateLocked ? (
            <Button disabled>Abrir editor</Button>
          ) : (
            <Button
              render={<Link to="/editor/$tenantId" params={{ tenantId }} />}
            >
              Abrir editor
            </Button>
          )}
          <Button
            variant="outline"
            disabled={
              templateLocked ||
              !canPublish ||
              republish.isPending ||
              site.deployInProgress
            }
            onClick={() => {
              if (canPublish) republish.mutate();
            }}
          >
            {republish.isPending ? (
              <>
                <Loader2Icon className="size-3 animate-spin" />
                Publicando…
              </>
            ) : isFirstPublish ? (
              'Publicar sitio'
            ) : (
              'Actualizar sitio web'
            )}
          </Button>
          {canViewSite && siteUrl ? (
            <Button
              variant="outline"
              nativeButton={false}
              render={
                <a href={siteUrl} target="_blank" rel="noopener noreferrer" />
              }
            >
              Ver sitio
              <ExternalLinkIcon />
            </Button>
          ) : (
            <Tooltip>
              <TooltipTrigger
                render={
                  <span className="inline-flex">
                    <Button variant="outline" disabled>
                      Ver sitio
                      <ExternalLinkIcon />
                    </Button>
                  </span>
                }
              />
              <TooltipContent>Publica tu sitio para verlo</TooltipContent>
            </Tooltip>
          )}
          {!canPublish && (
            <Button
              variant="link"
              size="sm"
              render={<Link to="/dashboard/subscription" />}
            >
              Elige un plan
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
