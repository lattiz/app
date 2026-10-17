import type { AdminAuditControllerListData } from '@lattiz/api-client';
import { z } from 'zod';

export const AUDIT_PAGE_SIZE = 25;

export const AUDIT_ACTION_FILTERS = [
  { value: 'template.', label: 'Plantillas' },
  { value: 'tenant.', label: 'Clientes' },
  { value: 'subscription.', label: 'Suscripciones' },
  { value: 'settings.', label: 'Configuración' },
  { value: 'member.', label: 'Equipo' },
] as const;

export type AuditActionPrefix = (typeof AUDIT_ACTION_FILTERS)[number]['value'];

const ACTION_PREFIXES = AUDIT_ACTION_FILTERS.map((item) => item.value) as [
  AuditActionPrefix,
  ...AuditActionPrefix[],
];

const daySchema = z
  .string()
  .refine(isRealDay, 'fecha')
  .optional()
  .catch(undefined);

export const auditListSearchSchema = z.object({
  actor: z.string().trim().max(320).optional().catch(undefined),
  action: z.enum(ACTION_PREFIXES).optional().catch(undefined),
  target: z.string().trim().max(200).optional().catch(undefined),
  from: daySchema,
  to: daySchema,
  page: z.number().int().min(1).max(100_000).optional().catch(undefined),
});

export type AuditListSearch = z.infer<typeof auditListSearchSchema>;

export function validateAuditListSearch(search: Record<string, unknown>): AuditListSearch {
  const parsed = auditListSearchSchema.safeParse(search);
  if (!parsed.success) return {};
  return compactSearch(parsed.data);
}

export function toAuditListQuery(
  search: AuditListSearch,
): NonNullable<AdminAuditControllerListData['query']> {
  const query: NonNullable<AdminAuditControllerListData['query']> = {
    page: search.page ?? 1,
    pageSize: AUDIT_PAGE_SIZE,
  };
  if (search.actor) query.actor = search.actor;
  if (search.action) query.action = search.action;
  if (search.target) query.targetId = search.target;
  if (search.from) query.from = mexicoDayStart(search.from);
  if (search.to) query.to = mexicoDayEnd(search.to);
  return query;
}

function compactSearch(search: AuditListSearch): AuditListSearch {
  const next: AuditListSearch = {};
  if (search.actor) next.actor = search.actor;
  if (search.action) next.action = search.action;
  if (search.target) next.target = search.target;
  if (search.from) next.from = search.from;
  if (search.to) next.to = search.to;
  if (search.page && search.page > 1) next.page = search.page;
  return next;
}

function isRealDay(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

// Ciudad de México es UTC−6 todo el año; el filtro cubre el día completo.
function mexicoDayStart(day: string): string {
  return `${day}T00:00:00-06:00`;
}

function mexicoDayEnd(day: string): string {
  return `${day}T23:59:59-06:00`;
}
