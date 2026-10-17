import {
  adminTemplatesControllerListOptions,
  adminTemplatesControllerListQueryKey,
  adminTemplatesControllerReorderMutation,
  type AdminTemplateListItemDto,
} from '@lattiz/api-client';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { textLinkClass } from '@/components/external-anchor';
import { FilterSelect } from '@/components/filter-select';
import { PageHeader } from '@/components/layout/page-header';
import { QueryAlert } from '@/components/query-alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { readApiErrorMessage } from '@/lib/admin-errors';
import { formatCount } from '@/lib/format';
import { StatusBadgeView } from '@/features/tenants/status-badge';
import { sameOrder, templatesInCatalogOrder } from './actions';
import { templateStatusBadge, templateTierBadge } from './labels';
import {
  templateCategories,
  templateTags,
  type TemplateListSearch,
  toTemplateListQuery,
} from './list-search';
import { TemplateOrderList } from './template-order-list';

const TIERS = [
  { value: 'basic', label: 'Básico' },
  { value: 'pro', label: 'Pro' },
] as const;

const STATUSES = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'active', label: 'Activa' },
  { value: 'retired', label: 'Retirada' },
] as const;

export function TemplateListPage({ search }: { search: TemplateListSearch }) {
  const navigate = useNavigate({ from: '/plantillas' });
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState(search.q ?? '');
  const [ordering, setOrdering] = useState(false);
  const [orderIds, setOrderIds] = useState<string[]>([]);
  const queryFilter = toTemplateListQuery(search);
  const query = useQuery({
    ...adminTemplatesControllerListOptions(
      queryFilter ? { query: queryFilter } : undefined,
    ),
    placeholderData: keepPreviousData,
  });
  const catalog = useQuery(adminTemplatesControllerListOptions());
  const reorder = useMutation({
    ...adminTemplatesControllerReorderMutation(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adminTemplatesControllerListQueryKey(),
      });
      setOrdering(false);
      toast.success('Orden guardado.');
    },
    onError: (error) => {
      toast.error(readApiErrorMessage(error));
    },
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
        }),
      });
    }, 300);
    return () => window.clearTimeout(handle);
  }, [draft, navigate, search.q]);

  function updateSearch(patch: Partial<TemplateListSearch>) {
    void navigate({
      search: (prev) => ({
        ...prev,
        ...patch,
      }),
    });
  }

  const catalogItems = catalog.data?.items ?? [];
  const categories = templateCategories(
    catalogItems.length > 0 ? catalogItems : (query.data?.items ?? []),
  );
  const categoryOptions = categories.map((category) => ({
    value: category,
    label: category,
  }));
  if (search.category && !categories.includes(search.category)) {
    categoryOptions.unshift({ value: search.category, label: search.category });
  }
  const tags = templateTags(catalogItems);
  const tagOptions = tags.map((tag) => ({ value: tag, label: tag }));
  if (search.tag && !tags.includes(search.tag)) {
    tagOptions.unshift({ value: search.tag, label: search.tag });
  }
  const catalogOrder = templatesInCatalogOrder(catalogItems);
  const orderDirty = !sameOrder(
    orderIds,
    catalogOrder.map((item) => item.id),
  );

  function startOrder() {
    setOrderIds(catalogOrder.map((item) => item.id));
    setOrdering(true);
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
        <PageHeader
          title="Plantillas"
          description="Los diseños que un cliente puede elegir para su sitio."
        />
        {ordering ? null : (
          <Button
            type="button"
            variant="outline"
            disabled={catalog.isPending || catalogItems.length === 0}
            onClick={startOrder}
          >
            Ordenar
          </Button>
        )}
      </div>
      <div className="flex min-w-0 flex-col gap-3">
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Buscar por nombre"
          aria-label="Buscar plantillas"
          className="max-w-md"
        />
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <FilterSelect
            label="Nivel"
            allLabel="Todos los niveles"
            value={search.tier}
            options={TIERS}
            onChange={(tier) => updateSearch({ tier })}
          />
          <FilterSelect
            label="Categoría"
            allLabel="Todas las categorías"
            value={search.category}
            options={categoryOptions}
            onChange={(category) => updateSearch({ category })}
          />
          <FilterSelect
            label="Estado"
            allLabel="Todos los estados"
            value={search.status}
            options={STATUSES}
            onChange={(status) => updateSearch({ status })}
          />
          {tagOptions.length > 0 ? (
            <FilterSelect
              label="Etiqueta"
              allLabel="Todas las etiquetas"
              value={search.tag}
              options={tagOptions}
              onChange={(tag) => updateSearch({ tag })}
            />
          ) : null}
        </div>
      </div>

      {ordering ? (
        <TemplateOrderList
          rows={catalogOrder}
          ids={orderIds}
          pending={reorder.isPending}
          onIdsChange={setOrderIds}
          onCancel={() => setOrdering(false)}
          onSave={() => {
            if (!orderDirty) {
              setOrdering(false);
              return;
            }
            reorder.mutate({ body: { ids: orderIds } });
          }}
        />
      ) : null}

      {ordering ? null : query.isPending ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-72" />
          ))}
        </div>
      ) : null}
      {ordering || !query.isError ? null : (
        <QueryAlert
          error={query.error}
          pending={query.isFetching}
          onRetry={() => void query.refetch()}
        />
      )}

      {ordering || !query.data || query.isError ? null : query.data.items
          .length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Ninguna plantilla coincide con esta búsqueda.
        </p>
      ) : ordering ? null : (
        <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {query.data.items.map((item) => (
            <TemplateCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

function TemplateCard({ item }: { item: AdminTemplateListItemDto }) {
  const usage = item.usage;
  return (
    <Card className="min-w-0 gap-2 pt-0">
      <Link
        to="/plantillas/$id"
        params={{ id: item.id }}
        className="block min-w-0"
      >
        {item.thumbnailUrl ? (
          <img
            src={item.thumbnailUrl}
            alt=""
            loading="lazy"
            className="aspect-[16/10] w-full object-cover"
          />
        ) : (
          <div className="grid aspect-[16/10] w-full place-items-center bg-muted text-sm text-muted-foreground">
            Sin miniatura
          </div>
        )}
        <CardHeader className="pt-4 pb-0">
          <CardTitle className={textLinkClass}>{item.name}</CardTitle>
        </CardHeader>
      </Link>
      <CardContent className="flex flex-col gap-3 pt-0">
        <div className="flex flex-wrap gap-1">
          <StatusBadgeView badge={templateTierBadge(item.tier)} />
          <StatusBadgeView badge={templateStatusBadge(item.status)} />
          {item.featured ? (
            <StatusBadgeView badge={{ label: 'Destacada', tone: 'info' }} />
          ) : null}
        </div>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <Usage label="La usan" value={usage.tenantsUsing} />
          <Usage label="Publicados" value={usage.sitesPublished} />
          <Usage label="De pago" value={usage.payingTenants} />
          <Usage label="En prueba" value={usage.trialTenants} />
        </dl>
      </CardContent>
    </Card>
  );
}

function Usage({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium">{formatCount(value)}</dd>
    </div>
  );
}
