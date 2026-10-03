-- Allow public (unauthenticated / anon key) read of PUBLISHED site schemas.
-- The tenant-sites renderer has no user JWT; drafts stay private.
DROP POLICY IF EXISTS "site_schemas_public_read_published" ON public.site_schemas;
CREATE POLICY "site_schemas_public_read_published"
  ON public.site_schemas
  FOR SELECT
  TO anon
  USING (status = 'published');

-- Allow public read of ACTIVE tenants for hostname resolution.
DROP POLICY IF EXISTS "tenants_public_read_active" ON public.tenants;
CREATE POLICY "tenants_public_read_active"
  ON public.tenants
  FOR SELECT
  TO anon
  USING (status = 'active');;
