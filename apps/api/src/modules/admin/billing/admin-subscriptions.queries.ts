import { sql, type SQL } from 'drizzle-orm';
import {
  BILLING_PERIODS,
  SUBSCRIPTION_PLANS,
  SUBSCRIPTION_STATUSES,
  type BillingPeriod,
  type SubscriptionPlan,
  type SubscriptionStatus,
} from './admin-subscriptions.dto';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;
const MAX_PAGE = 100_000;

const OVERVIEW_COLUMNS = sql`
  s.id,
  s.tenant_id,
  s.stripe_subscription_id,
  s.plan,
  s.billing_period,
  s.status,
  s.current_period_end,
  s.cancel_at_period_end,
  s.cancel_at,
  s.payment_attempts,
  s.created_at,
  s.canceled_at,
  s.tenant_slug,
  s.tenant_name,
  s.email
`;

export interface SubscriptionListQuery {
  q?: string;
  status?: SubscriptionStatus[];
  plan?: SubscriptionPlan;
  period?: BillingPeriod;
  cancelScheduled?: boolean;
  paymentIssues?: boolean;
  internal?: boolean;
  page?: number;
  pageSize?: number;
}

export interface SubscriptionListStatements {
  items: SQL;
  count: SQL;
  page: number;
  pageSize: number;
}

export function subscriptionListStatements(
  query: SubscriptionListQuery,
): SubscriptionListStatements {
  const where = subscriptionListWhere(query);
  const page = subscriptionListPage(query);
  return {
    page: page.page,
    pageSize: page.pageSize,
    count: sql`
      SELECT count(*)::int AS total
      FROM admin.subscription_overview s
      WHERE ${where}
    `,
    items: sql`
      SELECT ${OVERVIEW_COLUMNS}
      FROM admin.subscription_overview s
      WHERE ${where}
      ORDER BY s.created_at DESC, s.id ASC
      LIMIT ${page.pageSize}::int
      OFFSET ${page.offset}::int
    `,
  };
}

export function subscriptionOverviewStatement(id: string): SQL {
  return sql`
    SELECT ${OVERVIEW_COLUMNS}
    FROM admin.subscription_overview s
    WHERE s.id = ${id}::uuid
  `;
}

/**
 * Internal tenants are hidden unless `internal` is true, which drops the
 * predicate (they are included with everyone else).
 */
function subscriptionListWhere(query: SubscriptionListQuery): SQL {
  const parts: SQL[] = [];
  if (query.internal !== true) {
    parts.push(sql`s.is_internal = false`);
  }

  const q = query.q?.trim();
  if (q) {
    const pattern = containsPattern(q.slice(0, 200));
    parts.push(sql`(
      s.email ILIKE ${pattern}
      OR s.tenant_slug ILIKE ${pattern}
      OR s.tenant_name ILIKE ${pattern}
    )`);
  }

  const statuses = (query.status ?? []).filter((status) =>
    isOneOf(status, SUBSCRIPTION_STATUSES),
  );
  if (statuses.length > 0) {
    parts.push(
      sql`s.status IN (${sql.join(
        statuses.map((status) => sql`${status}`),
        sql`, `,
      )})`,
    );
  }

  if (query.plan && isOneOf(query.plan, SUBSCRIPTION_PLANS)) {
    parts.push(sql`s.plan = ${query.plan}`);
  }
  if (query.period && isOneOf(query.period, BILLING_PERIODS)) {
    parts.push(sql`s.billing_period = ${query.period}`);
  }
  if (query.cancelScheduled === true) {
    parts.push(scheduledCancellationPredicate());
  } else if (query.cancelScheduled === false) {
    parts.push(sql`NOT (${scheduledCancellationPredicate()})`);
  }
  if (query.paymentIssues === true) {
    parts.push(paymentIssuesPredicate());
  } else if (query.paymentIssues === false) {
    parts.push(sql`NOT (${paymentIssuesPredicate()})`);
  }

  if (parts.length === 0) return sql`TRUE`;
  return sql.join(parts, sql` AND `);
}

/**
 * Same terminal set as `scheduledCancellation`, so the filter matches the
 * `cancelAtPeriodEnd` flag on each item.
 */
function scheduledCancellationPredicate(): SQL {
  return sql`(
    s.status NOT IN ('canceled', 'unpaid', 'incomplete_expired')
    AND (s.cancel_at_period_end IS TRUE OR s.cancel_at IS NOT NULL)
  )`;
}

function paymentIssuesPredicate(): SQL {
  return sql`(s.payment_attempts > 0 OR s.status = 'past_due')`;
}

function subscriptionListPage(query: SubscriptionListQuery): {
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

function containsPattern(raw: string): string {
  return `%${raw.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;
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
