import { createFileRoute } from '@tanstack/react-router';
import { SectionPlaceholder } from '@/components/layout/section-placeholder';
import { canAccess } from '@/lib/navigation';

export const Route = createFileRoute('/_admin/suscripciones')({
  component: SuscripcionesPage,
});

function SuscripcionesPage() {
  const { me } = Route.useRouteContext();

  return (
    <SectionPlaceholder
      title="Suscripciones"
      description="Planes, pagos y cambios de plan."
      allowed={!!me && canAccess(me.role, '/suscripciones')}
    />
  );
}
