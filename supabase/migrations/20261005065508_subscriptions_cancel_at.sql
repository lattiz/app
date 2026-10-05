-- Stripe portal (API 2026-04-22.dahlia) schedules cancellation via cancel_at,
-- leaving cancel_at_period_end false; persist it so the dashboard can show the end date.
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS cancel_at TIMESTAMPTZ;
