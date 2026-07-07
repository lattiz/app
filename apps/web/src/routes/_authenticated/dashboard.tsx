import { createFileRoute, Outlet } from '@tanstack/react-router';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardLayoutRoute,
});

function DashboardLayoutRoute() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}
