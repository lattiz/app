-- ROLLBACK de 20261010085952_tenant_included_domain_used.sql. NO está en migrations/: no se aplica solo.
-- Para usarlo: copiar su contenido a una migración nueva (`supabase migration new revert_tenant_included_domain_used`)
-- y aplicarla con `supabase db push`. Se pierde la marca de que la cuenta ya usó su dominio incluido.

ALTER TABLE public.tenants
  DROP COLUMN IF EXISTS included_domain_used_at;
