import { createFileRoute } from '@tanstack/react-router';
import { SectionPlaceholder } from '@/components/layout/section-placeholder';
import { AuditPage } from '@/features/audit/audit-page';
import { validateAuditListSearch } from '@/features/audit/list-search';
import { canAccess } from '@/lib/navigation';

export const Route = createFileRoute('/_admin/auditoria')({
  validateSearch: validateAuditListSearch,
  component: AuditoriaPage,
});

function AuditoriaPage() {
  const { me } = Route.useRouteContext();
  const search = Route.useSearch();
  if (!me || !canAccess(me.role, '/auditoria')) {
    return <SectionPlaceholder title="Auditoría" allowed={false} />;
  }
  return <AuditPage search={search} />;
}
