import { adminTenantsControllerGetOptions } from '@lattiz/api-client';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { ExternalAnchor } from '@/components/external-anchor';
import { PageCrumb } from '@/components/layout/page-crumb';
import { PageHeader } from '@/components/layout/page-header';
import { QueryAlert } from '@/components/query-alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { isAdminNotFound } from '@/lib/admin-errors';
import type { AdminRole } from '@/lib/navigation';
import { DangerZone } from '@/features/deletions/danger-zone';
import {
  AnalyticsPanel,
  BillingPanel,
  EmailsPanel,
  StoragePanel,
  SummaryPanel,
  TemplateHistoryPanel,
} from './detail-panels';
import { DomainPanel } from './domain-panel';
import { planBadge, subscriptionBadge, tenantStatusBadge } from './labels';
import { StatusBadgeView } from './status-badge';
import { NotesPanel, TenantHeaderActions } from './tenant-actions';
import { tenantActionSet } from './actions';

const TABS = [
  { id: 'resumen', label: 'Resumen' },
  { id: 'dominio', label: 'Dominio' },
  { id: 'cobros', label: 'Cobros' },
  { id: 'analiticas', label: 'Analíticas' },
  { id: 'almacenamiento', label: 'Almacenamiento' },
  { id: 'correos', label: 'Correos' },
  { id: 'notas', label: 'Notas' },
  { id: 'historial', label: 'Historial de plantillas' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export function TenantDetailPage({
  tenantId,
  role,
}: {
  tenantId: string;
  role: AdminRole;
}) {
  const [tab, setTab] = useState<TabId>('resumen');
  const query = useQuery(
    adminTenantsControllerGetOptions({ path: { id: tenantId } }),
  );

  if (query.isPending) {
    return (
      <div className="flex w-full min-w-0 flex-col gap-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="flex w-full min-w-0 flex-col gap-4">
        <BackLink />
        {isAdminNotFound(query.error) ? (
          <PageHeader
            title="Cliente"
            description="No encontramos este cliente."
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
  const { overview, site } = detail;
  const publicHref = site.customDomainUrl ?? site.previewUrl;
  const suspended = overview.status === 'inactive';
  const payment = overview.subscriptionId
    ? subscriptionBadge(overview.subscriptionStatus)
    : suspended
      ? null
      : tenantStatusBadge(overview.status);
  const actions = tenantActionSet(role, overview.status);
  const tabs = actions.notes
    ? TABS
    : TABS.filter((item) => item.id !== 'notas');

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <PageCrumb label={overview.name} />
      <BackLink />
      <div className="flex min-w-0 flex-col gap-3">
        <PageHeader title={overview.name} description={overview.slug} />
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadgeView badge={planBadge(overview.plan)} />
          {payment ? <StatusBadgeView badge={payment} /> : null}
          {suspended ? (
            <StatusBadgeView badge={{ label: 'Suspendido', tone: 'warn' }} />
          ) : null}
          {overview.isInternal ? (
            <Badge variant="outline">Interno</Badge>
          ) : null}
          <ExternalAnchor href={publicHref}>Ver sitio público</ExternalAnchor>
        </div>
        <TenantHeaderActions
          tenantId={tenantId}
          role={role}
          status={overview.status}
        />
      </div>
      <Tabs
        value={tab}
        onValueChange={(value) => {
          if (isTab(value)) setTab(value);
        }}
      >
        <div className="max-w-full overflow-x-auto">
          <TabsList className="w-max">
            {tabs.map((item) => (
              <TabsTrigger key={item.id} value={item.id}>
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <TabsContent value="resumen">
          <div className="flex flex-col gap-6">
            <SummaryPanel detail={detail} />
            {role === 'owner' ? <DangerZone tenantId={tenantId} /> : null}
          </div>
        </TabsContent>
        <TabsContent value="dominio">
          {tab === 'dominio' ? (
            <DomainPanel tenantId={tenantId} domainName={overview.domain} />
          ) : null}
        </TabsContent>
        <TabsContent value="cobros">
          <BillingPanel subscriptions={detail.subscriptions} />
        </TabsContent>
        <TabsContent value="analiticas">
          <AnalyticsPanel analytics={detail.analytics} plan={overview.plan} />
        </TabsContent>
        <TabsContent value="almacenamiento">
          <StoragePanel
            tenantId={tenantId}
            storage={detail.storage}
            previewState={detail.previewState}
          />
        </TabsContent>
        <TabsContent value="correos">
          <EmailsPanel emails={detail.emails} />
        </TabsContent>
        <TabsContent value="notas">
          <NotesPanel tenantId={tenantId} flags={detail.flags} />
        </TabsContent>
        <TabsContent value="historial">
          <TemplateHistoryPanel history={detail.templateHistory} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      to="/clientes"
      className="text-sm text-muted-foreground hover:text-foreground"
    >
      Clientes
    </Link>
  );
}

function isTab(value: string | number | null | undefined): value is TabId {
  return TABS.some((item) => item.id === value);
}
