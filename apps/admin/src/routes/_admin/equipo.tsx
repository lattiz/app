import { createFileRoute } from '@tanstack/react-router';
import { SectionPlaceholder } from '@/components/layout/section-placeholder';
import { canAccess } from '@/lib/navigation';

export const Route = createFileRoute('/_admin/equipo')({
  component: EquipoPage,
});

function EquipoPage() {
  const { me } = Route.useRouteContext();

  return (
    <SectionPlaceholder
      title="Equipo"
      description="Miembros del panel y sus roles."
      allowed={!!me && canAccess(me.role, '/equipo')}
    />
  );
}
