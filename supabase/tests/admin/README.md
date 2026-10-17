# admin schema

Comprueba que `anon` y `authenticated` no pueden leer `admin.members`, `admin.audit_log` ni `admin.tenant_flags`, que un `role` inválido se rechaza, que la auditoría solo acepta inserciones, y que borrar un tenant o un usuario borra en cascada su marca o su membresía. La transacción termina en `ROLLBACK`.

`psql` no está en el host; hay que ejecutarlo dentro del contenedor de la base local, desde la raíz del repo:

```bash
supabase db reset --local
docker exec -i supabase_db_lattiz psql -U postgres -d postgres -v ON_ERROR_STOP=1 < supabase/tests/admin/admin_schema.sql
```
