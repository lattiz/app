
-- One tenant per user_id — required for the ON CONFLICT (user_id) target below,
-- and matches the app's existing single-tenant-per-user assumption
-- (TenantsService.getMyTenant does `WHERE user_id = $1 LIMIT 1`).
ALTER TABLE public.tenants
  ADD CONSTRAINT tenants_user_id_key UNIQUE (user_id);

-- Auto-provisions a tenants row the moment a user signs up in Supabase Auth,
-- so GET /tenants/me never 404s for a freshly registered user.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.tenants (
    user_id,
    slug,
    name,
    plan,
    status
  ) VALUES (
    NEW.id,
    -- Temporary slug derived from the UUID — the tenant can change it later.
    'tenant-' || LEFT(NEW.id::text, 8),
    -- Temporary name derived from the email local part.
    SPLIT_PART(NEW.email, '@', 1),
    'none',
    'active'
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
;
