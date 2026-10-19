import { createFileRoute } from '@tanstack/react-router';
import { SectionPlaceholder } from '@/components/layout/section-placeholder';
import { TemplateListPage } from '@/features/templates/template-list-page';
import { validateTemplateListSearch } from '@/features/templates/list-search';
import { canAccess } from '@/lib/navigation';

export const Route = createFileRoute('/_admin/plantillas')({
  validateSearch: validateTemplateListSearch,
  component: PlantillasPage,
});

function PlantillasPage() {
  const { me } = Route.useRouteContext();
  const search = Route.useSearch();
  const allowed = !!me && canAccess(me.role, '/plantillas');
  if (!allowed) {
    return <SectionPlaceholder title="Plantillas" allowed={false} />;
  }
  return <TemplateListPage search={search} />;
}
