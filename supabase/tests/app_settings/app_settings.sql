-- app_settings: closed tables, audit, seed, and the preview window read from the table.
-- Run: psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -v ON_ERROR_STOP=1 -f supabase/tests/app_settings/app_settings.sql
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
  ('aswin2', 'Settings Two', 'none', 'active', NULL, now() - interval '2 days'),
  ('aswin4', 'Settings Four', 'none', 'active', NULL, now() - interval '4 days'),
  ('aswinp', 'Settings Paid', 'basico', 'active', 'aswinp.example', now() - interval '30 days');

INSERT INTO public.site_schemas (tenant_id, grapesjs_json, exported_html, status, published_at)
SELECT id, '{}'::jsonb, 'html-' || slug, 'published', now()
FROM public.tenants
WHERE slug IN ('aswin2', 'aswin4', 'aswinp');

INSERT INTO public.subscriptions (
  tenant_id, stripe_subscription_id, stripe_customer_id, plan, billing_period, status,
  current_period_start, current_period_end
)
SELECT id, 'sub_' || slug, 'cus_' || slug, 'basico', 'monthly', 'active',
       now() - interval '1 day', now() + interval '30 days'
FROM public.tenants
WHERE slug = 'aswinp';

DO $tests$
DECLARE
  r record;
  started timestamptz;
  audit_id bigint;
  audit_old jsonb;
  audit_new jsonb;
  audit_by text;
  rel text;
  actor text;
