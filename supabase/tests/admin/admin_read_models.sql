-- Admin read models: closed to anon/authenticated, latest subscription, released domains hidden,
-- storage sum, template counts that skip internal tenants, storage cascade.
-- Run (psql is not on the host):
-- docker exec -i supabase_db_lattiz psql -U postgres -d postgres -v ON_ERROR_STOP=1 < supabase/tests/admin/admin_read_models.sql
\set ON_ERROR_STOP on

BEGIN;

CREATE FUNCTION pg_temp.expect(p_ok boolean, p_msg text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT COALESCE(p_ok, false) THEN
    RAISE EXCEPTION '%', p_msg;
  END IF;
END;
$$;

DO $deny$
DECLARE
  v_role text;
  v_rel text;
BEGIN
  FOREACH v_role IN ARRAY ARRAY['anon', 'authenticated']
  LOOP
    EXECUTE format('SET LOCAL ROLE %I', v_role);
    FOREACH v_rel IN ARRAY ARRAY[
      'admin.tenant_overview',
      'admin.template_usage',
      'admin.subscription_overview',
      'admin.storage_usage',
      'admin.kpi_daily'
    ]
    LOOP
      BEGIN
        EXECUTE format('SELECT 1 FROM %s', v_rel);
        RAISE EXCEPTION '% select % succeeded', v_role, v_rel;
      EXCEPTION
        WHEN insufficient_privilege THEN
          NULL;
      END;
    END LOOP;
    RESET ROLE;
  END LOOP;
END
$deny$;

INSERT INTO public.templates (id, name, category, grapesjs_json, tier, sort_order)
VALUES ('ov-cafe-v1', 'Cafe', 'cafe', '{}'::jsonb, 'basic', 4);

INSERT INTO auth.users (id, email, aud, role, email_confirmed_at, last_sign_in_at)
VALUES
  (
    'a2010000-0000-0000-0000-000000000001',
    'overview-paying@example.com',
    'authenticated',
    'authenticated',
    '2026-01-02T00:00:00Z',
    '2026-01-03T00:00:00Z'
  ),
  (
    'a2020000-0000-0000-0000-000000000001',
    'overview-trial@example.com',
    'authenticated',
    'authenticated',
    NULL,
    NULL
  ),
  (
    'a2030000-0000-0000-0000-000000000001',
    'overview-internal@example.com',
    'authenticated',
    'authenticated',
    NULL,
    NULL
  );

-- on_auth_user_created already made each tenant. Shape them for the read models.
UPDATE public.tenants
SET
  slug = 'ov-paying',
  name = 'Overview Paying',
  plan = 'basico',
  status = 'active',
  stripe_customer_id = 'cus_ov_paying',
  included_domain_used_at = '2026-02-01T00:00:00Z'
WHERE user_id = 'a2010000-0000-0000-0000-000000000001';

UPDATE public.tenants
SET
  slug = 'ov-trial',
  name = 'Overview Trial',
  plan = 'none',
  status = 'active',
  preview_started_at = '2026-03-01T00:00:00Z'
WHERE user_id = 'a2020000-0000-0000-0000-000000000001';

UPDATE public.tenants
SET slug = 'ov-internal', name = 'Overview Internal', plan = 'basico', status = 'active'
WHERE user_id = 'a2030000-0000-0000-0000-000000000001';

INSERT INTO admin.tenant_flags (tenant_id, is_internal, tags)
SELECT id, true, ARRAY['qa']::text[]
FROM public.tenants
WHERE slug = 'ov-internal';

INSERT INTO public.subscriptions (
  tenant_id, stripe_subscription_id, stripe_customer_id, plan, billing_period,
  status, current_period_end, payment_attempts, created_at
)
SELECT id, 'sub_ov_old', 'cus_ov_paying', 'basico', 'monthly',
  'canceled', now() - interval '40 days', 0, now() - interval '30 days'
FROM public.tenants WHERE slug = 'ov-paying';

INSERT INTO public.subscriptions (
  tenant_id, stripe_subscription_id, stripe_customer_id, plan, billing_period,
  status, current_period_end, cancel_at, payment_attempts, created_at
)
SELECT id, 'sub_ov_new', 'cus_ov_paying', 'pro', 'annual',
  'active', now() + interval '20 days', '2026-12-15T00:00:00Z', 3, now() - interval '1 day'
FROM public.tenants WHERE slug = 'ov-paying';

INSERT INTO public.subscriptions (
  tenant_id, stripe_subscription_id, stripe_customer_id, plan, billing_period,
  status, current_period_end
)
SELECT id, 'sub_ov_internal', 'cus_ov_internal', 'basico', 'monthly',
  'active', now() + interval '20 days'
FROM public.tenants WHERE slug = 'ov-internal';

INSERT INTO public.site_schemas (tenant_id, template_id, grapesjs_json, status, published_at)
SELECT id, 'ov-cafe-v1', '{}'::jsonb, 'published', '2026-04-01T00:00:00Z'
FROM public.tenants WHERE slug = 'ov-paying';

INSERT INTO public.site_schemas (tenant_id, template_id, grapesjs_json, status)
SELECT id, 'ov-cafe-v1', '{}'::jsonb, 'draft'
FROM public.tenants WHERE slug = 'ov-trial';

INSERT INTO public.site_schemas (tenant_id, template_id, grapesjs_json, status, published_at)
SELECT id, 'ov-cafe-v1', '{}'::jsonb, 'published', '2026-04-02T00:00:00Z'
FROM public.tenants WHERE slug = 'ov-internal';

INSERT INTO public.domains (
  tenant_id, domain, tld, source, dns_status, expires_at, dns_provider, released_at
)
SELECT id, 'ov-paying.com', 'com', 'lattiz_managed', 'active',
  '2027-01-01T00:00:00Z', 'cloudflare', now()
FROM public.tenants WHERE slug = 'ov-paying';

INSERT INTO public.domain_maintenance_cycles (
  tenant_id, domain_id, expires_at, status, amount_cents, late_deadline_at, created_at
)
SELECT d.tenant_id, d.id, '2027-01-01T00:00:00Z', 'open', 1000,
  '2026-12-01T00:00:00Z', now() - interval '2 days'
FROM public.domains d
WHERE d.domain = 'ov-paying.com';

INSERT INTO public.domain_maintenance_cycles (
  tenant_id, domain_id, expires_at, status, created_at
)
SELECT d.tenant_id, d.id, '2028-01-01T00:00:00Z', 'void', now()
FROM public.domains d
WHERE d.domain = 'ov-paying.com';

INSERT INTO public.template_archives (tenant_id, template_id, project_data, reason)
SELECT id, 'ov-cafe-v1', '{}'::jsonb, 'template_switch'
FROM public.tenants WHERE slug = 'ov-paying';

INSERT INTO public.template_archives (tenant_id, template_id, project_data, reason)
SELECT id, 'ov-cafe-v1', '{}'::jsonb, 'template_switch'
FROM public.tenants WHERE slug = 'ov-internal';

INSERT INTO admin.storage_usage (
  tenant_id, assets_bytes, assets_objects, branding_bytes, branding_objects
)
SELECT id, 1000, 2, 250, 1
FROM public.tenants WHERE slug = 'ov-paying';

INSERT INTO admin.storage_usage (tenant_id, assets_bytes, branding_bytes)
SELECT id, 9, 9
FROM public.tenants WHERE slug = 'ov-internal';

SELECT pg_temp.expect(
  (
    SELECT domain IS NULL AND domain_source IS NULL AND dns_status IS NULL
    FROM admin.tenant_overview
    WHERE slug = 'ov-paying'
  ),
  'released domain appears on tenant_overview'
);

UPDATE public.domains SET released_at = NULL WHERE domain = 'ov-paying.com';

SELECT pg_temp.expect(
  (
    SELECT
      subscription_status = 'active'
      AND subscription_plan = 'pro'
      AND billing_period = 'annual'
      AND payment_attempts = 3
      AND cancel_at = '2026-12-15T00:00:00Z'
      AND email = 'overview-paying@example.com'
      AND email_confirmed_at = '2026-01-02T00:00:00Z'
      AND last_sign_in_at = '2026-01-03T00:00:00Z'
      AND NOT is_internal
      AND tags = '{}'::text[]
      AND template_id = 'ov-cafe-v1'
      AND site_status = 'published'
      AND domain = 'ov-paying.com'
      AND domain_source = 'lattiz_managed'
      AND dns_status = 'active'
      AND domain_expires_at = '2027-01-01T00:00:00Z'
      AND dns_provider = 'cloudflare'
      AND renewal_status = 'open'
      AND renewal_late_deadline_at = '2026-12-01T00:00:00Z'
      AND storage_bytes = 1250
    FROM admin.tenant_overview
    WHERE slug = 'ov-paying'
  ),
  'tenant_overview missed the latest subscription, live domain, or storage sum'
);

SELECT pg_temp.expect(
  (
    SELECT entitled = public.tenant_site_is_entitled(tenant_id)
    FROM admin.tenant_overview
    WHERE slug = 'ov-paying'
  ),
  'paying entitled disagrees with tenant_site_is_entitled'
);

SELECT pg_temp.expect(
  (
    SELECT entitled = public.tenant_site_is_entitled(tenant_id) AND entitled
    FROM admin.tenant_overview
    WHERE slug = 'ov-paying'
  ),
  'paying tenant is not entitled'
);

SELECT pg_temp.expect(
  (
    SELECT entitled = public.tenant_site_is_entitled(tenant_id) AND NOT entitled
      AND storage_bytes IS NULL
    FROM admin.tenant_overview
    WHERE slug = 'ov-trial'
  ),
  'trial entitled or storage_bytes without a measurement'
);

SELECT pg_temp.expect(
  (
    SELECT
      tenants_using = 2
      AND sites_published = 1
      AND paying_tenants = 1
      AND trial_tenants = 1
      AND archived_count = 1
    FROM admin.template_usage
    WHERE template_id = 'ov-cafe-v1'
  ),
  'template_usage counted the internal tenant'
);

SELECT pg_temp.expect(
  (
    SELECT count(*) = 2
      AND bool_and(tenant_slug = 'ov-paying')
      AND bool_and(email = 'overview-paying@example.com')
      AND bool_and(NOT is_internal)
    FROM admin.subscription_overview
    WHERE stripe_customer_id = 'cus_ov_paying'
  ),
  'subscription_overview dropped a paying subscription or its tenant'
);

SELECT pg_temp.expect(
  (
    SELECT is_internal AND tenant_slug = 'ov-internal'
    FROM admin.subscription_overview
    WHERE stripe_subscription_id = 'sub_ov_internal'
  ),
  'subscription_overview missed the internal flag'
);

DO $cascade$
DECLARE
  v_internal uuid;
BEGIN
  SELECT id INTO v_internal FROM public.tenants WHERE slug = 'ov-internal';
  DELETE FROM public.tenants WHERE id = v_internal;
  PERFORM pg_temp.expect(
    NOT EXISTS (SELECT 1 FROM admin.storage_usage WHERE tenant_id = v_internal)
      AND EXISTS (
        SELECT 1 FROM admin.storage_usage WHERE assets_bytes = 1000 AND branding_bytes = 250
      ),
    'tenant delete did not cascade storage_usage'
  );
END
$cascade$;

ROLLBACK;
