import { createFileRoute } from '@tanstack/react-router';
import { SectionPlaceholder } from '@/components/layout/section-placeholder';
import { canAccess } from '@/lib/navigation';

export const Route = createFileRoute('/_admin/auditoria')({
  component: AuditoriaPage,
});

function AuditoriaPage() {
  const { me } = Route.useRouteContext();

  return (
    <SectionPlaceholder
      title="Auditoría"
      description="Quién hizo qué y cuándo."
      allowed={!!me && canAccess(me.role, '/auditoria')}
    />
  );
}
