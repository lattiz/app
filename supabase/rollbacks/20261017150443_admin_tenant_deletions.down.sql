-- ROLLBACK de 20261017150443_admin_tenant_deletions.sql. NO está en migrations/: no se aplica solo.
-- Para usarlo: copiar su contenido a una migración nueva (`supabase migration new revert_admin_tenant_deletions`)
-- y aplicarla con `supabase db push`. Se pierde el historial de borrados completos de tenants.

DROP TABLE IF EXISTS admin.tenant_deletions;
