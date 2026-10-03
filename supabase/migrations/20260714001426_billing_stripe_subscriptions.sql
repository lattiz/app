-- Stripe customer tracking on tenants
ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS tenants_stripe_customer_id_key
  ON public.tenants (stripe_customer_id);

-- Plan vocabulary: keep legacy 'trial', add billing plans + 'none'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tenants_plan_check'
  ) THEN
    ALTER TABLE public.tenants
      ADD CONSTRAINT tenants_plan_check
      CHECK (plan IN ('trial', 'none', 'basico', 'pro'));
  END IF;
END $$;

-- Subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id              UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  stripe_customer_id     TEXT NOT NULL,
  plan                   TEXT NOT NULL CHECK (plan IN ('basico', 'pro')),
  billing_period         TEXT NOT NULL CHECK (billing_period IN ('monthly', 'annual')),
  status                 TEXT NOT NULL CHECK (
    status IN ('active', 'trialing', 'past_due', 'canceled',
               'incomplete', 'incomplete_expired', 'unpaid', 'paused')
  ),
  current_period_start   TIMESTAMPTZ,
  current_period_end     TIMESTAMPTZ,
  cancel_at_period_end   BOOLEAN NOT NULL DEFAULT false,
  canceled_at            TIMESTAMPTZ,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_tenant_active_idx
  ON public.subscriptions (tenant_id)
  WHERE status IN ('active', 'trialing', 'past_due');

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "subscriptions_select_own" ON public.subscriptions;
CREATE POLICY "subscriptions_select_own"
  ON public.subscriptions FOR SELECT
  USING (
    tenant_id IN (
      SELECT id FROM public.tenants WHERE user_id = auth.uid()
    )
  );

DROP TRIGGER IF EXISTS subscriptions_set_updated_at ON public.subscriptions;
CREATE TRIGGER subscriptions_set_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();;
