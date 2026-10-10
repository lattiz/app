-- Clients cannot change which template a site uses, nor read the archives.
-- Run: psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -v ON_ERROR_STOP=1 -f supabase/tests/template_access/template_access_rls.sql
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

-- Runs `p_sql` as `p_role` (with the given JWT sub) and reports whether it was refused.
CREATE FUNCTION pg_temp.refused(p_role text, p_sub uuid, p_sql text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  v_rows integer;
BEGIN
  PERFORM set_config('request.jwt.claims', json_build_object('sub', p_sub, 'role', p_role)::text, true);
  EXECUTE format('SET LOCAL ROLE %I', p_role);
  EXECUTE p_sql;
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RESET ROLE;
  RETURN v_rows = 0;
EXCEPTION WHEN insufficient_privilege THEN
  RESET ROLE;
  RETURN true;
END;
$$;

INSERT INTO public.templates (id, name, grapesjs_json, tier)
VALUES ('rls-basic-v1', 'RLS basic', '{}'::jsonb, 'basic'),
       ('rls-pro-v1', 'RLS pro', '{}'::jsonb, 'pro');

INSERT INTO auth.users (id, email, aud, role)
VALUES ('00000000-0000-0000-0000-0000000a1101', 'rls-tenant@example.com', 'authenticated', 'authenticated');

-- on_auth_user_created already made this user's tenant; make it a paying Básico.
UPDATE public.tenants SET plan = 'basico', status = 'active'
WHERE user_id = '00000000-0000-0000-0000-0000000a1101';

INSERT INTO public.site_schemas (tenant_id, template_id, grapesjs_json)
VALUES ((SELECT id FROM public.tenants WHERE user_id = '00000000-0000-0000-0000-0000000a1101'), 'rls-pro-v1', '{"mine":true}'::jsonb);

INSERT INTO public.template_archives (tenant_id, template_id, project_data, reason)
VALUES ((SELECT id FROM public.tenants WHERE user_id = '00000000-0000-0000-0000-0000000a1101'), 'rls-basic-v1', '{"old":true}'::jsonb, 'template_switch');

SELECT pg_temp.expect(
  pg_temp.refused('authenticated', '00000000-0000-0000-0000-0000000a1101',
    $q$UPDATE public.site_schemas SET template_id = 'rls-basic-v1' WHERE tenant_id = (SELECT id FROM public.tenants WHERE user_id = '00000000-0000-0000-0000-0000000a1101')$q$),
  'authenticated owner could change site_schemas.template_id');

SELECT pg_temp.expect(
  pg_temp.refused('anon', NULL,
    $q$UPDATE public.site_schemas SET template_id = 'rls-basic-v1'$q$),
  'anon could change site_schemas.template_id');

SELECT pg_temp.expect(
  pg_temp.refused('authenticated', '00000000-0000-0000-0000-0000000a1101',
    $q$UPDATE public.tenants SET plan = 'pro' WHERE id = (SELECT id FROM public.tenants WHERE user_id = '00000000-0000-0000-0000-0000000a1101')$q$),
  'authenticated owner could change tenants.plan');

SELECT pg_temp.expect(
  pg_temp.refused('authenticated', '00000000-0000-0000-0000-0000000a1101',
    $q$SELECT * FROM public.template_archives$q$),
  'authenticated owner could read template_archives');

SELECT pg_temp.expect(
  pg_temp.refused('anon', NULL, $q$SELECT * FROM public.template_archives$q$),
  'anon could read template_archives');

SELECT pg_temp.expect(
  pg_temp.refused('authenticated', '00000000-0000-0000-0000-0000000a1101',
    $q$INSERT INTO public.template_archives (tenant_id, project_data, reason) VALUES ((SELECT id FROM public.tenants WHERE user_id = '00000000-0000-0000-0000-0000000a1101'), '{}'::jsonb, 'x')$q$),
  'authenticated owner could write template_archives');

SELECT pg_temp.expect(
  (SELECT template_id FROM public.site_schemas WHERE tenant_id = (SELECT id FROM public.tenants WHERE user_id = '00000000-0000-0000-0000-0000000a1101')) = 'rls-pro-v1',
  'site_schemas.template_id changed');

-- The archive copy the API runs is atomic: a failing replace leaves both rows as they were.
DO $$
BEGIN
  BEGIN
    INSERT INTO public.template_archives (tenant_id, template_id, project_data, exported_html, reason)
    SELECT tenant_id, template_id, grapesjs_json, exported_html, 'template_switch'
    FROM public.site_schemas WHERE tenant_id = (SELECT id FROM public.tenants WHERE user_id = '00000000-0000-0000-0000-0000000a1101')
    FOR UPDATE;
    UPDATE public.site_schemas SET template_id = 'no-such-template'
    WHERE tenant_id = (SELECT id FROM public.tenants WHERE user_id = '00000000-0000-0000-0000-0000000a1101');
  EXCEPTION WHEN foreign_key_violation THEN
    NULL;
  END;
END $$;

SELECT pg_temp.expect(
  (SELECT count(*) FROM public.template_archives WHERE tenant_id = (SELECT id FROM public.tenants WHERE user_id = '00000000-0000-0000-0000-0000000a1101')) = 1,
  'a failed replace left an extra archive row');
SELECT pg_temp.expect(
  (SELECT grapesjs_json FROM public.site_schemas WHERE tenant_id = (SELECT id FROM public.tenants WHERE user_id = '00000000-0000-0000-0000-0000000a1101')) = '{"mine":true}'::jsonb,
  'a failed replace changed the project');

SELECT pg_temp.expect(
  (SELECT tier FROM public.templates WHERE id = 'rls-basic-v1') = 'basic',
  'templates.tier default');

DO $$
BEGIN
  INSERT INTO public.templates (id, name, grapesjs_json, tier) VALUES ('rls-bad-v1', 'bad', '{}'::jsonb, 'gold');
  RAISE EXCEPTION 'templates_tier_check accepted gold';
EXCEPTION WHEN check_violation THEN
  NULL;
END $$;

ROLLBACK;
\echo 'template_access_rls: ok'
