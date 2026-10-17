import { createFileRoute } from '@tanstack/react-router';
import { SectionPlaceholder } from '@/components/layout/section-placeholder';
import { canAccess } from '@/lib/navigation';

export const Route = createFileRoute('/_admin/pruebas')({
  component: PruebasPage,
});

function PruebasPage() {
  const { me } = Route.useRouteContext();

  return (
    <SectionPlaceholder
      title="Pruebas gratuitas"
      description="Pruebas activas y vencidas."
      allowed={!!me && canAccess(me.role, '/pruebas')}
    />
  );
}
