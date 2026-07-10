import { Link } from '@tanstack/react-router';
import { useMutation } from '@tanstack/react-query';
import { Loader2Icon, PencilIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { SiteStatus } from '@/types/dashboard.types';

interface EditorGatewayCardProps {
  tenantId: string;
  site: SiteStatus;
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

export function EditorGatewayCard({ tenantId, site }: EditorGatewayCardProps) {
  const republish = useMutation({ mutationFn: mockRepublish });

  return (
    <Card>
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
          <Button render={<Link to="/editor/$tenantId" params={{ tenantId }} />}>
            Abrir editor
          </Button>
          <Button
            variant="outline"
            disabled={republish.isPending || site.deployInProgress}
            onClick={() => republish.mutate()}
          >
            {republish.isPending ? (
              <>
                <Loader2Icon className="size-3 animate-spin" />
                Publicando…
              </>
            ) : (
              'Republicar sitio'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
