CREATE TABLE IF NOT EXISTS public.tenants (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  slug          TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  stripe_sub_id TEXT,
  plan          TEXT NOT NULL DEFAULT 'trial',
  status        TEXT NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'inactive', 'cancelled')),
  domain        TEXT,
  vercel_domain_mapped BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenants_select_own" ON public.tenants;
CREATE POLICY "tenants_select_own"
  ON public.tenants FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "tenants_update_own" ON public.tenants;
CREATE POLICY "tenants_update_own"
  ON public.tenants FOR UPDATE
  USING (user_id = auth.uid());;
