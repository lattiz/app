-- Admin read models. Stay in admin: a view in public would be exposed by PostgREST
-- and, running as its owner, would bypass RLS and leak auth.users.
-- The API connects as the owner. Client roles stay revoked.

CREATE VIEW admin.tenant_overview AS
SELECT
  t.id AS tenant_id,
  t.user_id,
  t.slug,
  t.name,
  t.plan,
  t.status,
  t.created_at,
  t.preview_started_at,
  t.included_domain_used_at,
  t.stripe_customer_id,
  u.email,
  u.email_confirmed_at,
  u.last_sign_in_at,
  COALESCE(f.is_internal, false) AS is_internal,
  COALESCE(f.tags, '{}'::text[]) AS tags,
  public.tenant_site_is_entitled(t.id) AS entitled,
  sub.id AS subscription_id,
  sub.status AS subscription_status,
  sub.plan AS subscription_plan,
  sub.billing_period,
  sub.current_period_end,
  sub.cancel_at_period_end,
  sub.cancel_at,
  sub.payment_attempts,
  sub.created_at AS subscription_created_at,
  ss.template_id,
  ss.status AS site_status,
  ss.published_at,
  ss.updated_at AS site_updated_at,
  d.domain,
  d.source AS domain_source,
  d.dns_status,
  d.expires_at AS domain_expires_at,
  d.suspended_at AS domain_suspended_at,
  d.dns_provider,
  cyc.status AS renewal_status,
  cyc.late_deadline_at AS renewal_late_deadline_at,
  CASE
    WHEN su.tenant_id IS NULL THEN NULL
    ELSE su.assets_bytes + su.branding_bytes
  END AS storage_bytes,
  su.measured_at AS storage_measured_at
FROM public.tenants t
LEFT JOIN auth.users u ON u.id = t.user_id
LEFT JOIN admin.tenant_flags f ON f.tenant_id = t.id
LEFT JOIN LATERAL (
  SELECT
    s.id,
    s.status,
    s.plan,
    s.billing_period,
    s.current_period_end,
    s.cancel_at_period_end,
    s.cancel_at,
    s.payment_attempts,
    s.created_at
  FROM public.subscriptions s
  WHERE s.tenant_id = t.id
  ORDER BY s.created_at DESC, s.id DESC
  LIMIT 1
) sub ON true
LEFT JOIN public.site_schemas ss ON ss.tenant_id = t.id
LEFT JOIN public.domains d
  ON d.tenant_id = t.id AND d.released_at IS NULL
LEFT JOIN LATERAL (
  SELECT c.status, c.late_deadline_at
  FROM public.domain_maintenance_cycles c
  WHERE c.tenant_id = t.id
    AND c.status <> 'void'
  ORDER BY c.created_at DESC, c.id DESC
  LIMIT 1
) cyc ON true
LEFT JOIN admin.storage_usage su ON su.tenant_id = t.id;

-- Counts skip tenants flagged is_internal, including their template archives.
CREATE VIEW admin.template_usage AS
SELECT
  tpl.id AS template_id,
  tpl.name,
  tpl.category,
  tpl.tier,
  tpl.is_active,
  tpl.sort_order,
  tpl.created_at,
  COALESCE(usage.tenants_using, 0) AS tenants_using,
  COALESCE(usage.sites_published, 0) AS sites_published,
  COALESCE(usage.paying_tenants, 0) AS paying_tenants,
  COALESCE(usage.trial_tenants, 0) AS trial_tenants,
  COALESCE(archives.archived_count, 0) AS archived_count
FROM public.templates tpl
LEFT JOIN (
  SELECT
    ss.template_id,
    count(*)::integer AS tenants_using,
    count(*) FILTER (WHERE ss.status = 'published')::integer AS sites_published,
    count(*) FILTER (WHERE public.tenant_site_is_entitled(t.id))::integer AS paying_tenants,
    count(*) FILTER (
      WHERE t.plan = 'none' AND t.preview_started_at IS NOT NULL
    )::integer AS trial_tenants
  FROM public.site_schemas ss
  JOIN public.tenants t ON t.id = ss.tenant_id
  LEFT JOIN admin.tenant_flags f ON f.tenant_id = t.id
  WHERE ss.template_id IS NOT NULL
    AND NOT COALESCE(f.is_internal, false)
  GROUP BY ss.template_id
) usage ON usage.template_id = tpl.id
LEFT JOIN (
  SELECT ar.template_id, count(*)::integer AS archived_count
  FROM public.template_archives ar
  LEFT JOIN admin.tenant_flags f ON f.tenant_id = ar.tenant_id
  WHERE ar.template_id IS NOT NULL
    AND NOT COALESCE(f.is_internal, false)
  GROUP BY ar.template_id
) archives ON archives.template_id = tpl.id;

CREATE VIEW admin.subscription_overview AS
SELECT
  s.*,
  t.slug AS tenant_slug,
  t.name AS tenant_name,
  u.email,
  COALESCE(f.is_internal, false) AS is_internal
FROM public.subscriptions s
JOIN public.tenants t ON t.id = s.tenant_id
LEFT JOIN auth.users u ON u.id = t.user_id
LEFT JOIN admin.tenant_flags f ON f.tenant_id = t.id;

REVOKE ALL ON admin.tenant_overview FROM PUBLIC, anon, authenticated;
REVOKE ALL ON admin.template_usage FROM PUBLIC, anon, authenticated;
REVOKE ALL ON admin.subscription_overview FROM PUBLIC, anon, authenticated;
