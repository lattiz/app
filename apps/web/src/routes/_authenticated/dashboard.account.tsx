import { createFileRoute } from '@tanstack/react-router';
import { PlaceholderPage } from '@/pages/dashboard/PlaceholderPage';

export const Route = createFileRoute('/_authenticated/dashboard/account')({
  component: PlaceholderPage,
});
