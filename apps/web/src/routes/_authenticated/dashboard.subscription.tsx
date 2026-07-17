import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { SubscriptionPage } from '@/features/dashboard/subscription/SubscriptionPage';

export const Route = createFileRoute('/_authenticated/dashboard/subscription')({
  // Stripe redirects back with ?success=true / ?canceled=true (+ session_id).
  validateSearch: z.object({
    success: z.boolean().optional(),
    canceled: z.boolean().optional(),
    session_id: z.string().optional(),
  }),
  component: SubscriptionPage,
});
