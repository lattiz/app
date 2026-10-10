-- ROLLBACK de 20261010091807_template_tiers_and_archives.sql. NO está en migrations/: no se aplica solo.
-- Para usarlo: copiar su contenido a una migración nueva y aplicarla con `supabase db push`.
-- Se pierden los archivos de proyectos guardados antes de cada cambio de plantilla: exportarlos antes.

DROP TABLE IF EXISTS public.template_archives;
DROP INDEX IF EXISTS public.templates_tier_idx;
ALTER TABLE public.templates DROP CONSTRAINT IF EXISTS templates_tier_check;
ALTER TABLE public.templates DROP COLUMN IF EXISTS tier;
