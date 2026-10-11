-- "Datos del negocio": one JSON document per tenant, written only by the API
-- (PATCH /tenants/:tenantId/business-profile) and validated there. tenant-sites
-- reads it through get_public_tenant_site() for {{lz:*}} tokens and JSON-LD.
ALTER TABLE public.tenants
  ADD COLUMN business_profile jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.tenants
  ADD CONSTRAINT tenants_business_profile_is_object
  CHECK (jsonb_typeof(business_profile) = 'object');

-- Recreated (OUT columns changed) with business_profile and is_pro appended;
-- everything else is unchanged from 20261009060323_app_settings.sql.
DROP FUNCTION IF EXISTS public.get_public_tenant_site(text, text, integer);

CREATE FUNCTION public.get_public_tenant_site(
  p_slug text DEFAULT NULL,
  p_domain text DEFAULT NULL,
  p_trial_days integer DEFAULT NULL
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
  ga4_measurement_id text,
  is_paid boolean,
  preview_expires_at timestamptz,
  serving_state text,
  business_profile jsonb,
  is_pro boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  WITH trial AS (
    SELECT CASE
      WHEN NOT public.app_setting_bool('preview.enabled', true) THEN 0
      ELSE COALESCE(p_trial_days, public.app_setting_int('preview.trial_days', 14))
    END AS effective_days
  ),
  target AS (
    SELECT
      t.id,
      t.name,
      t.slug,
      t.domain,
      t.status,
      t.plan,
      t.preview_started_at,
      t.favicon_light_url,
      t.favicon_dark_url,
      t.social_preview_url,
      t.seo_title,
      t.seo_description,
      t.og_site_name,
      t.business_profile,
      public.tenant_site_is_entitled(t.id) AS entitled,
      trial.effective_days,
      (
        t.preview_started_at IS NOT NULL
        AND now() < t.preview_started_at + (trial.effective_days * interval '1 day')
      ) AS preview_open
    FROM public.tenants t
    CROSS JOIN trial
    WHERE (p_slug IS NOT NULL AND p_domain IS NULL AND t.slug = p_slug)
       OR (p_domain IS NOT NULL AND p_slug IS NULL AND t.domain = p_domain)
    ORDER BY t.created_at
    LIMIT 1
  ),
  marked AS (
    SELECT
      target.*,
      CASE
        WHEN target.status = 'active' AND target.entitled THEN 'serving'
        WHEN p_domain IS NULL
             AND p_slug IS NOT NULL
             AND target.status = 'active'
             AND target.plan = 'none'
             AND target.preview_open
          THEN 'serving'
        WHEN p_domain IS NULL
             AND p_slug IS NOT NULL
             AND target.status = 'active'
             AND target.plan = 'none'
             AND target.preview_started_at IS NOT NULL
             AND NOT target.entitled
             AND NOT target.preview_open
          THEN 'expired'
        ELSE 'unavailable'
      END AS state_out
    FROM target
  )
  SELECT
    marked.id,
    marked.state_out = 'serving',
    CASE WHEN marked.state_out IN ('serving', 'expired') THEN marked.name END,
    CASE WHEN marked.state_out IN ('serving', 'expired') THEN marked.slug END,
    CASE WHEN marked.state_out = 'serving' THEN marked.domain END,
    -- Redirect only when the visitor is being served and the tenant is entitled.
    -- A free preview never sends traffic to the custom domain.
    COALESCE(
      marked.state_out = 'serving'
      AND marked.entitled
      AND d.domain = marked.domain
      AND d.dns_status = 'active'
      AND d.ssl_active
      AND d.vercel_mapped
      AND NOT d.is_mock
      AND d.suspended_at IS NULL,
      false),
    CASE WHEN marked.state_out = 'serving' THEN ss.exported_html END,
    CASE WHEN marked.state_out = 'serving' THEN ss.published_at END,
    CASE WHEN marked.state_out = 'serving' THEN marked.favicon_light_url END,
    CASE WHEN marked.state_out = 'serving' THEN marked.favicon_dark_url END,
    CASE WHEN marked.state_out = 'serving' THEN marked.social_preview_url END,
    CASE WHEN marked.state_out = 'serving' THEN marked.seo_title END,
    CASE WHEN marked.state_out = 'serving' THEN marked.seo_description END,
    CASE WHEN marked.state_out = 'serving' THEN marked.og_site_name END,
    CASE
      WHEN marked.state_out = 'serving' AND marked.plan = 'pro' AND marked.entitled
      THEN ta.ga4_measurement_id
    END,
    marked.entitled,
    CASE
      WHEN NOT marked.entitled
       AND p_domain IS NULL
       AND marked.status = 'active'
       AND marked.plan = 'none'
       AND marked.preview_started_at IS NOT NULL
      THEN marked.preview_started_at + (marked.effective_days * interval '1 day')
    END,
    marked.state_out,
    CASE WHEN marked.state_out = 'serving' THEN marked.business_profile END,
    -- Same gate as GA4: Pro-only site features need a live Pro subscription.
    COALESCE(
      marked.state_out = 'serving'
      AND marked.entitled
      AND marked.plan IN ('pro', 'empresarial'),
      false)
  FROM marked
  LEFT JOIN public.site_schemas ss
    ON ss.tenant_id = marked.id AND ss.status = 'published'
  LEFT JOIN public.domains d
    ON d.tenant_id = marked.id AND d.released_at IS NULL
  LEFT JOIN public.tenant_analytics ta
    ON ta.tenant_id = marked.id AND ta.provisioning_status = 'ready'
$$;

REVOKE ALL ON FUNCTION public.get_public_tenant_site(text, text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_tenant_site(text, text, integer) TO anon, service_role;
