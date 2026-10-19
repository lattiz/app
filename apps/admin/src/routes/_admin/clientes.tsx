import { createFileRoute } from '@tanstack/react-router';
import { SectionPlaceholder } from '@/components/layout/section-placeholder';
import { TenantListPage } from '@/features/tenants/tenant-list-page';
import { validateClientListSearch } from '@/features/tenants/list-search';
import { canAccess } from '@/lib/navigation';

export const Route = createFileRoute('/_admin/clientes')({
  validateSearch: validateClientListSearch,
  component: ClientesPage,
});

function ClientesPage() {
  const { me } = Route.useRouteContext();
  const search = Route.useSearch();
  const allowed = !!me && canAccess(me.role, '/clientes');
  if (!allowed) {
    return <SectionPlaceholder title="Clientes" allowed={false} />;
  }
  return <TenantListPage search={search} />;
}
