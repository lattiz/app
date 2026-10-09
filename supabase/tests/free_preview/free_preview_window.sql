-- Free-preview window for get_public_tenant_site. Fixture rows roll back.
-- Run: psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -v ON_ERROR_STOP=1 -f supabase/tests/free_preview/free_preview_window.sql
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

INSERT INTO public.tenants (slug, name, plan, status, domain, preview_started_at)
VALUES
  ('fpwina', 'Preview Open', 'none', 'active', 'fpwina.example', now() - interval '1 day'),
  ('fpwinb', 'Preview Expired', 'none', 'active', 'fpwinb.example', now() - interval '15 days'),
  ('fpwinc', 'Preview Unstarted', 'none', 'active', NULL, NULL),
  ('fpwind', 'Basico Paid', 'basico', 'active', 'fpwind.example', NULL),
  ('fpwinp', 'Pro Paid', 'pro', 'active', 'fpwinp.example', NULL),
  ('fpwine', 'Basico Canceled', 'basico', 'active', 'fpwine.example', now() - interval '1 day'),
  ('fpwinf', 'Inactive Kill', 'pro', 'inactive', 'fpwinf.example', now() - interval '1 day'),
  ('fpwing', 'Trial Days Param', 'none', 'active', NULL, now() - interval '4 days'),
  ('fpwinh', 'Preview With Domain', 'none', 'active', 'fpwinh.example', now() - interval '1 day'),
  ('fpwini', 'Immutable Stamp', 'none', 'active', NULL, NULL);

INSERT INTO public.site_schemas (tenant_id, grapesjs_json, exported_html, status, published_at)
SELECT id, '{}'::jsonb, 'html-' || slug, 'published', now()
FROM public.tenants
WHERE slug LIKE 'fpwin%';

INSERT INTO public.subscriptions (
  tenant_id, stripe_subscription_id, stripe_customer_id, plan, billing_period, status,
  current_period_start, current_period_end
)
SELECT id, 'sub_' || slug, 'cus_' || slug, 'basico', 'monthly', 'active',
       now() - interval '1 day', now() + interval '30 days'
FROM public.tenants WHERE slug = 'fpwind'
UNION ALL
SELECT id, 'sub_' || slug, 'cus_' || slug, 'pro', 'monthly', 'active',
       now() - interval '1 day', now() + interval '30 days'
FROM public.tenants WHERE slug = 'fpwinp'
UNION ALL
SELECT id, 'sub_' || slug, 'cus_' || slug, 'basico', 'monthly', 'canceled',
       now() - interval '40 days', now() - interval '10 days'
FROM public.tenants WHERE slug = 'fpwine'
UNION ALL
SELECT id, 'sub_' || slug, 'cus_' || slug, 'pro', 'monthly', 'active',
       now() - interval '1 day', now() + interval '30 days'
FROM public.tenants WHERE slug = 'fpwinf';

INSERT INTO public.domains (
  tenant_id, domain, tld, annual_cost_usd_cents,
  dns_status, ssl_active, vercel_mapped, is_mock
)
SELECT id, domain, 'example', 1000, 'active', true, true, false
FROM public.tenants
WHERE slug IN ('fpwind', 'fpwinp', 'fpwinf', 'fpwinh');

INSERT INTO public.tenant_analytics (
  tenant_id, provisioning_status, ga4_property_id, ga4_measurement_id
)
SELECT id, 'ready', 'prop-' || slug,
       CASE slug
         WHEN 'fpwinp' THEN 'G-FPWINPRO1'
         WHEN 'fpwind' THEN 'G-FPWINDNO1'
         WHEN 'fpwinf' THEN 'G-FPWININA1'
       END
FROM public.tenants
WHERE slug IN ('fpwinp', 'fpwind', 'fpwinf');

DO $tests$
DECLARE
  r record;
  started timestamptz;
  fn_count integer;
  public_grant boolean;
