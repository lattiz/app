import { createFileRoute, Outlet } from '@tanstack/react-router';
import { NoTenantState } from '@/components/dashboard/home/NoTenantState';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useDashboardHome } from '@/hooks/use-dashboard-home';

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardLayoutRoute,
});

function DashboardLayoutRoute() {
  // Triggered once here (this layout stays mounted across all /dashboard/*
  // tabs) so state/site/subscription are populated no matter which tab a
  // user lands on first, not only when DashboardHomePage happens to mount.
  const { state } = useDashboardHome();

  return (
    <DashboardLayout>
      {state === 'no-tenant' ? <NoTenantState /> : <Outlet />}
    </DashboardLayout>
  );
}
