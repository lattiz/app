import { createFileRoute } from '@tanstack/react-router';
import { SectionPlaceholder } from '@/components/layout/section-placeholder';
import { SubscriptionDetailPage } from '@/features/subscriptions/subscription-detail-page';
import { canAccess } from '@/lib/navigation';

export const Route = createFileRoute('/_admin/suscripciones_/$id')({
  component: SuscripcionDetailRoute,
});

function SuscripcionDetailRoute() {
  const { me } = Route.useRouteContext();
  const { id } = Route.useParams();
  if (!me || !canAccess(me.role, '/suscripciones')) {
    return <SectionPlaceholder title="Suscripción" allowed={false} />;
  }
  return <SubscriptionDetailPage id={id} role={me.role} />;
}
