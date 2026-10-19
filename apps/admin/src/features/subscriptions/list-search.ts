import type { AdminSubscriptionsControllerListData } from '@lattiz/api-client';
import { z } from 'zod';

export const SUBSCRIPTION_LIST_PAGE_SIZE = 25;

export const SUBSCRIPTION_STATUSES = [
  'active',
  'trialing',
  'past_due',
  'canceled',
  'incomplete',
  'incomplete_expired',
  'unpaid',
  'paused',
] as const;

const planSchema = z.enum(['basico', 'pro']);
const periodSchema = z.enum(['monthly', 'annual']);
const statusSchema = z.enum(SUBSCRIPTION_STATUSES);

export const subscriptionListSearchSchema = z.object({
  q: z.string().trim().max(200).optional().catch(undefined),
  status: statusSchema.optional().catch(undefined),
  plan: planSchema.optional().catch(undefined),
  period: periodSchema.optional().catch(undefined),
  cancelScheduled: z.boolean().optional().catch(undefined),
  paymentIssues: z.boolean().optional().catch(undefined),
  internal: z.boolean().optional().catch(undefined),
  page: z.number().int().min(1).max(100_000).optional().catch(undefined),
  pageSize: z.number().int().min(1).max(100).optional().catch(undefined),
});

export type SubscriptionListSearch = z.infer<typeof subscriptionListSearchSchema>;
export type SubscriptionStatusFilter = (typeof SUBSCRIPTION_STATUSES)[number];

export function validateSubscriptionListSearch(
  search: Record<string, unknown>,
): SubscriptionListSearch {
  const parsed = subscriptionListSearchSchema.safeParse(search);
  if (!parsed.success) return {};
  return compactSearch(parsed.data);
}

export function toSubscriptionListQuery(
  search: SubscriptionListSearch,
): NonNullable<AdminSubscriptionsControllerListData['query']> {
  const query: NonNullable<AdminSubscriptionsControllerListData['query']> = {
    page: search.page ?? 1,
    pageSize: search.pageSize ?? SUBSCRIPTION_LIST_PAGE_SIZE,
  };
  if (search.q) query.q = search.q;
  if (search.status) query.status = [search.status];
  if (search.plan) query.plan = search.plan;
  if (search.period) query.period = search.period;
  if (search.cancelScheduled) query.cancelScheduled = true;
  if (search.paymentIssues) query.paymentIssues = true;
  if (search.internal) query.internal = true;
  return query;
}

function compactSearch(search: SubscriptionListSearch): SubscriptionListSearch {
  const next: SubscriptionListSearch = {};
  if (search.q) next.q = search.q;
  if (search.status) next.status = search.status;
  if (search.plan) next.plan = search.plan;
  if (search.period) next.period = search.period;
  if (search.cancelScheduled) next.cancelScheduled = true;
  if (search.paymentIssues) next.paymentIssues = true;
  if (search.internal) next.internal = true;
  if (search.page && search.page > 1) next.page = search.page;
  if (search.pageSize && search.pageSize !== SUBSCRIPTION_LIST_PAGE_SIZE) {
    next.pageSize = search.pageSize;
  }
  return next;
}
