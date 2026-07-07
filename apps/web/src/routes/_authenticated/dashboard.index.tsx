import { createFileRoute } from '@tanstack/react-router';
import { DashboardHomePage } from '@/pages/dashboard/DashboardHomePage';

export const Route = createFileRoute('/_authenticated/dashboard/')({
  component: DashboardHomePage,
});
