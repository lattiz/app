-- included_domain_used_at exists, backfill picks the earliest real managed purchase,
-- and authenticated cannot write the column.
-- Run: psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -v ON_ERROR_STOP=1 -f supabase/tests/domain_renewal/tenant_included_domain_used.sql
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

DO $tests$
DECLARE
  v_managed uuid;
  v_mock uuid;
  v_own uuid;
BEGIN
  PERFORM pg_temp.expect(
    (
      SELECT data_type = 'timestamp with time zone'
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'tenants'
        AND column_name = 'included_domain_used_at'
    ),
    'column exists');

  PERFORM pg_temp.expect(
    NOT has_column_privilege(
      'authenticated',
      'public.tenants',
      'included_domain_used_at',
      'UPDATE'
    ),
    'authenticated column privilege');
  PERFORM pg_temp.expect(
    NOT has_column_privilege(
      'anon',
      'public.tenants',
      'included_domain_used_at',
      'UPDATE'
    ),
    'anon column privilege');

  INSERT INTO public.tenants (slug, name, plan, status)
  VALUES ('included-managed', 'Included Managed', 'basico', 'active')
  RETURNING id INTO v_managed;
  INSERT INTO public.tenants (slug, name, plan, status)
  VALUES ('included-mock', 'Included Mock', 'basico', 'active')
  RETURNING id INTO v_mock;
  INSERT INTO public.tenants (slug, name, plan, status)
  VALUES ('included-own', 'Included Own', 'basico', 'active')
  RETURNING id INTO v_own;

  INSERT INTO public.domains (
    tenant_id, domain, tld, source, is_mock, purchase_completed_at
  ) VALUES
    (v_managed, 'managed.example', 'example', 'lattiz_managed', false, '2024-03-15T00:00:00Z'),
    (v_mock, 'mock.example', 'example', 'lattiz_managed', true, '2024-01-01T00:00:00Z'),
    (v_own, 'own.example', 'example', 'user_provided', false, '2024-02-01T00:00:00Z');

  -- Same statement as the migration, reapplied to rows inserted after it ran.
  UPDATE public.tenants AS t
  SET included_domain_used_at = earliest.purchase_completed_at
  FROM (
    SELECT tenant_id, MIN(purchase_completed_at) AS purchase_completed_at
    FROM public.domains
    WHERE source = 'lattiz_managed'
      AND is_mock = false
      AND purchase_completed_at IS NOT NULL
    GROUP BY tenant_id
  ) AS earliest
  WHERE t.id = earliest.tenant_id
    AND t.id IN (v_managed, v_mock, v_own);

  PERFORM pg_temp.expect(
    (
      SELECT included_domain_used_at = '2024-03-15T00:00:00Z'::timestamptz
      FROM public.tenants
      WHERE id = v_managed
    ),
    'backfill stamps the real managed purchase');
  PERFORM pg_temp.expect(
    (
      SELECT included_domain_used_at IS NULL
      FROM public.tenants
      WHERE id = v_mock
    ),
    'mock purchase is ignored');
  PERFORM pg_temp.expect(
    (
      SELECT included_domain_used_at IS NULL
      FROM public.tenants
      WHERE id = v_own
    ),
    'user provided domain is ignored');
END
$tests$;

SET ROLE authenticated;
DO $deny$
BEGIN
  UPDATE public.tenants SET included_domain_used_at = now();
  RAISE EXCEPTION 'authenticated updated included_domain_used_at';
EXCEPTION
  WHEN insufficient_privilege THEN
    NULL;
END
$deny$;
RESET ROLE;

ROLLBACK;
