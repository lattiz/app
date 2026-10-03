-- Option-B snapshot: GoDaddy's indicative renewal price captured at purchase time.
ALTER TABLE public.domains
  ADD COLUMN IF NOT EXISTS renewal_price_cents     INTEGER,
  ADD COLUMN IF NOT EXISTS renewal_price_currency  TEXT,
  ADD COLUMN IF NOT EXISTS renewal_price_quoted_at TIMESTAMPTZ;

-- One row per Lattiz-managed domain per expiry cycle.
CREATE TABLE IF NOT EXISTS public.domain_maintenance_cycles (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                  UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  domain_id                  UUID NOT NULL REFERENCES public.domains(id) ON DELETE CASCADE,
  expires_at                 TIMESTAMPTZ NOT NULL,
  status                     TEXT NOT NULL CHECK (status IN (
                               'pricing_pending', 'open', 'overdue', 'paid', 'renewed',
                               'renewal_failed', 'over_cap', 'lapsed', 'refunded', 'void')),
  amount_cents               INTEGER CHECK (amount_cents IS NULL OR amount_cents > 0),
  currency                   TEXT NOT NULL DEFAULT 'mxn',
  stripe_price_id            TEXT,
  renewal_quote_cents        INTEGER,
  renewal_quote_currency     TEXT,
  renewal_price_source       TEXT,
  renewal_cost_usd_cents     INTEGER,
  fx_rate                    NUMERIC(12, 6),
  actual_renewal_cost_cents  INTEGER,
  actual_renewal_currency    TEXT,
  godaddy_order_id           TEXT,
  stripe_checkout_session_id TEXT,
  stripe_payment_intent_id   TEXT,
  stripe_refund_id           TEXT,
  paid_at                    TIMESTAMPTZ,
  renewed_at                 TIMESTAMPTZ,
  lapsed_at                  TIMESTAMPTZ,
  attempts                   INTEGER NOT NULL DEFAULT 0,
  last_error                 TEXT,
  renewal_attempt_started_at TIMESTAMPTZ,
  last_alert_kind            TEXT,
  last_alerted_on            DATE,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT open_requires_amount
    CHECK (status NOT IN ('open', 'overdue', 'paid') OR amount_cents IS NOT NULL)
);

-- One live cycle per expiry; a voided cycle (canceled subscription) does not
-- block a fresh one if the tenant resubscribes before the domain expires.
CREATE UNIQUE INDEX IF NOT EXISTS domain_maintenance_cycles_domain_expiry_uidx
  ON public.domain_maintenance_cycles (domain_id, expires_at)
  WHERE status <> 'void';
CREATE INDEX IF NOT EXISTS domain_maintenance_cycles_tenant_idx
  ON public.domain_maintenance_cycles (tenant_id, expires_at DESC);
CREATE INDEX IF NOT EXISTS domain_maintenance_cycles_status_idx
  ON public.domain_maintenance_cycles (status, expires_at);
CREATE UNIQUE INDEX IF NOT EXISTS domain_maintenance_cycles_payment_intent_uidx
  ON public.domain_maintenance_cycles (stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;

DROP TRIGGER IF EXISTS domain_maintenance_cycles_set_updated_at ON public.domain_maintenance_cycles;
CREATE TRIGGER domain_maintenance_cycles_set_updated_at
  BEFORE UPDATE ON public.domain_maintenance_cycles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.domain_maintenance_cycles ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.domain_maintenance_cycles FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.domain_maintenance_cycles FROM authenticated;

CREATE POLICY "domain_maintenance_cycles_select_own" ON public.domain_maintenance_cycles
  FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT id FROM public.tenants WHERE user_id = (select auth.uid())));

-- Option-A probe: GoDaddy list renewal price per TLD, cached for one UTC day.
CREATE TABLE IF NOT EXISTS public.domain_renewal_price_probes (
  tld          TEXT NOT NULL,
  probe_date   DATE NOT NULL,
  price_cents  INTEGER NOT NULL CHECK (price_cents > 0),
  currency     TEXT NOT NULL,
  probe_domain TEXT NOT NULL,
  fetched_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (tld, probe_date)
);
ALTER TABLE public.domain_renewal_price_probes ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.domain_renewal_price_probes FROM anon, authenticated;

-- Processed Stripe events, so a redelivered webhook is a no-op.
CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  id           TEXT PRIMARY KEY,
  type         TEXT NOT NULL,
  received_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ
);
ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.stripe_webhook_events FROM anon, authenticated;;
