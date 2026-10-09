import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { SubscriptionPage } from '@/features/dashboard/subscription/SubscriptionPage';

export const Route = createFileRoute('/_authenticated/dashboard/subscription')({
  // Stripe redirects back with ?success=true / ?canceled=true (+ session_id),
  // or ?plan_change=done|canceled from the plan-change portal flow.
  validateSearch: z.object({
    success: z.boolean().optional(),
    canceled: z.boolean().optional(),
    session_id: z.string().optional(),
    plan_change: z.enum(['done', 'canceled']).optional(),
    from: z.enum(['domain']).optional(),
  }),
  component: SubscriptionPage,
});
