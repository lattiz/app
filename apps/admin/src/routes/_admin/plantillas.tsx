import { createFileRoute } from '@tanstack/react-router';
import { SectionPlaceholder } from '@/components/layout/section-placeholder';
import { canAccess } from '@/lib/navigation';

export const Route = createFileRoute('/_admin/plantillas')({
  component: PlantillasPage,
});

function PlantillasPage() {
  const { me } = Route.useRouteContext();

  return (
    <SectionPlaceholder
      title="Plantillas"
      description="Plantillas publicadas y en borrador."
      allowed={!!me && canAccess(me.role, '/plantillas')}
    />
  );
}
