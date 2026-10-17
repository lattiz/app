import {
  adminSubscriptionsControllerListOptions,
  type AdminSubscriptionListItemDto,
} from '@lattiz/api-client';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { textLinkClass } from '@/components/external-anchor';
import { FilterChip, FilterSelect } from '@/components/filter-select';
import { PageHeader } from '@/components/layout/page-header';
import { QueryAlert } from '@/components/query-alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCount, formatDate } from '@/lib/format';
import { billingPeriodLabel, planBadge } from '@/features/tenants/labels';
import { StatusBadgeView } from '@/features/tenants/status-badge';
import { cancellationLabel, subscriptionBadge } from './labels';
import {
  SUBSCRIPTION_STATUSES,
  type SubscriptionListSearch,
  type SubscriptionStatusFilter,
  toSubscriptionListQuery,
} from './list-search';

const PLANS = [
  { value: 'basico', label: 'Básico' },
  { value: 'pro', label: 'Pro' },
] as const;

const PERIODS = [
  { value: 'monthly', label: 'Mensual' },
  { value: 'annual', label: 'Anual' },
] as const;

const STATUSES = SUBSCRIPTION_STATUSES.map((status) => ({
  value: status,
  label: subscriptionBadge(status).label,
}));

export function SubscriptionListPage({ search }: { search: SubscriptionListSearch }) {
  const navigate = useNavigate({ from: '/suscripciones' });
  const [draft, setDraft] = useState(search.q ?? '');
  const query = useQuery({
    ...adminSubscriptionsControllerListOptions({
      query: toSubscriptionListQuery(search),
    }),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    setDraft(search.q ?? '');
  }, [search.q]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const next = draft.trim();
      if (next === (search.q ?? '')) return;
      void navigate({
        replace: true,
        search: (prev) => ({
          ...prev,
          q: next || undefined,
          page: undefined,
        }),
      });
    }, 300);
    return () => window.clearTimeout(handle);
  }, [draft, navigate, search.q]);

  function updateSearch(patch: Partial<SubscriptionListSearch>, resetPage = true) {
    void navigate({
      search: (prev) => ({
        ...prev,
        ...patch,
        page: resetPage ? undefined : patch.page,
      }),
    });
  }

  const page = query.data?.page ?? search.page ?? 1;
  const pageSize = query.data?.pageSize ?? 25;
  const total = query.data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <PageHeader
        title="Suscripciones"
        description="Quién paga, con qué plan y cuándo es el siguiente cobro."
      />
      <div className="flex min-w-0 flex-col gap-3">
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Buscar por nombre, correo o identificador"
          aria-label="Buscar suscripciones"
          className="max-w-md"
        />
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <FilterSelect<SubscriptionStatusFilter>
            label="Estado"
            allLabel="Todos los estados"
            value={search.status}
            options={STATUSES}
            onChange={(status) => updateSearch({ status })}
          />
          <FilterSelect
            label="Plan"
            allLabel="Todos los planes"
            value={search.plan}
            options={PLANS}
            onChange={(plan) => updateSearch({ plan })}
          />
          <FilterSelect
            label="Periodo"
            allLabel="Todos los periodos"
            value={search.period}
            options={PERIODS}
            onChange={(period) => updateSearch({ period })}
          />
          <FilterChip
            pressed={search.cancelScheduled === true}
            onClick={() =>
              updateSearch({ cancelScheduled: search.cancelScheduled ? undefined : true })
            }
          >
            Cancelación programada
          </FilterChip>
          <FilterChip
            pressed={search.paymentIssues === true}
            onClick={() =>
              updateSearch({ paymentIssues: search.paymentIssues ? undefined : true })
            }
          >
            Con problemas de pago
          </FilterChip>
          <FilterChip
            pressed={search.internal === true}
            onClick={() => updateSearch({ internal: search.internal ? undefined : true })}
          >
            Incluir cuentas internas
          </FilterChip>
        </div>
      </div>

      {query.isPending ? <Skeleton className="h-80" /> : null}
      {query.isError ? (
        <QueryAlert
          error={query.error}
          pending={query.isFetching}
          onRetry={() => void query.refetch()}
        />
      ) : null}

      {query.data && !query.isError ? (
        <Card className="min-w-0">
          {query.data.items.length === 0 ? (
            <p className="px-6 py-10 text-sm text-muted-foreground">
              Ninguna suscripción coincide con esta búsqueda.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Periodo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Próximo cobro o vencimiento</TableHead>
                  <TableHead>Cancelación programada</TableHead>
                  <TableHead>Intentos de pago fallidos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.data.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="whitespace-normal">
                      <ClientCell item={item} />
                    </TableCell>
                    <TableCell>
                      <StatusBadgeView badge={planBadge(item.plan)} />
                    </TableCell>
                    <TableCell>{billingPeriodLabel(item.period)}</TableCell>
                    <TableCell>
                      <StatusBadgeView badge={subscriptionBadge(item.status)} />
                    </TableCell>
                    <TableCell>
                      {item.currentPeriodEnd ? formatDate(item.currentPeriodEnd) : 'Sin fecha'}
                    </TableCell>
                    <TableCell>{cancellationLabel(item)}</TableCell>
                    <TableCell>
                      <span
                        className={
                          item.paymentAttempts > 0 ? 'font-medium text-destructive' : undefined
                        }
                      >
                        {formatCount(item.paymentAttempts)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
            <p className="text-sm text-muted-foreground">{rangeLabel(page, pageSize, total)}</p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => updateSearch({ page: page - 1 }, false)}
              >
                Anterior
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= pageCount}
                onClick={() => updateSearch({ page: page + 1 }, false)}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  );
}

function ClientCell({ item }: { item: AdminSubscriptionListItemDto }) {
  return (
    <div className="flex min-w-40 flex-col gap-1">
      <Link
        to="/suscripciones/$id"
        params={{ id: item.id }}
        className={textLinkClass}
      >
        {item.tenant.name}
      </Link>
      <span className="text-xs text-muted-foreground">{item.tenant.email ?? 'Sin correo'}</span>
    </div>
  );
}

function rangeLabel(page: number, pageSize: number, total: number): string {
  if (total === 0) return '0 suscripciones';
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return `${formatCount(start)}–${formatCount(end)} de ${formatCount(total)}`;
}
