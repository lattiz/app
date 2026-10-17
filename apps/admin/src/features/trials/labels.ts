import type { AdminTrialsControllerListData } from '@lattiz/api-client';
import { z } from 'zod';

export const TRIAL_LIST_PAGE_SIZE = 25;

export const TRIAL_STATES = ['active', 'expiring', 'expired', 'converted'] as const;

const stateSchema = z.enum(TRIAL_STATES);

export const trialListSearchSchema = z.object({
  state: stateSchema.optional().catch(undefined),
  page: z.number().int().min(1).max(100_000).optional().catch(undefined),
  pageSize: z.number().int().min(1).max(100).optional().catch(undefined),
});

export type TrialListSearch = z.infer<typeof trialListSearchSchema>;
export type TrialState = (typeof TRIAL_STATES)[number];

export function validateTrialListSearch(search: Record<string, unknown>): TrialListSearch {
  const parsed = trialListSearchSchema.safeParse(search);
  if (!parsed.success) return {};
  return compactSearch(parsed.data);
}

export function toTrialListQuery(
  search: TrialListSearch,
): NonNullable<AdminTrialsControllerListData['query']> {
  return {
    state: search.state ?? 'active',
    page: search.page ?? 1,
    pageSize: search.pageSize ?? TRIAL_LIST_PAGE_SIZE,
  };
}

export function trialStateLabel(state: TrialState): string {
  switch (state) {
    case 'active':
      return 'Activa';
    case 'expiring':
      return 'Por vencer';
    case 'expired':
      return 'Vencida';
    case 'converted':
      return 'Convertida';
  }
}

export function trialDurationText(days: number): string {
  const unit = days === 1 ? 'día' : 'días';
  return `La prueba dura ${days} ${unit} desde la primera publicación.`;
}

export function medianHoursText(hours: number | null): string | null {
  if (hours == null || !Number.isFinite(hours) || hours < 0) return null;
  const rounded = Math.round(hours);
  if (rounded <= 1) return 'La mitad de quienes pagan lo hacen en la primera hora.';
  return `La mitad de quienes pagan lo hacen en las primeras ${rounded} horas.`;
}

export function isTrialState(value: unknown): value is TrialState {
  return TRIAL_STATES.some((state) => state === value);
}

function compactSearch(search: TrialListSearch): TrialListSearch {
  const next: TrialListSearch = {};
  if (search.state && search.state !== 'active') next.state = search.state;
  if (search.page && search.page > 1) next.page = search.page;
  if (search.pageSize && search.pageSize !== TRIAL_LIST_PAGE_SIZE) {
    next.pageSize = search.pageSize;
  }
  return next;
}
