import { createFileRoute, redirect } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';
import { tenantsControllerMeOptions } from '@lattiz/api-client';

// Code-split the editor: the GrapesJS SDK is large and only needed on this route.
const SiteEditor = lazy(() =>
  import('@/features/editor/SiteEditor').then((m) => ({ default: m.SiteEditor })),
);

export const Route = createFileRoute('/_authenticated/editor/$tenantId')({
  // The editor lives outside the /dashboard layout, so it needs its own gate —
  // otherwise a lapsed tenant loads the whole SDK only to have every save 403.
  beforeLoad: async ({ context }) => {
    const tenant = await context.queryClient
      .ensureQueryData(tenantsControllerMeOptions())
      .catch(() => null);
    // Lapsed tenants have no preview. Trial and expired-trial tenants edit here.
    if (tenant?.previewState === 'lapsed') throw redirect({ to: '/dashboard' });
    // A template above the plan can't be edited (A2); the gallery shows the banner and the way out.
    if (tenant?.templateAccess?.locked) throw redirect({ to: '/dashboard/templates' });
  },
  component: EditorPage,
});

function EditorPage() {
  const { tenantId } = Route.useParams();
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
          Cargando editor…
        </div>
      }
    >
      <SiteEditor tenantId={tenantId} />
    </Suspense>
  );
}
