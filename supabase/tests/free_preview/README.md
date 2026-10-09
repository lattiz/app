# Preview gratuita

Comprueba `get_public_tenant_site` contra la base local. Los INSERT van en una transacción que termina en `ROLLBACK`.

La ventana por defecto sale de `app_settings` (`preview.trial_days`, semilla 3). Un `p_trial_days` explícito la sustituye solo si `preview.enabled` es true.

```bash
supabase db reset --local
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -v ON_ERROR_STOP=1 -f supabase/tests/free_preview/free_preview_window.sql
```
