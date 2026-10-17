import { createFileRoute } from '@tanstack/react-router';
import { SectionPlaceholder } from '@/components/layout/section-placeholder';
import { canAccess } from '@/lib/navigation';

export const Route = createFileRoute('/_admin/clientes')({
  component: ClientesPage,
});

function ClientesPage() {
  const { me } = Route.useRouteContext();

  return (
    <SectionPlaceholder
      title="Clientes"
      description="Negocios que usan Lattiz."
      allowed={!!me && canAccess(me.role, '/clientes')}
    />
  );
}
