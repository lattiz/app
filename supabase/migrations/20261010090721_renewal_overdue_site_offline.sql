-- A tenant whose domain renewal is overdue (expired and unpaid, inside the late window) is not
-- served at all: neither on the custom domain nor on the Lattiz subdomain. Paying moves the cycle
-- to 'paid' and losing the domain moves it to 'lapsed'; both bring the site back on its own.
CREATE OR REPLACE FUNCTION public.tenant_site_is_entitled(p_tenant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT COALESCE(
    (SELECT s.status IN ('active', 'trialing', 'past_due') AND s.current_period_end > now()
     FROM public.subscriptions s
     WHERE s.tenant_id = p_tenant_id
     ORDER BY s.created_at DESC
     LIMIT 1),
    false)
    AND NOT EXISTS (
      SELECT 1
      FROM public.domain_maintenance_cycles c
      WHERE c.tenant_id = p_tenant_id
        AND c.status = 'overdue'
    )
$$;

REVOKE ALL ON FUNCTION public.tenant_site_is_entitled(uuid) FROM PUBLIC, anon, authenticated;
