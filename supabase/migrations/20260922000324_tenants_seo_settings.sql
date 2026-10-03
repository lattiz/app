-- Nullable: absence means the tenant site uses its generic fallback.
ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS seo_title TEXT,
  ADD COLUMN IF NOT EXISTS seo_description TEXT,
  ADD COLUMN IF NOT EXISTS og_site_name TEXT;;
