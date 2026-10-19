-- ROLLBACK de 20261017091058_admin_snapshots.sql. NO está en migrations/: no se aplica solo.
-- Para usarlo: copiar su contenido a una migración nueva (`supabase migration new revert_admin_snapshots`)
-- y aplicarla con `supabase db push`. Se pierden las mediciones de almacenamiento y el historial de KPIs.
-- Revierte antes 20261017091113_admin_read_models.sql: admin.tenant_overview lee admin.storage_usage.

DROP INDEX IF EXISTS public.subscriptions_tenant_created_at_idx;
DROP INDEX IF EXISTS public.subscriptions_status_idx;
DROP INDEX IF EXISTS public.site_schemas_template_id_idx;
DROP TABLE IF EXISTS admin.kpi_daily;
DROP TABLE IF EXISTS admin.storage_usage;
