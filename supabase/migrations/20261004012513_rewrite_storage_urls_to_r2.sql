-- Moves every persisted public asset URL from the Supabase `template-assets` bucket to R2 (assets.lattiz.app).
-- DO NOT PUSH until every object has been copied to R2 and verified: this rewrites the live URLs and pages
-- would show broken images otherwise. Idempotent: a second run finds nothing to replace.
--   old: https://qozzexpfsjdrqlvvrvqs.supabase.co/storage/v1/object/public/template-assets/<path>
--   new: https://assets.lattiz.app/<path>
-- Only that exact prefix is touched. The same prefix is also replaced when JSON/HTML stored it with escaped
-- slashes (`\/`, up to four backslashes), keeping the escaping style of the surrounding text.
-- Columns: site_schemas.{grapesjs_json,exported_html}, templates.{grapesjs_json,thumbnail_url,preview_url},
-- tenants.{favicon_light_url,favicon_dark_url,social_preview_url}.

-- Helpers live only for this migration (created and dropped below) so no session-local state is needed.
CREATE FUNCTION public.tmp_rewrite_storage_urls(input text) RETURNS text
LANGUAGE plpgsql IMMUTABLE SET search_path = '' AS $$
DECLARE
  old_prefix CONSTANT text :=
    'https://qozzexpfsjdrqlvvrvqs.supabase.co/storage/v1/object/public/template-assets/';
  new_prefix CONSTANT text := 'https://assets.lattiz.app/';
  result text := input;
  slash text;
BEGIN
  -- 0 backslashes = plain URL; 1 = JSON/JS-escaped; 2-4 = the same seen through jsonb::text (which doubles backslashes) or JSON nested in a string.
  FOR n IN 0..4 LOOP
    slash := repeat(chr(92), n) || '/';
    result := replace(result, replace(old_prefix, '/', slash), replace(new_prefix, '/', slash));
  END LOOP;
  RETURN result;
END;
$$;

-- Rows are only updated when the rewrite changes them, so unrelated rows are never written.
CREATE FUNCTION public.tmp_has_old_storage_url(input text) RETURNS boolean
LANGUAGE sql IMMUTABLE SET search_path = '' AS $$
  SELECT input IS NOT NULL AND public.tmp_rewrite_storage_urls(input) <> input;
$$;

DO $$
DECLARE
  remaining integer;
  -- Escaped slashes (`\/`, `\\/`) count as well.
  left_over CONSTANT text := 'supabase\.co[/\\]+storage[/\\]+v1[/\\]';
BEGIN
  -- Rewriting URLs is not a content edit: keep updated_at (it drives "has the site been edited").
  ALTER TABLE public.site_schemas DISABLE TRIGGER site_schemas_set_updated_at;

  UPDATE public.site_schemas
  SET grapesjs_json = public.tmp_rewrite_storage_urls(grapesjs_json::text)::jsonb
  WHERE public.tmp_has_old_storage_url(grapesjs_json::text);

  UPDATE public.site_schemas
  SET exported_html = public.tmp_rewrite_storage_urls(exported_html)
  WHERE public.tmp_has_old_storage_url(exported_html);

  ALTER TABLE public.site_schemas ENABLE TRIGGER site_schemas_set_updated_at;

  UPDATE public.templates
  SET grapesjs_json = public.tmp_rewrite_storage_urls(grapesjs_json::text)::jsonb
  WHERE public.tmp_has_old_storage_url(grapesjs_json::text);

  UPDATE public.templates
  SET thumbnail_url = public.tmp_rewrite_storage_urls(thumbnail_url)
  WHERE public.tmp_has_old_storage_url(thumbnail_url);

  UPDATE public.templates
  SET preview_url = public.tmp_rewrite_storage_urls(preview_url)
  WHERE public.tmp_has_old_storage_url(preview_url);

  UPDATE public.tenants
  SET favicon_light_url = public.tmp_rewrite_storage_urls(favicon_light_url)
  WHERE public.tmp_has_old_storage_url(favicon_light_url);

  UPDATE public.tenants
  SET favicon_dark_url = public.tmp_rewrite_storage_urls(favicon_dark_url)
  WHERE public.tmp_has_old_storage_url(favicon_dark_url);

  UPDATE public.tenants
  SET social_preview_url = public.tmp_rewrite_storage_urls(social_preview_url)
  WHERE public.tmp_has_old_storage_url(social_preview_url);

  -- Any Supabase Storage URL still left (another bucket, render/signed URL form) is surfaced, never rewritten blindly.
  SELECT
    (SELECT count(*) FROM public.site_schemas
       WHERE grapesjs_json::text ~ left_over OR exported_html ~ left_over)
  + (SELECT count(*) FROM public.templates
       WHERE grapesjs_json::text ~ left_over
          OR thumbnail_url ~ left_over
          OR preview_url ~ left_over)
  + (SELECT count(*) FROM public.tenants
       WHERE favicon_light_url ~ left_over
          OR favicon_dark_url ~ left_over
          OR social_preview_url ~ left_over)
  INTO remaining;

  IF remaining > 0 THEN
    RAISE WARNING 'rewrite_storage_urls_to_r2: % row(s) still reference Supabase Storage URLs outside the template-assets public prefix; review them.', remaining;
  ELSE
    RAISE NOTICE 'rewrite_storage_urls_to_r2: no Supabase Storage URLs remain.';
  END IF;
END;
$$;

DROP FUNCTION public.tmp_has_old_storage_url(text);
DROP FUNCTION public.tmp_rewrite_storage_urls(text);
