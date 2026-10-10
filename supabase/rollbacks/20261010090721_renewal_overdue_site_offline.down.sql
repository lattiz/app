-- ROLLBACK de 20261010090721_renewal_overdue_site_offline.sql. NO está en migrations/: no se aplica solo.
-- Para usarlo: copiar su contenido a una migración nueva (`supabase migration new revert_renewal_overdue_site_offline`)
-- y aplicarla con `supabase db push`. Un sitio con la renovación del dominio vencida vuelve a servirse.

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
$$;

REVOKE ALL ON FUNCTION public.tenant_site_is_entitled(uuid) FROM PUBLIC, anon, authenticated;
