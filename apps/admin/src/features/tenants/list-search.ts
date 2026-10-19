import type { AdminTenantsControllerListData } from '@lattiz/api-client';
import { z } from 'zod';

export const CLIENT_LIST_PAGE_SIZE = 25;
export const DOMAIN_EXPIRING_SOON_DAYS = 30;

const planSchema = z.enum(['none', 'basico', 'pro', 'trial']);
const statusSchema = z.enum(['active', 'inactive', 'cancelled']);
const sortSchema = z.enum(['created_at', 'last_sign_in_at', 'domain_expires_at']);
const orderSchema = z.enum(['asc', 'desc']);

export const clientListSearchSchema = z.object({
  q: z.string().trim().max(200).optional().catch(undefined),
  plan: planSchema.optional().catch(undefined),
  status: statusSchema.optional().catch(undefined),
  domainSoon: z.boolean().optional().catch(undefined),
  renewalOverdue: z.boolean().optional().catch(undefined),
  dnsIssue: z.boolean().optional().catch(undefined),
  internal: z.boolean().optional().catch(undefined),
  sort: sortSchema.optional().catch(undefined),
  order: orderSchema.optional().catch(undefined),
  page: z.number().int().min(1).max(100_000).optional().catch(undefined),
  pageSize: z.number().int().min(1).max(100).optional().catch(undefined),
});

export type ClientListSearch = z.infer<typeof clientListSearchSchema>;

export function validateClientListSearch(search: Record<string, unknown>): ClientListSearch {
  const parsed = clientListSearchSchema.safeParse(search);
  if (!parsed.success) return {};
  return compactSearch(parsed.data);
}

export function toTenantListQuery(
  search: ClientListSearch,
): NonNullable<AdminTenantsControllerListData['query']> {
  const query: NonNullable<AdminTenantsControllerListData['query']> = {
    page: search.page ?? 1,
    pageSize: search.pageSize ?? CLIENT_LIST_PAGE_SIZE,
  };
  if (search.q) query.q = search.q;
  if (search.plan) query.plan = search.plan;
  if (search.status) query.status = search.status;
  if (search.domainSoon) query.domainExpiringDays = DOMAIN_EXPIRING_SOON_DAYS;
  if (search.renewalOverdue) query.renewalOverdue = true;
  if (search.dnsIssue) query.dnsIssue = true;
  if (search.internal) query.internal = true;
  if (search.sort) query.sort = search.sort;
  if (search.order) query.order = search.order;
  return query;
}

function compactSearch(search: ClientListSearch): ClientListSearch {
  const next: ClientListSearch = {};
  if (search.q) next.q = search.q;
  if (search.plan) next.plan = search.plan;
  if (search.status) next.status = search.status;
  if (search.domainSoon) next.domainSoon = true;
  if (search.renewalOverdue) next.renewalOverdue = true;
  if (search.dnsIssue) next.dnsIssue = true;
  if (search.internal) next.internal = true;
  if (search.sort) next.sort = search.sort;
  if (search.order) next.order = search.order;
  if (search.page && search.page > 1) next.page = search.page;
  if (search.pageSize && search.pageSize !== CLIENT_LIST_PAGE_SIZE) {
    next.pageSize = search.pageSize;
  }
  return next;
}
