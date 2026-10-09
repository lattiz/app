-- ROLLBACK de 20261009025040_free_preview_window.sql. NO está en migrations/: no se aplica solo.
-- Para usarlo: copiar su contenido a una migración nueva (`supabase migration new revert_free_preview_window`)
-- y aplicarla con `supabase db push`. Pierde los relojes de prueba ya sellados (preview_started_at).
-- La función depende de la columna, por eso se quita primero.

DROP FUNCTION IF EXISTS public.get_public_tenant_site(text, text, integer);

-- Firma anterior, tal como la dejó 20261004000458 (y no cambió después).
CREATE OR REPLACE FUNCTION public.get_public_tenant_site(
  p_slug text DEFAULT NULL,
  p_domain text DEFAULT NULL
)
RETURNS TABLE (
  tenant_id uuid,
  is_serving boolean,
  tenant_name text,
  slug text,
  domain text,
  domain_live boolean,
  exported_html text,
  published_at timestamptz,
  favicon_light_url text,
  favicon_dark_url text,
  social_preview_url text,
  seo_title text,
  seo_description text,
  og_site_name text,
  ga4_measurement_id text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  WITH target AS (
    SELECT t.*, (t.status = 'active' AND public.tenant_site_is_entitled(t.id)) AS serving
    FROM public.tenants t
    WHERE (p_slug IS NOT NULL AND p_domain IS NULL AND t.slug = p_slug)
       OR (p_domain IS NOT NULL AND p_slug IS NULL AND t.domain = p_domain)
    ORDER BY t.created_at
    LIMIT 1
  )
  SELECT
    target.id,
    target.serving,
    CASE WHEN target.serving THEN target.name END,
    CASE WHEN target.serving THEN target.slug END,
    CASE WHEN target.serving THEN target.domain END,
    -- A redirect target must be reachable: DNS verified, certificate issued, mapped, a real
    -- registration, not suspended or released.
    COALESCE(target.serving
             AND d.domain = target.domain
             AND d.dns_status = 'active'
             AND d.ssl_active
             AND d.vercel_mapped
             AND NOT d.is_mock
             AND d.suspended_at IS NULL, false),
    CASE WHEN target.serving THEN ss.exported_html END,
    CASE WHEN target.serving THEN ss.published_at END,
    CASE WHEN target.serving THEN target.favicon_light_url END,
    CASE WHEN target.serving THEN target.favicon_dark_url END,
    CASE WHEN target.serving THEN target.social_preview_url END,
    CASE WHEN target.serving THEN target.seo_title END,
    CASE WHEN target.serving THEN target.seo_description END,
    CASE WHEN target.serving THEN target.og_site_name END,
    -- The tag is a Pro feature; plan is checked at read time so a downgrade stops it at once.
    CASE WHEN target.serving AND target.plan = 'pro' THEN ta.ga4_measurement_id END
  FROM target
  LEFT JOIN public.site_schemas ss ON ss.tenant_id = target.id AND ss.status = 'published'
  LEFT JOIN public.domains d ON d.tenant_id = target.id AND d.released_at IS NULL
  LEFT JOIN public.tenant_analytics ta
    ON ta.tenant_id = target.id AND ta.provisioning_status = 'ready'
$$;

REVOKE ALL ON FUNCTION public.get_public_tenant_site(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_tenant_site(text, text) TO anon, service_role;

DROP TRIGGER IF EXISTS tenants_preview_started_at_immutable ON public.tenants;
DROP FUNCTION IF EXISTS public.tenants_preview_started_at_immutable();
ALTER TABLE public.tenants DROP COLUMN IF EXISTS preview_started_at;
