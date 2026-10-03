-- Consecutive failed renewal attempts for the CURRENT billing cycle; reset on invoice.paid.
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS payment_attempts INTEGER NOT NULL DEFAULT 0;

-- Set when a domain is released because the subscription lapsed.
-- A dedicated column rather than a new dns_status value, so the existing CHECK stays untouched.
ALTER TABLE public.domains
  ADD COLUMN IF NOT EXISTS released_at TIMESTAMPTZ;;
