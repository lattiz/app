import { createFileRoute } from '@tanstack/react-router';
import { SectionPlaceholder } from '@/components/layout/section-placeholder';
import { DeletePreviewPage } from '@/features/deletions/delete-preview-page';
import { canAccess } from '@/lib/navigation';

export const Route = createFileRoute('/_admin/clientes_/$tenantId_/borrar')({
  component: BorrarClienteRoute,
});

function BorrarClienteRoute() {
  const { me } = Route.useRouteContext();
  const { tenantId } = Route.useParams();
  if (!me || !canAccess(me.role, `/clientes/${tenantId}/borrar`)) {
    return <SectionPlaceholder title="Borrar cliente" allowed={false} />;
  }
  return <DeletePreviewPage tenantId={tenantId} />;
}
