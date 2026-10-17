-- Classification and lifecycle on public.templates. retired_at marks a retired
-- template; is_active = false with retired_at NULL is a seed still pending activation.
-- New view columns are appended: CREATE OR REPLACE cannot reorder or drop columns.

ALTER TABLE public.templates
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS retired_at timestamptz,
  ADD COLUMN IF NOT EXISTS kit_meta jsonb;

DROP TRIGGER IF EXISTS templates_set_updated_at ON public.templates;
CREATE TRIGGER templates_set_updated_at
  BEFORE UPDATE ON public.templates
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'templates_retired_at_check'
      AND conrelid = 'public.templates'::regclass
  ) THEN
    ALTER TABLE public.templates
      ADD CONSTRAINT templates_retired_at_check
      CHECK (retired_at IS NULL OR is_active = false);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS templates_active_sort_order_idx
  ON public.templates (sort_order)
  WHERE is_active;

CREATE OR REPLACE VIEW admin.template_usage AS
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
  COALESCE(archives.archived_count, 0) AS archived_count,
  tpl.tags,
  tpl.featured,
  tpl.updated_at,
  tpl.retired_at,
  tpl.thumbnail_url,
  tpl.preview_url,
  tpl.description
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
