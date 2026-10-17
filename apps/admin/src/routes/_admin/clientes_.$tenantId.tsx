import { createFileRoute } from '@tanstack/react-router';
import { SectionPlaceholder } from '@/components/layout/section-placeholder';
import { TenantDetailPage } from '@/features/tenants/tenant-detail-page';
import { canAccess } from '@/lib/navigation';

export const Route = createFileRoute('/_admin/clientes_/$tenantId')({
  component: ClienteDetailRoute,
});

function ClienteDetailRoute() {
  const { me } = Route.useRouteContext();
  const { tenantId } = Route.useParams();
  if (!me || !canAccess(me.role, '/clientes')) {
    return <SectionPlaceholder title="Cliente" allowed={false} />;
  }
  return <TenantDetailPage tenantId={tenantId} role={me.role} />;
}
