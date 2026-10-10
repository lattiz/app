-- Template access by plan: a tier per template, and an archive of tenant projects
-- taken before any replacement. Nothing here locks a tenant: every existing
-- template defaults to 'basic'; tiers change only when a template is re-seeded.

ALTER TABLE public.templates
  ADD COLUMN IF NOT EXISTS tier text NOT NULL DEFAULT 'basic';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'templates_tier_check'
  ) THEN
    ALTER TABLE public.templates
      ADD CONSTRAINT templates_tier_check CHECK (tier IN ('basic', 'pro'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS templates_tier_idx ON public.templates (tier);

-- Server-only: the API archives a tenant's project before replacing it. Tenants
-- never read or write it directly, so RLS is on with no policy and grants are revoked.
CREATE TABLE IF NOT EXISTS public.template_archives (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  template_id   text,
  project_data  jsonb NOT NULL,
  exported_html text,
  reason        text NOT NULL,
  archived_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS template_archives_tenant_idx
  ON public.template_archives (tenant_id, archived_at DESC);

ALTER TABLE public.template_archives ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.template_archives FROM anon, authenticated;
