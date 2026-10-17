import { sql, type SQL } from 'drizzle-orm';

export interface KpiSnapshotWrite {
  day: string;
  mrrCents: number | null;
  currency: string | null;
  payingTenants: number;
  trialsActive: number;
  signups: number;
  newPaying: number;
  cancellations: number;
  publishedSites: number;
  capturedAt: string;
}

export function subscriptionFactsStatement(): SQL {
  return sql`
    SELECT
      s.tenant_id,
      s.status,
      s.current_period_end,
      s.canceled_at,
      s.created_at,
      s.cancel_at_period_end,
      s.cancel_at,
      (row_number() OVER (
        PARTITION BY s.tenant_id
        ORDER BY s.created_at DESC, s.id DESC
      ) = 1) AS is_latest
    FROM public.subscriptions s
    JOIN public.tenants t ON t.id = s.tenant_id
    LEFT JOIN admin.tenant_flags f ON f.tenant_id = t.id
    WHERE NOT COALESCE(f.is_internal, false)
  `;
}

export function trialFactsStatement(): SQL {
  return sql`
    SELECT
      t.plan,
      t.preview_started_at,
      latest.status AS subscription_status,
      latest.current_period_end,
      converted.converted_at
    FROM public.tenants t
    LEFT JOIN admin.tenant_flags f ON f.tenant_id = t.id
    LEFT JOIN LATERAL (
      SELECT s.status, s.current_period_end
      FROM public.subscriptions s
      WHERE s.tenant_id = t.id
      ORDER BY s.created_at DESC, s.id DESC
      LIMIT 1
    ) latest ON true
    LEFT JOIN LATERAL (
      SELECT min(s.created_at) AS converted_at
      FROM public.subscriptions s
      WHERE s.tenant_id = t.id
        AND t.preview_started_at IS NOT NULL
        AND s.created_at > t.preview_started_at
    ) converted ON true
    WHERE NOT COALESCE(f.is_internal, false)
      AND t.preview_started_at IS NOT NULL
  `;
}

export function signupsStatement(startIso: string, endIso: string): SQL {
  return sql`
    SELECT count(*)::int AS total
    FROM public.tenants t
    LEFT JOIN admin.tenant_flags f ON f.tenant_id = t.id
    WHERE NOT COALESCE(f.is_internal, false)
      AND t.created_at >= ${startIso}::timestamptz
      AND t.created_at < ${endIso}::timestamptz
  `;
}

export function publishedSitesStatement(): SQL {
  return sql`
    SELECT count(*)::int AS total
    FROM public.site_schemas ss
    JOIN public.tenants t ON t.id = ss.tenant_id
    LEFT JOIN admin.tenant_flags f ON f.tenant_id = t.id
    WHERE ss.status = 'published'
      AND NOT COALESCE(f.is_internal, false)
  `;
}

export function domainFactsStatement(): SQL {
  return sql`
    SELECT
      d.source,
      t.plan,
      d.expires_at,
      EXISTS (
        SELECT 1
        FROM public.domain_maintenance_cycles overdue
        WHERE overdue.domain_id = d.id
          AND overdue.status = 'overdue'
      ) AS overdue,
      open.amount_cents AS open_amount_cents,
      open.expires_at AS open_expires_at
    FROM public.domains d
    JOIN public.tenants t ON t.id = d.tenant_id
    LEFT JOIN admin.tenant_flags f ON f.tenant_id = t.id
    LEFT JOIN LATERAL (
      SELECT c.amount_cents, c.expires_at
      FROM public.domain_maintenance_cycles c
      WHERE c.domain_id = d.id
        AND c.status = 'open'
      ORDER BY c.expires_at ASC, c.id ASC
      LIMIT 1
    ) open ON true
    WHERE d.released_at IS NULL
      AND NOT COALESCE(f.is_internal, false)
  `;
}

export function funnelStatement(startIso: string, endIso: string): SQL {
  return sql`
    SELECT
      t.created_at,
      (ss.tenant_id IS NOT NULL) AS has_schema,
      (
        t.preview_started_at IS NOT NULL
        OR ss.published_at IS NOT NULL
      ) AS published,
      first_sub.paid_at
    FROM public.tenants t
    LEFT JOIN admin.tenant_flags f ON f.tenant_id = t.id
    LEFT JOIN public.site_schemas ss ON ss.tenant_id = t.id
    LEFT JOIN LATERAL (
      SELECT min(s.created_at) AS paid_at
      FROM public.subscriptions s
      WHERE s.tenant_id = t.id
    ) first_sub ON true
    WHERE NOT COALESCE(f.is_internal, false)
      AND t.created_at >= ${startIso}::timestamptz
      AND t.created_at < ${endIso}::timestamptz
  `;
}

export function templateUsageStatement(): SQL {
  return sql`
    SELECT template_id, name, tier, tenants_using, paying_tenants
    FROM admin.template_usage
  `;
}

export function kpiHistoryStatement(startDay: string): SQL {
  return sql`
    SELECT
      to_char(day, 'YYYY-MM-DD') AS day,
      mrr_cents,
      currency,
      paying_tenants,
      trials_active,
      signups,
      new_paying,
      cancellations,
      published_sites,
      captured_at
    FROM admin.kpi_daily
    WHERE day >= ${startDay}::date
    ORDER BY day ASC
  `;
}

export function internalCustomerStatement(): SQL {
  return sql`
    SELECT t.stripe_customer_id
    FROM public.tenants t
    JOIN admin.tenant_flags f ON f.tenant_id = t.id
    WHERE f.is_internal = true
      AND t.stripe_customer_id IS NOT NULL
  `;
}

export function kpiUpsertStatement(row: KpiSnapshotWrite): SQL {
  return sql`
    INSERT INTO admin.kpi_daily (
      day,
      mrr_cents,
      currency,
      paying_tenants,
      trials_active,
      signups,
      new_paying,
      cancellations,
      published_sites,
      captured_at
    ) VALUES (
      ${row.day}::date,
      ${row.mrrCents}::bigint,
      ${row.currency},
      ${row.payingTenants}::int,
      ${row.trialsActive}::int,
      ${row.signups}::int,
      ${row.newPaying}::int,
      ${row.cancellations}::int,
      ${row.publishedSites}::int,
      ${row.capturedAt}::timestamptz
    )
    ON CONFLICT (day) DO UPDATE SET
      mrr_cents = EXCLUDED.mrr_cents,
      currency = EXCLUDED.currency,
      paying_tenants = EXCLUDED.paying_tenants,
      trials_active = EXCLUDED.trials_active,
      signups = EXCLUDED.signups,
      new_paying = EXCLUDED.new_paying,
      cancellations = EXCLUDED.cancellations,
      published_sites = EXCLUDED.published_sites,
      captured_at = EXCLUDED.captured_at
  `;
}
