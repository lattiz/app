import { useEffect } from 'react';
import {
  createFileRoute,
  Outlet,
  useNavigate,
  useRouterState,
} from '@tanstack/react-router';
import { NoTenantState } from '@/components/dashboard/home/NoTenantState';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useDashboardHome } from '@/hooks/use-dashboard-home';

// Reachable without an entitlement: home (which renders the "Acceso restringido"
// gate), and the two pages a lapsed tenant needs to resubscribe or leave.
const UNGATED_ROUTES = new Set([
  '/dashboard',
  '/dashboard/subscription',
  '/dashboard/account',
]);

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardLayoutRoute,
});

function DashboardLayoutRoute() {
  // Triggered once here (this layout stays mounted across all /dashboard/*
  // tabs) so state/site/subscription are populated no matter which tab a
  // user lands on first, not only when DashboardHomePage happens to mount.
  const { state } = useDashboardHome();
  const navigate = useNavigate();
  const pathname = useRouterState({
    select: (s) => s.location.pathname.replace(/\/+$/, '') || '/dashboard',
  });

  // Centralized here so no individual page can forget the check. `state` is
  // 'loading' until /tenants/me settles, so this never fires prematurely.
  const isBlocked = state === 'no-subscription' && !UNGATED_ROUTES.has(pathname);

  useEffect(() => {
    if (isBlocked) void navigate({ to: '/dashboard', replace: true });
  }, [isBlocked, navigate]);

  return (
    <DashboardLayout>
      {state === 'no-tenant' ? <NoTenantState /> : isBlocked ? null : <Outlet />}
    </DashboardLayout>
  );
}
