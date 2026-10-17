import {
  adminTenantsControllerListOptions,
  type AdminTenantListItemDto,
} from '@lattiz/api-client';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { QueryAlert } from '@/components/query-alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatBytes, formatCount, formatDate, formatDateTime } from '@/lib/format';
import {
  type ClientListSearch,
  toTenantListQuery,
} from './list-search';
import {
  daysUntil,
  domainExpiryIsUrgent,
  domainExpiryListText,
  planBadge,
  previewBadge,
  publishedLabel,
  subscriptionBadge,
  tenantStatusBadge,
} from './labels';
import { StatusBadgeView } from './status-badge';

const PLANS = [
  { value: 'basico', label: 'Básico' },
  { value: 'pro', label: 'Pro' },
  { value: 'trial', label: 'Prueba' },
  { value: 'none', label: 'Sin plan' },
] as const;

const PAYMENT_STATUSES = [
  { value: 'active', label: 'Activo' },
  { value: 'inactive', label: 'Inactivo' },
  { value: 'cancelled', label: 'Cancelado' },
] as const;

type SortColumn = NonNullable<ClientListSearch['sort']>;

export function TenantListPage({ search }: { search: ClientListSearch }) {
  const navigate = useNavigate({ from: '/clientes' });
  const [draft, setDraft] = useState(search.q ?? '');
  const query = useQuery({
    ...adminTenantsControllerListOptions({ query: toTenantListQuery(search) }),
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

  function updateSearch(patch: Partial<ClientListSearch>, resetPage = true) {
    void navigate({
      search: (prev) => ({
        ...prev,
        ...patch,
        page: resetPage ? undefined : patch.page,
      }),
    });
  }

  function toggleSort(column: SortColumn) {
    const active = search.sort ?? 'created_at';
    const order = search.order ?? 'desc';
    updateSearch({
      sort: column,
      order: active === column && order === 'desc' ? 'asc' : 'desc',
    });
  }

  const page = query.data?.page ?? search.page ?? 1;
  const pageSize = query.data?.pageSize ?? 25;
  const total = query.data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const sort = search.sort ?? 'created_at';
  const order = search.order ?? 'desc';

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <PageHeader title="Clientes" description="Negocios que usan Lattiz." />
      <div className="flex min-w-0 flex-col gap-3">
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Buscar por nombre, correo o dominio"
          aria-label="Buscar clientes"
          className="max-w-md"
        />
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <FilterSelect
            label="Plan"
            value={search.plan}
            options={PLANS}
            onChange={(plan) => updateSearch({ plan })}
          />
          <FilterSelect
            label="Estado de pago"
            value={search.status}
            options={PAYMENT_STATUSES}
            onChange={(status) => updateSearch({ status })}
          />
          <FilterChip
            pressed={search.domainSoon === true}
            onClick={() => updateSearch({ domainSoon: search.domainSoon ? undefined : true })}
          >
            Dominio vence pronto
          </FilterChip>
          <FilterChip
            pressed={search.renewalOverdue === true}
            onClick={() =>
              updateSearch({ renewalOverdue: search.renewalOverdue ? undefined : true })
            }
          >
            Renovación en mora
          </FilterChip>
          <FilterChip
            pressed={search.dnsIssue === true}
            onClick={() => updateSearch({ dnsIssue: search.dnsIssue ? undefined : true })}
          >
            Problema de DNS
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
              Ningún cliente coincide con esta búsqueda.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Plan / pago</TableHead>
                  <TableHead>Prueba</TableHead>
                  <TableHead>Plantilla</TableHead>
                  <TableHead>Sitio</TableHead>
                  <SortHeader
                    label="Dominio"
                    column="domain_expires_at"
                    active={sort}
                    order={order}
                    onSort={toggleSort}
                  />
                  <TableHead>Almacenamiento</TableHead>
                  <SortHeader
                    label="Alta"
                    column="created_at"
                    active={sort}
                    order={order}
                    onSort={toggleSort}
                  />
                  <SortHeader
                    label="Último acceso"
                    column="last_sign_in_at"
                    active={sort}
                    order={order}
                    onSort={toggleSort}
                  />
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.data.items.map((item) => (
                  <TableRow
                    key={item.id}
                    className="cursor-pointer"
                    onClick={() =>
                      void navigate({
                        to: '/clientes/$tenantId',
                        params: { tenantId: item.id },
                      })
                    }
                  >
                    <TableCell className="whitespace-normal">
                      <ClientCell item={item} />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <StatusBadgeView badge={planBadge(item.plan)} />
                        <StatusBadgeView
                          badge={
                            item.subscription
                              ? subscriptionBadge(item.subscription.status)
                              : tenantStatusBadge(item.status)
                          }
                        />
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-normal">
                      <div className="flex flex-col items-start gap-1">
                        <StatusBadgeView badge={previewBadge(item.previewState)} />
                        <span className="text-xs text-muted-foreground">
                          {item.previewExpiresAt
                            ? `Vence ${formatDate(item.previewExpiresAt)}`
                            : 'Sin fecha de prueba'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{item.template?.name ?? 'Sin plantilla'}</TableCell>
                    <TableCell>{publishedLabel(item.published)}</TableCell>
                    <TableCell className="whitespace-normal">
                      <DomainCell item={item} />
                    </TableCell>
                    <TableCell>
                      {item.storageBytes == null ? 'Sin medir' : formatBytes(item.storageBytes)}
                    </TableCell>
                    <TableCell>{formatDate(item.createdAt)}</TableCell>
                    <TableCell>
                      {item.lastSignInAt ? formatDateTime(item.lastSignInAt) : 'Nunca'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
            <p className="text-sm text-muted-foreground">
              {rangeLabel(page, pageSize, total)}
            </p>
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

function ClientCell({ item }: { item: AdminTenantListItemDto }) {
  return (
    <div className="flex min-w-40 flex-col gap-1">
      <span className="font-medium">{item.name}</span>
      <span className="text-xs text-muted-foreground">{item.email ?? 'Sin correo'}</span>
      {item.isInternal ? (
        <StatusBadgeView badge={{ label: 'Interna', tone: 'neutral' }} />
      ) : null}
    </div>
  );
}

function DomainCell({ item }: { item: AdminTenantListItemDto }) {
  if (!item.domain) {
    return <span className="text-muted-foreground">Sin dominio</span>;
  }
  const days = daysUntil(item.domain.expiresAt);
  return (
    <div className="flex min-w-36 flex-col">
      <span>{item.domain.name}</span>
      {days == null ? (
        <span className="text-xs text-muted-foreground">Sin fecha de vencimiento</span>
      ) : (
        <span
          className={
            domainExpiryIsUrgent(days)
              ? 'text-xs font-medium text-destructive'
              : 'text-xs text-muted-foreground'
          }
        >
          {domainExpiryListText(days)}
        </span>
      )}
    </div>
  );
}

function SortHeader({
  label,
  column,
  active,
  order,
  onSort,
}: {
  label: string;
  column: SortColumn;
  active: SortColumn;
  order: 'asc' | 'desc';
  onSort: (column: SortColumn) => void;
}) {
  const current = active === column;
  return (
    <TableHead aria-sort={current ? (order === 'asc' ? 'ascending' : 'descending') : 'none'}>
      <button
        type="button"
        className="inline-flex items-center gap-1 hover:text-foreground"
        onClick={() => onSort(column)}
      >
        {label}
        {current && order === 'asc' ? <ArrowUp className="size-3.5" /> : null}
        {current && order === 'desc' ? <ArrowDown className="size-3.5" /> : null}
      </button>
    </TableHead>
  );
}

function FilterChip({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={pressed ? 'default' : 'outline'}
      aria-pressed={pressed}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

function FilterSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T | undefined;
  options: readonly { value: T; label: string }[];
  onChange: (value: T | undefined) => void;
}) {
  const items = [{ value: 'all', label: `${label}: todos` }, ...options];

  return (
    <Select
      items={items}
      value={value ?? 'all'}
      onValueChange={(next) => {
        if (next == null || next === 'all') {
          onChange(undefined);
          return;
        }
        onChange(next as T);
      }}
    >
      <SelectTrigger aria-label={label} className="min-w-36">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        {items.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function rangeLabel(page: number, pageSize: number, total: number): string {
  if (total === 0) return '0 clientes';
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return `${formatCount(start)}–${formatCount(end)} de ${formatCount(total)}`;
}