BEGIN
  FOREACH rel IN ARRAY ARRAY['public.app_settings', 'public.app_settings_audit']
  LOOP
    PERFORM pg_temp.expect(
      (
        SELECT c.relrowsecurity
           AND NOT EXISTS (
             SELECT 1
             FROM pg_policy pol
             WHERE pol.polrelid = c.oid
           )
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public'
          AND c.relname = split_part(rel, '.', 2)
      ),
      'rls closed ' || rel);

    FOREACH actor IN ARRAY ARRAY['anon', 'authenticated']
    LOOP
      PERFORM pg_temp.expect(
        NOT has_table_privilege(actor, rel, 'SELECT'),
        actor || ' select ' || rel);
      PERFORM pg_temp.expect(
        NOT has_table_privilege(actor, rel, 'INSERT'),
        actor || ' insert ' || rel);
    END LOOP;
  END LOOP;

  PERFORM pg_temp.expect(
    has_table_privilege('service_role', 'public.app_settings', 'SELECT'),
    'service_role select');

  PERFORM pg_temp.expect(
    (SELECT count(*) = 11 FROM public.app_settings),
    'seed count');
  PERFORM pg_temp.expect(
    (SELECT value = 'true'::jsonb FROM public.app_settings WHERE key = 'preview.enabled'),
    'seed enabled');
  PERFORM pg_temp.expect(
    (SELECT value = '3'::jsonb FROM public.app_settings WHERE key = 'preview.trial_days'),
    'seed trial_days');
  PERFORM pg_temp.expect(
    (SELECT value = '26214400'::jsonb FROM public.app_settings WHERE key = 'preview.max_asset_bytes'),
    'seed max_asset_bytes');
  PERFORM pg_temp.expect(
    (SELECT value = 'true'::jsonb FROM public.app_settings WHERE key = 'preview.sanitize_enabled'),
    'seed sanitize');
  PERFORM pg_temp.expect(
    (SELECT value = 'true'::jsonb FROM public.app_settings WHERE key = 'preview.require_verified_email'),
    'seed verified email');
  PERFORM pg_temp.expect(
    (
      SELECT value = '["image/png","image/jpeg","image/webp","image/gif"]'::jsonb
      FROM public.app_settings
      WHERE key = 'preview.allowed_asset_mime'
    ),
    'seed mime');
  PERFORM pg_temp.expect(
    (SELECT value = '6'::jsonb FROM public.app_settings WHERE key = 'preview.publish_rate_limit_per_min'),
    'seed publish rate');
  PERFORM pg_temp.expect(
    (SELECT value = '20'::jsonb FROM public.app_settings WHERE key = 'preview.asset_rate_limit_per_min'),
    'seed asset rate');
  PERFORM pg_temp.expect(
    (SELECT value = 'true'::jsonb FROM public.app_settings WHERE key = 'preview.notify_enabled'),
    'seed notify');
  PERFORM pg_temp.expect(
    (SELECT value = '60'::jsonb FROM public.app_settings WHERE key = 'preview.notify_interval_minutes'),
    'seed notify interval');
  PERFORM pg_temp.expect(
    (SELECT value = '50'::jsonb FROM public.app_settings WHERE key = 'preview.notify_batch'),
    'seed notify batch');
  PERFORM pg_temp.expect(
    NOT EXISTS (
      SELECT 1
      FROM public.app_settings
      WHERE split_part(key, '.', 1) IN ('domains', 'email', 'dns')
         OR key = 'preview.warning_day'
    ),
    'seed excludes env keys');
  PERFORM pg_temp.expect(
    NOT EXISTS (
      SELECT 1 FROM public.app_settings WHERE key LIKE 'preview.%' AND description IS NULL
    ),
    'seed descriptions');
  PERFORM pg_temp.expect(
    (SELECT count(*) = 11 FROM public.app_settings_audit WHERE op = 'INSERT' AND key LIKE 'preview.%'),
    'seed audit inserts');

  INSERT INTO public.app_settings (key, value, updated_by)
  VALUES ('qa.audit', '1'::jsonb, 'alta');

  SELECT id, old_value, new_value, changed_by
  INTO audit_id, audit_old, audit_new, audit_by
  FROM public.app_settings_audit
  WHERE key = 'qa.audit' AND op = 'INSERT';
  PERFORM pg_temp.expect(audit_id IS NOT NULL, 'audit insert row');
  PERFORM pg_temp.expect(audit_old IS NULL, 'audit insert old');
  PERFORM pg_temp.expect(audit_new = '1'::jsonb, 'audit insert new');
  PERFORM pg_temp.expect(audit_by = 'alta', 'audit insert by');

  UPDATE public.app_settings
  SET value = '2'::jsonb,
      updated_by = 'edita',
      updated_at = timestamptz '2000-01-01'
  WHERE key = 'qa.audit';
  PERFORM pg_temp.expect(
    (SELECT updated_at > now() - interval '1 minute' FROM public.app_settings WHERE key = 'qa.audit'),
    'updated_at trigger');

  SELECT old_value, new_value, changed_by
  INTO audit_old, audit_new, audit_by
  FROM public.app_settings_audit
  WHERE key = 'qa.audit' AND op = 'UPDATE';
  PERFORM pg_temp.expect(audit_old = '1'::jsonb, 'audit update old');
  PERFORM pg_temp.expect(audit_new = '2'::jsonb, 'audit update new');
  PERFORM pg_temp.expect(audit_by = 'edita', 'audit update by');

  DELETE FROM public.app_settings WHERE key = 'qa.audit';
  SELECT old_value, new_value, changed_by
  INTO audit_old, audit_new, audit_by
  FROM public.app_settings_audit
  WHERE key = 'qa.audit' AND op = 'DELETE';
  PERFORM pg_temp.expect(audit_old = '2'::jsonb, 'audit delete old');
  PERFORM pg_temp.expect(audit_new IS NULL, 'audit delete new');
  PERFORM pg_temp.expect(audit_by = current_user, 'audit delete by');

  SELECT preview_started_at INTO started FROM public.tenants WHERE slug = 'aswin2';
  SELECT * INTO r FROM public.get_public_tenant_site(p_slug => 'aswin2');
  PERFORM pg_temp.expect(r.serving_state = 'serving' AND r.is_serving, 'window 2d serving');
  PERFORM pg_temp.expect(r.exported_html = 'html-aswin2', 'window 2d html');
  PERFORM pg_temp.expect(
    r.preview_expires_at = started + (3 * interval '1 day'),
    'window 2d expires');

  SELECT preview_started_at INTO started FROM public.tenants WHERE slug = 'aswin4';
  SELECT * INTO r FROM public.get_public_tenant_site(p_slug => 'aswin4');
  PERFORM pg_temp.expect(r.serving_state = 'expired' AND NOT r.is_serving, 'window 4d expired');
  PERFORM pg_temp.expect(r.exported_html IS NULL, 'window 4d html');
  PERFORM pg_temp.expect(
    r.preview_expires_at = started + (3 * interval '1 day'),
    'window 4d expires');

  UPDATE public.app_settings
  SET value = '5'::jsonb, updated_by = 'qa'
  WHERE key = 'preview.trial_days';
  SELECT * INTO r FROM public.get_public_tenant_site(p_slug => 'aswin4');
  PERFORM pg_temp.expect(r.serving_state = 'serving' AND r.is_serving, 'setting 5 serves');
  PERFORM pg_temp.expect(
    r.preview_expires_at = started + (5 * interval '1 day'),
    'setting 5 expires');

  UPDATE public.app_settings
  SET value = '3'::jsonb, updated_by = 'qa'
  WHERE key = 'preview.trial_days';
  SELECT * INTO r FROM public.get_public_tenant_site(p_slug => 'aswin4');
  PERFORM pg_temp.expect(r.serving_state = 'expired', 'setting restored 3');

  SELECT * INTO r FROM public.get_public_tenant_site(p_slug => 'aswin4', p_trial_days => 10);
  PERFORM pg_temp.expect(r.serving_state = 'serving' AND r.is_serving, 'explicit days override');
  PERFORM pg_temp.expect(
    r.preview_expires_at = started + (10 * interval '1 day'),
    'explicit days expires');
  SELECT * INTO r FROM public.get_public_tenant_site(p_slug => 'aswin4');
  PERFORM pg_temp.expect(r.serving_state = 'expired', 'omitted days still uses setting');

  UPDATE public.app_settings
  SET value = 'false'::jsonb, updated_by = 'qa'
  WHERE key = 'preview.enabled';
  SELECT * INTO r FROM public.get_public_tenant_site(p_slug => 'aswin2', p_trial_days => 30);
  PERFORM pg_temp.expect(r.serving_state = 'expired' AND NOT r.is_serving, 'disabled ignores argument');
  PERFORM pg_temp.expect(r.exported_html IS NULL, 'disabled html');
  SELECT * INTO r FROM public.get_public_tenant_site(p_slug => 'aswin2');
  PERFORM pg_temp.expect(r.serving_state = 'expired', 'disabled omitted argument');

  SELECT * INTO r FROM public.get_public_tenant_site(p_slug => 'aswinp');
  PERFORM pg_temp.expect(r.serving_state = 'serving' AND r.is_serving AND r.is_paid, 'paid while disabled');
  PERFORM pg_temp.expect(r.preview_expires_at IS NULL, 'paid expires');
  PERFORM pg_temp.expect(r.exported_html = 'html-aswinp', 'paid html');
  SELECT * INTO r FROM public.get_public_tenant_site(p_slug => 'aswinp', p_trial_days => 1);
  PERFORM pg_temp.expect(r.serving_state = 'serving' AND r.is_paid, 'paid ignores trial argument');

  UPDATE public.app_settings
  SET value = 'true'::jsonb, updated_by = 'qa'
  WHERE key = 'preview.enabled';
  UPDATE public.app_settings
  SET value = '"abc"'::jsonb, updated_by = 'qa'
  WHERE key = 'preview.trial_days';
  PERFORM pg_temp.expect(public.app_setting_int('preview.trial_days', 14) = 14, 'helper abc');
  PERFORM pg_temp.expect(public.app_setting_int('preview.missing', 9) = 9, 'helper missing');
  SELECT * INTO r FROM public.get_public_tenant_site(p_slug => 'aswin4');
  PERFORM pg_temp.expect(r.serving_state = 'serving' AND r.is_serving, 'abc falls back to 14');
  PERFORM pg_temp.expect(
    r.preview_expires_at = started + (14 * interval '1 day'),
    'abc expires at 14');

  UPDATE public.app_settings
  SET value = '3.5'::jsonb, updated_by = 'qa'
  WHERE key = 'preview.trial_days';
  PERFORM pg_temp.expect(public.app_setting_int('preview.trial_days', 14) = 14, 'helper fraction');
  UPDATE public.app_settings
  SET value = '9223372036854775807'::jsonb, updated_by = 'qa'
  WHERE key = 'preview.trial_days';
  PERFORM pg_temp.expect(public.app_setting_int('preview.trial_days', 14) = 14, 'helper overflow');

  UPDATE public.app_settings
  SET value = '"no"'::jsonb, updated_by = 'qa'
  WHERE key = 'preview.enabled';
  PERFORM pg_temp.expect(public.app_setting_bool('preview.enabled', true), 'helper bad bool uses default');
  PERFORM pg_temp.expect(
    NOT public.app_setting_bool('preview.enabled', false),
    'helper bad bool keeps caller default');
  UPDATE public.app_settings
  SET value = '3'::jsonb, updated_by = 'qa'
  WHERE key = 'preview.trial_days';
  SELECT * INTO r FROM public.get_public_tenant_site(p_slug => 'aswin2');
  PERFORM pg_temp.expect(r.serving_state = 'serving', 'bad enabled flag falls open');

  PERFORM pg_temp.expect(
    (
      SELECT pg_get_function_arguments(p.oid) LIKE '%p_trial_days integer DEFAULT NULL%'
         AND pg_get_function_arguments(p.oid) NOT LIKE '%DEFAULT 14%'
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public' AND p.proname = 'get_public_tenant_site'
    ),
    'argument default is null');
  PERFORM pg_temp.expect(
    NOT has_function_privilege('service_role', 'public.app_setting_int(text, integer)', 'EXECUTE'),
    'service_role cannot call int helper');
  PERFORM pg_temp.expect(
    NOT has_function_privilege('anon', 'public.app_setting_int(text, integer)', 'EXECUTE'),
    'anon cannot call int helper');
  PERFORM pg_temp.expect(
    NOT has_function_privilege('authenticated', 'public.app_setting_bool(text, boolean)', 'EXECUTE'),
    'authenticated cannot call bool helper');
