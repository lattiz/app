import { createFileRoute } from '@tanstack/react-router';
import { SectionPlaceholder } from '@/components/layout/section-placeholder';
import { MembersPage } from '@/features/members/members-page';
import { canAccess } from '@/lib/navigation';

export const Route = createFileRoute('/_admin/equipo')({
  component: EquipoPage,
});

function EquipoPage() {
  const { me } = Route.useRouteContext();
  if (!me || !canAccess(me.role, '/equipo')) {
    return <SectionPlaceholder title="Equipo" allowed={false} />;
  }
  return <MembersPage currentUserId={me.userId} />;
}
