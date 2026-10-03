-- Objects created outside migrations (dashboard), captured so any new project matches production.

-- profiles was created by Drizzle; RLS was then enabled by the project's automatic-RLS setting.
-- No policies on purpose: only the API (service connection) reads it.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Public bucket for editor/tenant assets; uploads go through the API with the service role.
INSERT INTO storage.buckets (id, name, public)
VALUES ('template-assets', 'template-assets', true)
ON CONFLICT (id) DO NOTHING;