END
$tests$;

SET ROLE anon;
DO $deny$
BEGIN
  PERFORM 1 FROM public.app_settings;
  RAISE EXCEPTION 'anon select app_settings succeeded';
EXCEPTION
  WHEN insufficient_privilege THEN
    NULL;
END
$deny$;
DO $deny$
BEGIN
  INSERT INTO public.app_settings (key, value) VALUES ('qa.anon', '1'::jsonb);
  RAISE EXCEPTION 'anon insert app_settings succeeded';
EXCEPTION
  WHEN insufficient_privilege THEN
    NULL;
END
$deny$;
DO $deny$
BEGIN
  PERFORM 1 FROM public.app_settings_audit;
  RAISE EXCEPTION 'anon select audit succeeded';
EXCEPTION
  WHEN insufficient_privilege THEN
    NULL;
END
$deny$;
DO $deny$
BEGIN
  INSERT INTO public.app_settings_audit (key, op) VALUES ('qa.anon', 'INSERT');
  RAISE EXCEPTION 'anon insert audit succeeded';
EXCEPTION
  WHEN insufficient_privilege THEN
    NULL;
END
$deny$;
SELECT public.get_public_tenant_site('aswin2', NULL);
DO $deny$
BEGIN
  PERFORM public.app_setting_int('preview.trial_days', 14);
  RAISE EXCEPTION 'anon executed app_setting_int';
