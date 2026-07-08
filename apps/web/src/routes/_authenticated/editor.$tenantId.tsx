import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

// Code-split the editor: the GrapesJS SDK is large and only needed on this route.
const SiteEditor = lazy(() =>
  import('@/features/editor/SiteEditor').then((m) => ({ default: m.SiteEditor })),
);

export const Route = createFileRoute('/_authenticated/editor/$tenantId')({
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
