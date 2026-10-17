import {
  adminTemplatesControllerListOptions,
  type AdminTemplateListItemDto,
} from '@lattiz/api-client';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { textLinkClass } from '@/components/external-anchor';
import { FilterSelect } from '@/components/filter-select';
import { PageHeader } from '@/components/layout/page-header';
import { QueryAlert } from '@/components/query-alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCount } from '@/lib/format';
import { StatusBadgeView } from '@/features/tenants/status-badge';
import { templateStatusBadge, templateTierBadge } from './labels';
import {
  templateCategories,
  type TemplateListSearch,
  toTemplateListQuery,
} from './list-search';

const TIERS = [
  { value: 'basic', label: 'Básico' },
  { value: 'pro', label: 'Pro' },
] as const;

const STATUSES = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'active', label: 'Activa' },
] as const;

export function TemplateListPage({ search }: { search: TemplateListSearch }) {
  const navigate = useNavigate({ from: '/plantillas' });
  const [draft, setDraft] = useState(search.q ?? '');
  const queryFilter = toTemplateListQuery(search);
  const query = useQuery({
    ...adminTemplatesControllerListOptions(
      queryFilter ? { query: queryFilter } : undefined,
    ),
    placeholderData: keepPreviousData,
  });
  const catalog = useQuery(adminTemplatesControllerListOptions());

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

  const categories = templateCategories(catalog.data?.items ?? query.data?.items ?? []);
  const categoryOptions = categories.map((category) => ({
    value: category,
    label: category,
  }));
  if (search.category && !categories.includes(search.category)) {
    categoryOptions.unshift({ value: search.category, label: search.category });
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <PageHeader
        title="Plantillas"
        description="Los diseños que un cliente puede elegir para su sitio."
      />
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
        </div>
      </div>

      {query.isPending ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-72" />
          ))}
        </div>
      ) : null}
      {query.isError ? (
        <QueryAlert
          error={query.error}
          pending={query.isFetching}
          onRetry={() => void query.refetch()}
        />
      ) : null}

      {query.data && !query.isError ? (
        query.data.items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Ninguna plantilla coincide con esta búsqueda.
          </p>
        ) : (
          <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {query.data.items.map((item) => (
              <TemplateCard key={item.id} item={item} />
            ))}
          </div>
        )
      ) : null}
    </div>
  );
}

function TemplateCard({ item }: { item: AdminTemplateListItemDto }) {
  const usage = item.usage;
  return (
    <Card className="min-w-0 pt-0">
      <Link to="/plantillas/$id" params={{ id: item.id }} className="block min-w-0">
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
        <CardHeader>
          <CardTitle className={textLinkClass}>{item.name}</CardTitle>
        </CardHeader>
      </Link>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-1">
          <StatusBadgeView badge={templateTierBadge(item.tier)} />
          <StatusBadgeView badge={templateStatusBadge(item.status)} />
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
