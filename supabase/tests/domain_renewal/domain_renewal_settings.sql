-- Domain renewal columns, amount check, and app_settings seed.
-- Run: psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -v ON_ERROR_STOP=1 -f supabase/tests/domain_renewal/domain_renewal_settings.sql
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
  v_tenant uuid;
  v_domain uuid;
  v_rejected boolean;
BEGIN
  PERFORM pg_temp.expect(
    (
      SELECT count(*) = 11
      FROM public.app_settings
      WHERE key IN (
        'domain.renewal.enabled',
        'domain.renewal.fee_basic_mxn_cents',
        'domain.renewal.fee_pro_mxn_cents',
        'domain.renewal.tax_rate_bps',
        'domain.renewal.open_days_before',
        'domain.renewal.notice_days_before',
        'domain.renewal.late_days',
        'domain.renewal.late_notice_days_after',
        'domain.renewal.max_registrar_attempts',
        'domain.renewal.balance_alert_days',
        'alerts.admin_email'
      )
    ),
    'seed count');

  PERFORM pg_temp.expect(
    (
      SELECT value = 'true'::jsonb AND jsonb_typeof(value) = 'boolean'
      FROM public.app_settings
      WHERE key = 'domain.renewal.enabled'
    ),
    'enabled bool');
  PERFORM pg_temp.expect(
    (
      SELECT value = '59900'::jsonb AND jsonb_typeof(value) = 'number'
      FROM public.app_settings
      WHERE key = 'domain.renewal.fee_basic_mxn_cents'
    ),
    'fee basic number');
  PERFORM pg_temp.expect(
    (
      SELECT value = '59900'::jsonb AND jsonb_typeof(value) = 'number'
      FROM public.app_settings
      WHERE key = 'domain.renewal.fee_pro_mxn_cents'
    ),
    'fee pro number');
  PERFORM pg_temp.expect(
    (
      SELECT value = '1600'::jsonb AND jsonb_typeof(value) = 'number'
      FROM public.app_settings
      WHERE key = 'domain.renewal.tax_rate_bps'
    ),
    'tax rate number');
  PERFORM pg_temp.expect(
    (
      SELECT value = '28'::jsonb AND jsonb_typeof(value) = 'number'
      FROM public.app_settings
      WHERE key = 'domain.renewal.open_days_before'
    ),
    'open days number');
  PERFORM pg_temp.expect(
    (
      SELECT value = '[28,14,7,3,1,0]'::jsonb AND jsonb_typeof(value) = 'array'
      FROM public.app_settings
      WHERE key = 'domain.renewal.notice_days_before'
    ),
    'notice days array');
  PERFORM pg_temp.expect(
    (
      SELECT value = '15'::jsonb AND jsonb_typeof(value) = 'number'
      FROM public.app_settings
      WHERE key = 'domain.renewal.late_days'
    ),
    'late days number');
  PERFORM pg_temp.expect(
    (
      SELECT value = '[7]'::jsonb AND jsonb_typeof(value) = 'array'
      FROM public.app_settings
      WHERE key = 'domain.renewal.late_notice_days_after'
    ),
    'late notice array');
  PERFORM pg_temp.expect(
    (
      SELECT value = '5'::jsonb AND jsonb_typeof(value) = 'number'
      FROM public.app_settings
      WHERE key = 'domain.renewal.max_registrar_attempts'
    ),
    'registrar attempts number');
  PERFORM pg_temp.expect(
    (
      SELECT value = '30'::jsonb AND jsonb_typeof(value) = 'number'
      FROM public.app_settings
      WHERE key = 'domain.renewal.balance_alert_days'
    ),
    'balance alert number');
  PERFORM pg_temp.expect(
    (
      SELECT value = '"avisos@lattiz.app"'::jsonb AND jsonb_typeof(value) = 'string'
      FROM public.app_settings
      WHERE key = 'alerts.admin_email'
    ),
    'admin email string');
  PERFORM pg_temp.expect(
    NOT EXISTS (
      SELECT 1
      FROM public.app_settings
      WHERE key IN (
        'domain.renewal.enabled',
        'domain.renewal.fee_basic_mxn_cents',
        'domain.renewal.fee_pro_mxn_cents',
        'domain.renewal.tax_rate_bps',
        'domain.renewal.open_days_before',
        'domain.renewal.notice_days_before',
        'domain.renewal.late_days',
        'domain.renewal.late_notice_days_after',
        'domain.renewal.max_registrar_attempts',
        'domain.renewal.balance_alert_days',
        'alerts.admin_email'
      )
        AND (description IS NULL OR updated_by IS DISTINCT FROM 'migration')
    ),
    'seed descriptions');

  PERFORM pg_temp.expect(
    (
      SELECT count(*) = 9
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'domain_maintenance_cycles'
        AND (
          (column_name = 'base_amount_cents' AND data_type = 'integer')
          OR (column_name = 'tax_amount_cents' AND data_type = 'integer')
          OR (column_name = 'plan_at_open' AND data_type = 'text')
          OR (column_name = 'opened_at' AND data_type = 'timestamp with time zone')
          OR (column_name = 'overdue_at' AND data_type = 'timestamp with time zone')
          OR (column_name = 'site_offline_at' AND data_type = 'timestamp with time zone')
          OR (column_name = 'late_deadline_at' AND data_type = 'timestamp with time zone')
          OR (column_name = 'admin_alert_kind' AND data_type = 'text')
          OR (column_name = 'admin_alerted_at' AND data_type = 'timestamp with time zone')
        )
    ),
    'new columns');
  PERFORM pg_temp.expect(
    EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conname = 'cycle_amount_matches_parts'
        AND conrelid = 'public.domain_maintenance_cycles'::regclass
    ),
    'amount constraint exists');

  INSERT INTO public.tenants (slug, name, plan, status)
  VALUES ('renewalqa', 'Renewal QA', 'basico', 'active')
  RETURNING id INTO v_tenant;

  INSERT INTO public.domains (tenant_id, domain, tld)
  VALUES (v_tenant, 'renewalqa.example', 'example')
  RETURNING id INTO v_domain;

  v_rejected := false;
  BEGIN
    INSERT INTO public.domain_maintenance_cycles (
      tenant_id, domain_id, expires_at, status,
      amount_cents, base_amount_cents, tax_amount_cents
    ) VALUES (
      v_tenant, v_domain, now() + interval '30 days', 'open',
      100, 80, 10
    );
  EXCEPTION
    WHEN check_violation THEN
      IF SQLERRM NOT LIKE '%cycle_amount_matches_parts%' THEN
        RAISE;
      END IF;
      v_rejected := true;
  END;
  PERFORM pg_temp.expect(v_rejected, 'mismatch rejected');

  INSERT INTO public.domain_maintenance_cycles (
    tenant_id, domain_id, expires_at, status,
    amount_cents, base_amount_cents, tax_amount_cents, plan_at_open
  ) VALUES (
    v_tenant, v_domain, now() + interval '30 days', 'open',
    69484, 59900, 9584, 'basico'
  );
  PERFORM pg_temp.expect(
    (
      SELECT amount_cents = 69484
         AND base_amount_cents = 59900
         AND tax_amount_cents = 9584
      FROM public.domain_maintenance_cycles
      WHERE domain_id = v_domain
    ),
    'matching cycle accepted');
END
$tests$;

ROLLBACK;
