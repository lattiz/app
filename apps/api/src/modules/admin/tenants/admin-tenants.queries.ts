import { sql, type SQL } from 'drizzle-orm';
import {
  SORT_ORDERS,
  TENANT_PLANS,
  TENANT_SORTS,
  TENANT_STATUSES,
  type TenantPlan,
  type TenantStatus,
} from './admin-tenants.dto';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;
const MAX_PAGE = 100_000;

const SORT_COLUMNS: Record<(typeof TENANT_SORTS)[number], string> = {
  created_at: 'o.created_at',
  last_sign_in_at: 'o.last_sign_in_at',
  domain_expires_at: 'o.domain_expires_at',
};

export interface TenantListQuery {
  q?: string;
  plan?: TenantPlan;
  status?: TenantStatus;
  entitled?: boolean;
  internal?: boolean;
  domainExpiringDays?: number;
  renewalOverdue?: boolean;
  dnsIssue?: boolean;
  sort?: (typeof TENANT_SORTS)[number];
  order?: (typeof SORT_ORDERS)[number];
  page?: number;
  pageSize?: number;
}

export interface TenantListStatements {
  items: SQL;
  count: SQL;
  page: number;
  pageSize: number;
}

export function tenantListStatements(
  query: TenantListQuery,
): TenantListStatements {
  const where = tenantListWhere(query);
  const page = tenantListPage(query);
  const order = tenantListOrder(query);
  return {
    page: page.page,
    pageSize: page.pageSize,
    count: sql`
      SELECT count(*)::int AS total
      FROM admin.tenant_overview o
      WHERE ${where}
    `,
    items: sql`
      SELECT
        o.tenant_id,
        o.slug,
        o.name,
        o.email,
        o.plan,
        o.status,
        o.entitled,
        o.preview_started_at,
        o.subscription_id,
        o.subscription_status,
        o.subscription_plan,
        o.billing_period,
        o.current_period_end,
        o.cancel_at_period_end,
        o.cancel_at,
        o.template_id,
        tpl.name AS template_name,
        o.site_status,
        o.domain,
        o.domain_expires_at,
        o.dns_status,
        o.storage_bytes,
        o.is_internal,
        o.tags,
        o.created_at,
        o.last_sign_in_at
      FROM admin.tenant_overview o
      LEFT JOIN public.templates tpl ON tpl.id = o.template_id
      WHERE ${where}
      ORDER BY ${order}
      LIMIT ${page.pageSize}::int
      OFFSET ${page.offset}::int
    `,
  };
}

/**
 * Internal tenants are hidden unless `internal` is true, which drops the
 * predicate (they are included with everyone else).
 */
export function tenantListWhere(query: TenantListQuery): SQL {
  const parts: SQL[] = [];
  if (query.internal !== true) {
    parts.push(sql`o.is_internal = false`);
  }

  const q = query.q?.trim();
  if (q) {
    const pattern = containsPattern(q.slice(0, 200));
    parts.push(sql`(
      o.email ILIKE ${pattern}
      OR o.slug ILIKE ${pattern}
      OR o.name ILIKE ${pattern}
      OR o.domain ILIKE ${pattern}
    )`);
  }

  if (query.plan && isOneOf(query.plan, TENANT_PLANS)) {
    parts.push(sql`o.plan = ${query.plan}`);
  }
  if (query.status && isOneOf(query.status, TENANT_STATUSES)) {
    parts.push(sql`o.status = ${query.status}`);
  }
  if (query.entitled === true || query.entitled === false) {
    parts.push(sql`o.entitled = ${query.entitled}`);
  }
  if (
    query.domainExpiringDays !== undefined &&
    Number.isInteger(query.domainExpiringDays) &&
    query.domainExpiringDays >= 1
  ) {
    parts.push(sql`(
      o.domain_expires_at IS NOT NULL
      AND o.domain_expires_at >= now()
      AND o.domain_expires_at <= now() + make_interval(days => ${query.domainExpiringDays}::int)
    )`);
  }
  if (query.renewalOverdue === true) {
    parts.push(sql`o.renewal_status = 'overdue'`);
  } else if (query.renewalOverdue === false) {
    parts.push(sql`o.renewal_status IS DISTINCT FROM 'overdue'`);
  }
  if (query.dnsIssue === true) {
    parts.push(sql`o.dns_status IS NOT NULL AND o.dns_status <> 'active'`);
  } else if (query.dnsIssue === false) {
    parts.push(sql`o.dns_status = 'active'`);
  }

  if (parts.length === 0) return sql`TRUE`;
  return sql.join(parts, sql` AND `);
}

