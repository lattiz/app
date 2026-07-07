import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { useAuthStore } from '../stores/auth.store';

// Protected layout. The gate in main.tsx guarantees auth status is resolved
// (never 'loading') before any navigation, so this check is deterministic.
export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ location }) => {
    if (useAuthStore.getState().status !== 'authenticated') {
      throw redirect({ to: '/login', search: { redirect: location.href } });
    }
  },
  component: () => <Outlet />,
});
