import { createFileRoute } from '@tanstack/react-router';
import { AnalyticsPage } from '@/features/dashboard/analytics/AnalyticsPage';

export const Route = createFileRoute('/_authenticated/dashboard/analytics')({
  component: AnalyticsPage,
});