export function tenantOverviewStatement(tenantId: string): SQL {
  return sql`
    SELECT
      o.tenant_id,
      o.user_id,
      o.slug,
      o.name,
      o.plan,
      o.status,
      o.created_at,
      o.preview_started_at,
      o.included_domain_used_at,
      o.stripe_customer_id,
      o.email,
      o.email_confirmed_at,
      o.last_sign_in_at,
      o.is_internal,
      o.tags,
      o.entitled,
      o.subscription_id,
      o.subscription_status,
      o.subscription_plan,
      o.billing_period,
      o.current_period_end,
      o.cancel_at_period_end,
      o.cancel_at,
      o.payment_attempts,
      o.subscription_created_at,
      o.template_id,
      tpl.name AS template_name,
      o.site_status,
      o.published_at,
      o.site_updated_at,
      o.domain,
      o.domain_source,
      o.dns_status,
      o.domain_expires_at,
      o.domain_suspended_at,
      o.dns_provider,
      o.renewal_status,
      o.renewal_late_deadline_at,
      o.storage_bytes,
      o.storage_measured_at,
      f.notes AS flag_notes
    FROM admin.tenant_overview o
    LEFT JOIN public.templates tpl ON tpl.id = o.template_id
    LEFT JOIN admin.tenant_flags f ON f.tenant_id = o.tenant_id
    WHERE o.tenant_id = ${tenantId}::uuid
  `;
}

export function tenantExistsStatement(tenantId: string): SQL {
  return sql`
    SELECT 1 AS ok
    FROM public.tenants
    WHERE id = ${tenantId}::uuid
  `;
}

export function tenantIdentityStatement(userId: string): SQL {
  return sql`
    SELECT
      email,
      email_confirmed_at,
      last_sign_in_at,
      created_at,
      raw_app_meta_data->'providers' AS providers
    FROM auth.users
    WHERE id = ${userId}::uuid
  `;
}

export function tenantArchivesStatement(tenantId: string): SQL {
  return sql`
    SELECT template_id, reason, archived_at
    FROM public.template_archives
    WHERE tenant_id = ${tenantId}::uuid
    ORDER BY archived_at DESC, id DESC
  `;
}

export function tenantSubscriptionsStatement(tenantId: string): SQL {
  return sql`
    SELECT
      id,
      stripe_subscription_id,
      plan,
      billing_period,
      status,
      current_period_start,
      current_period_end,
      cancel_at_period_end,
      cancel_at,
      canceled_at,
      payment_attempts,
      created_at
    FROM public.subscriptions
    WHERE tenant_id = ${tenantId}::uuid
    ORDER BY created_at DESC, id DESC
  `;
}

export function tenantAnalyticsStatement(tenantId: string): SQL {
  return sql`
    SELECT
      a.provisioning_status,
      a.is_mock,
      c.fetched_at,
      c.report
    FROM (SELECT ${tenantId}::uuid AS tenant_id) seed
    LEFT JOIN public.tenant_analytics a ON a.tenant_id = seed.tenant_id
    LEFT JOIN public.analytics_report_cache c ON c.tenant_id = seed.tenant_id
  `;
}

/** Last 20 outbox rows. Payload and recipient stay in the database. */
export function tenantEmailsStatement(tenantId: string): SQL {
  return sql`
    SELECT
      kind,
      status,
      attempts,
      created_at,
      sent_at,
      left(last_error, 200) AS last_error
    FROM public.email_outbox
    WHERE tenant_id = ${tenantId}::uuid
    ORDER BY created_at DESC, id DESC
    LIMIT 20
  `;
}

function tenantListPage(query: TenantListQuery): {
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

function tenantListOrder(query: TenantListQuery): SQL {
  const column =
    query.sort && query.sort in SORT_COLUMNS
      ? SORT_COLUMNS[query.sort]
      : SORT_COLUMNS.created_at;
  const direction = query.order === 'asc' ? 'ASC' : 'DESC';
  return sql`${sql.raw(column)} ${sql.raw(direction)} NULLS LAST, o.tenant_id ASC`;
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

export function tenantStatusStatement(tenantId: string): SQL {
  return sql`
    SELECT status
    FROM public.tenants
    WHERE id = ${tenantId}::uuid
  `;
}

export function tenantSetStatusStatement(
  tenantId: string,
  status: 'active' | 'inactive',
  expected: 'active' | 'inactive',
): SQL {
  return sql`
    UPDATE public.tenants
    SET status = ${status}
    WHERE id = ${tenantId}::uuid
      AND status = ${expected}
    RETURNING status
  `;
}

export function tenantFlagsStatement(tenantId: string): SQL {
  return sql`
    SELECT is_internal, tags, notes
    FROM admin.tenant_flags
    WHERE tenant_id = ${tenantId}::uuid
  `;
}

export function tenantFlagsUpsertStatement(
  tenantId: string,
  flags: { isInternal: boolean; tags: readonly string[]; notes: string | null },
  actorUserId: string,
): SQL {
  return sql`
    INSERT INTO admin.tenant_flags (
      tenant_id, is_internal, tags, notes, updated_by
    )
    VALUES (
      ${tenantId}::uuid,
      ${flags.isInternal},
      ${textArray(flags.tags)},
      ${flags.notes},
      ${actorUserId}::uuid
    )
    ON CONFLICT (tenant_id) DO UPDATE
    SET is_internal = EXCLUDED.is_internal,
        tags = EXCLUDED.tags,
        notes = EXCLUDED.notes,
        updated_by = EXCLUDED.updated_by
    RETURNING is_internal, tags, notes
  `;
}

function textArray(values: readonly string[]): SQL {
  if (values.length === 0) return sql`'{}'::text[]`;
  return sql`ARRAY[${sql.join(
    values.map((value) => sql`${value}`),
    sql`, `,
  )}]::text[]`;
}
