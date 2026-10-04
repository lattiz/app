-- Slug rules live here, once: the CHECK below and the API both call these functions.
-- Format: lowercase a-z 0-9, single inner hyphens, 3-32 chars (a valid DNS label, never "xn--").
CREATE OR REPLACE FUNCTION public.tenant_slug_is_valid_format(p_slug text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
SET search_path = ''
AS $$
  SELECT p_slug IS NOT NULL
     AND char_length(p_slug) BETWEEN 3 AND 32
     AND p_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
$$;

-- Names that must never become a tenant address (infrastructure, product pages, mail).
CREATE OR REPLACE FUNCTION public.tenant_slug_is_reserved(p_slug text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
SET search_path = ''
AS $$
  SELECT p_slug = ANY (ARRAY[
    'www', 'api', 'app', 'dashboard', 'admin', 'mail', 'send', 'rsend', 'assets', 'cdn',
    'status', 'docs', 'blog', 'help', 'soporte', 'support', 'staging', 'preview', 'test',
    'demo', 'lattiz', '_acme-challenge'
  ])
$$;

-- NULL when the slug may be claimed, else the stable error code the API returns.
-- Also reserves the temporary-slug shape handle_new_user() generates, so nobody can squat a future one.
CREATE OR REPLACE FUNCTION public.tenant_slug_problem(p_slug text)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
SET search_path = ''
AS $$
  SELECT CASE
    WHEN NOT public.tenant_slug_is_valid_format(p_slug) THEN 'SLUG_INVALID'
    WHEN public.tenant_slug_is_reserved(p_slug) OR p_slug ~ '^tenant-[0-9a-f]{8}$' THEN 'SLUG_RESERVED'
  END
$$;

-- Rows that predate the rules (hand-made, or an odd temporary slug) fall back to a UUID-derived
-- one that is always valid; 12 hex chars cannot collide with the 8-char signup-trigger slugs.
UPDATE public.tenants
SET slug = 'tenant-' || left(replace(id::text, '-', ''), 12)
WHERE NOT (public.tenant_slug_is_valid_format(slug) AND NOT public.tenant_slug_is_reserved(slug));

ALTER TABLE public.tenants
  ADD CONSTRAINT tenants_slug_valid
  CHECK (public.tenant_slug_is_valid_format(slug) AND NOT public.tenant_slug_is_reserved(slug));

-- Mirrors common/billing/entitlement.ts (computeIsEntitled) with one deliberate difference:
-- past_due still serves visitors, as the rest of the lifecycle does (tenants.plan stays set and
-- the domain is only suspended on a terminal status). The date check covers a missed webhook.
-- Internal: only the lookup below calls it, never a client.
CREATE OR REPLACE FUNCTION public.tenant_site_is_entitled(p_tenant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT COALESCE(
    (SELECT s.status IN ('active', 'trialing', 'past_due') AND s.current_period_end > now()
     FROM public.subscriptions s
     WHERE s.tenant_id = p_tenant_id
     ORDER BY s.created_at DESC
     LIMIT 1),
    false)
$$;

REVOKE ALL ON FUNCTION public.tenant_site_is_entitled(uuid) FROM PUBLIC, anon, authenticated;

-- The only door tenant-sites (anon key) uses to read tenants. Lookup is by exactly one key, so the
-- table cannot be listed. Row = tenant exists; is_serving = status active AND entitled. When it is
-- false every other column is NULL, so an unavailable tenant reveals nothing, not even why.
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
