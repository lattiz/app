-- ROLLBACK de 20261017091113_admin_read_models.sql. NO está en migrations/: no se aplica solo.
-- Para usarlo: copiar su contenido a una migración nueva (`supabase migration new revert_admin_read_models`)
-- y aplicarla con `supabase db push`. Se pierden las vistas de lectura del panel admin.

DROP VIEW IF EXISTS admin.subscription_overview;
DROP VIEW IF EXISTS admin.template_usage;
DROP VIEW IF EXISTS admin.tenant_overview;
