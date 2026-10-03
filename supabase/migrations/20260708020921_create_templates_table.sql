CREATE TABLE IF NOT EXISTS public.templates (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  description   TEXT,
  category      TEXT DEFAULT 'general',
  preview_url   TEXT,
  thumbnail_url TEXT,
  grapesjs_json JSONB NOT NULL,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "templates_authenticated_read" ON public.templates;
CREATE POLICY "templates_authenticated_read"
  ON public.templates
  FOR SELECT
  TO authenticated
  USING (is_active = true);;
