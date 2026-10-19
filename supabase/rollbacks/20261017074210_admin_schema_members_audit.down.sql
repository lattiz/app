-- ROLLBACK de 20261017074210_admin_schema_members_audit.sql. NO está en migrations/: no se aplica solo.
-- Para usarlo: copiar su contenido a una migración nueva (`supabase migration new revert_admin_schema_members_audit`)
-- y aplicarla con `supabase db push`. Se pierde el esquema admin (miembros, auditoría y marcas).

DROP TABLE IF EXISTS admin.tenant_flags;
DROP TABLE IF EXISTS admin.audit_log;
DROP TABLE IF EXISTS admin.members;
DROP FUNCTION IF EXISTS admin.audit_log_append_only();
DROP SCHEMA IF EXISTS admin;
