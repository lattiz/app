CREATE TABLE IF NOT EXISTS public.site_schemas (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  template_id   TEXT REFERENCES public.templates(id),
  grapesjs_json JSONB NOT NULL,
  exported_html TEXT,
  status        TEXT NOT NULL DEFAULT 'draft'
                CHECK (status IN ('draft', 'published')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at  TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS site_schemas_tenant_id_idx
  ON public.site_schemas (tenant_id);

ALTER TABLE public.site_schemas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "site_schemas_select_own" ON public.site_schemas;
CREATE POLICY "site_schemas_select_own"
  ON public.site_schemas FOR SELECT
  USING (
    tenant_id IN (SELECT id FROM public.tenants WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "site_schemas_insert_own" ON public.site_schemas;
CREATE POLICY "site_schemas_insert_own"
  ON public.site_schemas FOR INSERT
  WITH CHECK (
    tenant_id IN (SELECT id FROM public.tenants WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "site_schemas_update_own" ON public.site_schemas;
CREATE POLICY "site_schemas_update_own"
  ON public.site_schemas FOR UPDATE
  USING (
    tenant_id IN (SELECT id FROM public.tenants WHERE user_id = auth.uid())
  );;
