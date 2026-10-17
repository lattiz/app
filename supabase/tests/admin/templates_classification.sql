-- templates classification: updated_at trigger, retired_at check, view columns, closed to clients.
-- Run (psql is not on the host):
-- docker exec -i supabase_db_lattiz psql -U postgres -d postgres -v ON_ERROR_STOP=1 < supabase/tests/admin/templates_classification.sql
\set ON_ERROR_STOP on

BEGIN;

CREATE FUNCTION pg_temp.expect(p_ok boolean, p_msg text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT COALESCE(p_ok, false) THEN
    RAISE EXCEPTION '%', p_msg;
  END IF;
END;
$$;

INSERT INTO public.templates (id, name, category, grapesjs_json, tier, sort_order)
VALUES ('cls-cafe-v1', 'Cafe', 'cafe', '{}'::jsonb, 'basic', 4);

SELECT pg_temp.expect(
  (
    SELECT
      tags = '{}'::text[]
      AND featured = false
      AND retired_at IS NULL
      AND kit_meta IS NULL
      AND updated_at > now() - interval '1 minute'
    FROM public.templates
    WHERE id = 'cls-cafe-v1'
  ),
  'classification defaults'
);

UPDATE public.templates
SET
  name = 'Cafe editada',
  updated_at = timestamptz '2000-01-01'
WHERE id = 'cls-cafe-v1';

SELECT pg_temp.expect(
  (
    SELECT
      name = 'Cafe editada'
      AND updated_at > now() - interval '1 minute'
      AND updated_at <> timestamptz '2000-01-01'
    FROM public.templates
    WHERE id = 'cls-cafe-v1'
  ),
  'updated_at trigger'
);

DO $pending$
BEGIN
  UPDATE public.templates
  SET is_active = false, retired_at = NULL
  WHERE id = 'cls-cafe-v1';
END
$pending$;

SELECT pg_temp.expect(
  (
    SELECT NOT is_active AND retired_at IS NULL
    FROM public.templates
    WHERE id = 'cls-cafe-v1'
  ),
  'pending seed (inactive, not retired) was rejected'
);

DO $retire$
BEGIN
  UPDATE public.templates
  SET retired_at = timestamptz '2026-06-01T00:00:00Z'
  WHERE id = 'cls-cafe-v1';
END
$retire$;

DO $reactivate$
BEGIN
  UPDATE public.templates
  SET is_active = true
  WHERE id = 'cls-cafe-v1';
  RAISE EXCEPTION 'reactivating a retired template was accepted';
EXCEPTION
  WHEN check_violation THEN
    NULL;
END
$reactivate$;

UPDATE public.templates
SET retired_at = NULL, is_active = true
WHERE id = 'cls-cafe-v1';

DO $active_retired$
BEGIN
  UPDATE public.templates
  SET retired_at = now()
  WHERE id = 'cls-cafe-v1';
  RAISE EXCEPTION 'retired_at with is_active = true was accepted';
EXCEPTION
  WHEN check_violation THEN
    NULL;
END
$active_retired$;

SELECT pg_temp.expect(
  (
    SELECT is_active AND retired_at IS NULL
    FROM public.templates
    WHERE id = 'cls-cafe-v1'
  ),
  'rejected update changed the active template'
);

UPDATE public.templates
SET
  is_active = false,
  retired_at = timestamptz '2026-06-01T00:00:00Z',
  tags = ARRAY['cafe', 'centro']::text[],
  featured = true,
  thumbnail_url = 'https://example.test/thumb.jpg',
  preview_url = 'https://example.test/preview',
  description = 'Un cafe',
  kit_meta = '{"giro":"cafe"}'::jsonb
WHERE id = 'cls-cafe-v1';

SELECT pg_temp.expect(
  (
    SELECT kit_meta = '{"giro":"cafe"}'::jsonb
    FROM public.templates
    WHERE id = 'cls-cafe-v1'
  ),
  'kit_meta was not stored'
);

SELECT pg_temp.expect(
  (
    SELECT array_agg(attname::text ORDER BY attnum) = ARRAY[
      'template_id',
      'name',
      'category',
      'tier',
      'is_active',
      'sort_order',
      'created_at',
      'tenants_using',
      'sites_published',
      'paying_tenants',
      'trial_tenants',
      'archived_count',
      'tags',
      'featured',
      'updated_at',
      'retired_at',
      'thumbnail_url',
      'preview_url',
      'description'
    ]::text[]
    FROM pg_attribute
    WHERE attrelid = 'admin.template_usage'::regclass
      AND attnum > 0
      AND NOT attisdropped
  ),
  'template_usage columns were reordered or dropped'
);

SELECT pg_temp.expect(
  (
    SELECT
      name = 'Cafe editada'
      AND category = 'cafe'
      AND tier = 'basic'
      AND NOT is_active
      AND sort_order = 4
      AND tenants_using = 0
      AND sites_published = 0
      AND paying_tenants = 0
      AND trial_tenants = 0
      AND archived_count = 0
      AND tags = ARRAY['cafe', 'centro']::text[]
      AND featured
      AND updated_at > now() - interval '1 minute'
      AND retired_at = timestamptz '2026-06-01T00:00:00Z'
      AND thumbnail_url = 'https://example.test/thumb.jpg'
      AND preview_url = 'https://example.test/preview'
      AND description = 'Un cafe'
    FROM admin.template_usage
    WHERE template_id = 'cls-cafe-v1'
  ),
  'template_usage missed the classification columns'
);

DO $deny$
DECLARE
  v_role text;
BEGIN
  FOREACH v_role IN ARRAY ARRAY['anon', 'authenticated']
  LOOP
    EXECUTE format('SET LOCAL ROLE %I', v_role);
    BEGIN
      EXECUTE 'SELECT 1 FROM admin.template_usage';
      RAISE EXCEPTION '% select admin.template_usage succeeded', v_role;
    EXCEPTION
      WHEN insufficient_privilege THEN
        NULL;
    END;
    RESET ROLE;
  END LOOP;
END
$deny$;

ROLLBACK;