EXCEPTION
  WHEN insufficient_privilege THEN
    NULL;
END
$deny$;
RESET ROLE;

SET ROLE authenticated;
DO $deny$
BEGIN
  PERFORM 1 FROM public.app_settings;
  RAISE EXCEPTION 'authenticated select app_settings succeeded';
EXCEPTION
  WHEN insufficient_privilege THEN
    NULL;
END
$deny$;
DO $deny$
BEGIN
  INSERT INTO public.app_settings (key, value) VALUES ('qa.auth', '1'::jsonb);
  RAISE EXCEPTION 'authenticated insert app_settings succeeded';
EXCEPTION
  WHEN insufficient_privilege THEN
    NULL;
END
$deny$;
DO $deny$
BEGIN
  PERFORM 1 FROM public.app_settings_audit;
  RAISE EXCEPTION 'authenticated select audit succeeded';
EXCEPTION
  WHEN insufficient_privilege THEN
    NULL;
END
$deny$;
DO $deny$
BEGIN
  INSERT INTO public.app_settings_audit (key, op) VALUES ('qa.auth', 'INSERT');
  RAISE EXCEPTION 'authenticated insert audit succeeded';
EXCEPTION
  WHEN insufficient_privilege THEN
    NULL;
END
$deny$;
RESET ROLE;

SET ROLE service_role;
DO $sr$
BEGIN
  IF (SELECT count(*) FROM public.app_settings) <> 11 THEN
    RAISE EXCEPTION 'service_role cannot read app_settings';
  END IF;
  BEGIN
    PERFORM public.app_setting_int('preview.trial_days', 14);
    RAISE EXCEPTION 'service_role executed app_setting_int';
  EXCEPTION
    WHEN insufficient_privilege THEN
      NULL;
  END;
END
$sr$;
RESET ROLE;

ROLLBACK;
