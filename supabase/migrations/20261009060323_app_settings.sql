-- Business settings live in the database so a deploy is not required to change them.
-- A missing or mistyped JSON value must not break the public site: the helpers return the default.

CREATE TABLE public.app_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  description text,
  updated_by text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS app_settings_set_updated_at ON public.app_settings;
CREATE TRIGGER app_settings_set_updated_at
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.app_settings FROM anon, authenticated;

CREATE TABLE public.app_settings_audit (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  key text NOT NULL,
  old_value jsonb,
  new_value jsonb,
  changed_by text,
  changed_at timestamptz NOT NULL DEFAULT now(),
  op text NOT NULL
);

ALTER TABLE public.app_settings_audit ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.app_settings_audit FROM anon, authenticated;

-- NEW is unassigned on DELETE, so that op records current_user (the COALESCE fallback).
CREATE FUNCTION public.app_settings_audit_row()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  v_changed_by text;
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.app_settings_audit (key, old_value, new_value, changed_by, op)
    VALUES (OLD.key, OLD.value, NULL, current_user, 'DELETE');
    RETURN OLD;
  END IF;

  v_changed_by := COALESCE(NEW.updated_by, current_user);

  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.app_settings_audit (key, old_value, new_value, changed_by, op)
    VALUES (NEW.key, NULL, NEW.value, v_changed_by, 'INSERT');
    RETURN NEW;
  END IF;

  INSERT INTO public.app_settings_audit (key, old_value, new_value, changed_by, op)
  VALUES (NEW.key, OLD.value, NEW.value, v_changed_by, 'UPDATE');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS app_settings_audit_row ON public.app_settings;
CREATE TRIGGER app_settings_audit_row
  AFTER INSERT OR UPDATE OR DELETE ON public.app_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.app_settings_audit_row();

REVOKE ALL ON FUNCTION public.app_settings_audit_row() FROM PUBLIC, anon, authenticated, service_role;

CREATE FUNCTION public.app_setting_int(p_key text, p_default integer)
RETURNS integer
LANGUAGE plpgsql
STABLE
SET search_path = ''
AS $$
DECLARE
  raw jsonb;
  parsed integer;
BEGIN
  SELECT s.value INTO raw
  FROM public.app_settings s
  WHERE s.key = p_key;

  IF NOT FOUND OR jsonb_typeof(raw) IS DISTINCT FROM 'number' THEN
    RETURN p_default;
  END IF;

  BEGIN
    IF (raw #>> '{}') !~ '^-?[0-9]+$' THEN
      RETURN p_default;
    END IF;
    parsed := (raw #>> '{}')::integer;
  EXCEPTION
    WHEN OTHERS THEN
      RETURN p_default;
  END;

  RETURN parsed;
END;
$$;

CREATE FUNCTION public.app_setting_bool(p_key text, p_default boolean)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SET search_path = ''
AS $$
DECLARE
  raw jsonb;
BEGIN
  SELECT s.value INTO raw
  FROM public.app_settings s
  WHERE s.key = p_key;

  IF NOT FOUND OR jsonb_typeof(raw) IS DISTINCT FROM 'boolean' THEN
    RETURN p_default;
  END IF;

  RETURN raw = 'true'::jsonb;
END;
$$;

REVOKE ALL ON FUNCTION public.app_setting_int(text, integer) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.app_setting_bool(text, boolean) FROM PUBLIC, anon, authenticated, service_role;

INSERT INTO public.app_settings (key, value, description)
VALUES
  ('preview.enabled', 'true'::jsonb, 'Activa la ventana de prueba gratuita en el sitio público.'),
  ('preview.trial_days', '3'::jsonb, 'Días de la prueba gratuita cuando la llamada no indica otro valor.'),
  ('preview.max_asset_bytes', '26214400'::jsonb, 'Tamaño máximo, en bytes, de un archivo subido durante la prueba.'),
  ('preview.sanitize_enabled', 'true'::jsonb, 'Sanitiza el HTML publicado durante la prueba.'),
  ('preview.require_verified_email', 'true'::jsonb, 'Exige un correo verificado para publicar durante la prueba.'),
  (
    'preview.allowed_asset_mime',
    '["image/png","image/jpeg","image/webp","image/gif"]'::jsonb,
    'Tipos MIME permitidos para los archivos de la prueba.'
  ),
  ('preview.publish_rate_limit_per_min', '6'::jsonb, 'Publicaciones permitidas por minuto durante la prueba.'),
  ('preview.asset_rate_limit_per_min', '20'::jsonb, 'Subidas de archivos permitidas por minuto durante la prueba.'),
  ('preview.notify_enabled', 'true'::jsonb, 'Envía avisos de que la prueba está por terminar.'),
  ('preview.notify_interval_minutes', '60'::jsonb, 'Minutos de espera entre cada lote de avisos de fin de prueba.'),
  ('preview.notify_batch', '50'::jsonb, 'Cantidad de avisos de fin de prueba que se envían en cada lote.')
ON CONFLICT (key) DO NOTHING;

-- Default of p_trial_days changes, so the previous function must be dropped first.
-- Disabled preview forces a closed window even when the caller passes p_trial_days.
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
  serving_state text
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
    marked.state_out
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
