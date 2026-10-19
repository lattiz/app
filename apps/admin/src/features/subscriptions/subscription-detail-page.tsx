import {
  adminSubscriptionsControllerGetOptions,
  type AdminSubscriptionInvoiceDto,
  type AdminSubscriptionStripeDto,
} from '@lattiz/api-client';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { ExternalLink } from 'lucide-react';
import { ExternalAnchor, textLinkClass } from '@/components/external-anchor';
import { FactList } from '@/components/fact-list';
import { PageCrumb } from '@/components/layout/page-crumb';
import { PageHeader } from '@/components/layout/page-header';
import { QueryAlert } from '@/components/query-alert';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { buttonVariants } from '@/components/ui/button';
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
import {
  formatCount,
  formatDate,
  formatDateTime,
  formatMoney,
} from '@/lib/format';
import type { AdminRole } from '@/lib/navigation';
import { billingPeriodLabel, planBadge } from '@/features/tenants/labels';
import { StatusBadgeView } from '@/features/tenants/status-badge';
import { SubscriptionActions } from './subscription-actions';
import {
  cancellationLabel,
  cardBrandLabel,
  invoiceBadge,
  priceText,
  scheduleStatusLabel,
  subscriptionBadge,
} from './labels';

export function SubscriptionDetailPage({
  id,
  role,
}: {
  id: string;
  role: AdminRole;
}) {
  const query = useQuery(
    adminSubscriptionsControllerGetOptions({ path: { id } }),
  );

  if (query.isPending) {
    return (
      <div className="flex w-full min-w-0 flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="flex w-full min-w-0 flex-col gap-4">
        <BackLink />
        {isAdminNotFound(query.error) ? (
          <PageHeader
            title="Suscripción"
            description="No encontramos esta suscripción."
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
  const { local } = detail;

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <PageCrumb label={local.tenant.name} />
      <BackLink />
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
        <PageHeader title={local.tenant.name} description={local.tenant.slug} />
        <a
          href={local.stripeDashboardUrl}
          target="_blank"
          rel="noreferrer"
          className={buttonVariants({ variant: 'outline' })}
        >
          Abrir en Stripe
          <ExternalLink />
        </a>
      </div>
      <SubscriptionActions id={id} role={role} local={local} />

      {detail.stripeError ? (
        <Alert>
          <AlertTitle>No se pudo consultar Stripe</AlertTitle>
        </Alert>
      ) : null}

      <div
        className={
          detail.stripe || !detail.stripeError
            ? 'grid min-w-0 gap-4 lg:grid-cols-2'
            : 'grid min-w-0 gap-4'
        }
      >
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>En Lattiz</CardTitle>
            <CardDescription>
              Lo que tenemos guardado de este cobro.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-1">
              <StatusBadgeView badge={planBadge(local.plan)} />
              <StatusBadgeView badge={subscriptionBadge(local.status)} />
            </div>
            <FactList
              items={[
                { label: 'Periodo', value: billingPeriodLabel(local.period) },
                {
                  label: 'Próximo cobro o vencimiento',
                  value: local.currentPeriodEnd
                    ? formatDate(local.currentPeriodEnd)
                    : 'Sin fecha',
                },
                {
                  label: 'Cancelación programada',
                  value: cancellationLabel(local),
                },
                {
                  label: 'Intentos de pago fallidos',
                  value: formatCount(local.paymentAttempts),
                },
                { label: 'Alta', value: formatDate(local.createdAt) },
                {
                  label: 'Cancelada',
                  value: local.canceledAt ? formatDate(local.canceledAt) : 'No',
                },
              ]}
            />
            <p className="text-sm">
              Cliente:{' '}
              <Link
                to="/clientes/$tenantId"
                params={{ tenantId: local.tenant.id }}
                className={textLinkClass}
              >
                {local.tenant.name}
              </Link>
            </p>
          </CardContent>
        </Card>
        {detail.stripe ? (
          <StripeCard stripe={detail.stripe} />
        ) : detail.stripeError ? null : (
          <StripeCard stripe={null} />
        )}
      </div>
      {detail.stripe ? (
        <InvoicesTable invoices={detail.stripe.invoices} />
      ) : null}
    </div>
  );
}

function StripeCard({ stripe }: { stripe: AdminSubscriptionStripeDto | null }) {
  if (!stripe) {
    return (
      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>En Stripe</CardTitle>
          <CardDescription>
            No hay datos de Stripe para mostrar.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const method = stripe.paymentMethod;
  const upcoming = stripe.upcomingInvoice;

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>En Stripe</CardTitle>
        <CardDescription>Precio, tarjeta y el siguiente cobro.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <StatusBadgeView badge={subscriptionBadge(stripe.status)} />
        <FactList
          items={[
            { label: 'Precio', value: priceText(stripe.price) },
            {
              label: 'Tarjeta',
              value: method
                ? `${cardBrandLabel(method.brand)} ···· ${method.last4} · vence ${method.expMonth}/${method.expYear}`
                : 'Sin tarjeta',
            },
            {
              label: 'Próximo cobro',
              value: upcoming
                ? `${formatMoney(upcoming.total, upcoming.currency)}${
                    upcoming.date ? ` el ${formatDate(upcoming.date)}` : ''
                  }`
                : 'Sin próximo cobro',
            },
            { label: 'Cambio programado', value: scheduleText(stripe) },
          ]}
        />
      </CardContent>
    </Card>
  );
}

function InvoicesTable({
  invoices,
}: {
  invoices: AdminSubscriptionInvoiceDto[];
}) {
  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Facturas</CardTitle>
      </CardHeader>
      {invoices.length === 0 ? (
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Todavía no hay facturas.
          </p>
        </CardContent>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Pagada</TableHead>
              <TableHead>Enlaces</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice, index) => (
              <TableRow
                key={`${invoice.number ?? 'sin-numero'}-${invoice.createdAt}-${index}`}
              >
                <TableCell>{invoice.number ?? 'Sin número'}</TableCell>
                <TableCell>
                  <StatusBadgeView badge={invoiceBadge(invoice.status)} />
                </TableCell>
                <TableCell>
                  {formatMoney(invoice.total, invoice.currency)}
                </TableCell>
                <TableCell>{formatDateTime(invoice.createdAt)}</TableCell>
                <TableCell>
                  {invoice.paidAt ? formatDate(invoice.paidAt) : 'No'}
                </TableCell>
                <TableCell>
                  <div className="flex gap-3">
                    {invoice.hostedInvoiceUrl ? (
                      <ExternalAnchor href={invoice.hostedInvoiceUrl}>
                        Ver
                      </ExternalAnchor>
                    ) : (
                      <span className="text-muted-foreground">Sin enlace</span>
                    )}
                    {invoice.invoicePdf ? (
                      <ExternalAnchor href={invoice.invoicePdf}>
                        PDF
                      </ExternalAnchor>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}

function scheduleText(stripe: AdminSubscriptionStripeDto): string {
  const schedule = stripe.schedule;
  if (!schedule || schedule.phases.length === 0) return 'Sin cambio programado';
  const phases = schedule.phases
    .map((phase) => {
      const plan = phase.plan ? planBadge(phase.plan).label : 'Otro precio';
      return `${plan}, del ${formatDate(phase.start)} al ${formatDate(phase.end)}`;
    })
    .join(' · ');
  return `${scheduleStatusLabel(schedule.status)}: ${phases}`;
}

function BackLink() {
  return (
    <Link
      to="/suscripciones"
      className="text-sm text-muted-foreground hover:text-foreground"
    >
      Suscripciones
    </Link>
  );
}
