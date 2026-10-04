-- tenant-sites now reads through public.get_public_tenant_site() only. Apply this AFTER that app is
-- deployed: until then the previous tenant-sites release still queries these tables as anon.
--
-- Leaves anon with no table access here, so the anon key (public by design) can no longer read
-- stripe ids, user ids or exported HTML of a suspended tenant straight from the REST API.
DROP POLICY IF EXISTS "tenants_public_read_active" ON public.tenants;
DROP POLICY IF EXISTS "site_schemas_public_read_published" ON public.site_schemas;
DROP POLICY IF EXISTS "tenant_analytics_public_ready" ON public.tenant_analytics;

REVOKE ALL ON public.tenants FROM anon;
REVOKE ALL ON public.site_schemas FROM anon;
REVOKE ALL ON public.tenant_analytics FROM anon;
