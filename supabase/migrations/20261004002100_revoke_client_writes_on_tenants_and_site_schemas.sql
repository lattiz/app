-- Clients never write these tables: the dashboard goes through the API, which connects as the table owner.
-- Left in place, a user's own JWT could set tenants.stripe_customer_id/plan/status or publish HTML
-- directly through PostgREST, bypassing the API's subscription and ownership checks.
DROP POLICY IF EXISTS "tenants_update_own" ON public.tenants;
DROP POLICY IF EXISTS "site_schemas_insert_own" ON public.site_schemas;
DROP POLICY IF EXISTS "site_schemas_update_own" ON public.site_schemas;

REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.tenants FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.site_schemas FROM anon, authenticated;
