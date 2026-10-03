-- suspended_at: set when Vercel mapping is removed due to non-payment (NULL = not suspended).
-- relaunched_at: timestamp of the last successful recovery (audit trail).
ALTER TABLE public.domains
  ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS relaunched_at TIMESTAMPTZ;

-- Rows offboarded by the old release flow are suspended under the new model.
UPDATE public.domains
SET suspended_at = released_at
WHERE released_at IS NOT NULL AND suspended_at IS NULL AND vercel_mapped = false;;
