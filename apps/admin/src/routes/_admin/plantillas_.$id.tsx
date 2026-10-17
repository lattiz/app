import { createFileRoute } from '@tanstack/react-router';
import { SectionPlaceholder } from '@/components/layout/section-placeholder';
import { TemplateDetailPage } from '@/features/templates/template-detail-page';
import { canAccess } from '@/lib/navigation';

export const Route = createFileRoute('/_admin/plantillas_/$id')({
  component: PlantillaDetailRoute,
});

function PlantillaDetailRoute() {
  const { me } = Route.useRouteContext();
  const { id } = Route.useParams();
  const allowed = !!me && canAccess(me.role, '/plantillas');
  if (!allowed) {
    return <SectionPlaceholder title="Plantilla" allowed={false} />;
  }
  return <TemplateDetailPage id={id} />;
}
