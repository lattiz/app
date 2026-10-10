# Acceso a plantillas por plan

Contra la base local tras `supabase db reset --local`. Ninguno deja datos: el de RLS termina en `ROLLBACK` y el pre-check es `READ ONLY`.

```bash
DB="postgresql://postgres:postgres@127.0.0.1:54322/postgres"
psql "$DB" -v ON_ERROR_STOP=1 -f supabase/tests/template_access/template_access_rls.sql
psql "$DB" -v ON_ERROR_STOP=1 -f supabase/tests/template_access/precheck_pro_templates.sql
```

- `template_access_rls.sql`: `anon` y `authenticated` no pueden cambiar `site_schemas.template_id` ni `tenants.plan`, ni leer o escribir `template_archives`; archivar + reemplazar es atómico; `templates.tier` tiene default `basic` y CHECK.
- `precheck_pro_templates.sql`: antes de re-sembrar plantillas como `pro`, lista los tenants que no tienen Pro y usan una de ellas (por defecto ÓXIDO, Norte y Concreto; otras con `-v pro_ids="'a','b'"`). No resuelve nada: cada caso es decisión del dueño.

Sin psql local, se puede usar el del contenedor: `docker exec -i supabase_db_<proyecto> psql -U postgres -v ON_ERROR_STOP=1 < archivo.sql`.
