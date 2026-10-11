-- Server-only: one row per stock photo a tenant imported into its assets, so the
-- provider's attribution (photographer, source page) is kept next to the R2 copy.
-- Tenants never read or write it directly, so RLS is on with no policy and grants are revoked.
CREATE TABLE IF NOT EXISTS public.tenant_stock_assets (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  provider          text NOT NULL CHECK (provider IN ('pexels')),
  provider_photo_id text NOT NULL,
  photographer      text,
  photographer_url  text,
  photo_url         text,
  asset_id          uuid NOT NULL,
  src               text NOT NULL,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tenant_stock_assets_tenant_idx
  ON public.tenant_stock_assets (tenant_id, created_at DESC);

ALTER TABLE public.tenant_stock_assets ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.tenant_stock_assets FROM anon, authenticated;
