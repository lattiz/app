import type { AdminTemplatesControllerListData } from '@lattiz/api-client';
import { z } from 'zod';

const tierSchema = z.enum(['basic', 'pro']);
const statusSchema = z.enum(['pending', 'active', 'retired']);

export const templateListSearchSchema = z.object({
  q: z.string().trim().max(200).optional().catch(undefined),
  tier: tierSchema.optional().catch(undefined),
  category: z.string().trim().min(1).max(100).optional().catch(undefined),
  status: statusSchema.optional().catch(undefined),
  tag: z.string().trim().min(1).max(24).optional().catch(undefined),
});

export type TemplateListSearch = z.infer<typeof templateListSearchSchema>;

export function validateTemplateListSearch(
  search: Record<string, unknown>,
): TemplateListSearch {
  const parsed = templateListSearchSchema.safeParse(search);
  if (!parsed.success) return {};
  return compactSearch(parsed.data);
}

export function toTemplateListQuery(
  search: TemplateListSearch,
): NonNullable<AdminTemplatesControllerListData['query']> | undefined {
  const query: NonNullable<AdminTemplatesControllerListData['query']> = {};
  if (search.q) query.q = search.q;
  if (search.tier) query.tier = search.tier;
  if (search.category) query.category = search.category;
  if (search.status) query.status = search.status;
  if (search.tag) query.tag = search.tag.toLowerCase();
  return Object.keys(query).length > 0 ? query : undefined;
}

export function templateCategories(
  items: readonly { category: string | null }[],
): string[] {
  const names = new Set<string>();
  for (const item of items) {
    const category = item.category?.trim();
    if (category) names.add(category);
  }
  return [...names].sort((left, right) => left.localeCompare(right, 'es'));
}

export function templateTags(
  items: readonly { tags: readonly string[] }[],
): string[] {
  const names = new Set<string>();
  for (const item of items) {
    for (const tag of item.tags) {
      const trimmed = tag.trim().toLowerCase();
      if (trimmed) names.add(trimmed);
    }
  }
  return [...names].sort((left, right) => left.localeCompare(right, 'es'));
}

function compactSearch(search: TemplateListSearch): TemplateListSearch {
  const next: TemplateListSearch = {};
  if (search.q) next.q = search.q;
  if (search.tier) next.tier = search.tier;
  if (search.category) next.category = search.category;
  if (search.status) next.status = search.status;
  if (search.tag) next.tag = search.tag.toLowerCase();
  return next;
}
