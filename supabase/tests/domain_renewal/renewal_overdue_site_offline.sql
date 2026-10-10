-- An overdue renewal cycle takes the tenant's site offline; open, paid and lapsed cycles do not.
-- Run: psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -v ON_ERROR_STOP=1 -f supabase/tests/domain_renewal/renewal_overdue_site_offline.sql
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
  v_cycle uuid;
  v_state text;
BEGIN
  INSERT INTO public.tenants (slug, name, plan, status)
  VALUES ('renewal-offline', 'Renewal Offline', 'basico', 'active')
  RETURNING id INTO v_tenant;
  INSERT INTO public.subscriptions (
    tenant_id, stripe_subscription_id, stripe_customer_id, plan, billing_period,
    status, current_period_end)
  VALUES (v_tenant, 'sub_renewal_offline', 'cus_renewal_offline', 'basico', 'monthly',
    'active', now() + interval '20 days');
  INSERT INTO public.domains (tenant_id, domain, tld, annual_cost_usd_cents, expires_at,
    purchase_completed_at)
  VALUES (v_tenant, 'renewal-offline.com', 'com', 1198, now() - interval '2 days',
    now() - interval '363 days')
  RETURNING id INTO v_domain;

  PERFORM pg_temp.expect(public.tenant_site_is_entitled(v_tenant), 'entitled with no cycle');

  INSERT INTO public.domain_maintenance_cycles (
    tenant_id, domain_id, expires_at, status, amount_cents, base_amount_cents, tax_amount_cents)
  VALUES (v_tenant, v_domain, now() - interval '2 days', 'open', 69484, 59900, 9584)
  RETURNING id INTO v_cycle;
  PERFORM pg_temp.expect(public.tenant_site_is_entitled(v_tenant), 'entitled while open');

  UPDATE public.domain_maintenance_cycles SET status = 'overdue' WHERE id = v_cycle;
  PERFORM pg_temp.expect(NOT public.tenant_site_is_entitled(v_tenant), 'offline while overdue');
  SELECT serving_state INTO v_state
  FROM public.get_public_tenant_site(p_slug => 'renewal-offline');
  PERFORM pg_temp.expect(v_state = 'unavailable', 'subdomain unavailable while overdue');

  UPDATE public.domain_maintenance_cycles SET status = 'paid' WHERE id = v_cycle;
  PERFORM pg_temp.expect(public.tenant_site_is_entitled(v_tenant), 'back online once paid');

  UPDATE public.domain_maintenance_cycles SET status = 'lapsed' WHERE id = v_cycle;
  PERFORM pg_temp.expect(public.tenant_site_is_entitled(v_tenant), 'back online after the domain is lost');
  SELECT serving_state INTO v_state
  FROM public.get_public_tenant_site(p_slug => 'renewal-offline');
  PERFORM pg_temp.expect(v_state = 'serving', 'subdomain serving after lapse');
END;
$tests$;

ROLLBACK;
