import { createFileRoute } from '@tanstack/react-router';
import { SectionPlaceholder } from '@/components/layout/section-placeholder';
import { TrialsPage } from '@/features/trials/trials-page';
import { validateTrialListSearch } from '@/features/trials/labels';
import { canAccess } from '@/lib/navigation';

export const Route = createFileRoute('/_admin/pruebas')({
  validateSearch: validateTrialListSearch,
  component: PruebasPage,
});

function PruebasPage() {
  const { me } = Route.useRouteContext();
  const search = Route.useSearch();
  const allowed = !!me && canAccess(me.role, '/pruebas');
  if (!allowed) {
    return <SectionPlaceholder title="Pruebas gratuitas" allowed={false} />;
  }
  return <TrialsPage search={search} />;
}
