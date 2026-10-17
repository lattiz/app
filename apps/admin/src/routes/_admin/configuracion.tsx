import { createFileRoute } from '@tanstack/react-router';
import { SectionPlaceholder } from '@/components/layout/section-placeholder';
import { canAccess } from '@/lib/navigation';

export const Route = createFileRoute('/_admin/configuracion')({
  component: ConfiguracionPage,
});

function ConfiguracionPage() {
  const { me } = Route.useRouteContext();

  return (
    <SectionPlaceholder
      title="Configuración"
      description="Ajustes internos del panel."
      allowed={!!me && canAccess(me.role, '/configuracion')}
    />
  );
}
