-- ROLLBACK de 20261017121856_templates_classification.sql. NO está en migrations/: no se aplica solo.
-- Para usarlo: copiar su contenido a una migración nueva (`supabase migration new revert_templates_classification`)
-- y aplicarla con `supabase db push`. Se pierden tags, featured, updated_at, retired_at y kit_meta.
-- CREATE OR REPLACE no puede quitar columnas: hay que tirar la vista y recrear la de 20261017091113.

DROP VIEW IF EXISTS admin.template_usage;

CREATE VIEW admin.template_usage AS
SELECT
  tpl.id AS template_id,
  tpl.name,
  tpl.category,
  tpl.tier,
  tpl.is_active,
  tpl.sort_order,
  tpl.created_at,
  COALESCE(usage.tenants_using, 0) AS tenants_using,
  COALESCE(usage.sites_published, 0) AS sites_published,
  COALESCE(usage.paying_tenants, 0) AS paying_tenants,
  COALESCE(usage.trial_tenants, 0) AS trial_tenants,
  COALESCE(archives.archived_count, 0) AS archived_count
FROM public.templates tpl
LEFT JOIN (
  SELECT
    ss.template_id,
    count(*)::integer AS tenants_using,
    count(*) FILTER (WHERE ss.status = 'published')::integer AS sites_published,
    count(*) FILTER (WHERE public.tenant_site_is_entitled(t.id))::integer AS paying_tenants,
    count(*) FILTER (
      WHERE t.plan = 'none' AND t.preview_started_at IS NOT NULL
    )::integer AS trial_tenants
  FROM public.site_schemas ss
  JOIN public.tenants t ON t.id = ss.tenant_id
  LEFT JOIN admin.tenant_flags f ON f.tenant_id = t.id
  WHERE ss.template_id IS NOT NULL
    AND NOT COALESCE(f.is_internal, false)
  GROUP BY ss.template_id
) usage ON usage.template_id = tpl.id
LEFT JOIN (
  SELECT ar.template_id, count(*)::integer AS archived_count
  FROM public.template_archives ar
  LEFT JOIN admin.tenant_flags f ON f.tenant_id = ar.tenant_id
  WHERE ar.template_id IS NOT NULL
    AND NOT COALESCE(f.is_internal, false)
  GROUP BY ar.template_id
) archives ON archives.template_id = tpl.id;

REVOKE ALL ON admin.template_usage FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS templates_set_updated_at ON public.templates;
DROP INDEX IF EXISTS public.templates_active_sort_order_idx;
ALTER TABLE public.templates DROP CONSTRAINT IF EXISTS templates_retired_at_check;
ALTER TABLE public.templates
  DROP COLUMN IF EXISTS tags,
  DROP COLUMN IF EXISTS featured,
  DROP COLUMN IF EXISTS updated_at,
  DROP COLUMN IF EXISTS retired_at,
  DROP COLUMN IF EXISTS kit_meta;
