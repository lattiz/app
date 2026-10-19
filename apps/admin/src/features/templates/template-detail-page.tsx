import {
  adminTemplatesControllerGetOptions,
  type AdminTemplateDetailDto,
} from '@lattiz/api-client';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { useEffect, useRef, useState, type RefObject } from 'react';
import { textLinkClass } from '@/components/external-anchor';
import { FactList } from '@/components/fact-list';
import { PageCrumb } from '@/components/layout/page-crumb';
import { PageHeader } from '@/components/layout/page-header';
import { QueryAlert } from '@/components/query-alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { isAdminNotFound } from '@/lib/admin-errors';
import { formatCount, formatDate } from '@/lib/format';
import type { AdminRole } from '@/lib/navigation';
import { planBadge, publishedLabel } from '@/features/tenants/labels';
import { StatusBadgeView } from '@/features/tenants/status-badge';
import { templateStatusBadge, templateTierBadge } from './labels';
import { TemplateControls } from './template-controls';
import { TemplateKitCard } from './template-kit-card';
import {
  PREVIEW_FRAME_HEIGHT,
  PREVIEW_WIDTH_LABEL,
  PREVIEW_WIDTHS,
  previewScale,
  type PreviewWidth,
} from './preview-scale';

export function TemplateDetailPage({
  id,
  role,
}: {
  id: string;
  role: AdminRole;
}) {
  const query = useQuery(adminTemplatesControllerGetOptions({ path: { id } }));

  if (query.isPending) {
    return (
      <div className="flex w-full min-w-0 flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="flex w-full min-w-0 flex-col gap-4">
        <BackLink />
        {isAdminNotFound(query.error) ? (
          <PageHeader
            title="Plantilla"
            description="No encontramos esta plantilla."
          />
        ) : (
          <QueryAlert
            error={query.error}
            pending={query.isFetching}
            onRetry={() => void query.refetch()}
          />
        )}
      </div>
    );
  }

  const detail = query.data;

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <PageCrumb label={detail.name} />
      <BackLink />
      <div className="flex min-w-0 flex-col gap-3">
        <PageHeader
          title={detail.name}
          description={detail.description ?? undefined}
        />
        <div className="flex flex-wrap gap-1">
          <StatusBadgeView badge={templateTierBadge(detail.tier)} />
          <StatusBadgeView badge={templateStatusBadge(detail.status)} />
          {detail.featured ? (
            <StatusBadgeView badge={{ label: 'Destacada', tone: 'info' }} />
          ) : null}
        </div>
        <TemplateControls detail={detail} role={role} />
      </div>
      <PreviewFrame name={detail.name} previewUrl={detail.previewUrl} />
      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>Datos</CardTitle>
          <CardDescription>
            Los clientes que ya usan esta plantilla tienen su propia copia;
            cambiarla no altera sus sitios.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <FactList items={metadata(detail)} />
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Count label="La usan" value={detail.usage.tenantsUsing} />
            <Count label="Publicados" value={detail.usage.sitesPublished} />
            <Count label="De pago" value={detail.usage.payingTenants} />
            <Count label="En prueba" value={detail.usage.trialTenants} />
          </dl>
        </CardContent>
      </Card>
      <TemplateKitCard meta={detail.kitMeta} />
      <TenantsTable detail={detail} />
    </div>
  );
}

function PreviewFrame({
  name,
  previewUrl,
}: {
  name: string;
  previewUrl: string | null;
}) {
  const [width, setWidth] = useState<PreviewWidth>(1440);
  const frameRef = useRef<HTMLDivElement>(null);
  const containerWidth = useElementWidth(frameRef);
  const scale = previewScale(containerWidth, width);

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Vista previa</CardTitle>
        <CardDescription>
          Elige el ancho de un teléfono, una tableta o una computadora.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex min-w-0 flex-col gap-3">
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Ancho de la vista previa"
        >
          {PREVIEW_WIDTHS.map((option) => (
            <Button
              key={option}
              type="button"
              size="sm"
              variant={width === option ? 'default' : 'outline'}
              aria-pressed={width === option}
              onClick={() => setWidth(option)}
            >
              {PREVIEW_WIDTH_LABEL[option]} ({option})
            </Button>
          ))}
        </div>
        {previewUrl ? (
          <div
            ref={frameRef}
            className="relative w-full min-w-0 overflow-hidden rounded-2xl bg-muted"
          >
            <div
              className="relative w-full"
              style={{ height: PREVIEW_FRAME_HEIGHT * scale }}
            >
              <iframe
                src={previewUrl}
                title={`Vista previa de ${name}`}
                sandbox="allow-scripts allow-same-origin"
                className="absolute top-0 left-0 border-0 bg-background"
                style={{
                  width,
                  height: PREVIEW_FRAME_HEIGHT,
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left',
                }}
              />
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Esta plantilla no tiene vista previa.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function TenantsTable({ detail }: { detail: AdminTemplateDetailDto }) {
  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Clientes que la usan</CardTitle>
      </CardHeader>
      {detail.tenants.length === 0 ? (
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nadie está usando esta plantilla.
          </p>
        </CardContent>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Con acceso</TableHead>
              <TableHead>Publicado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {detail.tenants.map((tenant) => (
              <TableRow key={tenant.id}>
                <TableCell className="whitespace-normal">
                  <Link
                    to="/clientes/$tenantId"
                    params={{ tenantId: tenant.id }}
                    className={textLinkClass}
                  >
                    {tenant.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">{tenant.slug}</p>
                </TableCell>
                <TableCell>
                  <StatusBadgeView badge={planBadge(tenant.plan)} />
                </TableCell>
                <TableCell>{tenant.entitled ? 'Sí' : 'No'}</TableCell>
                <TableCell>{publishedLabel(tenant.published)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}

function metadata(
  detail: AdminTemplateDetailDto,
): { label: string; value: string }[] {
  return [
    { label: 'Categoría', value: detail.category?.trim() || 'Sin categoría' },
    {
      label: 'Etiquetas',
      value: detail.tags.length > 0 ? detail.tags.join(', ') : 'Sin etiquetas',
    },
    { label: 'Secciones', value: formatCount(detail.sectionCount) },
    {
      label: 'Retirada',
      value: detail.retiredAt ? formatDate(detail.retiredAt) : 'No',
    },
    { label: 'Alta', value: formatDate(detail.createdAt) },
    {
      label: 'Archivadas',
      value: formatCount(detail.usage.archivedCount),
    },
  ];
}

function Count({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-lg font-medium">{formatCount(value)}</dd>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      to="/plantillas"
      className="text-sm text-muted-foreground hover:text-foreground"
    >
      Plantillas
    </Link>
  );
}

function useElementWidth(ref: RefObject<HTMLElement | null>): number {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new ResizeObserver((entries) => {
      const next = entries[0]?.contentRect.width ?? 0;
      setWidth(next);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);

  return width;
}
