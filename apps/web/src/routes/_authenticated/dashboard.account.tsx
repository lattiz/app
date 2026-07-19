import { createFileRoute } from '@tanstack/react-router';
import { AccountPage } from '@/features/dashboard/account/AccountPage';

export const Route = createFileRoute('/_authenticated/dashboard/account')({
  component: AccountPage,
});
