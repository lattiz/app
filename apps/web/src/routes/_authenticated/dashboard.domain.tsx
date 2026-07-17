import { createFileRoute } from '@tanstack/react-router';
import { DomainPage } from '@/features/dashboard/domain/DomainPage';

export const Route = createFileRoute('/_authenticated/dashboard/domain')({
  component: DomainPage,
});
