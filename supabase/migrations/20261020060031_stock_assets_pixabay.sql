-- Pixabay replaces Pexels as the stock-photo provider. Existing rows with
-- provider = 'pexels' stay; new imports write 'pixabay'.
ALTER TABLE public.tenant_stock_assets
  DROP CONSTRAINT IF EXISTS tenant_stock_assets_provider_check;

ALTER TABLE public.tenant_stock_assets
  ADD CONSTRAINT tenant_stock_assets_provider_check
  CHECK (provider IN ('pexels', 'pixabay'));