BEGIN
  -- a) open preview serves by slug only
  SELECT preview_started_at INTO started FROM public.tenants WHERE slug = 'fpwina';
  SELECT * INTO r FROM public.get_public_tenant_site(p_slug => 'fpwina');
  PERFORM pg_temp.expect(r.serving_state = 'serving', 'a: slug serving_state');
  PERFORM pg_temp.expect(r.is_serving, 'a: slug is_serving');
  PERFORM pg_temp.expect(r.is_paid = false, 'a: slug is_paid');
  PERFORM pg_temp.expect(r.tenant_name = 'Preview Open', 'a: slug name');
  PERFORM pg_temp.expect(r.slug = 'fpwina', 'a: slug');
  PERFORM pg_temp.expect(r.exported_html = 'html-fpwina', 'a: slug html');
  PERFORM pg_temp.expect(
    r.preview_expires_at = started + (3 * interval '1 day'),
    'a: preview_expires_at');
  PERFORM pg_temp.expect(r.domain_live = false, 'a: slug domain_live');
  PERFORM pg_temp.expect(r.ga4_measurement_id IS NULL, 'a: slug ga4');

  SELECT * INTO r FROM public.get_public_tenant_site(p_domain => 'fpwina.example');
  PERFORM pg_temp.expect(r.serving_state = 'unavailable', 'a: domain serving_state');
  PERFORM pg_temp.expect(r.is_serving = false, 'a: domain is_serving');
  PERFORM pg_temp.expect(r.exported_html IS NULL, 'a: domain html');
  PERFORM pg_temp.expect(r.tenant_name IS NULL, 'a: domain name');
  PERFORM pg_temp.expect(r.slug IS NULL, 'a: domain slug');
  PERFORM pg_temp.expect(r.preview_expires_at IS NULL, 'a: domain expires');

  -- b) window elapsed
  SELECT preview_started_at INTO started FROM public.tenants WHERE slug = 'fpwinb';
  SELECT * INTO r FROM public.get_public_tenant_site(p_slug => 'fpwinb');
  PERFORM pg_temp.expect(r.serving_state = 'expired', 'b: serving_state');
  PERFORM pg_temp.expect(r.is_serving = false, 'b: is_serving');
  PERFORM pg_temp.expect(r.is_paid = false, 'b: is_paid');
  PERFORM pg_temp.expect(r.tenant_name = 'Preview Expired', 'b: name');
  PERFORM pg_temp.expect(r.slug = 'fpwinb', 'b: slug');
  PERFORM pg_temp.expect(r.exported_html IS NULL, 'b: html');
  PERFORM pg_temp.expect(r.domain IS NULL, 'b: domain');
  PERFORM pg_temp.expect(r.published_at IS NULL, 'b: published_at');
  PERFORM pg_temp.expect(r.favicon_light_url IS NULL, 'b: favicon');
  PERFORM pg_temp.expect(r.seo_title IS NULL, 'b: seo');
  PERFORM pg_temp.expect(r.ga4_measurement_id IS NULL, 'b: ga4');
  PERFORM pg_temp.expect(r.domain_live = false, 'b: domain_live');
  PERFORM pg_temp.expect(
    r.preview_expires_at = started + (3 * interval '1 day'),
    'b: preview_expires_at');

  SELECT * INTO r FROM public.get_public_tenant_site(p_domain => 'fpwinb.example');
  PERFORM pg_temp.expect(r.serving_state = 'unavailable', 'b: domain is unavailable');
  PERFORM pg_temp.expect(r.tenant_name IS NULL, 'b: domain name hidden');

  -- c) never published to preview
  SELECT * INTO r FROM public.get_public_tenant_site(p_slug => 'fpwinc');
  PERFORM pg_temp.expect(r.serving_state = 'unavailable', 'c: serving_state');
  PERFORM pg_temp.expect(r.is_serving = false, 'c: is_serving');
  PERFORM pg_temp.expect(r.tenant_name IS NULL AND r.slug IS NULL, 'c: identity hidden');
  PERFORM pg_temp.expect(r.exported_html IS NULL, 'c: html');
  PERFORM pg_temp.expect(r.preview_expires_at IS NULL, 'c: expires');
  PERFORM pg_temp.expect(r.is_paid = false, 'c: is_paid');

  -- d) paid basico serves on slug and domain; pro adds GA4 and domain_live
  SELECT * INTO r FROM public.get_public_tenant_site(p_slug => 'fpwind');
  PERFORM pg_temp.expect(r.serving_state = 'serving' AND r.is_serving, 'd: basico slug serving');
  PERFORM pg_temp.expect(r.is_paid = true, 'd: basico is_paid');
  PERFORM pg_temp.expect(r.preview_expires_at IS NULL, 'd: basico expires');
  PERFORM pg_temp.expect(r.exported_html = 'html-fpwind', 'd: basico html');
  PERFORM pg_temp.expect(r.domain_live = true, 'd: basico domain_live');
  PERFORM pg_temp.expect(r.ga4_measurement_id IS NULL, 'd: basico ga4 hidden');

  SELECT * INTO r FROM public.get_public_tenant_site(p_domain => 'fpwind.example');
  PERFORM pg_temp.expect(r.serving_state = 'serving' AND r.is_serving, 'd: basico domain serving');
  PERFORM pg_temp.expect(r.is_paid = true, 'd: basico domain is_paid');
  PERFORM pg_temp.expect(r.exported_html = 'html-fpwind', 'd: basico domain html');
  PERFORM pg_temp.expect(r.domain_live = true, 'd: basico domain domain_live');

  SELECT * INTO r FROM public.get_public_tenant_site(p_slug => 'fpwinp');
  PERFORM pg_temp.expect(r.serving_state = 'serving' AND r.is_paid, 'd: pro serving');
  PERFORM pg_temp.expect(r.domain_live = true, 'd: pro domain_live');
  PERFORM pg_temp.expect(r.ga4_measurement_id = 'G-FPWINPRO1', 'd: pro ga4');
  PERFORM pg_temp.expect(r.preview_expires_at IS NULL, 'd: pro expires');

  SELECT * INTO r FROM public.get_public_tenant_site(p_domain => 'fpwinp.example');
  PERFORM pg_temp.expect(r.ga4_measurement_id = 'G-FPWINPRO1', 'd: pro domain ga4');
  PERFORM pg_temp.expect(r.domain_live = true, 'd: pro domain domain_live');

  -- e) canceled paid plan gets no free preview
  SELECT * INTO r FROM public.get_public_tenant_site(p_slug => 'fpwine');
  PERFORM pg_temp.expect(r.serving_state = 'unavailable', 'e: serving_state');
  PERFORM pg_temp.expect(r.is_serving = false AND r.is_paid = false, 'e: flags');
  PERFORM pg_temp.expect(r.exported_html IS NULL AND r.tenant_name IS NULL, 'e: hidden');
  PERFORM pg_temp.expect(r.preview_expires_at IS NULL, 'e: expires');

  -- f) kill switch
  SELECT * INTO r FROM public.get_public_tenant_site(p_slug => 'fpwinf');
  PERFORM pg_temp.expect(r.serving_state = 'unavailable', 'f: slug serving_state');
  PERFORM pg_temp.expect(r.exported_html IS NULL AND r.tenant_name IS NULL, 'f: slug hidden');
  PERFORM pg_temp.expect(r.ga4_measurement_id IS NULL, 'f: slug ga4');
  PERFORM pg_temp.expect(r.domain_live = false, 'f: slug domain_live');

  SELECT * INTO r FROM public.get_public_tenant_site(p_domain => 'fpwinf.example');
  PERFORM pg_temp.expect(r.serving_state = 'unavailable', 'f: domain serving_state');
  PERFORM pg_temp.expect(r.exported_html IS NULL AND r.ga4_measurement_id IS NULL, 'f: domain hidden');

  -- g) omitted p_trial_days reads app_settings (seed 3). 4 days old expires; an explicit argument overrides.
  SELECT preview_started_at INTO started FROM public.tenants WHERE slug = 'fpwing';
  SELECT * INTO r FROM public.get_public_tenant_site(p_slug => 'fpwing');
  PERFORM pg_temp.expect(r.serving_state = 'expired', 'g: default 3 expired');
  PERFORM pg_temp.expect(
    r.preview_expires_at = started + (3 * interval '1 day'),
    'g: default 3 expires');

  SELECT * INTO r FROM public.get_public_tenant_site(p_slug => 'fpwing', p_trial_days => 3);
  PERFORM pg_temp.expect(r.serving_state = 'expired', 'g: 3 days expired');
  PERFORM pg_temp.expect(r.exported_html IS NULL, 'g: 3 days html');
  PERFORM pg_temp.expect(
    r.preview_expires_at = started + (3 * interval '1 day'),
    'g: 3 days expires');

  SELECT * INTO r FROM public.get_public_tenant_site(p_slug => 'fpwing', p_trial_days => 5);
  PERFORM pg_temp.expect(r.serving_state = 'serving', 'g: 5 days serving');
  PERFORM pg_temp.expect(r.exported_html = 'html-fpwing', 'g: 5 days html');
  PERFORM pg_temp.expect(
    r.preview_expires_at = started + (5 * interval '1 day'),
    'g: 5 days expires');

  -- h) live custom domain does not redirect an unpaid preview
  SELECT * INTO r FROM public.get_public_tenant_site(p_slug => 'fpwinh');
  PERFORM pg_temp.expect(r.serving_state = 'serving' AND r.is_serving, 'h: serving');
  PERFORM pg_temp.expect(r.is_paid = false, 'h: is_paid');
  PERFORM pg_temp.expect(r.domain = 'fpwinh.example', 'h: domain exposed');
  PERFORM pg_temp.expect(r.domain_live = false, 'h: domain_live');
  PERFORM pg_temp.expect(r.exported_html = 'html-fpwinh', 'h: html');

  -- signature: one function, the 3-arg form only
  SELECT count(*) INTO fn_count
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public' AND p.proname = 'get_public_tenant_site';
  PERFORM pg_temp.expect(fn_count = 1, 'i: function count');

  PERFORM pg_temp.expect(
    EXISTS (
      SELECT 1
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public'
        AND p.proname = 'get_public_tenant_site'
        AND pg_get_function_identity_arguments(p.oid) = 'p_slug text, p_domain text, p_trial_days integer'
    ),
    'i: signature');

  PERFORM pg_temp.expect(
    has_function_privilege('anon', 'public.get_public_tenant_site(text, text, integer)', 'EXECUTE'),
    'i: anon execute');
  PERFORM pg_temp.expect(
    NOT has_function_privilege('authenticated', 'public.get_public_tenant_site(text, text, integer)', 'EXECUTE'),
    'i: authenticated execute');
  PERFORM pg_temp.expect(
    has_function_privilege('service_role', 'public.get_public_tenant_site(text, text, integer)', 'EXECUTE'),
    'i: service_role execute');

  PERFORM pg_temp.expect(
    (
      SELECT p.proacl IS NOT NULL
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public' AND p.proname = 'get_public_tenant_site'
    ),
    'i: explicit acl');

  SELECT COALESCE(bool_or(a.grantee = 0), false) INTO public_grant
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  CROSS JOIN LATERAL aclexplode(p.proacl) a
  WHERE n.nspname = 'public'
    AND p.proname = 'get_public_tenant_site'
    AND a.privilege_type = 'EXECUTE';
  PERFORM pg_temp.expect(public_grant = false, 'i: public execute');

  -- first stamp is allowed; a second write is not
  UPDATE public.tenants SET preview_started_at = now() WHERE slug = 'fpwini';
  BEGIN
    UPDATE public.tenants
    SET preview_started_at = now() + interval '1 day'
    WHERE slug = 'fpwini';
    RAISE EXCEPTION 'trigger: rewrite succeeded';
  EXCEPTION
    WHEN check_violation THEN
      NULL;
  END;
  BEGIN
    UPDATE public.tenants SET preview_started_at = NULL WHERE slug = 'fpwini';
    RAISE EXCEPTION 'trigger: clear succeeded';
  EXCEPTION
    WHEN check_violation THEN
      NULL;
  END;
  PERFORM pg_temp.expect(
    (SELECT preview_started_at IS NOT NULL FROM public.tenants WHERE slug = 'fpwini'),
    'trigger: stamp kept');
END
$tests$;

SET ROLE anon;
SELECT public.get_public_tenant_site('fpwina', NULL);
RESET ROLE;

SET ROLE service_role;
SELECT public.get_public_tenant_site('fpwina', NULL);
RESET ROLE;

SET ROLE authenticated;
DO $auth$
BEGIN
  PERFORM * FROM public.get_public_tenant_site('fpwina', NULL);
  RAISE EXCEPTION 'authenticated executed get_public_tenant_site';
EXCEPTION
  WHEN insufficient_privilege THEN
    NULL;
END
$auth$;
RESET ROLE;

ROLLBACK;
