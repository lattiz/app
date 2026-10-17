import { sql, type SQL } from 'drizzle-orm';
import {
  ADMIN_TRIAL_STATES,
  EXPIRING_WITHIN_HOURS,
  type AdminTrialState,
} from './admin-trials.classify';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;
const MAX_PAGE = 100_000;

export interface TrialListQuery {
  state?: AdminTrialState;
  page?: number;
  pageSize?: number;
}

export interface TrialListStatements {
  items: SQL;
  count: SQL;
  page: number;
  pageSize: number;
}

const TRIAL_COLUMNS = sql`
  o.tenant_id,
  o.slug,
  o.name,
  o.email,
  o.plan,
  o.entitled,
  o.preview_started_at,
  o.template_id,
  tpl.name AS template_name,
  converted.converted_at
`;

export function trialListStatements(
  query: TrialListQuery,
  trialDays: number,
): TrialListStatements {
  const where = trialWhere(query.state, trialDays);
  const page = trialPage(query);
  return {
    page: page.page,
    pageSize: page.pageSize,
    count: sql`
      SELECT count(*)::int AS total
      ${trialFrom()}
      WHERE ${where}
    `,
    items: sql`
      SELECT ${TRIAL_COLUMNS}
      ${trialFrom()}
      WHERE ${where}
      ORDER BY o.preview_started_at DESC, o.tenant_id ASC
      LIMIT ${page.pageSize}::int
      OFFSET ${page.offset}::int
    `,
  };
}

export function trialPopulationStatement(): SQL {
  return sql`
    SELECT ${TRIAL_COLUMNS}
    ${trialFrom()}
    WHERE o.preview_started_at IS NOT NULL
      AND o.is_internal = false
  `;
}

function trialFrom(): SQL {
  return sql`
    FROM admin.tenant_overview o
    LEFT JOIN public.templates tpl ON tpl.id = o.template_id
    LEFT JOIN LATERAL (
      SELECT min(s.created_at) AS converted_at
      FROM public.subscriptions s
      WHERE s.tenant_id = o.tenant_id
        AND s.created_at > o.preview_started_at
    ) converted ON true
  `;
}

/**
 * Same window as `classifyTrial`: plan `none`, not entitled, and
 * `now < preview_started_at + trialDays` (24h days). Converted rows are
 * those with a subscription created after the preview started.
 */
export function trialWhere(
  state: AdminTrialState | undefined,
  trialDays: number,
): SQL {
  const parts: SQL[] = [
    sql`o.preview_started_at IS NOT NULL`,
    sql`o.is_internal = false`,
  ];
  if (state && isOneOf(state, ADMIN_TRIAL_STATES)) {
    parts.push(trialStatePredicate(state, trialDays));
  }
  return sql.join(parts, sql` AND `);
}

function trialStatePredicate(state: AdminTrialState, trialDays: number): SQL {
  if (state === 'converted') {
    return sql`converted.converted_at IS NOT NULL`;
  }
  const notConverted = sql`converted.converted_at IS NULL`;
  if (state === 'expiring') {
    return sql`${notConverted} AND ${trialExpiring(trialDays)}`;
  }
  if (state === 'active') {
    return sql`${notConverted} AND ${trialActive(trialDays)}`;
  }
  return sql`${notConverted} AND NOT ${trialOpen(trialDays)}`;
}

function trialOpen(trialDays: number): SQL {
  return sql`(
    o.plan = 'none'
    AND o.entitled IS NOT TRUE
    AND now() < o.preview_started_at + make_interval(days => ${trialDays}::int)
  )`;
}

function trialExpiring(trialDays: number): SQL {
  return sql`(
    ${trialOpen(trialDays)}
    AND o.preview_started_at + make_interval(days => ${trialDays}::int)
      < now() + make_interval(hours => ${EXPIRING_WITHIN_HOURS}::int)
  )`;
}

function trialActive(trialDays: number): SQL {
  return sql`(
    ${trialOpen(trialDays)}
    AND o.preview_started_at + make_interval(days => ${trialDays}::int)
      >= now() + make_interval(hours => ${EXPIRING_WITHIN_HOURS}::int)
  )`;
}

function trialPage(query: TrialListQuery): {
  page: number;
  pageSize: number;
  offset: number;
} {
  const page = clampInt(query.page, DEFAULT_PAGE, 1, MAX_PAGE);
  const pageSize = clampInt(
    query.pageSize,
    DEFAULT_PAGE_SIZE,
    1,
    MAX_PAGE_SIZE,
  );
  return { page, pageSize, offset: (page - 1) * pageSize };
}

function clampInt(
  value: number | undefined,
  fallback: number,
  min: number,
  max: number,
): number {
  if (value === undefined || !Number.isInteger(value)) return fallback;
  return Math.min(Math.max(value, min), max);
}

function isOneOf<T extends string>(
  value: string,
  allowed: readonly T[],
): value is T {
  return (allowed as readonly string[]).includes(value);
}
