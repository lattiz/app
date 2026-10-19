import { createFileRoute } from '@tanstack/react-router';
import { SectionPlaceholder } from '@/components/layout/section-placeholder';
import { DeletionListPage } from '@/features/deletions/deletion-list-page';
import { validateDeletionListSearch } from '@/features/deletions/list-search';
import { canAccess } from '@/lib/navigation';

export const Route = createFileRoute('/_admin/borrados')({
  validateSearch: validateDeletionListSearch,
  component: BorradosRoute,
});

function BorradosRoute() {
  const { me } = Route.useRouteContext();
  const search = Route.useSearch();
  if (!me || !canAccess(me.role, '/borrados')) {
    return <SectionPlaceholder title="Borrados" allowed={false} />;
  }
  return <DeletionListPage search={search} />;
}
