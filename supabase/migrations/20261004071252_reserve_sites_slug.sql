-- sites.lattiz.app is the stable internal URL the API uses to revalidate tenant-sites; no tenant may claim it.
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
    'demo', 'lattiz', 'sites', '_acme-challenge'
  ])
$$;
