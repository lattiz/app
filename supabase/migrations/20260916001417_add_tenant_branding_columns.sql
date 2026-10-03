ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS favicon_light_url TEXT,
  ADD COLUMN IF NOT EXISTS favicon_dark_url TEXT,
  ADD COLUMN IF NOT EXISTS social_preview_url TEXT;

COMMENT ON COLUMN public.tenants.favicon_light_url IS 'Public Storage URL of the light-scheme favicon; null falls back to the Lattiz default.';
COMMENT ON COLUMN public.tenants.favicon_dark_url IS 'Public Storage URL of the dark-scheme favicon; null falls back to the Lattiz default.';
COMMENT ON COLUMN public.tenants.social_preview_url IS 'Public Storage URL of the OG image; null falls back to the auto-generated /api/og image.';;
