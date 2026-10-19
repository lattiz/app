import {
  adminTenantsControllerGetQueryKey,
  adminTenantsControllerListQueryKey,
  adminTenantsControllerRefreshMutation,
  type AdminTemplateArchiveDto,
  type AdminTenantAnalyticsDto,
  type AdminTenantDetailDto,
  type AdminTenantEmailDto,
  type AdminTenantStorageDto,
  type AdminTenantSubscriptionDto,
} from '@lattiz/api-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { toast } from 'sonner';
import { ExternalAnchor, textLinkClass } from '@/components/external-anchor';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { readApiErrorMessage } from '@/lib/admin-errors';
import { formatBytes, formatCount, formatDate, formatDateTime, formatDay } from '@/lib/format';
import {
  billingPeriodLabel,
  emailKindLabel,
  emailStatusBadge,
  planBadge,
  previewBadge,
  showTrialStorageQuota,
  siteStatusLabel,
  subscriptionBadge,
} from './labels';
import { StatusBadgeView } from './status-badge';

const visitsChart = {
  sessions: { label: 'Visitas', color: 'var(--chart-3)' },
} satisfies ChartConfig;

export function SummaryPanel({ detail }: { detail: AdminTenantDetailDto }) {
  const { overview, identity, site } = detail;
  const publicHref = site.customDomainUrl ?? site.previewUrl;
  return (
    <div className="grid min-w-0 gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Identidad</CardTitle>
        </CardHeader>
        <CardContent>
          <FactList
            items={[
              { label: 'Correo', value: identity.email ?? 'Sin correo' },
              { label: 'Correo confirmado', value: identity.emailVerified ? 'Sí' : 'No' },
              {
                label: 'Último acceso',
                value: identity.lastSignInAt ? formatDateTime(identity.lastSignInAt) : 'Nunca',
              },
              {
                label: 'Cómo entró',
                value: identity.providers.length > 0 ? identity.providers.join(', ') : 'Sin dato',
              },
              {
                label: 'Cuenta creada',
                value: identity.createdAt ? formatDate(identity.createdAt) : 'Sin fecha',
              },
            ]}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Sitio</CardTitle>
          <CardDescription>{siteStatusLabel(site.status)}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p>
            Plantilla:{' '}
            {site.template ? (
              <Link
                to="/plantillas/$id"
                params={{ id: site.template.id }}
                className={textLinkClass}
              >
                {site.template.name ?? 'Sin nombre'}
              </Link>
            ) : (
              'Sin plantilla'
            )}
          </p>
          <FactList
            items={[
              { label: 'Publicado', value: site.published ? 'Sí' : 'No' },
              {
                label: 'Fecha de publicación',
                value: site.publishedAt ? formatDateTime(site.publishedAt) : 'Nunca',
              },
              {
                label: 'Último cambio',
                value: site.updatedAt ? formatDateTime(site.updatedAt) : 'Sin cambios',
              },
            ]}
          />
          <ExternalAnchor href={publicHref}>Ver sitio público</ExternalAnchor>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Suscripción actual</CardTitle>
        </CardHeader>
        <CardContent>
          {overview.subscriptionId ? (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-1">
                <StatusBadgeView badge={planBadge(overview.subscriptionPlan)} />
                <StatusBadgeView badge={subscriptionBadge(overview.subscriptionStatus)} />
              </div>
              <FactList
                items={[
                  { label: 'Periodo', value: billingPeriodLabel(overview.billingPeriod) },
                  {
                    label: 'Termina el periodo',
                    value: overview.currentPeriodEnd
                      ? formatDate(overview.currentPeriodEnd)
                      : 'Sin fecha',
                  },
                  {
                    label: 'Cancelación',
                    value: overview.cancelAt
                      ? `Programada para ${formatDate(overview.cancelAt)}`
                      : overview.cancelAtPeriodEnd
                        ? 'Al terminar el periodo'
                        : 'No',
                  },
                ]}
              />
              <Link
                to="/suscripciones/$id"
                params={{ id: overview.subscriptionId }}
                className={textLinkClass}
              >
                Ver el cobro
              </Link>
            </div>
          ) : (
            <p className="text-muted-foreground">Este cliente no tiene una suscripción.</p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Prueba</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-start gap-2">
          <StatusBadgeView badge={previewBadge(detail.previewState)} />
          <p className="text-sm text-muted-foreground">
            {detail.previewExpiresAt
              ? `Vence ${formatDate(detail.previewExpiresAt)}`
              : 'Sin fecha de vencimiento'}
          </p>
          {detail.flags.notes ? (
            <p className="text-sm">Nota interna: {detail.flags.notes}</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

export function BillingPanel({ subscriptions }: { subscriptions: AdminTenantSubscriptionDto[] }) {
  if (subscriptions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sin cobros</CardTitle>
          <CardDescription>Este cliente no tiene suscripciones registradas.</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  return (
    <Card className="min-w-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Plan</TableHead>
            <TableHead>Pago</TableHead>
            <TableHead>Periodo</TableHead>
            <TableHead>Termina</TableHead>
            <TableHead>Intentos</TableHead>
            <TableHead>Alta</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <Link
                  to="/suscripciones/$id"
                  params={{ id: item.id }}
                  className={textLinkClass}
                >
                  {planBadge(item.plan).label}
                </Link>
              </TableCell>
              <TableCell>
                <StatusBadgeView badge={subscriptionBadge(item.status)} />
              </TableCell>
              <TableCell>{billingPeriodLabel(item.billingPeriod)}</TableCell>
              <TableCell>
                {item.currentPeriodEnd ? formatDate(item.currentPeriodEnd) : '—'}
              </TableCell>
              <TableCell>{formatCount(item.paymentAttempts)}</TableCell>
              <TableCell>{formatDate(item.createdAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

export function AnalyticsPanel({
  analytics,
  plan,
}: {
  analytics: AdminTenantAnalyticsDto | null;
  plan: string;
}) {
  const report = analytics?.report ?? null;
  if (!report) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analíticas</CardTitle>
          <CardDescription>
            {plan === 'pro'
              ? 'Este sitio Pro todavía no tiene un reporte guardado.'
              : 'Solo los sitios Pro tienen analíticas.'}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid min-w-0 gap-4">
      {analytics?.isMock ? (
        <p className="text-sm text-muted-foreground">Estas cifras son de demostración.</p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Metric label="Visitas en 28 días" value={formatCount(report.sessions)} />
        <Metric label="Personas en 28 días" value={formatCount(report.activeUsers)} />
      </div>
      {report.daily.length > 0 ? (
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Visitas por día</CardTitle>
            <CardDescription>
              {analytics?.fetchedAt
                ? `Reporte guardado el ${formatDateTime(analytics.fetchedAt)}`
                : 'Últimos 28 días'}
            </CardDescription>
          </CardHeader>
          <CardContent className="min-w-0">
            <ChartContainer config={visitsChart} className="aspect-auto h-56 w-full min-w-0">
              <AreaChart
                accessibilityLayer
                data={report.daily}
                margin={{ left: 0, right: 8, top: 8 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={24}
                  tickFormatter={(value: string) => formatDay(value)}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={36}
                  allowDecimals={false}
                  tickFormatter={(value: number) => formatCount(value)}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      indicator="line"
                      labelFormatter={(_label, payload) => {
                        const row = payload?.[0]?.payload as { date?: string } | undefined;
                        return row?.date ? formatDay(row.date) : '';
                      }}
                    />
                  }
                />
                <Area
                  dataKey="sessions"
                  type="monotone"
                  fill="var(--color-sessions)"
                  fillOpacity={0.2}
                  stroke="var(--color-sessions)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

export function StoragePanel({
  tenantId,
  storage,
  previewState,
}: {
  tenantId: string;
  storage: AdminTenantStorageDto;
  previewState: string;
}) {
  const queryClient = useQueryClient();
  const refresh = useMutation({
    ...adminTenantsControllerRefreshMutation(),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: adminTenantsControllerGetQueryKey({ path: { id: tenantId } }),
        }),
        queryClient.invalidateQueries({ queryKey: adminTenantsControllerListQueryKey() }),
      ]);
      toast.success('Volvimos a medir el almacenamiento.');
    },
    onError: (error) => {
      toast.error(readApiErrorMessage(error));
    },
  });
  const usage = storage.usage;
  const limit = storage.assetByteLimit;
  const showQuota = showTrialStorageQuota(previewState);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Almacenamiento</CardTitle>
        <CardDescription>
          {usage
            ? `Medido el ${formatDateTime(usage.measuredAt)}`
            : 'Todavía no medimos los archivos de este cliente.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <FactList
          items={[
            { label: 'Editor', value: usage ? formatBytes(usage.assetsBytes) : 'Sin medir' },
            { label: 'Marca', value: usage ? formatBytes(usage.brandingBytes) : 'Sin medir' },
          ]}
        />
        {showQuota && limit != null && limit > 0 ? (
          <QuotaBar used={usage?.assetsBytes ?? 0} limit={limit} />
        ) : null}
        {showQuota && (limit == null || limit <= 0) ? (
          <p className="text-sm text-muted-foreground">
            Esta cuenta no tiene tope de prueba.
          </p>
        ) : null}
        <Button
          type="button"
          variant="outline"
          className="w-fit"
          disabled={refresh.isPending}
          onClick={() => refresh.mutate({ path: { id: tenantId } })}
        >
          {refresh.isPending ? 'Recalculando…' : 'Recalcular'}
        </Button>
      </CardContent>
    </Card>
  );
}

export function EmailsPanel({ emails }: { emails: AdminTenantEmailDto[] }) {
  const latest = emails.slice(0, 20);
  if (latest.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Correos</CardTitle>
          <CardDescription>Todavía no enviamos correos a este cliente.</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Últimos correos</CardTitle>
      </CardHeader>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Correo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Intentos</TableHead>
            <TableHead>Creado</TableHead>
            <TableHead>Enviado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {latest.map((email, index) => (
            <TableRow key={`${email.kind}-${email.createdAt}-${index}`}>
              <TableCell className="whitespace-normal">
                {emailKindLabel(email.kind)}
                {email.lastError ? (
                  <p className="mt-1 max-w-72 text-xs text-muted-foreground">{email.lastError}</p>
                ) : null}
              </TableCell>
              <TableCell>
                <StatusBadgeView badge={emailStatusBadge(email.status)} />
              </TableCell>
              <TableCell>{formatCount(email.attempts)}</TableCell>
              <TableCell>{formatDateTime(email.createdAt)}</TableCell>
              <TableCell>{email.sentAt ? formatDateTime(email.sentAt) : '—'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

export function TemplateHistoryPanel({ history }: { history: AdminTemplateArchiveDto[] }) {
  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historial de plantillas</CardTitle>
          <CardDescription>Este cliente no ha cambiado de plantilla.</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de plantillas</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-3">
          {history.map((item, index) => (
            <li key={`${item.archivedAt}-${index}`} className="min-w-0">
              <p className="text-sm font-medium">
                {item.templateId ? (
                  <Link
                    to="/plantillas/$id"
                    params={{ id: item.templateId }}
                    className={textLinkClass}
                  >
                    {item.templateId}
                  </Link>
                ) : (
                  'Plantilla quitada'
                )}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatDateTime(item.archivedAt)} · {item.reason}
              </p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}

function QuotaBar({ used, limit }: { used: number; limit: number }) {
  const ratio = Math.min(used / limit, 1);
  return (
    <div className="flex flex-col gap-2">
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${ratio * 100}%` }} />
      </div>
      <p className="text-sm text-muted-foreground">
        {formatBytes(used)} de {formatBytes(limit)} en la prueba
      </p>
    </div>
  );
}

function FactList({ items }: { items: { label: string; value: string }[] }) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <dt className="text-xs text-muted-foreground">{item.label}</dt>
          <dd className="mt-0.5 break-words">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
