# admin schema

`admin_schema.sql` comprueba que `anon` y `authenticated` no pueden leer `admin.members`, `admin.audit_log` ni `admin.tenant_flags`, que un `role` inválido se rechaza, que la auditoría solo acepta inserciones, y que borrar un tenant o un usuario borra en cascada su marca o su membresía.

`admin_read_models.sql` comprueba que esos roles tampoco pueden leer `admin.tenant_overview`, `admin.template_usage`, `admin.subscription_overview`, `admin.storage_usage` ni `admin.kpi_daily`. Con datos de prueba verifica que la vista de tenant toma la suscripción más reciente, oculta un dominio liberado, alinea `entitled` con `tenant_site_is_entitled`, suma las dos carpetas de almacenamiento, y que el uso de plantilla excluye al tenant interno. Borrar el tenant borra su fila de `admin.storage_usage`.

Cada archivo abre una transacción y termina en `ROLLBACK`.

`psql` no está en el host; hay que ejecutarlo dentro del contenedor de la base local, desde la raíz del repo:

```bash
supabase db reset --local
docker exec -i supabase_db_lattiz psql -U postgres -d postgres -v ON_ERROR_STOP=1 < supabase/tests/admin/admin_schema.sql
docker exec -i supabase_db_lattiz psql -U postgres -d postgres -v ON_ERROR_STOP=1 < supabase/tests/admin/admin_read_models.sql
```
