import { createFileRoute } from '@tanstack/react-router';
import { SectionPlaceholder } from '@/components/layout/section-placeholder';
import { SubscriptionListPage } from '@/features/subscriptions/subscription-list-page';
import { validateSubscriptionListSearch } from '@/features/subscriptions/list-search';
import { canAccess } from '@/lib/navigation';

export const Route = createFileRoute('/_admin/suscripciones')({
  validateSearch: validateSubscriptionListSearch,
  component: SuscripcionesPage,
});

function SuscripcionesPage() {
  const { me } = Route.useRouteContext();
  const search = Route.useSearch();
  const allowed = !!me && canAccess(me.role, '/suscripciones');
  if (!allowed) {
    return <SectionPlaceholder title="Suscripciones" allowed={false} />;
  }
  return <SubscriptionListPage search={search} />;
}
