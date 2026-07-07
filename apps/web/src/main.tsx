import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Spinner } from '@/components/ui/spinner';
import { configureApiClient } from './lib/api';
import { queryClient, router } from './router';
import { useAuthStore } from './stores/auth.store';
import './index.css';

// Point the generated API client at the backend before anything renders.
configureApiClient();

// Resolve the session once, then keep the router's auth guards in sync.
useAuthStore.getState().initialize();
useAuthStore.subscribe(() => void router.invalidate());

/** Holds routing until the initial session check resolves, so guards never see 'loading'. */
function RootGate() {
  const status = useAuthStore((s) => s.status);

  if (status === 'loading') {
    return (
      <div className="grid min-h-svh place-items-center">
        <Spinner className="size-6" />
      </div>
    );
  }

  return <RouterProvider router={router} />;
}

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root element');

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RootGate />
    </QueryClientProvider>
  </StrictMode>,
);
