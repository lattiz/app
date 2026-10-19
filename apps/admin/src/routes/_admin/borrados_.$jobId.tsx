import { createFileRoute } from '@tanstack/react-router';
import { SectionPlaceholder } from '@/components/layout/section-placeholder';
import { DeletionJobPage } from '@/features/deletions/deletion-job-page';
import { canAccess } from '@/lib/navigation';

export const Route = createFileRoute('/_admin/borrados_/$jobId')({
  component: BorradoRoute,
});

function BorradoRoute() {
  const { me } = Route.useRouteContext();
  const { jobId } = Route.useParams();
  if (!me || !canAccess(me.role, `/borrados/${jobId}`)) {
    return <SectionPlaceholder title="Borrado" allowed={false} />;
  }
  return <DeletionJobPage jobId={jobId} />;
}
