import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { DomainPage } from '@/features/dashboard/domain/DomainPage';

export const Route = createFileRoute('/_authenticated/dashboard/domain')({
  validateSearch: z.object({
    renewal: z.enum(['success', 'canceled']).optional(),
  }),
  component: DomainPage,
});
