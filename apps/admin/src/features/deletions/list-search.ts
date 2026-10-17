import type { AdminDeletionsControllerListData } from '@lattiz/api-client';
import { z } from 'zod';

export const DELETION_PAGE_SIZE = 25;

export const DELETION_STATUSES = [
  'pending',
  'running',
  'completed',
  'completed_manual',
  'failed',
] as const;

const statusSchema = z.enum(DELETION_STATUSES);

export const deletionListSearchSchema = z.object({
  status: statusSchema.optional().catch(undefined),
  page: z.number().int().min(1).max(100_000).optional().catch(undefined),
});

export type DeletionListSearch = z.infer<typeof deletionListSearchSchema>;
export type DeletionStatusFilter = (typeof DELETION_STATUSES)[number];

export function validateDeletionListSearch(
  search: Record<string, unknown>,
): DeletionListSearch {
  const parsed = deletionListSearchSchema.safeParse(search);
  if (!parsed.success) return {};
  const next: DeletionListSearch = {};
  if (parsed.data.status) next.status = parsed.data.status;
  if (parsed.data.page && parsed.data.page > 1) next.page = parsed.data.page;
  return next;
}

export function toDeletionListQuery(
  search: DeletionListSearch,
): NonNullable<AdminDeletionsControllerListData['query']> {
  const query: NonNullable<AdminDeletionsControllerListData['query']> = {
    page: search.page ?? 1,
    pageSize: DELETION_PAGE_SIZE,
  };
  if (search.status) query.status = search.status;
  return query;
}
