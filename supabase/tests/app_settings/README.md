# app_settings

Comprueba la tabla de configuración, su historial y que `get_public_tenant_site` lee la ventana de prueba desde ahí. La transacción termina en `ROLLBACK`.

```bash
supabase db reset --local
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -v ON_ERROR_STOP=1 -f supabase/tests/app_settings/app_settings.sql
```
