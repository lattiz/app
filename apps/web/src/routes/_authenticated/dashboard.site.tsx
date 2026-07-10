import { createFileRoute } from '@tanstack/react-router';
import { SitePage } from '@/pages/dashboard/SitePage';

export const Route = createFileRoute('/_authenticated/dashboard/site')({
  component: SitePage,
});
