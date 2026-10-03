CREATE TABLE IF NOT EXISTS public.domains (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                 UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

  -- Domain identity
  domain                    TEXT NOT NULL UNIQUE,
  tld                       TEXT NOT NULL,

  -- GoDaddy registration data
  godaddy_registration_id   TEXT,
  godaddy_idempotency_key   TEXT,
  annual_cost_usd_cents     INTEGER NOT NULL,
  period_years              INTEGER NOT NULL DEFAULT 1,
  expires_at                TIMESTAMPTZ,
  auto_renew                BOOLEAN NOT NULL DEFAULT false,

  -- DNS & Vercel state
  dns_status                TEXT NOT NULL DEFAULT 'pending'
    CHECK (dns_status IN ('pending','configuring','propagating','active','error')),
  vercel_domain_id          TEXT,
  vercel_mapped             BOOLEAN NOT NULL DEFAULT false,
  ssl_active                BOOLEAN NOT NULL DEFAULT false,

  -- Agreement tracking (legal)
  agreement_types_accepted  TEXT[] NOT NULL DEFAULT '{}',
  agreed_at                 TIMESTAMPTZ,

  -- Dev/test flag
  is_mock                   BOOLEAN NOT NULL DEFAULT false,

  purchase_completed_at     TIMESTAMPTZ,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS domains_tenant_id_idx
  ON public.domains (tenant_id);

ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "domains_select_own" ON public.domains
  FOR SELECT USING (
    tenant_id IN (SELECT id FROM public.tenants WHERE user_id = auth.uid())
  );;
