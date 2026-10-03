ALTER TABLE public.domains
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'godaddy_managed'
    CHECK (source IN ('godaddy_managed', 'user_provided'));

ALTER TABLE public.domains
  ALTER COLUMN annual_cost_usd_cents DROP NOT NULL;

ALTER TABLE public.domain_jobs
  ADD COLUMN IF NOT EXISTS job_type TEXT NOT NULL DEFAULT 'purchase'
    CHECK (job_type IN ('purchase', 'connect'));;
