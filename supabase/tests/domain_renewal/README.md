# Renovación de dominios

Comprueba las columnas nuevas de `domain_maintenance_cycles`, el CHECK `cycle_amount_matches_parts` y las 11 claves de `app_settings`. La transacción termina en `ROLLBACK`.

```bash
supabase db reset --local
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -v ON_ERROR_STOP=1 -f supabase/tests/domain_renewal/domain_renewal_settings.sql
```
